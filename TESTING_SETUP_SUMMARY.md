# 📊 Resumen de Configuración de Pruebas - MindGuard

## ✅ Estado Actual

Se ha completado la configuración completa de pruebas unitarias y funcionales con pytest y pytest-html.

### 📁 Archivos Creados/Modificados

#### Tests
- ✅ `backend/tests/conftest.py` - Configuración global y fixtures reutilizables
- ✅ `backend/tests/test_functional.py` - Pruebas funcionales (✨ PRINCIPAL)
- ✅ `backend/tests/test_unit_extended.py` - Pruebas unitarias avanzadas
- ✅ `backend/tests/test_auth.py` - Mejorado con fixtures
- ✅ `backend/tests/test_flow.py` - Mejorado con fixtures

#### Configuración
- ✅ `backend/pytest.ini` - Configuración de pytest
- ✅ `backend/requirements.txt` - Actualizado con pytest, pytest-html, pytest-asyncio, pytest-cov

#### Scripts de Ejecución
- ✅ `backend/run_tests.py` - Script Python para ejecutar tests
- ✅ `backend/run_tests.ps1` - Script PowerShell para Windows
- ✅ `backend/run_all_tests.py` - Script completo con cobertura
- ✅ `backend/setup_testing.py` - Script de setup
- ✅ `backend/setup_testing.ps1` - Script de setup para Windows

#### Documentación
- ✅ `TESTING_GUIDE.md` - Guía completa de testing
- ✅ `TESTING_CONTRIBUTION_GUIDE.md` - Guía para contribuir nuevas pruebas

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Python (Multiplataforma)

```bash
cd backend

# Pruebas unitarias básicas
python -m pytest tests/test_unit_logic.py -v

# Pruebas unitarias avanzadas
python -m pytest tests/test_unit_extended.py -v

# Pruebas funcionales (RECOMENDADO)
python -m pytest tests/test_functional.py -v

# Pruebas de autenticación
python -m pytest tests/test_auth.py -v

# Todas las pruebas con reporte HTML
python -m pytest tests -v --html=test_reports/report.html --self-contained-html

# Todas con cobertura
python run_all_tests.py
```

### Opción 2: PowerShell (Windows)

```powershell
cd backend
.\run_tests.ps1 -Coverage -OpenReport
```

### Opción 3: Línea de Comandos Avanzada

```bash
# Solo tests que pasen (stop on first failure)
python -m pytest tests -x

# Rerun si falla
python -m pytest tests --reruns 3

# Verbose con output
python -m pytest tests -vv -s

# Específico test
python -m pytest tests/test_functional.py::TestAdminFunctionality::test_admin_login_with_valid_credentials -v

# Tests en paralelo (más rápido)
python -m pytest tests -n auto
```

## 🔐 Credenciales para Pruebas Funcionales

Las pruebas funcionales utilizan estas credenciales del admin:

```
Email: admin@mindguard.ai
Password: admin123
```

**⚠️ IMPORTANTE**: 
1. El usuario admin DEBE estar creado en la base de datos antes de ejecutar test_functional.py
2. Usar el script `seed_db.py` o `reset_db_final.py` para crear el admin

### Crear Admin en la BD

```python
# En backend/seed_db.py
from app.core.security import get_password_hash

admin = {
    "email": "admin@mindguard.ai",
    "hashed_password": get_password_hash("admin123"),
    "is_active": True,
    "is_verified": True
}
```

## 📊 Reportes Generados

### HTML Report
```
backend/test_reports/report_YYYYMMDD_HHMMSS.html
```
- Abre en el navegador para ver:
  - ✅ Tests pasados
  - ❌ Tests fallidos
  - ⏭️  Tests saltados
  - 📈 Gráficos y estadísticas
  - 📝 Logs detallados

### Coverage Report
```
backend/test_reports/coverage_YYYYMMDD_HHMMSS/index.html
```
- Porcentaje de cobertura por archivo
- Líneas cubiertas vs no cubiertas
- Recomendaciones

## 📋 Estructura de Pruebas

### Pruebas Unitarias (sin BD)
```python
# test_unit_extended.py
class TestSecurityFunctions:
    def test_password_hashing()
    def test_verify_password()
    ...

class TestValidation:
    def test_email_format()
    def test_assessment_data()
    ...
```

### Pruebas Funcionales (con API completa)
```python
# test_functional.py
@pytest.mark.asyncio
class TestAdminFunctionality:
    async def test_admin_login_with_valid_credentials()
    async def test_admin_can_access_protected_routes()
    ...

class TestAssessmentFunctionality:
    async def test_create_assessment_with_valid_data()
    async def test_get_user_assessments_history()
    ...

class TestAuthenticationFlow:
    async def test_complete_user_flow_signup_login_assessment()
    ...

class TestErrorHandling:
    async def test_invalid_json_payload()
    ...
```

## 🔧 Fixtures Disponibles (conftest.py)

```python
# Credenciales
@pytest.fixture
def admin_credentials():
    # admin@mindguard.ai : admin123

@pytest.fixture
def test_user_credentials():
    # testuser@example.com : TestPassword123!

# Cliente HTTP
@pytest.fixture
async def client():
    # Cliente AsyncClient para tests

# Datos de evaluación
@pytest.fixture
def sample_assessment_data():
    # PHQ9: 8, GAD7: 6 - Riesgo medio

@pytest.fixture
def sample_assessment_data_high_risk():
    # PHQ9: 20, GAD7: 18 - Riesgo alto

@pytest.fixture
def sample_assessment_data_low_risk():
    # PHQ9: 2, GAD7: 1 - Riesgo bajo
```

## 📚 Guías de Referencia

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guía completa de testing
- [TESTING_CONTRIBUTION_GUIDE.md](TESTING_CONTRIBUTION_GUIDE.md) - Cómo contribuir nuevas pruebas

## 🎯 Conjuntos de Pruebas Predefinidos

### Pruebas Rápidas (< 1 min)
```bash
python -m pytest tests/test_unit_logic.py tests/test_unit_extended.py -v
```

### Pruebas de Funcionalidad (2-3 min)
```bash
python -m pytest tests/test_functional.py -v
```

### Suite Completa (5-10 min)
```bash
python run_all_tests.py
```

## ✨ Suite de Pruebas Completa

### Cobertura Total
- **Pruebas Unitarias**: 50+ tests
  - Seguridad (password hashing)
  - Validación (email, scores, arrays)
  - Lógica de riesgo

- **Pruebas Funcionales**: 40+ tests
  - Admin login/logout
  - Gestión de evaluaciones
  - Flujos completos de usuario
  - Manejo de errores

- **Total**: 90+ tests automáticos

## 📈 Métricas Esperadas

- ✅ Coverage: 70-85%
- ✅ Execution time: < 2 min (unitarias) + < 5 min (funcionales)
- ✅ Tests passing: 95%+
- ✅ Error reports: Detallados con logs

## 🐛 Troubleshooting

### "No module named pytest"
```bash
pip install pytest pytest-html pytest-asyncio pytest-cov
```

### "Connection refused" en tests
```bash
# Verificar que no hay servidor en puerto 8000
netstat -ano | findstr :8000
```

### Tests con timeout
Aumentar timeout en pytest.ini:
```ini
timeout = 300
```

### BD no se resetea
```bash
# Limpiar BDs de test
rm backend/test.db backend/test_flow.db
```

## 🔄 Próximas Mejoras Recomendadas

- [ ] Integración con GitHub Actions (CI/CD)
- [ ] Pruebas E2E con Playwright
- [ ] Pruebas de carga/rendimiento
- [ ] Reportes en PDF
- [ ] Dashboard en tiempo real
- [ ] Pruebas de seguridad (OWASP)

## 📞 Soporte

Para más detalles, ver:
- `TESTING_GUIDE.md` - Guía completa
- `TESTING_CONTRIBUTION_GUIDE.md` - Cómo escribir nuevas pruebas
- `backend/pytest.ini` - Configuración
- `backend/tests/conftest.py` - Fixtures

---

**Estado**: ✅ Completado
**Versión**: 1.0
**Última actualización**: Junio 2024
