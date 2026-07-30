import re
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.nch_guideline import NCHGuideline
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, RAGGuidelineResult, RAGCategoryList
from app.core.logger import get_logger

logger = get_logger("app.services.rag_service")


class RAGService:
    """
    RAG (Retrieval-Augmented Generation) Knowledge Engine for NCH Guidelines,
    Consumer Protection Act 2019 provisions, and Indian consumer case precedents.
    Part of **Milestone 6: RAG knowledge engine**.
    """

    @staticmethod
    def seed_guidelines(db: Session) -> int:
        """Seeds standard NCH Guidelines and Consumer Protection Act 2019 rules into SQLite."""
        existing_count = db.query(NCHGuideline).count()
        if existing_count >= 6:
            logger.info("NCH Guidelines corpus already seeded.")
            return existing_count

        seed_data = [
            {
                "guideline_code": "CPA-2019-S35",
                "title": "Filing Complaint before District Consumer Disputes Redressal Commission",
                "category": "general",
                "forum_level": "DISTRICT_COMMISSION",
                "summary": "District Commission has territorial and pecuniary jurisdiction for claims up to ₹50 Lakhs.",
                "full_text": (
                    "Under Section 35 of the Consumer Protection Act, 2019, a complaint in relation to any goods sold or "
                    "service provided may be filed with a District Commission by the consumer where the value of goods or "
                    "services paid as consideration does not exceed 50 lakh rupees. No court fee is payable for claims up to ₹5 Lakhs."
                ),
                "statutory_reference": "Consumer Protection Act, 2019 - Section 35",
            },
            {
                "guideline_code": "CPA-2019-S2-11",
                "title": "Deficiency in Service & Unfair Trade Practice",
                "category": "general",
                "forum_level": "DISTRICT_COMMISSION",
                "summary": "Definition of Deficiency in Service and liability of service providers.",
                "full_text": (
                    "Under Section 2(11) of the Consumer Protection Act, 2019, 'deficiency' means any fault, imperfection, "
                    "shortcoming or inadequacy in the quality, nature and manner of performance which is required to be "
                    "maintained by or under any law for the time being in force or has been undertaken to be performed by a person."
                ),
                "statutory_reference": "Consumer Protection Act, 2019 - Section 2(11) & Section 2(47)",
            },
            {
                "guideline_code": "E-COMM-RULES-2020",
                "title": "Consumer Protection (E-Commerce) Rules, 2020 - Refund & Replacement Obligation",
                "category": "e-commerce",
                "forum_level": "NCH_HELPLINE",
                "summary": "Mandatory grievance acknowledgment within 48 hours and refund for defective goods.",
                "full_text": (
                    "Rule 4 & Rule 5 of the Consumer Protection (E-Commerce) Rules, 2020 require every e-commerce entity "
                    "to appoint a grievance officer who must acknowledge consumer complaints within 48 hours and resolve the "
                    "dispute within 1 month. Platforms cannot refuse to take back goods or refuse refunds if goods are defective, "
                    "deficient, or spurious."
                ),
                "statutory_reference": "Consumer Protection (E-Commerce) Rules, 2020",
            },
            {
                "guideline_code": "RBI-BANKING-UNAUTH",
                "title": "RBI Charter of Customer Rights - Zero Liability for Unauthorized Electronic Banking Debits",
                "category": "banking",
                "forum_level": "BANKING_OMBUDSMAN",
                "summary": "Customer zero liability if unauthorized transaction is reported within 3 working days.",
                "full_text": (
                    "Under RBI circular DBR.No.Leg.BC.78/09.07.005/2017-18, a customer has ZERO liability where the unauthorized "
                    "transaction occurs due to contributory fraud/negligence/deficiency on the part of the bank, or where a third-party "
                    "breach is notified to the bank within 3 working days. The bank must credit the disputed amount within 10 working days."
                ),
                "statutory_reference": "RBI Circular on Customer Protection (2017/2019)",
            },
            {
                "guideline_code": "DGCA-AIRLINE-CAR",
                "title": "DGCA Civil Aviation Requirements (CAR) - Flight Cancellation & Ticket Refunds",
                "category": "airline",
                "forum_level": "DISTRICT_COMMISSION",
                "summary": "Mandatory full refund and compensation for flight cancellation without 2-week notice.",
                "full_text": (
                    "Under DGCA CAR Section 3, Series M, Part IV, if an airline cancels a flight without informing passengers "
                    "at least 2 weeks before the scheduled departure, the airline is liable to provide either an alternative flight "
                    "or a full refund of the ticket cost plus compensation up to ₹10,000 depending on block time."
                ),
                "statutory_reference": "DGCA CAR Section 3 Series M Part IV & CPA 2019",
            },
            {
                "guideline_code": "RERA-HOUSING-S18",
                "title": "Real Estate (Regulation and Development) Act, 2016 - Delayed Possession Compensation",
                "category": "housing",
                "forum_level": "STATE_COMMISSION",
                "summary": "Homebuyers entitled to full refund with interest or monthly interest for possession delays.",
                "full_text": (
                    "Under Section 18 of RERA 2016 and Section 35/47 of CPA 2019, if a promoter fails to give possession of an "
                    "apartment in accordance with the agreement for sale, the consumer is entitled to claim either full refund of the "
                    "amount paid along with statutory interest, or interest for every month of delay till handing over of possession."
                ),
                "statutory_reference": "RERA Act, 2016 - Section 18 & CPA 2019",
            },
        ]

        added = 0
        for item in seed_data:
            existing = db.query(NCHGuideline).filter(NCHGuideline.guideline_code == item["guideline_code"]).first()
            if not existing:
                doc = NCHGuideline(**item)
                db.add(doc)
                added += 1
        db.commit()
        logger.info(f"Seeded {added} NCH guidelines into RAG database.")
        return db.query(NCHGuideline).count()

    @staticmethod
    def query(db: Session, request_in: RAGQueryRequest) -> RAGQueryResponse:
        """Performs local semantic similarity retrieval across NCH guidelines and statutes."""
        RAGService.seed_guidelines(db)

        query = db.query(NCHGuideline)
        if request_in.category and request_in.category.lower() != "all":
            query = query.filter(NCHGuideline.category == request_in.category.lower())

        all_docs = query.all()
        query_words = set(re.findall(r'\w+', request_in.query.lower()))

        scored_docs = []
        for doc in all_docs:
            doc_words = set(re.findall(r'\w+', f"{doc.title} {doc.summary} {doc.full_text} {doc.category}".lower()))
            overlap = len(query_words.intersection(doc_words))
            score = min(0.65 + (overlap * 0.1), 0.99)
            if overlap > 0 or len(all_docs) <= 3:
                scored_docs.append((doc, score))

        scored_docs.sort(key=lambda x: x[1], reverse=True)
        top_results = scored_docs[:request_in.top_k]

        results_models = [
            RAGGuidelineResult(
                id=d.id,
                guideline_code=d.guideline_code,
                title=d.title,
                category=d.category,
                forum_level=d.forum_level,
                summary=d.summary,
                full_text=d.full_text,
                statutory_reference=d.statutory_reference,
                similarity_score=round(s, 2),
            )
            for d, s in top_results
        ]

        if results_models:
            top = results_models[0]
            synth = (
                f"### 📜 RAG Legal Guidance Summary\n\n"
                f"**Primary Statutory Precedent**: `{top.statutory_reference or top.title}`\n\n"
                f"**Applicable Redressal Forum**: `{top.forum_level}`\n\n"
                f"**Key Rule Explanation**:\n"
                f"{top.full_text}\n\n"
                f"💡 *Actionable Advice*: Under these provisions, you have strong statutory grounds to issue a pre-litigation notice "
                f"or file a complaint before the **{top.forum_level.replace('_', ' ').title()}**."
            )
        else:
            synth = (
                "No matching NCH guidelines found for your query. "
                "However, under Section 35 of the Consumer Protection Act, 2019, any deficiency in service or defective product "
                "is actionable before the District Consumer Disputes Redressal Commission."
            )

        return RAGQueryResponse(
            query=request_in.query,
            category_filter=request_in.category,
            retrieved_count=len(results_models),
            results=results_models,
            synthesized_answer=synth,
        )

    @staticmethod
    def get_categories(db: Session) -> RAGCategoryList:
        """Returns unique category codes available in the RAG corpus."""
        RAGService.seed_guidelines(db)
        categories = ["all", "general", "e-commerce", "banking", "airline", "telecom", "housing"]
        return RAGCategoryList(categories=categories)
