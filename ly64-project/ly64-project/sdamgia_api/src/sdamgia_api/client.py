from __future__ import annotations

import concurrent.futures
from typing import Any

from .cache import ttl_cache
from .exceptions import InvalidSubjectError
from .models import (
    Catalog,
    ExamType,
    FullVariant,
    Problem,
    Subject,
    TestGenerationParams,
    Variant,
    VariantInfo,
)
from .parsers import (
    parse_catalog,
    parse_category_problems,
    parse_problem,
    parse_search_results,
    parse_variant,
)
from .transport import AsyncTransport, SyncTransport

OGE_SUBJECTS = {
    Subject.MATH,
    Subject.PHYS,
    Subject.INF,
    Subject.RUS,
    Subject.BIO,
    Subject.EN,
    Subject.CHEM,
    Subject.GEO,
    Subject.SOC,
    Subject.DE,
    Subject.FR,
    Subject.LIT,
    Subject.SP,
    Subject.HIST,
}

EGE_SUBJECTS = {
    Subject.MATH,
    Subject.MATHB,
    Subject.PHYS,
    Subject.INF,
    Subject.RUS,
    Subject.BIO,
    Subject.EN,
    Subject.CHEM,
    Subject.GEO,
    Subject.SOC,
    Subject.DE,
    Subject.FR,
    Subject.LIT,
    Subject.SP,
    Subject.HIST,
}


def _get_base_url(subject: Subject, exam_type: ExamType) -> str:
    exam_suffix = exam_type.value
    subject_prefix = subject.value
    return f"https://{subject_prefix}-{exam_suffix}.sdamgia.ru"


def _validate_subject(subject: Subject, exam_type: ExamType) -> None:
    available = OGE_SUBJECTS if exam_type == ExamType.OGE else EGE_SUBJECTS
    if subject not in available:
        raise InvalidSubjectError(subject.value, exam_type.value)


class SdamgiaClient:
    def __init__(
        self,
        user_agent: str | None = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        rate_limit_rps: float = 3.0,
        proxy: str | None = None,
    ) -> None:
        transport_kwargs: dict[str, Any] = {
            "timeout": timeout,
            "max_retries": max_retries,
            "rate_limit_rps": rate_limit_rps,
        }
        if user_agent:
            transport_kwargs["user_agent"] = user_agent
        if proxy:
            transport_kwargs["proxy"] = proxy

        self._transport = SyncTransport(**transport_kwargs)

    def get_problem(
        self,
        problem_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Problem:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/problem"
        html = self._transport.get(url, params={"id": str(problem_id)})

        return parse_problem(html, str(problem_id), base_url, subject, exam_type)

    def get_variant(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Variant:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"
        html = self._transport.get(url, params={"id": str(variant_id)})

        return parse_variant(html, str(variant_id), base_url, subject, exam_type)

    def list_variants(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> list[VariantInfo]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/newapi/general"
        response_text = self._transport.get(url)

        import json

        data = json.loads(response_text)
        variant_ids = data.get("ourVariants", [])

        variants: list[VariantInfo] = []
        for idx, variant_id in enumerate(variant_ids, start=1):
            variants.append(
                VariantInfo(
                    id=str(variant_id),
                    url=f"{base_url}/test?id={variant_id}",
                    title=f"Вариант {idx}",
                )
            )

        return variants

    def search(
        self,
        query: str,
        subject: Subject | str,
        exam_type: ExamType | str,
        page: int = 1,
    ) -> list[str]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/search"
        html = self._transport.get(url, params={"search": query, "page": str(page)})

        return parse_search_results(html)

    def get_catalog(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Catalog:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/prob_catalog"
        html = self._transport.get(url)

        return parse_catalog(html, subject, exam_type)

    def get_category_problems(
        self,
        category_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
        page: int = 1,
    ) -> list[str]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"
        html = self._transport.get(
            url,
            params={"filter": "all", "theme": str(category_id), "page": str(page)},
        )

        return parse_category_problems(html)

    def generate_test(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
        params: TestGenerationParams | dict[str, int] | None = None,
    ) -> str:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"

        if params is None:
            params = TestGenerationParams(full=1)
        elif isinstance(params, dict):
            if "full" in params:
                params = TestGenerationParams(full=params["full"])
            else:
                params = TestGenerationParams(problems_per_topic=params)

        request_params: dict[str, Any] = {"a": "generate"}

        if params.full is not None:
            catalog = self.get_catalog(subject, exam_type)
            for idx in range(1, len(catalog.topics) + 1):
                request_params[f"prob{idx}"] = params.full
        elif params.problems_per_topic:
            for topic_num, count in params.problems_per_topic.items():
                request_params[f"prob{topic_num}"] = count

        response_text = self._transport.get(url, params=request_params)

        import re

        match = re.search(r"id=(\d+)", response_text)
        if match:
            return match.group(1)

        raise Exception("Failed to parse generated test ID")

    def generate_pdf(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
        with_solutions: bool = False,
        with_answers: bool = True,
        with_instructions: bool = False,
    ) -> str:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"

        params: dict[str, Any] = {
            "id": str(variant_id),
            "print": "true",
            "pdf": "true",
        }

        if with_solutions:
            params["sol"] = "true"
        if with_answers:
            params["ans"] = "true"
        if with_instructions:
            params["pre"] = "true"

        response_text = self._transport.get(url, params=params)

        import re

        match = re.search(r'href="([^"]*\.pdf)"', response_text)
        if match:
            pdf_path = match.group(1)
            if not pdf_path.startswith("http"):
                pdf_path = base_url + pdf_path
            return pdf_path

        raise Exception("Failed to find PDF URL in response")

    def get_full_variant(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> FullVariant:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        variant = self.get_variant(variant_id, subject, exam_type)

        problems: list[Problem] = []
        total_score = 0

        for prob_ref in variant.problems:
            problem = self.get_problem(prob_ref.id, subject, exam_type)
            problems.append(problem)
            total_score += problem.score

        return FullVariant(
            id=variant.id,
            url=variant.url,
            problems=problems,
            subject=subject,
            exam_type=exam_type,
            total_score=total_score,
        )

    def get_problems_batch(
        self,
        problem_ids: list[str | int],
        subject: Subject | str,
        exam_type: ExamType | str,
        max_workers: int = 5,
    ) -> list[Problem]:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self.get_problem, pid, subject, exam_type): i
                for i, pid in enumerate(problem_ids)
            }
            results: list[Problem | None] = [None] * len(problem_ids)
            for future in concurrent.futures.as_completed(futures):
                idx = futures[future]
                results[idx] = future.result()
        return [r for r in results if r is not None]

    def close(self) -> None:
        self._transport.close()

    def __enter__(self) -> SdamgiaClient:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()


class AsyncSdamgiaClient:
    def __init__(
        self,
        user_agent: str | None = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        rate_limit_rps: float = 3.0,
        proxy: str | None = None,
    ) -> None:
        transport_kwargs: dict[str, Any] = {
            "timeout": timeout,
            "max_retries": max_retries,
            "rate_limit_rps": rate_limit_rps,
        }
        if user_agent:
            transport_kwargs["user_agent"] = user_agent
        if proxy:
            transport_kwargs["proxy"] = proxy

        self._transport = AsyncTransport(**transport_kwargs)

    async def get_problem(
        self,
        problem_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Problem:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/problem"
        html = await self._transport.get(url, params={"id": str(problem_id)})

        return parse_problem(html, str(problem_id), base_url, subject, exam_type)

    async def get_variant(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Variant:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"
        html = await self._transport.get(url, params={"id": str(variant_id)})

        return parse_variant(html, str(variant_id), base_url, subject, exam_type)

    async def list_variants(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> list[VariantInfo]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/newapi/general"
        response_text = await self._transport.get(url)

        import json

        data = json.loads(response_text)
        variant_ids = data.get("ourVariants", [])

        variants: list[VariantInfo] = []
        for idx, variant_id in enumerate(variant_ids, start=1):
            variants.append(
                VariantInfo(
                    id=str(variant_id),
                    url=f"{base_url}/test?id={variant_id}",
                    title=f"Вариант {idx}",
                )
            )

        return variants

    async def search(
        self,
        query: str,
        subject: Subject | str,
        exam_type: ExamType | str,
        page: int = 1,
    ) -> list[str]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/search"
        html = await self._transport.get(url, params={"search": query, "page": str(page)})

        return parse_search_results(html)

    async def get_catalog(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> Catalog:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/prob_catalog"
        html = await self._transport.get(url)

        return parse_catalog(html, subject, exam_type)

    async def get_category_problems(
        self,
        category_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
        page: int = 1,
    ) -> list[str]:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"
        html = await self._transport.get(
            url,
            params={"filter": "all", "theme": str(category_id), "page": str(page)},
        )

        return parse_category_problems(html)

    async def generate_test(
        self,
        subject: Subject | str,
        exam_type: ExamType | str,
        params: TestGenerationParams | dict[str, int] | None = None,
    ) -> str:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"

        if params is None:
            params = TestGenerationParams(full=1)
        elif isinstance(params, dict):
            if "full" in params:
                params = TestGenerationParams(full=params["full"])
            else:
                params = TestGenerationParams(problems_per_topic=params)

        request_params: dict[str, Any] = {"a": "generate"}

        if params.full is not None:
            catalog = await self.get_catalog(subject, exam_type)
            for idx in range(1, len(catalog.topics) + 1):
                request_params[f"prob{idx}"] = params.full
        elif params.problems_per_topic:
            for topic_num, count in params.problems_per_topic.items():
                request_params[f"prob{topic_num}"] = count

        response_text = await self._transport.get(url, params=request_params)

        import re

        match = re.search(r"id=(\d+)", response_text)
        if match:
            return match.group(1)

        raise Exception("Failed to parse generated test ID")

    async def generate_pdf(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
        with_solutions: bool = False,
        with_answers: bool = True,
        with_instructions: bool = False,
    ) -> str:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        _validate_subject(subject, exam_type)

        base_url = _get_base_url(subject, exam_type)
        url = f"{base_url}/test"

        params: dict[str, Any] = {
            "id": str(variant_id),
            "print": "true",
            "pdf": "true",
        }

        if with_solutions:
            params["sol"] = "true"
        if with_answers:
            params["ans"] = "true"
        if with_instructions:
            params["pre"] = "true"

        response_text = await self._transport.get(url, params=params)

        import re

        match = re.search(r'href="([^"]*\.pdf)"', response_text)
        if match:
            pdf_path = match.group(1)
            if not pdf_path.startswith("http"):
                pdf_path = base_url + pdf_path
            return pdf_path

        raise Exception("Failed to find PDF URL in response")

    async def get_full_variant(
        self,
        variant_id: str | int,
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> FullVariant:
        if isinstance(subject, str):
            subject = Subject(subject)
        if isinstance(exam_type, str):
            exam_type = ExamType(exam_type)

        variant = await self.get_variant(variant_id, subject, exam_type)

        problems: list[Problem] = []
        total_score = 0

        for prob_ref in variant.problems:
            problem = await self.get_problem(prob_ref.id, subject, exam_type)
            problems.append(problem)
            total_score += problem.score

        return FullVariant(
            id=variant.id,
            url=variant.url,
            problems=problems,
            subject=subject,
            exam_type=exam_type,
            total_score=total_score,
        )

    async def get_problems_batch(
        self,
        problem_ids: list[str | int],
        subject: Subject | str,
        exam_type: ExamType | str,
    ) -> list[Problem]:
        import asyncio

        tasks = [self.get_problem(pid, subject, exam_type) for pid in problem_ids]
        return await asyncio.gather(*tasks)

    async def close(self) -> None:
        await self._transport.close()

    async def __aenter__(self) -> AsyncSdamgiaClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
