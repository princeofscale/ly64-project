from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class ExamType(str, Enum):
    OGE = "oge"
    EGE = "ege"


class Subject(str, Enum):
    MATH = "math"
    MATHB = "mathb"
    PHYS = "phys"
    INF = "inf"
    RUS = "rus"
    BIO = "bio"
    EN = "en"
    CHEM = "chem"
    GEO = "geo"
    SOC = "soc"
    DE = "de"
    FR = "fr"
    LIT = "lit"
    SP = "sp"
    HIST = "hist"


class ContentBlock(BaseModel):
    text: str = ""
    html: str = ""
    images: list[str] = Field(default_factory=list)


class Problem(BaseModel):
    id: str
    url: str
    topic: str = ""
    condition: ContentBlock = Field(default_factory=ContentBlock)
    solution: ContentBlock | None = None
    answer: str = ""
    analogs: list[str] = Field(default_factory=list)
    subject: Subject
    exam_type: ExamType
    score: int = 1


class ProblemRef(BaseModel):
    id: str
    number: int
    url: str


class Variant(BaseModel):
    id: str
    url: str
    problems: list[ProblemRef] = Field(default_factory=list)
    subject: Subject
    exam_type: ExamType


class VariantInfo(BaseModel):
    id: str
    url: str
    title: str = ""


class Category(BaseModel):
    id: str
    name: str


class Topic(BaseModel):
    id: str
    name: str
    categories: list[Category] = Field(default_factory=list)


class Catalog(BaseModel):
    topics: list[Topic] = Field(default_factory=list)
    subject: Subject
    exam_type: ExamType


class FullVariant(BaseModel):
    id: str
    url: str
    problems: list[Problem] = Field(default_factory=list)
    subject: Subject
    exam_type: ExamType
    total_score: int = 0


class TestGenerationParams(BaseModel):
    problems_per_topic: dict[str, int] | None = None
    full: int | None = None
