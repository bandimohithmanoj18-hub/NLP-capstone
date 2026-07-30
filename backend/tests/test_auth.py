import uuid
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_seed_demo_accounts():
    """Verify default demo accounts can be seeded cleanly."""
    response = client.post("/api/v1/auth/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["demo_accounts"]) == 2
    emails = [acc["email"] for acc in data["demo_accounts"]]
    assert "consumer@example.com" in emails
    assert "advocate@example.com" in emails


def test_login_demo_consumer():
    """Verify demo consumer account login returns valid JWT token."""
    # Ensure seeded
    client.post("/api/v1/auth/seed")

    login_payload = {
        "email": "consumer@example.com",
        "password": "password123",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "consumer@example.com"
    assert data["user"]["is_advocate"] is False


def test_login_demo_advocate():
    """Verify demo advocate account login returns valid JWT token and advocate flag."""
    login_payload = {
        "email": "advocate@example.com",
        "password": "password123",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "advocate@example.com"
    assert data["user"]["is_advocate"] is True


def test_register_new_user():
    """Verify a new user can register and receive an access token."""
    unique_id = str(uuid.uuid4())[:8]
    register_payload = {
        "email": f"testconsumer_{unique_id}@example.com",
        "password": "securepassword123",
        "full_name": "Anita Verma",
        "phone_number": "+91 91234 56789",
        "is_advocate": False,
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == f"testconsumer_{unique_id}@example.com"
    assert data["user"]["full_name"] == "Anita Verma"
    assert "access_token" in data


def test_register_duplicate_email():
    """Verify registering with an existing email returns HTTP 400."""
    register_payload = {
        "email": "consumer@example.com",
        "password": "someotherpassword",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 400
    data = response.json()
    assert "already exists" in data.get("detail", "").lower() or "already exists" in data.get("message", "").lower()


def test_login_invalid_password():
    """Verify incorrect password returns HTTP 401 Unauthorized."""
    login_payload = {
        "email": "consumer@example.com",
        "password": "wrongpassword999",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401


def test_get_current_user_profile():
    """Verify authenticated user can retrieve profile via /auth/me."""
    # First login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "consumer@example.com", "password": "password123"},
    )
    token = login_response.json()["access_token"]

    # Request /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == "consumer@example.com"
    assert "id" in user_data


def test_get_current_user_unauthorized():
    """Verify calling /auth/me without token returns HTTP 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_update_user_profile():
    """Verify user can update their display name and phone number via PUT /auth/me."""
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "consumer@example.com", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    update_payload = {
        "full_name": "Rajesh Kumar (Updated)",
        "phone_number": "+91 99999 00000",
    }
    put_response = client.put("/api/v1/auth/me", headers=headers, json=update_payload)
    assert put_response.status_code == 200
    data = put_response.json()
    assert data["full_name"] == "Rajesh Kumar (Updated)"
    assert data["phone_number"] == "+91 99999 00000"
