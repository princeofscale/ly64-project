from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

from .exceptions import NotFoundError
from .models import (
    Catalog,
    Category,
    ContentBlock,
    ExamType,
    Problem,
    ProblemRef,
    Subject,
    Topic,
    Variant,
    VariantInfo,
)


def _extract_images(element: Tag, base_url: str) -> list[str]:
    images: list[str] = []
    for img in element.find_all("img"):
        src = str(img.get("src", ""))
        if src:
            if not src.startswith(("http://", "https://")):
                src = urljoin(base_url, src)
            images.append(src)
    return images


def _make_absolute_urls(element: Tag, base_url: str) -> None:
    for img in element.find_all("img"):
        src = str(img.get("src", ""))
        if src and not src.startswith(("http://", "https://")):
            img["src"] = urljoin(base_url, src)


def parse_problem(
    html: str,
    problem_id: str,
    base_url: str,
    subject: Subject,
    exam_type: ExamType,
) -> Problem:
    soup = BeautifulSoup(html, "html.parser")

    prob_block = soup.find("div", {"class": "prob_maindiv"})
    if prob_block is None or not isinstance(prob_block, Tag):
        raise NotFoundError("Problem", problem_id)

    _make_absolute_urls(prob_block, base_url)

    topic = ""
    prob_nums = prob_block.find("span", {"class": "prob_nums"})
    if prob_nums and isinstance(prob_nums, Tag):
        text = prob_nums.get_text()
        parts = text.split()
        if len(parts) > 1:
            topic = " ".join(parts[1:-2]) if len(parts) > 3 else parts[1] if len(parts) > 1 else ""

    condition = ContentBlock()
    pbody_list = prob_block.find_all("div", {"class": "pbody"})
    if pbody_list and len(pbody_list) > 0:
        first_pbody = pbody_list[0]
        if isinstance(first_pbody, Tag):
            condition = ContentBlock(
                text=first_pbody.get_text(strip=True),
                html=str(first_pbody),
                images=_extract_images(first_pbody, base_url),
            )

    solution = None
    if len(pbody_list) > 1:
        second_pbody = pbody_list[1]
        if isinstance(second_pbody, Tag):
            solution = ContentBlock(
                text=second_pbody.get_text(strip=True),
                html=str(second_pbody),
                images=_extract_images(second_pbody, base_url),
            )

    answer = ""
    answer_div = prob_block.find("div", {"class": "answer"})
    if answer_div and isinstance(answer_div, Tag):
        answer = answer_div.get_text(strip=True).replace("Ответ:", "").strip()

    analogs: list[str] = []
    minor_div = prob_block.find("div", {"class": "minor"})
    if minor_div and isinstance(minor_div, Tag):
        for link in minor_div.find_all("a"):
            text = link.get_text(strip=True)
            if text and text != "Все" and text.isdigit():
                analogs.append(text)

    url = f"{base_url}/problem?id={problem_id}"

    return Problem(
        id=problem_id,
        url=url,
        topic=topic,
        condition=condition,
        solution=solution,
        answer=answer,
        analogs=analogs,
        subject=subject,
        exam_type=exam_type,
    )


def parse_variant(
    html: str,
    variant_id: str,
    base_url: str,
    subject: Subject,
    exam_type: ExamType,
) -> Variant:
    soup = BeautifulSoup(html, "html.parser")

    problems: list[ProblemRef] = []

    prob_list = soup.find("div", {"class": "prob_list"})
    if prob_list:
        prob_nums = prob_list.find_all("div", {"class": "prob_num"})
        for prob_num in prob_nums:
            if not isinstance(prob_num, Tag):
                continue

            num_text = prob_num.get_text(strip=True)
            try:
                number = int(num_text)
            except ValueError:
                continue

            prob_view = prob_num.find_next_sibling("div", {"class": "prob_view"})
            if prob_view:
                links = prob_view.find_all("a", href=True)
                for link in links:
                    href = str(link.get("href", ""))
                    match = re.search(r"problem\?id=(\d+)", href)
                    if match:
                        problem_id = match.group(1)
                        problems.append(
                            ProblemRef(
                                id=problem_id,
                                number=number,
                                url=f"{base_url}/problem?id={problem_id}",
                            )
                        )
                        break

    url = f"{base_url}/test?id={variant_id}"

    return Variant(
        id=variant_id,
        url=url,
        problems=problems,
        subject=subject,
        exam_type=exam_type,
    )


def parse_variant_list(html: str, base_url: str) -> list[VariantInfo]:
    soup = BeautifulSoup(html, "html.parser")
    variants: list[VariantInfo] = []

    grid = soup.find("div", {"class": "OurVariants-Grid"})
    if grid and isinstance(grid, Tag):
        for link in grid.find_all("a", href=True):
            href = str(link.get("href", ""))
            match = re.search(r"test\?id=(\d+)", href)
            if match:
                variant_id = match.group(1)
                title = link.get_text(strip=True)
                variants.append(
                    VariantInfo(
                        id=variant_id,
                        url=f"{base_url}/test?id={variant_id}",
                        title=title,
                    )
                )

    if not variants:
        for link in soup.find_all("a", href=True):
            href = str(link.get("href", ""))
            if "test?id=" in href:
                match = re.search(r"test\?id=(\d+)", href)
                if match:
                    variant_id = match.group(1)
                    if not any(v.id == variant_id for v in variants):
                        title = link.get_text(strip=True)
                        variants.append(
                            VariantInfo(
                                id=variant_id,
                                url=f"{base_url}/test?id={variant_id}",
                                title=title,
                            )
                        )

    return variants


def parse_search_results(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    problem_ids: list[str] = []

    for prob_num in soup.find_all("span", {"class": "prob_nums"}):
        if isinstance(prob_num, Tag):
            text = prob_num.get_text(strip=True)
            match = re.search(r"(\d+)\s*$", text)
            if match:
                problem_ids.append(match.group(1))

    return problem_ids


def parse_catalog(
    html: str,
    subject: Subject,
    exam_type: ExamType,
) -> Catalog:
    soup = BeautifulSoup(html, "html.parser")
    topics: list[Topic] = []

    all_categories = soup.find_all("div", {"class": "cat_category"})
    top_level_categories = [
        c for c in all_categories if not c.get("data-id") and isinstance(c, Tag)
    ]

    for topic_div in top_level_categories:
        if not isinstance(topic_div, Tag):
            continue

        topic_name_elem = topic_div.find("b", {"class": "cat_name"})
        if not topic_name_elem or not isinstance(topic_name_elem, Tag):
            continue

        topic_text = topic_name_elem.get_text(strip=True)

        topic_id = ""
        topic_name = topic_text
        if ". " in topic_text:
            parts = topic_text.split(". ", 1)
            topic_id = parts[0].strip()
            if topic_id.startswith("Задания "):
                topic_id = topic_id.replace("Задания ", "")
            topic_name = parts[1] if len(parts) > 1 else topic_text

        categories: list[Category] = []
        children_div = topic_div.find("div", {"class": "cat_children"})
        if children_div and isinstance(children_div, Tag):
            for cat_div in children_div.find_all("div", {"class": "cat_category"}):
                if not isinstance(cat_div, Tag):
                    continue
                cat_id = cat_div.get("data-id", "")
                cat_name_elem = cat_div.find("a", {"class": "cat_name"})
                if cat_name_elem and isinstance(cat_name_elem, Tag):
                    cat_name = cat_name_elem.get_text(strip=True)
                    if cat_id:
                        categories.append(Category(id=str(cat_id), name=cat_name))

        if topic_id or topic_name:
            topics.append(Topic(id=topic_id, name=topic_name, categories=categories))

    return Catalog(topics=topics, subject=subject, exam_type=exam_type)


def parse_category_problems(html: str) -> list[str]:
    return parse_search_results(html)
