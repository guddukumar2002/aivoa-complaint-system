from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} '{id}' not found", status_code=404)


class ForbiddenError(AppError):
    def __init__(self, detail: str = "Access denied"):
        super().__init__(detail, status_code=403)


class ConflictError(AppError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=409)


class UploadError(AppError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=422)


def _error_body(status_code: int, message: str) -> dict:
    return {"error": {"status": status_code, "message": message}}


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=_error_body(exc.status_code, exc.message))


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [{"field": ".".join(str(l) for l in e["loc"]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"error": {"status": 422, "message": "Validation failed", "details": errors}})


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content=_error_body(500, "Internal server error"))
