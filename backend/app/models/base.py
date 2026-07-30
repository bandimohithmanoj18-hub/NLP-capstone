from datetime import datetime, timezone
from sqlalchemy import Column, DateTime


def utcnow():
    return datetime.now(timezone.utc)


class TimestampMixin:
    """Mixin for automatic created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
