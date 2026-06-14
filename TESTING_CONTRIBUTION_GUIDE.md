# 🧪 Guía de Contribución a Tests - MindGuard

## 📚 Estructura de Archivos de Testing

```
backend/
├── tests/
│   ├── conftest.py                 # Fixtures y configuración global
│   ├── test_auth.py               # Pruebas de autenticación
│   ├── test_functional.py         # Pruebas funcionales (PRINCIPAL)
│   ├── test_flow.py               # Flujos completos de usuario
│   ├── test_unit_logic.py         # Pruebas unitarias simples
│   ├── test_unit_extended.py      # Pruebas unitarias avanzadas
│   └── test_services_logic.py     # Pruebas de servicios
├── run_tests.py                    # Script para ejecutar tests
├── run_all_tests.py               # Script ejecutor completo
├── setup_testing.py               # Setup inicial
├── pytest.ini                      # Configuración de pytest
└── test_reports/                   # Reportes generados (ignorar en Git)
```

## 🎯 Dónde Escribir Pruebas

### 1. **Pruebas Unitarias** 
   - **Archivo:** `test_unit_extended.py` o `test_unit_logic.py`
   - **Uso:** Funciones puras sin BD o dependencias externas
   - **Ejemplo:**
   ```python
   class TestSecurityFunctions:
       def test_get_password_hash_creates_different_hash_each_time(self):
           password = "test_password_123"
           hash1 = get_password_hash(password)
           hash2 = get_password_hash(password)
           assert hash1 != hash2
   ```

### 2. **Pruebas Funcionales**
   - **Archivo:** `test_functional.py` (✅ PRINCIPAL - AQUÍ VAN LAS NUEVAS)
   - **Uso:** Pruebas con API completa, autenticación, flujos reales
   - **Ejemplo:**
   ```python
   @pytest.mark.asyncio
   class TestAdminFunctionality:
       async def test_admin_login_with_valid_credentials(self, client, admin_credentials):
           response = await client.post(
               "/api/v1/auth/login/access-token",
               data=admin_credentials
           )
           assert response.status_code == 200
   ```

### 3. **Pruebas de Flujo**
   - **Archivo:** `test_flow.py`
   - **Uso:** Flujos complejos, múltiples pasos
   - **Ejemplo:**
   ```python
   async def test_full_user_flow(self, client, test_user_credentials):
       # Signup -> Login -> Crear evaluación -> Ver historial
   ```

### 4. **Pruebas de Autenticación**
   - **Archivo:** `test_auth.py`
   - **Uso:** Tests de signup/login
   - **Nota:** Reutiliza fixtures del conftest

## 🔧 Usar Fixtures

### Fixtures Disponibles (en `conftest.py`)

```python
# Credenciales
@pytest.fixture
def admin_credentials():
    return {
        "email": "admin@mindguard.ai",
        "password": "admin123"
    }

@pytest.fixture
def test_user_credentials():
    return {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "nombre": "Test User"
    }

# Cliente HTTP
@pytest.fixture
async def client():
    # Cliente AsyncClient para tests

# Datos de evaluación
@pytest.fixture
def sample_assessment_data():
@pytest.fixture
def sample_assessment_data_high_risk():
@pytest.fixture
def sample_assessment_data_low_risk():
```

### Ejemplo: Usar Fixtures

```python
async def test_create_assessment(self, client, admin_credentials, sample_assessment_data):
    # Login
    login_response = await client.post(
        "/api/v1/auth/login/access-token",
        data=admin_credentials
    )
    token = login_response.json()["access_token"]
    
    # Crear evaluación
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.post(
        "/api/v1/assessments/",
        json=sample_assessment_data,
        headers=headers
    )
    assert response.status_code == 200
```

## ✍️ Escribir Nuevas Pruebas

### Paso 1: Elegir archivo correcto
```python
# test_functional.py - para nuevas pruebas funcionales
```

### Paso 2: Crear clase de tests
```python
@pytest.mark.asyncio
@pytest.mark.functional  # Marcador opcional
class TestNewFeature:
    """Descripción de lo que pruebas"""
```

### Paso 3: Escribir método de test
```python
    async def test_something_specific(self, client, admin_credentials):
        """
        Descripción clara: Qué pruebas, por qué, qué esperas
        
        Pasos:
        1. Setup (Login, crear datos)
        2. Acción (Llamar endpoint)
        3. Verificación (Assert)
        """
        # Setup
        login_response = await client.post(...)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Acción
        response = await client.post(...)
        
        # Verificación
        assert response.status_code == 200
        assert "expected_field" in response.json()
```

### Paso 4: Ejecutar
```bash
# Solo tu test
pytest tests/test_functional.py::TestNewFeature::test_something_specific -v

# Todos en test_functional.py
pytest tests/test_functional.py -v

# Con reporte HTML
pytest tests/test_functional.py -v --html=test_reports/report.html --self-contained-html
```

## 📋 Checklist para Nuevas Pruebas

- [ ] ¿Tiene docstring explicativo?
- [ ] ¿Usa fixtures disponibles?
- [ ] ¿Tiene setup y teardown claros?
- [ ] ¿Verifica el caso exitoso?
- [ ] ¿Verifica casos de error?
- [ ] ¿Está marcada con `@pytest.mark.asyncio` si es async?
- [ ] ¿Tiene asserts significativos (no solo status_code)?
- [ ] ¿No depende de otras pruebas?
- [ ] ¿El nombre describe qué prueba?

## 🐛 Debugging

### Ver output de print
```bash
pytest tests/test_functional.py -v -s
```

### Ver variables locales en error
```bash
pytest tests/test_functional.py -v --tb=long
```

### Ejecutar un test específico
```bash
pytest tests/test_functional.py::TestAdminFunctionality::test_admin_login_with_valid_credentials -v
```

### Parar en primer error
```bash
pytest tests/test_functional.py -x
```

### Reruns (útil para tests flaky)
```bash
pip install pytest-rerunfailures
pytest tests/test_functional.py --reruns 3
```

## 🏆 Mejores Prácticas

### 1. Nombres Descriptivos
```python
# ❌ Malo
async def test_auth(self): pass

# ✅ Bueno
async def test_admin_login_with_valid_credentials_returns_bearer_token(self): pass
```

### 2. Un Assert Principal por Test
```python
# ❌ Múltiples afirmaciones sin relación
assert response.status_code == 200
assert "name" in response.json()
assert len(response.json()) > 0

# ✅ Enfocado
assert response.status_code == 200
```

### 3. Setup Limpio
```python
# Setup en el mismo test o use fixtures
async def test_something(self, client, admin_credentials):
    # Login y obtener token (setup)
    login_response = await client.post(...)
    token = login_response.json()["access_token"]
    
    # Acción
    response = await client.post(...)
    
    # Verificación
    assert response.status_code == 200
```

### 4. Mensajes de Error Claros
```python
# ❌ Vago
assert response.status_code == 200

# ✅ Informativo
assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
```

### 5. Prueba Casos de Error
```python
async def test_create_assessment_without_token_returns_401(self, client):
    """Verificar que endpoint protegido rechaza sin token"""
    response = await client.post(
        "/api/v1/assessments/",
        json={"phq9Score": 5, ...}
    )
    assert response.status_code == 401
```

## 🔐 Credenciales para Tests

**Usuario Admin:**
```
Email: admin@mindguard.ai
Password: admin123
```

**Crear en la BD antes de ejecutar tests funcionales:**
```python
# En seed_db.py o manualmente
from app.core.security import get_password_hash
admin_user = {
    "email": "admin@mindguard.ai",
    "hashed_password": get_password_hash("admin123"),
    "is_active": True
}
```

## 📊 Interpretar Reportes

### HTML Report
```
test_reports/report_YYYYMMDD_HHMMSS.html
```
- Cada test tiene color: ✅ (passed), ❌ (failed), ⏭️  (skipped)
- Haz click en test para ver detalles
- Ver logs completos

### Coverage Report
```
test_reports/coverage_YYYYMMDD_HHMMSS/index.html
```
- Rojo: No cubierto
- Amarillo: Parcialmente cubierto
- Verde: Totalmente cubierto
- % Coverage por archivo

## 🚀 CI/CD Integration

Para GitHub Actions (próximamente):
```yaml
- name: Run tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest tests --html=report.html --cov=app
```

## 📞 Ayuda y Soporte

- Docs pytest: https://docs.pytest.org/
- AsyncIO: https://pytest-asyncio.readthedocs.io/
- httpx: https://www.python-httpx.org/

---

**Última actualización:** Junio 2024
**Mantenedor:** Team QA
