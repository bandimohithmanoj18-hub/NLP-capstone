from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.nch import (
    JurisdictionAssessmentRequest,
    JurisdictionAssessmentResponse,
    CourtFeeTier,
    RedressalStep,
)
from app.services.nch_service import NCHService
from app.services.rag_service import RAGService
from app.schemas.rag import RAGGuidelineResult

router = APIRouter()


@router.post("/assess-jurisdiction", response_model=JurisdictionAssessmentResponse, summary="Calculate dispute forum jurisdiction and court fee")
def assess_consumer_jurisdiction(request_in: JurisdictionAssessmentRequest):
    """
    Calculates appropriate forum (District Commission vs. State Commission vs. NCDRC vs. NCH Helpline)
    and statutory court fee based on claim valuation under Consumer Protection Act 2019.
    Part of **Milestone 9: NCH guidance module**.
    """
    return NCHService.assess_jurisdiction(request_in)


@router.get("/court-fees", response_model=List[CourtFeeTier], summary="Get statutory court fee schedule")
def get_statutory_court_fees():
    """
    Returns the statutory court fee schedule under the Consumer Protection (Consumer Commission Procedure) Regulations, 2020.
    Part of **Milestone 9: NCH guidance module**.
    """
    return NCHService.get_court_fee_tiers()


@router.get("/flowchart", response_model=List[RedressalStep], summary="Get step-by-step consumer redressal roadmap")
def get_redressal_flowchart():
    """
    Returns step-by-step redressal roadmap from NCH Helpline 1915 to E-Daakhil consumer court filing.
    Part of **Milestone 9: NCH guidance module**.
    """
    return NCHService.get_redressal_flowchart()
