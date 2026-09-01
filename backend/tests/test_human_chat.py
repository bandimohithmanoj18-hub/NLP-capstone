import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.user import User
from app.schemas.chat import ChatSessionCreate, ChatMessageCreate
from app.services.chat_service import ChatService
from app.services.rag_service import RAGService
from app.schemas.rag import RAGQueryRequest

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_human_greeting_interaction(db):
    """Test that greetings trigger warm human-like responses."""
    session = ChatService.create_session(db, ChatSessionCreate(title="Test Session"))
    msg = ChatService.send_message(db, session.id, ChatMessageCreate(content="Hi, hello! Who are you?"))
    assert "Hello!" in msg.content or "legal steps" in msg.content
    assert "Consumer Protection Act, 2019" in msg.content


def test_human_qa_pattern_matching_banking(db):
    """Test Q&A pattern matching for unauthorized banking transactions."""
    session = ChatService.create_session(db, ChatSessionCreate(title="Banking Test"))
    msg = ChatService.send_message(
        db,
        session.id,
        ChatMessageCreate(content="Rs 15000 was debited from my HDFC bank account without any OTP yesterday!")
    )

    assert "zero liability" in msg.content.lower() or "hdfc" in msg.content.lower()
    assert "Deficiency in Service" in msg.content or "Section 2(11)" in msg.content


def test_human_qa_faq_edaakhil(db):
    """Test FAQ interaction for e-Daakhil online portal."""
    session = ChatService.create_session(db, ChatSessionCreate(title="FAQ Test"))
    msg = ChatService.send_message(db, session.id, ChatMessageCreate(content="How to file online complaint on edaakhil?"))

    assert "e-Daakhil" in msg.content or "edaakhil.nic.in" in msg.content


def test_rag_service_indexes_human_qa(db):
    """Test that RAGService indexes human interaction Q&A items."""
    count = RAGService.seed_guidelines(db)
    assert count >= 10

    res = RAGService.query(db, RAGQueryRequest(query="unauthorized electronic banking transactions", category="all", top_k=3))
    assert len(res.results) > 0


def test_multilingual_kannada_and_malayalam(db):
    """Test legal response generation in Kannada (kn) and Malayalam (ml)."""
    session = ChatService.create_session(db, ChatSessionCreate(title="Multilingual Test"))

    # Test Kannada
    msg_kn = ChatService.send_message(
        db,
        session.id,
        ChatMessageCreate(content="Damaged product delivered from Flipkart amount Rs 5000", language="kn")
    )
    assert "ಕಾನೂನು" in msg_kn.content or "ವಿಭಾಗ" in msg_kn.content

    # Test Malayalam
    msg_ml = ChatService.send_message(
        db,
        session.id,
        ChatMessageCreate(content="Defective laptop from Amazon cost 45000 rupees", language="ml")
    )
    assert "നിയമപരമായ" in msg_ml.content or "വകുപ്പ്" in msg_ml.content

