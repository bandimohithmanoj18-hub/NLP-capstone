from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, RAGCategoryList
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/query", response_model=RAGQueryResponse, summary="Query RAG knowledge engine")
def query_rag_corpus(
    request_in: RAGQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Performs semantic retrieval across NCH guidelines, Consumer Protection Act 2019 sections,
    E-Commerce Rules 2020, and RBI Banking Customer Rights, returning top matching citations.
    Part of **Milestone 6: RAG knowledge engine**.
    """
    return RAGService.query(db, request_in)


@router.get("/categories", response_model=RAGCategoryList, summary="List available RAG corpus categories")
def list_rag_categories(db: Session = Depends(get_db)):
    """
    Returns all legal domain categories available in the RAG knowledge corpus.
    Part of **Milestone 6: RAG knowledge engine**.
    """
    return RAGService.get_categories(db)


@router.post("/seed", summary="Seed NCH guidelines corpus into SQLite")
def seed_rag_guidelines(db: Session = Depends(get_db)):
    """
    Seeds default NCH guidelines and CPA 2019 statutory sections into SQLite.
    Part of **Milestone 6: RAG knowledge engine**.
    """
    count = RAGService.seed_guidelines(db)
    return {"success": True, "seeded_count": count, "message": "NCH guidelines seeded successfully."}
