from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserProfileUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger("app.services.auth_service")


class AuthService:
    """
    Service class encapsulating user registration, authentication, profile management, and demo seeding.
    Part of **Milestone 2: Authentication and database**.
    """

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, register_in: RegisterRequest) -> User:
        """Register a new consumer or advocate user."""
        existing_user = AuthService.get_user_by_email(db, register_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{register_in.email}' already exists.",
            )

        hashed_password = get_password_hash(register_in.password)
        db_user = User(
            email=register_in.email.lower(),
            hashed_password=hashed_password,
            full_name=register_in.full_name or register_in.email.split("@")[0].title(),
            phone_number=register_in.phone_number,
            is_active=True,
            is_advocate=register_in.is_advocate,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Registered new user account: {db_user.email} (Advocate: {db_user.is_advocate})")
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        user = AuthService.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_user_token(user: User) -> dict:
        """Generate JWT access token and response payload for a user."""
        access_token = create_access_token(subject=user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user,
        }

    @staticmethod
    def update_profile(db: Session, user: User, update_in: UserProfileUpdate) -> User:
        """Update existing user profile and optional password."""
        if update_in.full_name is not None:
            user.full_name = update_in.full_name
        if update_in.phone_number is not None:
            user.phone_number = update_in.phone_number
        if update_in.is_advocate is not None:
            user.is_advocate = update_in.is_advocate
        if update_in.password:
            user.hashed_password = get_password_hash(update_in.password)

        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Updated profile for user ID {user.id} ({user.email})")
        return user

    @staticmethod
    def seed_default_users(db: Session) -> Tuple[User, User]:
        """
        Seeds default consumer and legal advocate demo accounts if they don't already exist.
        Allows instant login without requiring registration.
        """
        consumer_email = "consumer@example.com"
        advocate_email = "advocate@example.com"
        default_pwd = "password123"

        consumer = AuthService.get_user_by_email(db, consumer_email)
        if not consumer:
            consumer = User(
                email=consumer_email,
                hashed_password=get_password_hash(default_pwd),
                full_name="Rajesh Kumar (Demo Consumer)",
                phone_number="+91 98765 43210",
                is_active=True,
                is_advocate=False,
            )
            db.add(consumer)

        advocate = AuthService.get_user_by_email(db, advocate_email)
        if not advocate:
            advocate = User(
                email=advocate_email,
                hashed_password=get_password_hash(default_pwd),
                full_name="Adv. Priya Sharma (Demo Advocate)",
                phone_number="+91 98111 22334",
                is_active=True,
                is_advocate=True,
            )
            db.add(advocate)

        db.commit()
        if consumer:
            db.refresh(consumer)
        if advocate:
            db.refresh(advocate)

        logger.info("Default consumer and advocate demo accounts verified in database.")
        return consumer, advocate
