# 🧪 Guía de Pruebas - MindGuard Backend

## 📋 Descripción General

Este documento describe cómo ejecutar pruebas unitarias y funcionales en el backend de MindGuard usando **pytest** y **pytest-html**.

### Tipos de Pruebas

1. **Pruebas Unitarias** (`test_unit_logic.py`, `test_unit_extended.py`)
   - Pruebas de funciones de seguridad
   - Validación de lógica de cálculo
   - Sin dependencias externas

2. **Pruebas de Autenticación** (`test_auth.py`)
   - Login y registro
   - Validación de tokens JWT

3. **Pruebas Funcionales** (`test_functional.py`)
   - Flujos completos de usuario
   - Autenticación del admin
   - Creación y gestión de evaluaciones

4. **Pruebas de Flujo** (`test_flow.py`)
   - Flujo completo: Signup → Login → Evaluación

## 🚀 Instalación

### Paso 1: Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

Las dependencias de testing ya están incluidas:
- `pytest==8.4.2`
- `pytest-asyncio==0.24.0`
- `pytest-html==4.1.1`
- `pytest-cov==6.0.0`

### Paso 2: Configurar Variables de Entorno

Crear archivo `.env` en el directorio `backend/`:

```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=test-secret-key-for-testing
DEBUG=true
```

## 🧪 Ejecutar Pruebas

### Opción 1: Linux/macOS con Python

```bash
cd backend
python run_tests.py
```

### Opción 2: Windows con PowerShell

```powershell
cd backend
.\run_tests.ps1 -Coverage -OpenReport
```

**Parámetros disponibles:**
- `-Coverage`: Incluir reporte de cobertura de código
- `-OpenReport`: Abrir automáticamente el reporte HTML

### Opción 3: Línea de Comandos Directa

#### Ejecutar todas las pruebas con reporte HTML:

```bash
pytest tests -v --html=test_reports/report.html --self-contained-html
```

#### Ejecutar pruebas específicas:

```bash
# Solo pruebas unitarias
pytest tests/test_unit_logic.py tests/test_unit_extended.py -v

# Solo pruebas funcionales
pytest tests/test_functional.py -v

# Solo pruebas del admin
pytest tests/test_functional.py::TestAdminFunctionality -v
```

#### Con cobertura de código:

```bash
pytest tests -v --cov=app --cov-report=html --cov-report=term
```

#### Modo verbose con salida más detallada:

```bash
pytest tests -vv --tb=long
```

## 📊 Reportes

### Reporte HTML

Después de ejecutar las pruebas, se generan reportes HTML en:

```
backend/test_reports/report_YYYYMMDD_HHMMSS.html
```

El reporte incluye:
- ✅ Tests pasados
- ❌ Tests fallidos
- ⏭️  Tests saltados
- 📈 Estadísticas y gráficos
- 📝 Logs detallados

### Cobertura de Código

Si usas la opción `--cov`, se genera:

```
backend/test_reports/coverage_YYYYMMDD_HHMMSS/index.html
```

Abre este archivo en el navegador para ver:
- Porcentaje de cobertura por archivo
- Líneas cubiertas vs no cubiertas
- Recomendaciones de mejora

## 🔐 Credenciales para Pruebas Funcionales

Las pruebas funcionales usan las siguientes credenciales del admin:

```
Email: admin@mindguard.ai
Password: admin123
```

**⚠️ IMPORTANTE:** Estas credenciales deben:
1. Estar creadas en la base de datos antes de ejecutar las pruebas funcionales
2. NO usarse en producción
3. Cambiar después de las pruebas en ambientes reales

### Crear usuario admin en la base de datos:

```python
# En backend/seed_db.py o usar el script reset_db_final.py
from app.core.security import get_password_hash

# Insertar admin
admin_user = {
    "email": "admin@mindguard.ai",
    "hashed_password": get_password_hash("admin123"),
    "is_active": True,
    "is_verified": True
}
```

## 📝 Estructura de las Pruebas

### conftest.py

Contiene fixtures globales reutilizables:

```python
@pytest.fixture
def admin_credentials():
    """Credenciales del admin"""
    return {
        "email": "admin@mindguard.ai",
        "password": "admin123"
    }

@pytest.fixture
def sample_assessment_data():
    """Datos de evaluación de prueba"""
    return {
        "phq9Score": 8,
        "gad7Score": 6,
        "phq9Answers": [1, 1, 1, 1, 1, 0, 1, 1, 0],
        "gad7Answers": [1, 1, 1, 1, 0, 0, 0],
        "text_input": "Test message"
    }
```

### test_functional.py - Clases de Prueba

```python
class TestAdminFunctionality:
    """Pruebas del admin"""

class TestAssessmentFunctionality:
    """Pruebas de evaluaciones"""

class TestAuthenticationFlow:
    """Flujos de autenticación"""

class TestErrorHandling:
    """Manejo de errores"""
```

## 🔄 Ciclo de Vida de las Pruebas

1. **Setup**: Se crea la BD en memoria
2. **Ejecución**: Se ejecutan todos los tests
3. **Teardown**: Se limpia la BD
4. **Reporte**: Se generan reportes HTML y cobertura

## 🐛 Troubleshooting

### Problema: "No module named pytest"

```bash
pip install pytest pytest-html pytest-asyncio pytest-cov
```

### Problema: "Connection refused" en pruebas

Verificar que el servidor no esté corriendo en el puerto 8000:

```bash
# Linux/macOS
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

### Problema: Tests timeout

Aumentar el timeout en pytest.ini:

```ini
[tool:pytest]
timeout = 300
```

### Problema: BD no se resetea entre tests

El conftest.py usa BD en memoria, que se resetea automáticamente. Si persisten datos:

```bash
rm backend/test.db backend/test_flow.db
```

## 📚 Referencias

- [Documentación pytest](https://docs.pytest.org/)
- [pytest-html](https://pytest-html.readthedocs.io/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [pytest-cov](https://pytest-cov.readthedocs.io/)

## 🎯 Próximas Mejoras

- [ ] Agregar pruebas de rendimiento (pytest-benchmark)
- [ ] Integración con CI/CD (GitHub Actions)
- [ ] Pruebas E2E con Playwright
- [ ] Generación de reportes en PDF
- [ ] Dashboard de métricas

---

**Última actualización:** 2024
**Versión:** 1.0
