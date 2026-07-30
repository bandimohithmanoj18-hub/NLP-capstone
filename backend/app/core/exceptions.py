from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logger import get_logger

logger = get_logger("app.exceptions")


class AppException(Exception):
    """Base exception class for application-level errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ResourceNotFoundException(AppException):
    """Raised when a requested resource is not found."""
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            message=f"{resource} with ID '{resource_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ValidationException(AppException):
    """Raised when request validation fails."""
    def __init__(self, detail: str):
        super().__init__(
            message=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class UnauthorizedException(AppException):
    """Raised when user is unauthorized or token is invalid."""
    def __init__(self, detail: str = "Not authenticated."):
        super().__init__(
            message=detail,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """FastAPI exception handler for application exceptions."""
    logger.error(f"AppException [{exc.status_code}] on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.message,
            "path": str(request.url.path),
        },
    )
