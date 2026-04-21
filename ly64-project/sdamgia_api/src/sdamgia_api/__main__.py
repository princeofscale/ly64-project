from __future__ import annotations

import argparse
import json
import sys

from .client import SdamgiaClient
from .models import ExamType, Subject


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="sdamgia",
        description="CLI для работы с sdamgia.ru",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    problem_parser = subparsers.add_parser("problem", help="Получить задачу по ID")
    problem_parser.add_argument("id", help="ID задачи")
    problem_parser.add_argument("--subject", "-s", default="math", help="Предмет (math, rus, phys, ...)")
    problem_parser.add_argument("--exam", "-e", default="ege", choices=["oge", "ege"], help="Тип экзамена")
    problem_parser.add_argument("--json", action="store_true", help="Вывод в JSON")

    search_parser = subparsers.add_parser("search", help="Поиск задач")
    search_parser.add_argument("query", help="Поисковый запрос")
    search_parser.add_argument("--subject", "-s", default="math")
    search_parser.add_argument("--exam", "-e", default="ege", choices=["oge", "ege"])
    search_parser.add_argument("--page", "-p", type=int, default=1)

    catalog_parser = subparsers.add_parser("catalog", help="Каталог тем")
    catalog_parser.add_argument("--subject", "-s", default="math")
    catalog_parser.add_argument("--exam", "-e", default="ege", choices=["oge", "ege"])
    catalog_parser.add_argument("--json", action="store_true")

    variant_parser = subparsers.add_parser("variant", help="Получить вариант")
    variant_parser.add_argument("id", help="ID варианта")
    variant_parser.add_argument("--subject", "-s", default="math")
    variant_parser.add_argument("--exam", "-e", default="ege", choices=["oge", "ege"])
    variant_parser.add_argument("--json", action="store_true")

    args = parser.parse_args()

    try:
        subject = Subject(args.subject)
        exam_type = ExamType(args.exam)
    except ValueError as e:
        print(f"Ошибка: {e}", file=sys.stderr)
        sys.exit(1)

    with SdamgiaClient() as client:
        if args.command == "problem":
            problem = client.get_problem(args.id, subject, exam_type)
            if getattr(args, "json", False):
                print(problem.model_dump_json(indent=2))
            else:
                print(f"ID: {problem.id}")
                print(f"Тема: {problem.topic}")
                print(f"URL: {problem.url}")
                print(f"Условие: {problem.condition.text[:300]}")
                print(f"Ответ: {problem.answer}")
                if problem.analogs:
                    print(f"Аналоги: {', '.join(problem.analogs[:5])}")

        elif args.command == "search":
            results = client.search(args.query, subject, exam_type, page=args.page)
            print(f"Найдено: {len(results)}")
            for pid in results:
                print(f"  #{pid}")

        elif args.command == "catalog":
            catalog = client.get_catalog(subject, exam_type)
            if getattr(args, "json", False):
                print(catalog.model_dump_json(indent=2))
            else:
                print(f"Предмет: {subject.value}, Экзамен: {exam_type.value}")
                print(f"Тем: {len(catalog.topics)}")
                for topic in catalog.topics:
                    print(f"  {topic.id}. {topic.name} ({len(topic.categories)} категорий)")

        elif args.command == "variant":
            variant = client.get_variant(args.id, subject, exam_type)
            if getattr(args, "json", False):
                print(variant.model_dump_json(indent=2))
            else:
                print(f"Вариант {variant.id}: {len(variant.problems)} задач")
                print(f"URL: {variant.url}")
                for ref in variant.problems:
                    print(f"  #{ref.number}: задача {ref.id}")


if __name__ == "__main__":
    main()
