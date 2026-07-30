from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExtractedEntity(BaseModel):
    """A named entity extracted from grievance text."""
    entity_type: str  # MERCHANT, PRODUCT, AMOUNT, DATE, DEFECT, RELIEF
    value: str
    confidence: float = 0.95


class StatutoryPrecedent(BaseModel):
    """Legal rule or section relevant to the grievance."""
    statute: str  # e.g., Consumer Protection Act, 2019
    section: str  # e.g., Section 2(11)
    title: str    # e.g., Deficiency in Service
    summary: str


class NLPAnalyzeRequest(BaseModel):
    """Request payload for NLP grievance analysis."""
    text: str = Field(..., min_length=5, description="Consumer grievance narrative")
    domain_hint: Optional[str] = None


class NLPAnalyzeResponse(BaseModel):
    """Response payload containing NER, intent, merit score, and statutory rules."""
    domain_category: str
    intent_classification: str
    merit_score_percentage: int = Field(..., description="Statutory legal merit score (0-100%)")
    entities: List[ExtractedEntity] = []
    applicable_statutes: List[StatutoryPrecedent] = []
    recommended_forum: str
    summary_analysis: str
