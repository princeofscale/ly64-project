# SdamGIA API

Современная Python-библиотека для работы с образовательным порталом [sdamgia.ru](https://sdamgia.ru/) для подготовки к ОГЭ/ЕГЭ.

## Возможности

- **Синхронный и асинхронный режим** - `SdamgiaClient` и `AsyncSdamgiaClient`
- **Полная типизация** - type hints для всех методов и моделей
- **Pydantic модели** - структурированные данные с валидацией
- **Rate limiting** - встроенное ограничение частоты запросов
- **Автоповторы с backoff** - автоматические повторы при ошибках
- **ОГЭ и ЕГЭ** - поддержка обоих типов экзаменов
- **Все предметы** - математика, физика, информатика, русский и другие..

## Установка

```bash
git clone https://github.com/princeofscale/oge-sdamgia-api.git
```

## Быстрый старт

### Синхронное использование

```python
from sdamgia_api import SdamgiaClient, Subject, ExamType

client = SdamgiaClient()

problem = client.get_problem("1001", Subject.MATH, ExamType.EGE)
print(f"Задача: {problem.condition.text}")
print(f"Ответ: {problem.answer}")

variant = client.get_variant("12345", Subject.MATH, ExamType.EGE)
for prob_ref in variant.problems:
    print(f"Задача #{prob_ref.number}: {prob_ref.id}")

results = client.search("вероятность", Subject.MATH, ExamType.EGE)
print(f"Найдено {len(results)} задач")

client.close()

with SdamgiaClient() as client:
    problem = client.get_problem("1001", Subject.MATH, ExamType.EGE)
```

### Асинхронное использование

```python
import asyncio
from sdamgia_api import AsyncSdamgiaClient, Subject, ExamType

async def main():
    async with AsyncSdamgiaClient() as client:
        problem = await client.get_problem("1001", Subject.MATH, ExamType.EGE)
        print(f"Задача: {problem.condition.text}")

        catalog = await client.get_catalog(Subject.MATH, ExamType.EGE)
        for topic in catalog.topics:
            print(f"Тема {topic.id}: {topic.name}")

asyncio.run(main())
```

## API

### Клиенты

```python
client = SdamgiaClient(
    user_agent="Custom UA",      # Кастомный User-Agent
    timeout=30.0,                # Таймаут запроса в секундах
    max_retries=3,               # Количество повторов
    rate_limit_rps=3.0,          # Лимит запросов в секунду
    proxy="http://proxy:8080",   # Прокси (опционально)
)
```

### Методы

| Метод | Описание |
|-------|----------|
| `get_problem(id, subject, exam_type)` | Получить задачу по ID |
| `get_variant(id, subject, exam_type)` | Получить вариант по ID |
| `list_variants(subject, exam_type)` | Список доступных вариантов |
| `search(query, subject, exam_type, page=1)` | Поиск задач |
| `get_catalog(subject, exam_type)` | Каталог тем |
| `get_category_problems(id, subject, exam_type, page=1)` | Задачи в категории |

### Модели

#### Problem

```python
class Problem:
    id: str
    url: str
    topic: str
    condition: ContentBlock
    solution: ContentBlock | None
    answer: str
    analogs: list[str]
    subject: Subject
    exam_type: ExamType
```

#### Variant

```python
class Variant:
    id: str
    url: str
    problems: list[ProblemRef]
    subject: Subject
    exam_type: ExamType
```

#### Catalog

```python
class Catalog:
    topics: list[Topic]
    subject: Subject
    exam_type: ExamType
```

### Предметы (Subject)

```python
from sdamgia_api import Subject

Subject.MATH    # Математика
Subject.MATHB   # Математика (базовый уровень, только ЕГЭ)
Subject.PHYS    # Физика
Subject.INF     # Информатика
Subject.RUS     # Русский язык
Subject.BIO     # Биология
Subject.EN      # Английский язык
Subject.CHEM    # Химия
Subject.GEO     # География
Subject.SOC     # Обществознание
Subject.HIST    # История
Subject.LIT     # Литература
Subject.DE      # Немецкий язык
Subject.FR      # Французский язык
Subject.SP      # Испанский язык
```

### Тип экзамена (ExamType)

```python
from sdamgia_api import ExamType

ExamType.OGE  # Основной государственный экзамен (9 класс)
ExamType.EGE  # Единый государственный экзамен (11 класс)
```

### Исключения

```python
from sdamgia_api import (
    SdamgiaError,       # Базовое исключение
    NetworkError,       # Сетевые ошибки
    ParseError,         # Ошибки парсинга HTML
    RateLimitError,     # Превышен лимит запросов (HTTP 429)
    NotFoundError,      # Ресурс не найден
    InvalidSubjectError # Неверный предмет для типа экзамена
)
```

## Разработка

### Установка

```bash
git clone https://github.com/princeofscale/oge-sdamgia-api.git
cd oge-sdamgia-api

pip install -e ".[dev]"

pre-commit install
```

### Тесты

```bash
pytest
```

### Проверка кода

```bash
ruff format .
ruff check .
mypy src/
```

## Лицензия

MIT License - см. файл [LICENSE](LICENSE).

## Автор

**princeofscale** - [GitHub](https://github.com/princeofscale)

## Благодарности

Основано на оригинальном [sdamgia-api](https://github.com/anijackich/sdamgia-api) от anijackich.
