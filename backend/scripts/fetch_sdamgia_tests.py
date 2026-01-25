#!/usr/bin/env python3
"""
Script to fetch test data from sdamgia.ru using sdamgia_api
and populate the database with questions and tests.
"""

import sys
import os
import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path

# Add sdamgia_api to path
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
        self.conn = None

    def connect(self):
        """Connect to SQLite database"""
        self.conn = sqlite3.connect(self.db_path, detect_types=0)  # Disable type detection
        self.conn.row_factory = sqlite3.Row

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

    def create_question(self, problem, subject: str, exam_type: str, target_grade: str) -> str:
        """Create a question in the database"""
        question_id = str(uuid.uuid4())

        # Determine question type based on problem data
        question_type = "SHORT_ANSWER"  # Default
        options = None

        # Get question HTML (preserves formulas and images)
        question_text = problem.condition.html if hasattr(problem.condition, 'html') else (
            problem.condition.text if hasattr(problem.condition, 'text') else str(problem.condition)
        )

        # Get correct answer
        correct_answer = problem.answer

        # Get explanation if available
        explanation = None
        if problem.solution and hasattr(problem.solution, 'html'):
            explanation = problem.solution.html
        elif problem.solution and hasattr(problem.solution, 'text'):
            explanation = problem.solution.text

        # Get topic
        topic = problem.topic if hasattr(problem, 'topic') else None

        # Determine difficulty (default to MEDIUM)
        difficulty = "MEDIUM"

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO Question
            (id, subject, examType, targetGrade, type, difficulty,
             question, options, correctAnswer, explanation, topic, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            question_id,
            subject,
            exam_type,
            target_grade,
            question_type,
            difficulty,
            question_text,
            json.dumps(options) if options else None,
            correct_answer,
            explanation,
            topic,
            int(datetime.now().timestamp() * 1000),  # Milliseconds since epoch
            int(datetime.now().timestamp() * 1000)
        ))

        self.conn.commit()
        return question_id

    def create_test(self, title: str, subject: str, exam_type: str,
                   target_grade: str, question_ids: list) -> str:
        """Create a test with questions"""
        test_id = str(uuid.uuid4())

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO Test
            (id, title, description, subject, examType, targetGrade,
             isDiagnostic, randomizeQuestions, preventBackNavigation,
             timeLimit, passingScore, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test_id,
            title,
            f"Тест по {subject} ({exam_type})",
            subject,
            exam_type,
            target_grade,
            0,  # isDiagnostic
            0,  # randomizeQuestions - disabled for OGE/EGE to preserve original order
            0,  # preventBackNavigation
            None,  # timeLimit
            None,  # passingScore
            int(datetime.now().timestamp() * 1000),  # Milliseconds since epoch
            int(datetime.now().timestamp() * 1000)
        ))

        # Add questions to test
        for order, question_id in enumerate(question_ids):
            test_question_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO TestQuestion (id, testId, questionId, "order")
                VALUES (?, ?, ?, ?)
            """, (test_question_id, test_id, question_id, order))

        self.conn.commit()
        return test_id

    def fetch_and_create_variant(self, variant_id: str, subject: Subject,
                                exam_type: ExamType, target_grade: str):
        """Fetch a variant from sdamgia and create test with questions"""
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

                if question_ids:
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
                else:
                    print(f"✗ No questions created for variant {variant_id}")
                    return None

            except Exception as e:
                print(f"✗ Error fetching variant {variant_id}: {e}")
                return None

    @staticmethod
    def _map_subject(subject: Subject) -> str:
        """Map sdamgia Subject to database subject"""
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
        """Map sdamgia ExamType to database examType"""
        return exam_type.value.upper()


def main():
    # Path to database
    db_path = Path(__file__).parent.parent / "prisma" / "dev.db"

    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        print("Please run: npm run prisma:migrate --workspace=backend")
        sys.exit(1)

    print(f"Using database: {db_path}")

    seeder = DatabaseSeeder(str(db_path))
    seeder.connect()

    try:
        # Fetch OGE Math variants (вариант 12345 - полный ОГЭ с 26 заданиями)
        print("\n=== Fetching OGE Math variants ===")
        seeder.fetch_and_create_variant("12345", Subject.MATH, ExamType.OGE, "GRADE_9")

        # Fetch EGE Math variants (profile level)
        print("\n=== Fetching EGE Math Profile variants ===")
        seeder.fetch_and_create_variant("33333", Subject.MATH, ExamType.EGE, "GRADE_11")

        # Fetch EGE Math Base variants
        print("\n=== Fetching EGE Math Base variants ===")
        seeder.fetch_and_create_variant("11111", Subject.MATHB, ExamType.EGE, "GRADE_11")

        # Fetch OGE Russian variants
        print("\n=== Fetching OGE Russian variants ===")
        seeder.fetch_and_create_variant("88888", Subject.RUS, ExamType.OGE, "GRADE_9")

        print("\n✓ All variants fetched successfully!")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        seeder.close()


if __name__ == "__main__":
    main()
