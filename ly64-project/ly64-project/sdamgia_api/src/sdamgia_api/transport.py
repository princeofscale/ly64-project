from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

import httpx

from .exceptions import NetworkError, RateLimitError

if TYPE_CHECKING:
    pass

DEFAULT_USER_AGENT = "sdamgia-api/2.0.0 (Python; +https://github.com/princeofscale/oge-sdamgia-api)"
DEFAULT_TIMEOUT = 30.0
DEFAULT_MAX_RETRIES = 3
DEFAULT_RATE_LIMIT_RPS = 3.0


class RateLimiter:
    def __init__(self, requests_per_second: float = DEFAULT_RATE_LIMIT_RPS) -> None:
        self.requests_per_second = requests_per_second
        self.min_interval = 1.0 / requests_per_second
        self._last_request_time: float = 0.0

    def wait(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self._last_request_time = time.monotonic()

    async def wait_async(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_request_time
        if elapsed < self.min_interval:
            await asyncio.sleep(self.min_interval - elapsed)
        self._last_request_time = time.monotonic()


class BaseTransport(ABC):
    def __init__(
        self,
        user_agent: str = DEFAULT_USER_AGENT,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
        rate_limit_rps: float = DEFAULT_RATE_LIMIT_RPS,
        proxy: str | None = None,
    ) -> None:
        self.user_agent = user_agent
        self.timeout = timeout
        self.max_retries = max_retries
        self.proxy = proxy
        self.rate_limiter = RateLimiter(rate_limit_rps)

    def _get_headers(self) -> dict[str, str]:
        return {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        }

    def _calculate_backoff(self, attempt: int) -> int | float:
        backoff: int | float = min(2**attempt * 0.5, 30.0)
        return backoff

    @abstractmethod
    def get(self, url: str, params: dict[str, Any] | None = None) -> str:
        pass

    @abstractmethod
    def close(self) -> None:
        pass


class SyncTransport(BaseTransport):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        transport_kwargs: dict[str, Any] = {}
        if self.proxy:
            transport_kwargs["proxy"] = self.proxy
        self._client = httpx.Client(
            headers=self._get_headers(),
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True,
            **transport_kwargs,
        )

    def get(self, url: str, params: dict[str, Any] | None = None) -> str:
        last_exception: Exception | None = None

        for attempt in range(self.max_retries):
            self.rate_limiter.wait()

            try:
                response = self._client.get(url, params=params)

                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    retry_seconds = (
                        int(retry_after) if retry_after else self._calculate_backoff(attempt)
                    )
                    if attempt < self.max_retries - 1:
                        time.sleep(retry_seconds)
                        continue
                    raise RateLimitError(retry_after=retry_seconds)

                if response.status_code >= 500:
                    if attempt < self.max_retries - 1:
                        time.sleep(self._calculate_backoff(attempt))
                        continue
                    raise NetworkError(
                        f"Server error: {response.status_code}",
                        status_code=response.status_code,
                    )

                response.raise_for_status()
                return response.text

            except httpx.TimeoutException as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    time.sleep(self._calculate_backoff(attempt))
                    continue

            except httpx.HTTPStatusError as e:
                raise NetworkError(
                    f"HTTP error: {e.response.status_code}",
                    status_code=e.response.status_code,
                ) from e

            except httpx.RequestError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    time.sleep(self._calculate_backoff(attempt))
                    continue

        raise NetworkError(f"Request failed after {self.max_retries} retries: {last_exception}")

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> SyncTransport:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()


class AsyncTransport(BaseTransport):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        transport_kwargs: dict[str, Any] = {}
        if self.proxy:
            transport_kwargs["proxy"] = self.proxy
        self._client = httpx.AsyncClient(
            headers=self._get_headers(),
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True,
            **transport_kwargs,
        )

    async def get(self, url: str, params: dict[str, Any] | None = None) -> str:  # type: ignore[override]
        last_exception: Exception | None = None

        for attempt in range(self.max_retries):
            await self.rate_limiter.wait_async()

            try:
                response = await self._client.get(url, params=params)

                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    retry_seconds = (
                        int(retry_after) if retry_after else self._calculate_backoff(attempt)
                    )
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(retry_seconds)
                        continue
                    raise RateLimitError(retry_after=retry_seconds)

                if response.status_code >= 500:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self._calculate_backoff(attempt))
                        continue
                    raise NetworkError(
                        f"Server error: {response.status_code}",
                        status_code=response.status_code,
                    )

                response.raise_for_status()
                return response.text

            except httpx.TimeoutException as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self._calculate_backoff(attempt))
                    continue

            except httpx.HTTPStatusError as e:
                raise NetworkError(
                    f"HTTP error: {e.response.status_code}",
                    status_code=e.response.status_code,
                ) from e

            except httpx.RequestError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self._calculate_backoff(attempt))
                    continue

        raise NetworkError(f"Request failed after {self.max_retries} retries: {last_exception}")

    async def close(self) -> None:  # type: ignore[override]
        await self._client.aclose()

    async def __aenter__(self) -> AsyncTransport:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
