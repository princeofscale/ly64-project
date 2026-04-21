from sdamgia_api.models import ExamType, Subject
from sdamgia_api.parsers import (
    parse_catalog,
    parse_problem,
    parse_search_results,
    parse_variant,
    parse_variant_list,
)


class TestParseProblem:
    def test_parse_problem_basic(self, problem_html: str) -> None:
        problem = parse_problem(
            problem_html,
            "1001",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert problem.id == "1001"
        assert problem.subject == Subject.MATH
        assert problem.exam_type == ExamType.EGE
        assert problem.url == "https://math-ege.sdamgia.ru/problem?id=1001"

    def test_parse_problem_condition(self, problem_html: str) -> None:
        problem = parse_problem(
            problem_html,
            "1001",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert "60 вопросов" in problem.condition.text
        assert "Андрей" in problem.condition.text
        assert len(problem.condition.images) == 1
        assert "formula/svg/test.svg" in problem.condition.images[0]

    def test_parse_problem_solution(self, problem_html: str) -> None:
        problem = parse_problem(
            problem_html,
            "1001",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert problem.solution is not None
        assert "57 вопросов" in problem.solution.text
        assert len(problem.solution.images) == 1

    def test_parse_problem_answer(self, problem_html: str) -> None:
        problem = parse_problem(
            problem_html,
            "1001",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert problem.answer == "0,95"

    def test_parse_problem_analogs(self, problem_html: str) -> None:
        problem = parse_problem(
            problem_html,
            "1001",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert "1001" in problem.analogs
        assert "1002" in problem.analogs
        assert "1003" in problem.analogs
        assert "Все" not in problem.analogs


class TestParseVariant:
    def test_parse_variant_basic(self, variant_html: str) -> None:
        variant = parse_variant(
            variant_html,
            "12345",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert variant.id == "12345"
        assert variant.subject == Subject.MATH
        assert variant.exam_type == ExamType.EGE
        assert variant.url == "https://math-ege.sdamgia.ru/test?id=12345"

    def test_parse_variant_problems(self, variant_html: str) -> None:
        variant = parse_variant(
            variant_html,
            "12345",
            "https://math-ege.sdamgia.ru",
            Subject.MATH,
            ExamType.EGE,
        )

        assert len(variant.problems) == 3
        assert variant.problems[0].id == "77345"
        assert variant.problems[0].number == 1
        assert variant.problems[1].id == "28765"
        assert variant.problems[1].number == 2
        assert variant.problems[2].id == "77374"
        assert variant.problems[2].number == 3


class TestParseVariantList:
    def test_parse_variant_list(self, variants_list_html: str) -> None:
        variants = parse_variant_list(
            variants_list_html,
            "https://math-ege.sdamgia.ru",
        )

        assert len(variants) == 3
        assert variants[0].id == "12345"
        assert variants[0].title == "Вариант 1"
        assert variants[1].id == "12346"
        assert variants[2].id == "12347"


class TestParseCatalog:
    def test_parse_catalog_topics(self, catalog_html: str) -> None:
        catalog = parse_catalog(
            catalog_html,
            Subject.MATH,
            ExamType.EGE,
        )

        assert len(catalog.topics) == 2
        assert catalog.topics[0].id == "1"
        assert catalog.topics[0].name == "Простейшие текстовые задачи"
        assert catalog.topics[1].id == "2"
        assert catalog.topics[1].name == "Чтение графиков и диаграмм"

    def test_parse_catalog_categories(self, catalog_html: str) -> None:
        catalog = parse_catalog(
            catalog_html,
            Subject.MATH,
            ExamType.EGE,
        )

        topic1_categories = catalog.topics[0].categories
        assert len(topic1_categories) == 3
        assert topic1_categories[0].id == "174"
        assert topic1_categories[0].name == "Вычисления"
        assert topic1_categories[1].id == "1"
        assert topic1_categories[1].name == "Округление с недостатком"


class TestParseSearchResults:
    def test_parse_search_results(self, search_results_html: str) -> None:
        results = parse_search_results(search_results_html)

        assert len(results) == 4
        assert "6407" in results
        assert "8795" in results
        assert "8799" in results
        assert "27501" in results
