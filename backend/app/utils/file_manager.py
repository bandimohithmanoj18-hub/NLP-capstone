import os
import shutil
from pathlib import Path
from typing import Optional
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger("app.utils.file_manager")


class FileManager:
    """
    Utility class for safe file management, uploads, and generated output storage.
    """
    @staticmethod
    def save_upload_file(file_content: bytes, filename: str) -> Path:
        """Saves an uploaded file to the configured uploads directory."""
        settings.ensure_directories()
        safe_filename = filename.replace(" ", "_").replace("..", "_")
        target_path = settings.UPLOADS_DIR / safe_filename
        with open(target_path, "wb") as f:
            f.write(file_content)
        logger.info(f"Saved uploaded file to {target_path}")
        return target_path

    @staticmethod
    def get_file_size(file_path: Path) -> int:
        """Returns size in bytes of a file."""
        if file_path.exists():
            return os.path.getsize(file_path)
        return 0

    @staticmethod
    def get_generated_path(filename: str) -> Path:
        """Returns the full target path for a generated document."""
        settings.ensure_directories()
        safe_filename = filename.replace(" ", "_").replace("..", "_")
        return settings.GENERATED_DIR / safe_filename
