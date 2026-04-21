from __future__ import annotations

import asyncio
from pathlib import Path
from urllib.parse import urlparse

import httpx

from .models import Problem


def download_image_sync(url: str, output_path: str | Path) -> None:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with httpx.Client() as client:
        response = client.get(url)
        response.raise_for_status()
        output_path.write_bytes(response.content)


async def download_image_async(url: str, output_path: str | Path) -> None:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        output_path.write_bytes(response.content)


def download_problem_images_sync(problem: Problem, output_dir: str | Path) -> dict[str, str]:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    downloaded: dict[str, str] = {}

    for idx, img_url in enumerate(problem.condition.images):
        ext = Path(urlparse(img_url).path).suffix or ".png"
        filename = f"{problem.id}_condition_{idx}{ext}"
        output_path = output_dir / filename
        download_image_sync(img_url, output_path)
        downloaded[img_url] = str(output_path)

    if problem.solution:
        for idx, img_url in enumerate(problem.solution.images):
            ext = Path(urlparse(img_url).path).suffix or ".png"
            filename = f"{problem.id}_solution_{idx}{ext}"
            output_path = output_dir / filename
            download_image_sync(img_url, output_path)
            downloaded[img_url] = str(output_path)

    return downloaded


async def download_problem_images_async(problem: Problem, output_dir: str | Path) -> dict[str, str]:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    downloaded: dict[str, str] = {}
    tasks = []

    for idx, img_url in enumerate(problem.condition.images):
        ext = Path(urlparse(img_url).path).suffix or ".png"
        filename = f"{problem.id}_condition_{idx}{ext}"
        output_path = output_dir / filename
        tasks.append((img_url, output_path))

    if problem.solution:
        for idx, img_url in enumerate(problem.solution.images):
            ext = Path(urlparse(img_url).path).suffix or ".png"
            filename = f"{problem.id}_solution_{idx}{ext}"
            output_path = output_dir / filename
            tasks.append((img_url, output_path))

    async def download_task(url: str, path: Path) -> tuple[str, str]:
        await download_image_async(url, path)
        return url, str(path)

    results = await asyncio.gather(*[download_task(url, path) for url, path in tasks])

    for url, path in results:
        downloaded[url] = path

    return downloaded
