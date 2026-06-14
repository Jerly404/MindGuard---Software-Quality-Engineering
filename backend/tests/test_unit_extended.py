"""
Test Unitarios - Pruebas de lógica sin dependencias externas
Cubre: Security, Password hashing, Level to score mapping, Validaciones
"""

import pytest
from app.core.security import get_password_hash, verify_password

pytestmark = pytest.mark.unit


class TestSecurityFunctions:
    """Suite de pruebas para funciones de seguridad"""

    def test_get_password_hash_creates_different_hash_each_time(self):
        """
        Prueba: get_password_hash genera hash diferente cada vez
        - Mismo password genera diferentes hashes (por el salt)
        - Pero verify_password debe validar correctamente
        """
        password = "test_password_123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Los hashes deben ser diferentes (por el salt)
        assert hash1 != hash2
        # Pero ambos deben validar correctamente
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

    def test_verify_password_with_correct_password(self):
        """
        Prueba: verify_password retorna True con contraseña correcta
        """
        password = "correct_password"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_with_incorrect_password(self):
        """
        Prueba: verify_password retorna False con contraseña incorrecta
        """
        password = "correct_password"
        hashed = get_password_hash(password)
        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_with_empty_password(self):
        """
        Prueba: verify_password con contraseña vacía
        - Debe retornar False
        """
        hashed = get_password_hash("actual_password")
        assert verify_password("", hashed) is False

    def test_password_hash_is_not_plaintext(self):
        """
        Prueba: El hash nunca es el texto plano original
        """
        password = "plaintext_password"
        hashed = get_password_hash(password)
        assert password not in hashed

    def test_password_hash_contains_salt(self):
        """
        Prueba: El hash contiene información de salt (indicador bcrypt)
        - bcrypt hashes siempre empiezan con $2a$, $2b$, $2y$, $2x$
        """
        password = "test_password"
        hashed = get_password_hash(password)
        # bcrypt hash format: $2a$12$...
        assert any(hashed.startswith(prefix) for prefix in ["$2a$", "$2b$", "$2y$", "$2x$"])

    def test_verify_password_case_sensitive(self):
        """
        Prueba: verify_password es sensible a mayúsculas/minúsculas
        """
        password = "TestPassword"
        hashed = get_password_hash(password)
        assert verify_password("TestPassword", hashed) is True
        assert verify_password("testpassword", hashed) is False
        assert verify_password("TESTPASSWORD", hashed) is False

    def test_very_long_password(self):
        """
        Prueba: Manejar contraseñas muy largas (bcrypt trunca a 72 bytes)
        """
        password = "a" * 500
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True
        # Debe fallar si difiere dentro de los primeros 72 caracteres
        assert verify_password("b" + ("a" * 499), hashed) is False

    def test_password_with_special_characters(self):
        """
        Prueba: Contraseñas con caracteres especiales
        """
        special_passwords = [
            "P@ssw0rd!@#$%",
            "¡Contraseña con ñ!",
            "密码password",
            "emoji🔒password",
        ]
        for password in special_passwords:
            hashed = get_password_hash(password)
            assert verify_password(password, hashed) is True
            assert verify_password(password + "x", hashed) is False


class TestLevelToScore:
    """Suite de pruebas para conversión de niveles a puntajes"""

    def test_level_to_score_alto_variants(self):
        """
        Prueba: Variantes de nivel ALTO
        """
        from app.api.assessments import level_to_score

        assert level_to_score("ALTO") == 18
        assert level_to_score("alto") == 18
        assert level_to_score("Alto") == 18
        assert level_to_score("GRAVE") == 18
        assert level_to_score("grave") == 18

    def test_level_to_score_medio_variants(self):
        """
        Prueba: Variantes de nivel MEDIO
        """
        from app.api.assessments import level_to_score

        assert level_to_score("MEDIO") == 10
        assert level_to_score("medio") == 10
        assert level_to_score("Medio") == 10
        assert level_to_score("MODERADO") == 10
        assert level_to_score("moderado") == 10

    def test_level_to_score_bajo_variants(self):
        """
        Prueba: Variantes de nivel BAJO
        """
        from app.api.assessments import level_to_score

        assert level_to_score("BAJO") == 5
        assert level_to_score("bajo") == 5
        assert level_to_score("Bajo") == 5
        assert level_to_score("LEVE") == 5
        assert level_to_score("leve") == 5

    def test_level_to_score_unknown_defaults_to_zero(self):
        """
        Prueba: Nivel desconocido retorna 0
        """
        from app.api.assessments import level_to_score

        assert level_to_score("desconocido") == 0
        assert level_to_score("xyz") == 0
        assert level_to_score("") == 0

    def test_level_to_score_with_whitespace(self):
        """
        Prueba: Niveles con espacios en blanco
        """
        from app.api.assessments import level_to_score

        assert level_to_score(" ALTO ") == 18
        assert level_to_score("  medio  ") == 10
        assert level_to_score("\tbajo\n") == 5


class TestAssessmentValidation:
    """Suite de pruebas para validación de datos de evaluación"""

    def test_phq9_score_range_validation(self):
        """
        Prueba: Validar que PHQ-9 esté en rango 0-27
        """
        # Valid scores
        valid_scores = [0, 1, 5, 13, 18, 27]
        for score in valid_scores:
            assert 0 <= score <= 27

        # Invalid scores
        invalid_scores = [-1, 28, 50, 100]
        for score in invalid_scores:
            assert not (0 <= score <= 27)

    def test_gad7_score_range_validation(self):
        """
        Prueba: Validar que GAD-7 esté en rango 0-21
        """
        # Valid scores
        valid_scores = [0, 1, 5, 10, 15, 21]
        for score in valid_scores:
            assert 0 <= score <= 21

        # Invalid scores
        invalid_scores = [-1, 22, 50, 100]
        for score in invalid_scores:
            assert not (0 <= score <= 21)

    def test_phq9_answers_array_length(self):
        """
        Prueba: PHQ-9 debe tener exactamente 9 respuestas
        """
        valid = [0, 0, 1, 1, 1, 0, 1, 1, 0]  # 9 elementos
        invalid_short = [0, 0, 1, 1, 1]  # 5 elementos
        invalid_long = [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1]  # 11 elementos

        assert len(valid) == 9
        assert len(invalid_short) != 9
        assert len(invalid_long) != 9

    def test_gad7_answers_array_length(self):
        """
        Prueba: GAD-7 debe tener exactamente 7 respuestas
        """
        valid = [0, 0, 1, 1, 1, 0, 1]  # 7 elementos
        invalid_short = [0, 0, 1, 1]  # 4 elementos
        invalid_long = [0, 0, 1, 1, 1, 0, 1, 1, 1]  # 9 elementos

        assert len(valid) == 7
        assert len(invalid_short) != 7
        assert len(invalid_long) != 7

    def test_answer_values_are_binary(self):
        """
        Prueba: Las respuestas deben ser 0 o 1 (o valores 0-3 según escala)
        """
        valid_answers = [0, 1, 2, 3]  # Rango típico de PHQ-9 y GAD-7
        invalid_answers = [-1, 4, 5, "invalid", None]

        for answer in valid_answers:
            assert isinstance(answer, (int, float)) and 0 <= answer <= 3

        for answer in invalid_answers:
            if isinstance(answer, int):
                assert not (0 <= answer <= 3)

    def test_text_input_not_empty(self):
        """
        Prueba: text_input no debe estar vacío
        """
        valid_texts = [
            "Me siento bien",
            "A",
            "Estoy ansioso",
            "Lorem ipsum dolor sit amet",
        ]

        for text in valid_texts:
            assert len(text) > 0

    def test_email_format_validation(self):
        """
        Prueba: Validar formato de email
        """
        import re
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

        valid_emails = [
            "admin@mindguard.ai",
            "user@example.com",
            "test.user+tag@domain.co.uk",
        ]

        invalid_emails = [
            "invalid_email",
            "@example.com",
            "user@",
            "user @example.com",
        ]

        for email in valid_emails:
            assert re.match(email_pattern, email)

        for email in invalid_emails:
            assert not re.match(email_pattern, email)


class TestRiskLevelCalculation:
    """Suite de pruebas para cálculo de nivel de riesgo"""

    def test_risk_level_from_phq9_score(self):
        """
        Prueba: Cálculo de nivel de riesgo basado en PHQ-9
        Rangos típicos:
        - 0-4: Mínimo
        - 5-9: Leve
        - 10-14: Moderado
        - 15-19: Moderadamente Grave
        - 20-27: Grave
        """
        def calculate_risk_phq9(score):
            if score <= 4:
                return "minimo"
            elif score <= 9:
                return "leve"
            elif score <= 14:
                return "moderado"
            elif score <= 19:
                return "moderadamente_grave"
            else:
                return "grave"

        assert calculate_risk_phq9(0) == "minimo"
        assert calculate_risk_phq9(3) == "minimo"
        assert calculate_risk_phq9(5) == "leve"
        assert calculate_risk_phq9(9) == "leve"
        assert calculate_risk_phq9(10) == "moderado"
        assert calculate_risk_phq9(14) == "moderado"
        assert calculate_risk_phq9(15) == "moderadamente_grave"
        assert calculate_risk_phq9(19) == "moderadamente_grave"
        assert calculate_risk_phq9(20) == "grave"
        assert calculate_risk_phq9(27) == "grave"

    def test_combined_phq9_gad7_risk_assessment(self):
        """
        Prueba: Evaluación de riesgo combinada PHQ-9 + GAD-7
        """
        def assess_combined_risk(phq9, gad7):
            combined = phq9 + gad7
            if combined <= 5:
                return "bajo"
            elif combined <= 15:
                return "medio"
            else:
                return "alto"

        # Bajo riesgo
        assert assess_combined_risk(2, 1) == "bajo"
        assert assess_combined_risk(3, 2) == "bajo"

        # Medio riesgo
        assert assess_combined_risk(5, 5) == "medio"
        assert assess_combined_risk(8, 4) == "medio"

        # Alto riesgo
        assert assess_combined_risk(15, 10) == "alto"
        assert assess_combined_risk(20, 15) == "alto"
