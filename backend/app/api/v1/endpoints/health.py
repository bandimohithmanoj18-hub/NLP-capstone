from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.health import HealthCheckResponse, SystemInfoResponse
from app.services.health_service import HealthService

router = APIRouter()


@router.get("", response_model=HealthCheckResponse, summary="Check system health")
def check_health(db: Session = Depends(get_db)):
    """
    Returns the real-time operational status of the API, database connectivity, and core services.
    Part of **Milestone 1: Project setup and architecture**.
    """
    return HealthService.get_health_check(db)


@router.get("/system-info", response_model=SystemInfoResponse, summary="Get system & milestone status")
def get_system_info():
    """
    Returns system environment details and implementation tracker for all 10 milestones.
    Part of **Milestone 1: Project setup and architecture**.
    """
    return HealthService.get_system_info()
