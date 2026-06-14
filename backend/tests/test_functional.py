"""
Test de Funcionalidad - Pruebas con credenciales del Admin
Cubre flujos completos de usuario administrador y validación de funcionalidades críticas
"""

import pytest

pytestmark = pytest.mark.functional


@pytest.mark.asyncio
class TestAdminFunctionality:
    """Suite de pruebas de funcionalidad para usuario administrador"""

    async def test_admin_login_with_valid_credentials(self, client, admin_credentials):
        """
        Prueba: Login del admin con credenciales válidas
        - Verificar que el login es exitoso (200)
        - Verificar que se retorna un token JWT válido
        """
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        assert response.status_code == 200, f"Error en login: {response.text}"
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    async def test_admin_login_with_invalid_password(self, client, admin_credentials):
        """
        Prueba: Login del admin con contraseña inválida
        - Debe rechazar el acceso
        - Debe retornar estado 401 (Unauthorized)
        """
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401

    async def test_admin_login_with_nonexistent_user(self, client):
        """
        Prueba: Login con usuario que no existe
        - Debe rechazar el acceso
        - Debe retornar estado 401
        """
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 401

    async def test_admin_can_access_protected_routes(self, client, admin_credentials):
        """
        Prueba: Admin puede acceder a rutas protegidas
        - Login exitoso
        - Acceso a ruta protegida (GET /api/v1/assessments/me)
        """
        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Acceder a ruta protegida
        response = await client.get(
            "/api/v1/assessments/me",
            headers=headers
        )
        assert response.status_code == 200

    async def test_protected_route_without_token_returns_401(self, client):
        """
        Prueba: Acceso a ruta protegida sin token
        - Debe retornar 401 (Unauthorized)
        """
        response = await client.get(
            "/api/v1/assessments/me"
        )
        assert response.status_code == 401

    async def test_protected_route_with_invalid_token_returns_401(self, client):
        """
        Prueba: Acceso a ruta protegida con token inválido
        - Debe retornar 401
        """
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get(
            "/api/v1/assessments/me",
            headers=headers
        )
        assert response.status_code == 401


@pytest.mark.asyncio
class TestAssessmentFunctionality:
    """Suite de pruebas de funcionalidad para evaluaciones"""

    async def test_create_assessment_with_valid_data(
        self, client, admin_credentials, sample_assessment_data
    ):
        """
        Prueba: Crear evaluación con datos válidos
        - Login como admin
        - Crear evaluación
        - Verificar que se retorna código 200
        - Verificar que se incluye nivel de riesgo
        """
        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear evaluación
        response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "nivelRiesgo" in data or "riskLevel" in data

    async def test_create_assessment_with_high_risk_data(
        self, client, admin_credentials, sample_assessment_data_high_risk
    ):
        """
        Prueba: Crear evaluación con datos de alto riesgo
        - Los puntajes PHQ-9 y GAD-7 son altos
        - Debe identificar alto riesgo
        """
        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear evaluación
        response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data_high_risk,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        # Verificar que el nivel de riesgo sea alto
        risk_level = data.get("nivelRiesgo") or data.get("riskLevel", "").lower()
        assert "alto" in str(risk_level).lower() or "high" in str(risk_level).lower()

    async def test_create_assessment_with_low_risk_data(
        self, client, admin_credentials, sample_assessment_data_low_risk
    ):
        """
        Prueba: Crear evaluación con datos de bajo riesgo
        - Los puntajes PHQ-9 y GAD-7 son bajos
        - Debe identificar bajo riesgo
        """
        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear evaluación
        response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data_low_risk,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        # Verificar que el nivel de riesgo sea bajo
        risk_level = data.get("nivelRiesgo") or data.get("riskLevel", "").lower()
        assert "bajo" in str(risk_level).lower() or "low" in str(risk_level).lower()

    async def test_get_user_assessments_history(
        self, client, admin_credentials, sample_assessment_data
    ):
        """
        Prueba: Obtener historial de evaluaciones del usuario
        - Login como admin
        - Crear evaluación
        - Obtener historial
        - Verificar que la evaluación aparece en el historial
        """
        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear evaluación
        await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data,
            headers=headers
        )

        # Obtener historial
        response = await client.get(
            "/api/v1/assessments/me",
            headers=headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1

    async def test_create_assessment_without_authentication_fails(
        self, client, sample_assessment_data
    ):
        """
        Prueba: Intentar crear evaluación sin autenticación
        - Debe retornar 401
        """
        response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data
        )
        assert response.status_code == 401

    async def test_create_assessment_with_invalid_phq9_score(
        self, client, admin_credentials
    ):
        """
        Prueba: Crear evaluación con puntaje PHQ-9 inválido
        - El rango válido es 0-27
        - Debe rechazar puntajes fuera del rango
        """
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        invalid_data = {
            "phq9Score": 50,  # Inválido (máximo es 27)
            "gad7Score": 5,
            "phq9Answers": [1, 1, 1, 1, 1, 0, 0, 0, 0],
            "gad7Answers": [1, 1, 1, 0, 0, 0, 0],
            "text_input": "Test"
        }

        response = await client.post(
            "/api/v1/assessments/",
            json=invalid_data,
            headers=headers
        )
        # Debe rechazar puntajes fuera del rango
        assert response.status_code == 422


@pytest.mark.asyncio
class TestAuthenticationFlow:
    """Suite de pruebas del flujo de autenticación"""

    async def test_complete_user_flow_signup_login_assessment(
        self, client, test_user_credentials, sample_assessment_data
    ):
        """
        Prueba: Flujo completo del usuario
        1. Registrarse
        2. Login
        3. Crear evaluación
        4. Obtener historial
        """
        # 1. Signup
        signup_response = await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials
        )
        assert signup_response.status_code == 200

        # 2. Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": test_user_credentials["email"],
                "password": test_user_credentials["password"]
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Crear evaluación
        assessment_response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data,
            headers=headers
        )
        assert assessment_response.status_code == 200

        # 4. Obtener historial
        history_response = await client.get(
            "/api/v1/assessments/me",
            headers=headers
        )
        assert history_response.status_code == 200
        assert len(history_response.json()) >= 1

    async def test_duplicate_email_signup_fails(self, client, test_user_credentials):
        """
        Prueba: No se puede registrar dos veces con el mismo email
        - Primer signup debe exitoso
        - Segundo signup con mismo email debe fallar
        """
        # Primer signup
        response1 = await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials
        )
        assert response1.status_code == 200

        # Segundo signup con mismo email
        response2 = await client.post(
            "/api/v1/auth/signup",
            json=test_user_credentials
        )
        assert response2.status_code in [400, 409, 422]  # Conflict or validation error

    async def test_login_with_empty_credentials(self, client):
        """
        Prueba: Login con credenciales vacías
        - Debe rechazar
        """
        response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": "",
                "password": ""
            }
        )
        assert response.status_code in [401, 422]


@pytest.mark.asyncio
class TestErrorHandling:
    """Suite de pruebas para manejo de errores"""

    async def test_invalid_json_payload(self, client, admin_credentials):
        """
        Prueba: Enviar JSON inválido
        - Debe retornar 422 (Unprocessable Entity)
        """
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/api/v1/assessments/",
            json={"invalid": "data"},
            headers=headers
        )
        assert response.status_code in [422, 400]

    async def test_missing_required_fields(self, client, admin_credentials):
        """
        Prueba: Enviar datos sin campos requeridos
        - Debe retornar 422
        """
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": admin_credentials["username"],
                "password": admin_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.post(
            "/api/v1/assessments/",
            json={},
            headers=headers
        )
        assert response.status_code in [422, 400]

    async def test_nonexistent_endpoint_returns_404(self, client):
        """
        Prueba: Acceder a endpoint que no existe
        - Debe retornar 404
        """
        response = await client.get(
            "/api/v1/nonexistent-endpoint"
        )
        assert response.status_code == 404
