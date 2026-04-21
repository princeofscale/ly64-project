from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def problem_html() -> str:
    return (FIXTURES_DIR / "problem.html").read_text(encoding="utf-8")


@pytest.fixture
def variant_html() -> str:
    return (FIXTURES_DIR / "variant.html").read_text(encoding="utf-8")


@pytest.fixture
def variants_list_html() -> str:
    return (FIXTURES_DIR / "variants_list.html").read_text(encoding="utf-8")


@pytest.fixture
def catalog_html() -> str:
    return (FIXTURES_DIR / "catalog.html").read_text(encoding="utf-8")


@pytest.fixture
def search_results_html() -> str:
    return (FIXTURES_DIR / "search_results.html").read_text(encoding="utf-8")
