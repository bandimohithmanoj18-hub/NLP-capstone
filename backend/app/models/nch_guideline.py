from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base
from app.models.base import TimestampMixin


class NCHGuideline(Base, TimestampMixin):
    __tablename__ = "nch_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    guideline_code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)  # e-commerce, banking, telecom, airline, housing, general
    forum_level = Column(String, default="NCH_HELPLINE")  # NCH_HELPLINE, DISTRICT, STATE, NCDRC
    summary = Column(Text, nullable=False)
    full_text = Column(Text, nullable=False)
    statutory_reference = Column(String, nullable=True)  # e.g., Consumer Protection Act 2019, Section 35
