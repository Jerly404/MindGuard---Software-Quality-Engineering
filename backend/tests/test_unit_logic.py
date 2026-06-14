import pytest
from app.api.assessments import level_to_score

pytestmark = pytest.mark.unit


def test_level_to_score_mapping():
    """
    PRUEBA UNITARIA PURA:
    Verifica que la lógica de conversión de etiquetas a puntajes sea exacta.
    No requiere base de datos ni servidor activo.
    """
    # Caso 1: Niveles altos
    assert level_to_score("ALTO") == 18
    assert level_to_score("GRAVE") == 18

    # Caso 2: Niveles medios
    assert level_to_score("medio") == 10
    assert level_to_score("moderado") == 10

    # Caso 3: Niveles bajos
    assert level_to_score("bajo") == 5
    assert level_to_score("Leve") == 5

    # Caso 4: Caso por defecto
    assert level_to_score("desconocido") == 0


def test_security_logic():
    """
    PRUEBA UNITARIA:
    Verifica que las funciones de seguridad no dependan de otros módulos.
    """
    from app.core.security import get_password_hash, verify_password

    password = "secret_password"
    hashed = get_password_hash(password)

    assert password != hashed
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_pass", hashed) is False
