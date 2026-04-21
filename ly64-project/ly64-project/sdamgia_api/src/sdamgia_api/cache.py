from __future__ import annotations

import functools
import time
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

_cache: dict[str, tuple[Any, float]] = {}


def ttl_cache(ttl: float = 3600.0) -> Callable[[F], F]:
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            key = f"{func.__qualname__}:{args}:{sorted(kwargs.items())}"
            if key in _cache:
                value, expires_at = _cache[key]
                if time.monotonic() < expires_at:
                    return value
            result = func(*args, **kwargs)
            _cache[key] = (result, time.monotonic() + ttl)
            return result

        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            key = f"{func.__qualname__}:{args}:{sorted(kwargs.items())}"
            if key in _cache:
                value, expires_at = _cache[key]
                if time.monotonic() < expires_at:
                    return value
            result = await func(*args, **kwargs)
            _cache[key] = (result, time.monotonic() + ttl)
            return result

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper  # type: ignore[return-value]
        return sync_wrapper  # type: ignore[return-value]

    return decorator


def clear_cache() -> None:
    _cache.clear()


def cache_info() -> dict[str, Any]:
    now = time.monotonic()
    active = {k: v for k, v in _cache.items() if v[1] > now}
    return {"total": len(_cache), "active": len(active), "expired": len(_cache) - len(active)}
