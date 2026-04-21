from __future__ import annotations


class SdamgiaError(Exception):
    pass


class NetworkError(SdamgiaError):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        self.status_code = status_code
        super().__init__(message)


class ParseError(SdamgiaError):
    def __init__(self, message: str, url: str | None = None) -> None:
        self.url = url
        super().__init__(message)


class RateLimitError(NetworkError):
    def __init__(self, message: str = "Rate limit exceeded", retry_after: int | float = 3) -> None:
        self.retry_after = retry_after
        super().__init__(message, status_code=429)


class NotFoundError(SdamgiaError):
    def __init__(self, resource_type: str, resource_id: str) -> None:
        self.resource_type = resource_type
        self.resource_id = resource_id
        super().__init__(f"{resource_type} with id '{resource_id}' not found")


class InvalidSubjectError(SdamgiaError):
    def __init__(self, subject: str, exam_type: str) -> None:
        self.subject = subject
        self.exam_type = exam_type
        super().__init__(f"Subject '{subject}' is not available for exam type '{exam_type}'")
