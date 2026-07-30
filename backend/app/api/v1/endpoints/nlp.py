from fastapi import APIRouter
from app.schemas.nlp import NLPAnalyzeRequest, NLPAnalyzeResponse
from app.services.nlp_service import NLPService

router = APIRouter()


@router.post("/analyze", response_model=NLPAnalyzeResponse, summary="Analyze grievance narrative with NLP")
def analyze_grievance_text(request_in: NLPAnalyzeRequest):
    """
    Extracts Named Entities (Merchant, Amount, Date, Defect), classifies consumer domain and intent,
    and calculates statutory legal merit score under CPA 2019.
    Part of **Milestone 4: NLP pipeline**.
    """
    return NLPService.analyze_grievance(request_in)
