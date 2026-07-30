from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_user, get_current_active_user
from app.models.user import User
from app.schemas.chat import (
    ChatSessionCreate,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionSummaryResponse,
    ChatSessionResponse,
)
from app.services.chat_service import ChatService

router = APIRouter()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED, summary="Create new legal consultation session")
def create_chat_session(
    session_in: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Creates a new legal consultation session in SQLite, generates a domain-tailored AI welcome message,
    and initializes statutory triage metadata. Works both anonymously and authenticated.
    Part of **Milestone 3: AI chat interface**.
    """
    user_id = current_user.id if current_user else None
    session = ChatService.create_session(db, session_in, user_id=user_id)
    return session


@router.get("/sessions", response_model=List[ChatSessionSummaryResponse], summary="List user's consultation sessions")
def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Retrieves a list of all legal consultation chat sessions for the active user (or anonymous sessions).
    Part of **Milestone 3: AI chat interface**.
    """
    user_id = current_user.id if current_user else None
    return ChatService.get_user_sessions(db, user_id=user_id)


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse, summary="Get full session history")
def get_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieves full chat message history, timestamps, and extracted JSON triage entities for a session.
    Part of **Milestone 3: AI chat interface**.
    """
    session = ChatService.get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session ID {session_id} not found.",
        )
    return session


@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse, summary="Send message to legal assistant")
def send_chat_message(
    session_id: int,
    message_in: ChatMessageCreate,
    db: Session = Depends(get_db),
):
    """
    Sends a user prompt to the legal triage assistant, extracts key case facts (merchant, claim amount, dates),
    determines statutory jurisdiction forum, and generates an authoritative legal response.
    Part of **Milestone 3: AI chat interface**.
    """
    try:
        return ChatService.send_message(db, session_id, message_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/sessions/{session_id}", summary="Delete a chat session")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    """
    Deletes a chat session and all its recorded messages from the SQLite database.
    Part of **Milestone 3: AI chat interface**.
    """
    success = ChatService.delete_session(db, session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session ID {session_id} not found.",
        )
    return {"success": True, "message": f"Chat session {session_id} deleted successfully."}
