from typing import Dict, List
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema for basic system health response (Milestone 1)."""
    status: str = Field(default="online", description="Overall health status")
    version: str = Field(..., description="Backend application version")
    environment: str = Field(..., description="Running environment")
    timestamp: str = Field(..., description="UTC timestamp of the health check")
    services: Dict[str, str] = Field(..., description="Status of connected services (database, vector store, etc.)")


class MilestoneStatus(BaseModel):
    """Schema representing the status of each milestone."""
    id: int
    title: str
    status: str  # completed, in_progress, pending
    description: str


class SystemInfoResponse(BaseModel):
    """Schema for detailed system and milestone status."""
    project_name: str
    version: str
    python_version: str
    database_url: str
    milestones: List[MilestoneStatus]
