#!/usr/bin/env python3

import sys
import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from contextlib import contextmanager

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "sdamgia_api" / "src"))

try:
    from sdamgia_api import SdamgiaClient, Subject, ExamType
except ImportError:
    print("Error: sdamgia_api not found. Make sure it's installed.")
    print("Run: cd sdamgia_api && pip install -e .")
    sys.exit(1)


class DatabaseSeeder:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn: Optional[sqlite3.Connection] = None

    def connect(self) -> None:
        self.conn = sqlite3.connect(self.db_path, detect_types=0)
        self.conn.row_factory = sqlite3.Row

    def close(self) -> None:
        if self.conn:
            self.conn.close()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def create_question(
        self,
        problem,
        subject: str,
        exam_type: str,
        target_grade: str
    ) -> str:
        question_id = str(uuid.uuid4())
        question_type = "SHORT_ANSWER"
        options = None

        question_text = (
            problem.condition.html if hasattr(problem.condition, 'html')
            else problem.condition.text if hasattr(problem.condition, 'text')
            else str(problem.condition)
        )

        correct_answer = problem.answer

        explanation = None
        if problem.solution:
            if hasattr(problem.solution, 'html'):
                explanation = problem.solution.html
            elif hasattr(problem.solution, 'text'):
                explanation = problem.solution.text

        topic = getattr(problem, 'topic', None)
        difficulty = "MEDIUM"
        timestamp = int(datetime.now().timestamp() * 1000)

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO Question
            (id, subject, examType, targetGrade, type, difficulty,
             question, options, correctAnswer, explanation, topic, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            question_id, subject, exam_type, target_grade, question_type,
            difficulty, question_text, json.dumps(options) if options else None,
            correct_answer, explanation, topic, timestamp, timestamp
        ))

        self.conn.commit()
        return question_id

    def create_test(
        self,
        title: str,
        subject: str,
        exam_type: str,
        target_grade: str,
        question_ids: List[str]
    ) -> str:
        test_id = str(uuid.uuid4())
        timestamp = int(datetime.now().timestamp() * 1000)

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO Test
            (id, title, description, subject, examType, targetGrade,
             isDiagnostic, randomizeQuestions, preventBackNavigation,
             timeLimit, passingScore, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test_id, title, f"Тест по {subject} ({exam_type})",
            subject, exam_type, target_grade,
            0, 0, 0, None, None, timestamp, timestamp
        ))

        for order, question_id in enumerate(question_ids):
            test_question_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO TestQuestion (id, testId, questionId, "order")
                VALUES (?, ?, ?, ?)
            """, (test_question_id, test_id, question_id, order))

        self.conn.commit()
        return test_id

    def fetch_and_create_variant(
        self,
        variant_id: str,
        subject: Subject,
        exam_type: ExamType,
        target_grade: str
    ) -> Optional[str]:
        print(f"Fetching variant {variant_id} for {subject.value} {exam_type.value}...")

        with SdamgiaClient() as client:
            try:
                variant = client.get_variant(variant_id, subject, exam_type)
                print(f"Found {len(variant.problems)} problems in variant")

                question_ids = []
                for idx, problem_ref in enumerate(variant.problems, 1):
                    try:
                        problem = client.get_problem(problem_ref.id, subject, exam_type)
                        question_id = self.create_question(
                            problem,
                            self._map_subject(subject),
                            self._map_exam_type(exam_type),
                            target_grade
                        )
                        question_ids.append(question_id)
                        print(f"  Created question {idx}/{len(variant.problems)}: {problem_ref.id}")
                    except Exception as e:
                        print(f"  Warning: Failed to fetch problem {problem_ref.id}: {e}")
                        continue

                if not question_ids:
                    print(f"✗ No questions created for variant {variant_id}")
                    return None

                test_title = f"{self._map_exam_type(exam_type)} {self._map_subject(subject)} - Вариант {variant_id}"
                test_id = self.create_test(
                    test_title,
                    self._map_subject(subject),
                    self._map_exam_type(exam_type),
                    target_grade,
                    question_ids
                )
                print(f"✓ Created test: {test_title} (ID: {test_id})")
                return test_id

            except Exception as e:
                print(f"✗ Error fetching variant {variant_id}: {e}")
                return None

    @staticmethod
    def _map_subject(subject: Subject) -> str:
        mapping = {
            Subject.MATH: "MATHEMATICS",
            Subject.MATHB: "MATHEMATICS",
            Subject.RUS: "RUSSIAN",
            Subject.PHYS: "PHYSICS",
            Subject.INF: "INFORMATICS",
            Subject.BIO: "BIOLOGY",
            Subject.CHEM: "CHEMISTRY",
            Subject.HIST: "HISTORY",
            Subject.SOC: "SOCIAL_STUDIES",
            Subject.GEO: "GEOGRAPHY",
            Subject.EN: "ENGLISH",
            Subject.LIT: "LITERATURE",
        }
        return mapping.get(subject, subject.value.upper())

    @staticmethod
    def _map_exam_type(exam_type: ExamType) -> str:
        return exam_type.value.upper()


def main() -> None:
    db_path = Path(__file__).parent.parent / "prisma" / "dev.db"

    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        print("Please run: npm run prisma:migrate --workspace=backend")
        sys.exit(1)

    print(f"Using database: {db_path}")

    try:
        with DatabaseSeeder(str(db_path)) as seeder:
            print("\n=== Fetching OGE Math variants ===")
            seeder.fetch_and_create_variant("12345", Subject.MATH, ExamType.OGE, "GRADE_9")

            print("\n=== Fetching EGE Math Profile variants ===")
            seeder.fetch_and_create_variant("33333", Subject.MATH, ExamType.EGE, "GRADE_11")

            print("\n=== Fetching EGE Math Base variants ===")
            seeder.fetch_and_create_variant("11111", Subject.MATHB, ExamType.EGE, "GRADE_11")

            print("\n=== Fetching OGE Russian variants ===")
            seeder.fetch_and_create_variant("88888", Subject.RUS, ExamType.OGE, "GRADE_9")

            print("\n✓ All variants fetched successfully!")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
