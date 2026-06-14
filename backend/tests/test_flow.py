"""
Test de Flujo Completo - Caso de uso integral del usuario
Cubre: Signup → Login → Evaluación → Historial
"""

import pytest

pytestmark = pytest.mark.functional


@pytest.mark.asyncio
@pytest.mark.integration
class TestCompleteUserFlow:
    """Suite de tests del flujo completo de usuario"""

    async def test_full_user_flow(self, client, test_user_credentials, sample_assessment_data):
        """
        Test completo: Registro -> Login -> Crear Evaluación -> Ver Historial
        
        Pasos:
        1. REGISTRO - Nuevo usuario se crea en el sistema
        2. LOGIN - Usuario obtiene token JWT
        3. EVALUACIÓN - Usuario crea una evaluación clínica (PHQ-9, GAD-7)
        4. HISTORIAL - Usuario consulta su historial de evaluaciones
        """
        print("\n\n" + "=" * 50)
        print("INICIANDO SIMULACION DE USUARIO REAL")
        print("=" * 50)

        # 1. REGISTRO
        signup_data = {
            "email": test_user_credentials["email"],
            "password": test_user_credentials["password"],
            "nombre": test_user_credentials.get("nombre", test_user_credentials["email"].split("@")[0])
        }
        print("\n[PASO 1] REGISTRANDO NUEVO USUARIO")
        print(f"   -> Enviando Payload: {signup_data}")
        
        signup_response = await client.post("/api/v1/auth/signup", json=signup_data)
        assert signup_response.status_code == 200, f"Error en registro: {signup_response.text}"
        print(f"   <- Respuesta Servidor (200 OK): Usuario {signup_response.json()['email']} creado exitosamente.")

        # 2. LOGIN
        login_data = {
            "username": test_user_credentials["email"],
            "password": test_user_credentials["password"]
        }
        print("\n[PASO 2] INICIANDO SESION")
        print(f"   -> Enviando Credenciales: {login_data['username']} / ********")
        
        login_response = await client.post("/api/v1/auth/login/access-token", data=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        print(f"   <- Respuesta Servidor (200 OK): JWT Token recibido [{token[:15]}...]")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. REALIZAR ACCION (Crear Evaluacion)
        print("\n[PASO 3] ENVIANDO EVALUACION CLINICA (PHQ-9 / GAD-7)")
        print(
            f"   -> Payload: Puntaje PHQ9: {sample_assessment_data['phq9Score']}, "
            f"GAD7: {sample_assessment_data['gad7Score']}, "
            f"Notas: '{sample_assessment_data['text_input']}'"
        )
        
        eval_response = await client.post("/api/v1/assessments/", json=sample_assessment_data, headers=headers)
        assert eval_response.status_code == 200
        eval_result = eval_response.json()
        risk_level = eval_result.get('nivelRiesgo') or eval_result.get('riskLevel', 'N/A')
        print(f"   <- Respuesta Servidor (200 OK): Evaluacion procesada. Riesgo calculado: {risk_level}")

        # 4. VERIFICAR HISTORIAL
        print("\n[PASO 4] CONSULTANDO HISTORIAL DEL PACIENTE")
        print("   -> GET /api/v1/assessments/me con Token de Autorizacion")
        
        history_response = await client.get("/api/v1/assessments/me", headers=headers)
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) >= 1
        assert history[0]["phq9Score"] == sample_assessment_data["phq9Score"]
        print(
            f"   <- Respuesta Servidor (200 OK): Se encontro {len(history)} registro(s) en el historial."
        )
        print("=" * 50 + "\n")

    async def test_multiple_assessments_in_history(self, client, test_user_credentials, sample_assessment_data):
        """
        Test: Usuario puede crear múltiples evaluaciones
        - Signup y login
        - Crear 3 evaluaciones diferentes
        - Verificar que todas aparecen en el historial
        """
        # Signup
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": test_user_credentials["email"],
                "password": test_user_credentials["password"],
                "nombre": test_user_credentials.get("nombre", "Test User")
            }
        )

        # Login
        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": test_user_credentials["email"],
                "password": test_user_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear 3 evaluaciones
        assessment_scores = [
            {"phq9": 5, "gad7": 3},
            {"phq9": 10, "gad7": 8},
            {"phq9": 15, "gad7": 12},
        ]

        for scores in assessment_scores:
            assessment = {
                **sample_assessment_data,
                "phq9Score": scores["phq9"],
                "gad7Score": scores["gad7"],
            }
            response = await client.post("/api/v1/assessments/", json=assessment, headers=headers)
            assert response.status_code == 200

        # Verificar historial
        history_response = await client.get("/api/v1/assessments/me", headers=headers)
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) == 3

    async def test_assessment_data_persistence(self, client, test_user_credentials, sample_assessment_data):
        """
        Test: Los datos de evaluación persisten correctamente
        - Crear evaluación
        - Obtener del historial
        - Verificar que coinciden
        """
        # Signup y login
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": test_user_credentials["email"],
                "password": test_user_credentials["password"],
                "nombre": "Test User"
            }
        )

        login_response = await client.post(
            "/api/v1/auth/login/access-token",
            data={
                "username": test_user_credentials["email"],
                "password": test_user_credentials["password"]
            }
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Crear evaluación
        create_response = await client.post(
            "/api/v1/assessments/",
            json=sample_assessment_data,
            headers=headers
        )
        created_assessment = create_response.json()

        # Obtener del historial
        history_response = await client.get("/api/v1/assessments/me", headers=headers)
        history = history_response.json()
        retrieved_assessment = history[0]

        # Verificar datos clave
        assert retrieved_assessment["phq9Score"] == sample_assessment_data["phq9Score"]
        assert retrieved_assessment["gad7Score"] == sample_assessment_data["gad7Score"]
        assert sample_assessment_data["text_input"] in retrieved_assessment.get("text_input", "")
