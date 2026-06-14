"""
Tests de evaluaciones clínicas usando fixtures compartidos de conftest.
"""

import pytest

pytestmark = pytest.mark.functional


async def _auth_headers(client, credentials):
    signup = await client.post("/api/v1/auth/signup", json=credentials)
    assert signup.status_code == 200
    login = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": credentials["email"], "password": credentials["password"]},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_evaluation(client, test_user_credentials):
    headers = await _auth_headers(client, test_user_credentials)

    response = await client.post(
        "/api/v1/assessments/",
        headers=headers,
        json={
            "phq9Score": 10,
            "gad7Score": 5,
            "text_input": "I have been feeling very sad and anxious lately.",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["phq9Score"] == 10
    assert "nivelRiesgo" in data
    assert data["id_usuario"] > 0


@pytest.mark.asyncio
async def test_get_evaluations(client, test_user_credentials):
    headers = await _auth_headers(client, test_user_credentials)

    create_response = await client.post(
        "/api/v1/assessments/",
        headers=headers,
        json={"phq9Score": 10, "gad7Score": 5, "text_input": "Evaluación de prueba."},
    )
    assert create_response.status_code == 200

    response = await client.get("/api/v1/assessments/me", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
