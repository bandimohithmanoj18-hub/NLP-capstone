import re
from typing import List
from app.schemas.nlp import (
    NLPAnalyzeRequest,
    NLPAnalyzeResponse,
    ExtractedEntity,
    StatutoryPrecedent,
)
from app.core.logger import get_logger

logger = get_logger("app.services.nlp_service")


class NLPService:
    """
    Local NLP pipeline for Named Entity Recognition (NER), intent classification,
    and statutory merit scoring under the Indian Consumer Protection Act, 2019.
    Part of **Milestone 4: NLP pipeline**.
    """

    @staticmethod
    def analyze_grievance(request_in: NLPAnalyzeRequest) -> NLPAnalyzeResponse:
        text = request_in.text
        text_lower = text.lower()

        # 1. Domain Category Classification
        domain = request_in.domain_hint or "general"
        if any(kw in text_lower for kw in ["amazon", "flipkart", "meesho", "order", "delivery", "e-commerce", "online shopping", "refrigerator", "tv", "laptop", "mobile"]):
            domain = "e-commerce"
        elif any(kw in text_lower for kw in ["bank", "sbi", "hdfc", "icici", "axis", "credit card", "debit card", "atm", "unauthorized", "transaction", "emi", "loan", "debited"]):
            domain = "banking"
        elif any(kw in text_lower for kw in ["airtel", "jio", "vi", "bsnl", "broadband", "sim", "telecom", "fiber", "recharge"]):
            domain = "telecom"
        elif any(kw in text_lower for kw in ["flight", "airline", "indigo", "air india", "ticket", "cancellation", "airport", "baggage"]):
            domain = "airline"
        elif any(kw in text_lower for kw in ["builder", "flat", "apartment", "possession", "real estate", "housing", "rera"]):
            domain = "housing"

        # 2. Intent Classification
        intent = "GENERAL_GRIEVANCE"
        if any(kw in text_lower for kw in ["unauthorized", "without otp", "without authorization", "fraud", "scam", "debited without"]):
            intent = "UNAUTHORIZED_TRANSACTION"
        elif any(kw in text_lower for kw in ["refund", "money back", "return refused", "not refunding"]):
            intent = "REFUND_REFUSAL"
        elif any(kw in text_lower for kw in ["defective", "not working", "compressor", "damaged", "broken"]):
            intent = "DEFECTIVE_PRODUCT"
        elif any(kw in text_lower for kw in ["billing", "charged extra", "overcharged", "hidden charges"]):
            intent = "BILLING_DISPUTE"
        elif any(kw in text_lower for kw in ["delayed", "not delivered", "late delivery"]):
            intent = "DELIVERY_DELAY"

        # 3. Named Entity Recognition (NER)
        entities: List[ExtractedEntity] = []

        # Extract Merchant
        merchant = None
        for name, keywords in [
            ("Amazon India", ["amazon"]),
            ("Flipkart", ["flipkart"]),
            ("HDFC Bank", ["hdfc"]),
            ("SBI Bank", ["sbi"]),
            ("ICICI Bank", ["icici"]),
            ("IndiGo Airlines", ["indigo"]),
            ("Airtel Telecom", ["airtel"]),
            ("Reliance Jio", ["jio"]),
        ]:
            if any(k in text_lower for k in keywords):
                merchant = name
                break
        if not merchant:
            match = re.search(r'(?:from|against|by|company|merchant)\s+([A-Z][a-zA-Z0-9\s&]{2,20})', text)
            if match and match.group(1).strip().lower() not in ["the", "my", "this", "customer"]:
                merchant = match.group(1).strip()
        if merchant:
            entities.append(ExtractedEntity(entity_type="MERCHANT", value=merchant, confidence=0.96))

        # Extract Amount
        match_amt = re.search(r'(?:rs\.?|₹|inr|rupees)\s*([\d,]+(?:\.\d{2})?)', text, re.IGNORECASE)
        if not match_amt:
            match_amt = re.search(r'([\d,]+(?:\.\d{2})?)\s*(?:rs\.?|₹|inr|rupees)', text, re.IGNORECASE)
        if match_amt:
            entities.append(ExtractedEntity(entity_type="AMOUNT", value=f"₹{match_amt.group(1)}", confidence=0.98))

        # Extract Date
        match_date = re.search(r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})', text, re.IGNORECASE)
        if not match_date:
            match_date = re.search(r'(\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4})', text)
        if match_date:
            entities.append(ExtractedEntity(entity_type="DATE", value=match_date.group(1), confidence=0.94))

        # Extract Defect / Issue
        if intent == "DEFECTIVE_PRODUCT":
            entities.append(ExtractedEntity(entity_type="DEFECT", value="Manufacturing defect / operational failure", confidence=0.91))
        elif intent == "REFUND_REFUSAL":
            entities.append(ExtractedEntity(entity_type="DEFECT", value="Refusal to refund / replace defective item", confidence=0.93))

        # 4. Applicable Statutes & Precedents
        statutes: List[StatutoryPrecedent] = [
            StatutoryPrecedent(
                statute="Consumer Protection Act, 2019",
                section="Section 2(11)",
                title="Deficiency in Service",
                summary="Any fault, imperfection, shortcoming or inadequacy in quality or manner of performance of service.",
            ),
            StatutoryPrecedent(
                statute="Consumer Protection Act, 2019",
                section="Section 2(47)",
                title="Unfair Trade Practice",
                summary="Deceptive practices, misleading warranties, or withholding rightful consumer refunds.",
            ),
        ]
        if domain == "e-commerce":
            statutes.insert(0, StatutoryPrecedent(
                statute="Consumer Protection (E-Commerce) Rules, 2020",
                section="Rule 4(3) & 5",
                title="Duties of E-Commerce Entities",
                summary="Mandated grievance officer response within 48 hours and resolution within 1 month.",
            ))
        elif domain == "banking":
            statutes.insert(0, StatutoryPrecedent(
                statute="RBI Charter of Customer Rights",
                section="Para 6.2 - Liability of Customer",
                title="Zero Liability for Unauthorized Electronic Banking Debit",
                summary="Customer has zero liability if unauthorized debit occurs due to third-party breach reported within 3 days.",
            ))

        # 5. Statutory Merit Score Calculation (0 - 100)
        merit_score = 75  # Base score
        if merchant:
            merit_score += 10
        if any(e.entity_type == "AMOUNT" for e in entities):
            merit_score += 10
        if any(e.entity_type == "DATE" for e in entities):
            merit_score += 5

        # 6. Forum Recommendation
        forum = "DISTRICT_COMMISSION"

        summary_text = (
            f"The grievance against {merchant or 'the opposite party'} shows strong statutory merit ({merit_score}%) "
            f"for '{intent.replace('_', ' ').title()}' under {statutes[0].statute}, {statutes[0].section}."
        )

        return NLPAnalyzeResponse(
            domain_category=domain,
            intent_classification=intent,
            merit_score_percentage=min(merit_score, 100),
            entities=entities,
            applicable_statutes=statutes,
            recommended_forum=forum,
            summary_analysis=summary_text,
        )
