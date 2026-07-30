from typing import List
from app.schemas.nch import (
    JurisdictionAssessmentRequest,
    JurisdictionAssessmentResponse,
    CourtFeeTier,
    RedressalStep,
)
from app.core.logger import get_logger

logger = get_logger("app.services.nch_service")


class NCHService:
    """
    NCH Guidance Module for statutory forum jurisdiction, court fee tiers,
    and step-by-step consumer redressal roadmaps.
    Part of **Milestone 9: NCH guidance module**.
    """

    @staticmethod
    def assess_jurisdiction(request_in: JurisdictionAssessmentRequest) -> JurisdictionAssessmentResponse:
        amount = request_in.claim_amount_inr

        # Calculate forum under Section 34 / 35 / 47 / 58 of CPA 2019
        if amount <= 500000:
            forum = "NCH_HELPLINE_OR_DISTRICT_COMMISSION"
            display_name = "National Consumer Helpline (1915) or District Commission"
            rule_ref = "CPA 2019 Section 35 & NCH Standard Operating Procedure"
        elif amount <= 5000000:
            forum = "DISTRICT_COMMISSION"
            display_name = "District Consumer Disputes Redressal Commission (up to ₹50 Lakhs)"
            rule_ref = "Consumer Protection Act, 2019 - Section 34 / 35"
        elif amount <= 20000000:
            forum = "STATE_COMMISSION"
            display_name = "State Consumer Disputes Redressal Commission (₹50 Lakhs - ₹2 Crores)"
            rule_ref = "Consumer Protection Act, 2019 - Section 47"
        else:
            forum = "NCDRC"
            display_name = "National Consumer Disputes Redressal Commission (above ₹2 Crores)"
            rule_ref = "Consumer Protection Act, 2019 - Section 58"

        # Calculate statutory court fee under Consumer Protection Regulations 2020
        court_fee = 0.0
        if amount <= 500000:
            court_fee = 0.0
        elif amount <= 1000000:
            court_fee = 200.0
        elif amount <= 2000000:
            court_fee = 400.0
        elif amount <= 5000000:
            court_fee = 1000.0
        elif amount <= 10000000:
            court_fee = 2000.0
        elif amount <= 20000000:
            court_fee = 2500.0
        else:
            court_fee = 5000.0

        next_steps = [
            f"1. Issue Pre-Litigation Legal Notice via email or registered post giving 15 days to respond.",
            f"2. If unresolved, register grievance on NCH Helpline 1915 / INGRAM Portal (if claim <= ₹5 Lakhs).",
            f"3. File formal complaint before the {display_name} via the E-Daakhil Online Portal.",
            f"4. Attach verified Affidavit and pay statutory court fee of ₹{court_fee:,.2f}.",
        ]

        return JurisdictionAssessmentResponse(
            claim_amount_inr=amount,
            recommended_forum=forum,
            forum_display_name=display_name,
            statutory_court_fee_inr=court_fee,
            statutory_rule_reference=rule_ref,
            territorial_jurisdiction=f"District of Complainant's Residence ({request_in.complainant_state}) or OP Place of Business",
            next_steps=next_steps,
        )

    @staticmethod
    def get_court_fee_tiers() -> List[CourtFeeTier]:
        return [
            CourtFeeTier(min_amount_inr=0, max_amount_inr=500000, fee_inr=0, tier_label="Up to ₹5 Lakhs (NIL Fee)"),
            CourtFeeTier(min_amount_inr=500001, max_amount_inr=1000000, fee_inr=200, tier_label="₹5 Lakhs to ₹10 Lakhs (₹200)"),
            CourtFeeTier(min_amount_inr=1000001, max_amount_inr=2000000, fee_inr=400, tier_label="₹10 Lakhs to ₹20 Lakhs (₹400)"),
            CourtFeeTier(min_amount_inr=2000001, max_amount_inr=5000000, fee_inr=1000, tier_label="₹20 Lakhs to ₹50 Lakhs (₹1,000)"),
            CourtFeeTier(min_amount_inr=5000001, max_amount_inr=10000000, fee_inr=2000, tier_label="₹50 Lakhs to ₹1 Crore (₹2,000)"),
            CourtFeeTier(min_amount_inr=10000001, max_amount_inr=20000000, fee_inr=2500, tier_label="₹1 Crore to ₹2 Crores (₹2,500)"),
            CourtFeeTier(min_amount_inr=20000001, max_amount_inr=1000000000, fee_inr=5000, tier_label="Above ₹2 Crores (₹5,000)"),
        ]

    @staticmethod
    def get_redressal_flowchart() -> List[RedressalStep]:
        return [
            RedressalStep(
                step_number=1,
                title="Direct Merchant Grievance / Customer Support",
                forum="Company Customer Care / Grievance Officer",
                description="Raise formal complaint with company customer care. Under E-Commerce rules, they must acknowledge within 48 hours.",
                expected_timeline="48 Hours to 7 Days",
            ),
            RedressalStep(
                step_number=2,
                title="Pre-Litigation Legal Notice",
                forum="Legal Counsel / Merchant Registered Office",
                description="Send formal Legal Notice citing Section 35 & 47 of CPA 2019, giving 15 days for refund or replacement.",
                expected_timeline="15 Days",
            ),
            RedressalStep(
                step_number=3,
                title="NCH Helpline 1915 / INGRAM Portal Registration",
                forum="National Consumer Helpline (NCH / 1915)",
                description="Free, rapid pre-litigation mediation portal operated by Department of Consumer Affairs, Government of India.",
                expected_timeline="30 to 45 Days",
            ),
            RedressalStep(
                step_number=4,
                title="Formal Complaint Filing on E-Daakhil Portal",
                forum="District Commission / State Commission / NCDRC",
                description="File electronic complaint under CPA 2019 before the statutory commission with verified affidavit and evidence.",
                expected_timeline="90 to 180 Days",
            ),
        ]
