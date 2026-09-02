import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CodeLens"


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # Register user
    user_payload = {
        "email": "student@codelens.dev",
        "password": "Password123!",
        "full_name": "Test Student"
    }
    reg_response = await client.post("/api/v1/auth/register", json=user_payload)
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "student@codelens.dev"
    assert reg_data["user"]["full_name"] == "Test Student"
    
    # Duplicate registration should fail
    dup_response = await client.post("/api/v1/auth/register", json=user_payload)
    assert dup_response.status_code == 400

    # Login
    login_payload = {
        "email": "student@codelens.dev",
        "password": "Password123!"
    }
    login_response = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Access protected /me endpoint
    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "student@codelens.dev"
