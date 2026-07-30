from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Generic API wrapper schema."""
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[Any] = None
