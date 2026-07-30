import pytest
from app.core.database import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Automatically initialize database tables before running the pytest suite.
    """
    init_db()
    yield
