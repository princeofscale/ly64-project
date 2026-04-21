from sdamgia_api.models import (
    Catalog,
    Category,
    ContentBlock,
    ExamType,
    Problem,
    ProblemRef,
    Subject,
    Topic,
    Variant,
)


class TestSubject:
    def test_subject_values(self) -> None:
        assert Subject.MATH.value == "math"
        assert Subject.PHYS.value == "phys"
        assert Subject.INF.value == "inf"
        assert Subject.RUS.value == "rus"

    def test_subject_from_string(self) -> None:
        assert Subject("math") == Subject.MATH
        assert Subject("phys") == Subject.PHYS


class TestExamType:
    def test_exam_type_values(self) -> None:
        assert ExamType.OGE.value == "oge"
        assert ExamType.EGE.value == "ege"

    def test_exam_type_from_string(self) -> None:
        assert ExamType("oge") == ExamType.OGE
        assert ExamType("ege") == ExamType.EGE


class TestContentBlock:
    def test_content_block_defaults(self) -> None:
        block = ContentBlock()
        assert block.text == ""
        assert block.html == ""
        assert block.images == []

    def test_content_block_with_data(self) -> None:
        block = ContentBlock(
            text="Test text",
            html="<p>Test</p>",
            images=["img1.png", "img2.png"],
        )
        assert block.text == "Test text"
        assert block.html == "<p>Test</p>"
        assert len(block.images) == 2


class TestProblem:
    def test_problem_creation(self) -> None:
        problem = Problem(
            id="1001",
            url="https://math-ege.sdamgia.ru/problem?id=1001",
            topic="4",
            condition=ContentBlock(text="Test condition"),
            answer="42",
            analogs=["1002", "1003"],
            subject=Subject.MATH,
            exam_type=ExamType.EGE,
        )

        assert problem.id == "1001"
        assert problem.topic == "4"
        assert problem.answer == "42"
        assert len(problem.analogs) == 2
        assert problem.solution is None

    def test_problem_serialization(self) -> None:
        problem = Problem(
            id="1001",
            url="https://math-ege.sdamgia.ru/problem?id=1001",
            subject=Subject.MATH,
            exam_type=ExamType.EGE,
        )

        data = problem.model_dump()
        assert data["id"] == "1001"
        assert data["subject"] == "math"
        assert data["exam_type"] == "ege"


class TestVariant:
    def test_variant_creation(self) -> None:
        variant = Variant(
            id="12345",
            url="https://math-ege.sdamgia.ru/test?id=12345",
            problems=[
                ProblemRef(id="1001", number=1, url="url1"),
                ProblemRef(id="1002", number=2, url="url2"),
            ],
            subject=Subject.MATH,
            exam_type=ExamType.EGE,
        )

        assert variant.id == "12345"
        assert len(variant.problems) == 2
        assert variant.problems[0].number == 1


class TestCatalog:
    def test_catalog_creation(self) -> None:
        catalog = Catalog(
            topics=[
                Topic(
                    id="1",
                    name="Topic 1",
                    categories=[
                        Category(id="10", name="Category 10"),
                        Category(id="11", name="Category 11"),
                    ],
                ),
            ],
            subject=Subject.MATH,
            exam_type=ExamType.EGE,
        )

        assert len(catalog.topics) == 1
        assert catalog.topics[0].id == "1"
        assert len(catalog.topics[0].categories) == 2
