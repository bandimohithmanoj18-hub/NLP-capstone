from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RAGQueryRequest(BaseModel):
    """Request schema for RAG knowledge retrieval."""
    query: str = Field(..., min_length=2, description="User legal query or search keywords")
    category: Optional[str] = None
    top_k: int = Field(default=3, ge=1, le=10)


class RAGGuidelineResult(BaseModel):
    """Schema representing a retrieved legal guideline or statutory provision."""
    id: int
    guideline_code: str
    title: str
    category: str
    forum_level: str
    summary: str
    full_text: str
    statutory_reference: Optional[str] = None
    similarity_score: float = 0.95

    model_config = ConfigDict(from_attributes=True)


class RAGQueryResponse(BaseModel):
    """Response containing retrieved legal guidelines and synthesized legal guidance."""
    query: str
    category_filter: Optional[str] = None
    retrieved_count: int
    results: List[RAGGuidelineResult]
    synthesized_answer: str


class RAGCategoryList(BaseModel):
    """List of available legal categories in the RAG corpus."""
    categories: List[str]
