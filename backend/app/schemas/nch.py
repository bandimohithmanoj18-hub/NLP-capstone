from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class NCHGuidelineResponse(BaseModel):
    """Schema for an NCH guideline item."""
    id: int
    guideline_code: str
    title: str
    category: str
    forum_level: str
    summary: str
    full_text: str
    statutory_reference: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JurisdictionAssessmentRequest(BaseModel):
    """Request payload to calculate statutory forum and court fee."""
    claim_amount_inr: float = Field(..., ge=0, description="Disputed claim amount in INR")
    category: str = "general"
    complainant_state: Optional[str] = "Tamil Nadu"
    opposite_party_state: Optional[str] = "Tamil Nadu"


class CourtFeeTier(BaseModel):
    """Court fee schedule tier under Consumer Protection Regulations 2020."""
    min_amount_inr: float
    max_amount_inr: float
    fee_inr: float
    tier_label: str


class JurisdictionAssessmentResponse(BaseModel):
    """Response containing jurisdiction forum, statutory court fee, and redressal roadmap."""
    claim_amount_inr: float
    recommended_forum: str
    forum_display_name: str
    statutory_court_fee_inr: float
    statutory_rule_reference: str
    territorial_jurisdiction: str
    next_steps: List[str]


class RedressalStep(BaseModel):
    """A single step in the consumer grievance redressal roadmap."""
    step_number: int
    title: str
    forum: str
    description: str
    expected_timeline: str
