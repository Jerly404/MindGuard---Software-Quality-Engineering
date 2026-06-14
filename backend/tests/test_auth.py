"""
Test de Autenticación - Signup y Login básicos
Cubre: Registro de usuarios y autenticación
"""

import pytest


@pytest.mark.asyncio
@pytest.mark.unit
class TestAuthBasics:
    """Suite de tests de autenticación básica"""

    async def test_signup(self, client, test_user_credentials):
        """
        Prueba: Signup/Registro exitoso
        - Email válido
        - Contraseña válida
        - Usuario creado correctamente
        """
        response = await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials,
        )
        assert response.status_code == 200
        assert response.json()["email"] == test_user_credentials["email"]

    async def test_login_after_signup(self, client, test_user_credentials):
        """
        Prueba: Login después de signup
        - Signup exitoso
        - Login exitoso con mismas credenciales
        - Token JWT retornado
        """
        # Signup
        signup_response = await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials,
        )
        assert signup_response.status_code == 200

        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": test_user_credentials["email"],
                "password": test_user_credentials["password"]
            },
        )
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()
        assert login_response.json()["token_type"] == "bearer"

    async def test_signup_validation(self, client):
        """
        Prueba: Validación en signup
        - Email requerido
        - Contraseña requerida
        - Nombre requerido
        """
        # Sin email
        response = await client.post(
            "/api/v1/auth/signup",
            json={"password": "pass", "nombre": "User"}
        )
        assert response.status_code in [400, 422]

        # Sin contraseña
        response = await client.post(
            "/api/v1/auth/signup",
            json={"email": "test@example.com", "nombre": "User"}
        )
        assert response.status_code in [400, 422]

    async def test_login_invalid_credentials(self, client, test_user_credentials):
        """
        Prueba: Login con credenciales inválidas
        """
        # Signup primero
        await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials,
        )

        # Login con contraseña incorrecta
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": test_user_credentials["email"],
                "password": "wrong_password"
            },
        )
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client):
        """
        Prueba: Login con usuario que no existe
        """
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            },
        )
        assert response.status_code == 401
