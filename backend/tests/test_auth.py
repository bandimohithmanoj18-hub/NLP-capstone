import uuid
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_register_and_login_user():
    """Verify a user can register and log in with email and password."""
    unique_id = str(uuid.uuid4())[:8]
    email = f"user_{unique_id}@example.com"
    pwd = "securepassword123"

    register_payload = {
        "email": email,
        "password": pwd,
        "full_name": "Anita Verma",
        "phone_number": "+91 91234 56789",
        "is_advocate": False,
    }
    reg_res = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["user"]["email"] == email
    assert "access_token" in data

    login_payload = {
        "email": email,
        "password": pwd,
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email


def test_register_duplicate_email():
    """Verify registering with an existing email returns HTTP 400."""
    unique_id = str(uuid.uuid4())[:8]
    email = f"dup_{unique_id}@example.com"
    pwd = "password123"

    client.post("/api/v1/auth/register", json={"email": email, "password": pwd, "full_name": "First User"})

    dup_res = client.post("/api/v1/auth/register", json={"email": email, "password": pwd, "full_name": "Duplicate User"})
    assert dup_res.status_code == 400
    data = dup_res.json()
    assert "already exists" in data.get("detail", "").lower() or "already exists" in data.get("message", "").lower()


def test_login_invalid_password():
    """Verify incorrect password returns HTTP 401 Unauthorized."""
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword999",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401


def test_get_current_user_profile():
    """Verify authenticated user can retrieve profile via /auth/me."""
    unique_id = str(uuid.uuid4())[:8]
    email = f"profile_{unique_id}@example.com"
    pwd = "password123"

    reg_res = client.post("/api/v1/auth/register", json={"email": email, "password": pwd, "full_name": "Profile User"})
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    user_data = me_response.json()
    assert user_data["email"] == email
    assert "id" in user_data


def test_get_current_user_unauthorized():
    """Verify calling /auth/me without token returns HTTP 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_update_user_profile():
    """Verify user can update their display name and phone number via PUT /auth/me."""
    unique_id = str(uuid.uuid4())[:8]
    email = f"update_{unique_id}@example.com"
    pwd = "password123"

    reg_res = client.post("/api/v1/auth/register", json={"email": email, "password": pwd, "full_name": "Rajesh Kumar"})
    token = reg_res.json()["access_token"]
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
