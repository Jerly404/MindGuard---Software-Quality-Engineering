# 🧪 Guía Completa de Testing - MindGuard Backend

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Ejecutar Tests](#ejecutar-tests)
3. [Credenciales de Prueba](#credenciales-de-prueba)
4. [Ver Reportes](#ver-reportes)
5. [Troubleshooting](#troubleshooting)

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Verificar Instalación

```bash
python -m pytest --version
```

Debería mostrar algo como: `pytest 8.4.2`

---

## 🚀 Ejecutar Tests

### Opción 1: Usar el Script PowerShell (RECOMENDADO)

#### Todos los tests
```powershell
.\run_tests_advanced.ps1 -Type all -OpenReport
```

#### Solo unitarios
```powershell
.\run_tests_advanced.ps1 -Type unit -OpenReport
```

#### Solo funcionales
```powershell
.\run_tests_advanced.ps1 -Type functional -OpenReport
```

#### Tests de Admin
```powershell
.\run_tests_advanced.ps1 -Type admin -OpenReport
```

#### Test específico
```powershell
.\run_tests_advanced.ps1 -Type specific -TestName "test_login" -OpenReport
```

#### Con cobertura de código
```powershell
.\run_tests_advanced.ps1 -Type coverage -OpenReport
```

---

### Opción 2: Comando Directo de pytest

#### Todos los tests con reporte HTML
```bash
python -m pytest tests/ -v --html=reporte.html --self-contained-html
```

#### Solo tests unitarios
```bash
python -m pytest tests/ -m "unit" -v --html=reporte_unit.html --self-contained-html
```

#### Solo tests funcionales
```bash
python -m pytest tests/ -m "functional" -v --html=reporte_functional.html --self-contained-html
```

#### Tests con salida detallada
```bash
python -m pytest tests/ -v --tb=long
```

#### Tests con cobertura
```bash
python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
```

#### Test específico
```bash
python -m pytest tests/test_auth.py::TestAuthBasics::test_login -v
```

#### Tests con patrón de nombre
```bash
python -m pytest tests/ -k "auth" -v
```

---

## 🔐 Credenciales de Prueba

### Admin
```
Email: admin@mindguard.ai
Password: admin123
```

### Usuario de Prueba (en conftest.py)
```
Email: testuser@example.com
Password: TestPassword123!
```

---

## 📊 Ver Reportes

### Abrir reporte HTML generado

```powershell
# Última ejecución
Start-Process reporte_completo.html

# Reporte de unitarios
Start-Process reporte_unitarios.html

# Reporte de funcionales
Start-Process reporte_funcionales.html

# Cobertura
Start-Process htmlcov/index.html
```

### Archivos de reporte disponibles

| Archivo | Descripción |
|---------|------------|
| `reporte_completo.html` | Todos los tests |
| `reporte_unitarios.html` | Solo tests unitarios |
| `reporte_funcionales.html` | Solo tests funcionales |
| `reporte_admin.html` | Tests del admin |
| `reporte_backend.html` | Reporte antiguo |
| `htmlcov/index.html` | Cobertura de código |

---

## 🏗️ Estructura de Tests

```
tests/
├── conftest.py                    # Fixtures compartidas
├── test_auth.py                  # Tests de autenticación
├── test_assessments.py           # Tests de evaluaciones
├── test_flow.py                  # Tests de flujo completo
├── test_functional.py            # Tests funcionales (Admin, Assessments)
├── test_services_logic.py        # Tests de servicios
├── test_unit_extended.py         # Tests unitarios extendidos
└── test_unit_logic.py            # Tests unitarios básicos
```

---

## 🏷️ Marcadores de Tests

Los tests pueden ejecutarse por categoría usando marcadores:

```bash
# Tests marcados como "unit"
python -m pytest tests/ -m "unit" -v

# Tests marcados como "functional"
python -m pytest tests/ -m "functional" -v

# Tests marcados como "admin"
python -m pytest tests/ -m "admin" -v

# Tests marcados como "integration"
python -m pytest tests/ -m "integration" -v

# Tests lentos (pueden omitirse)
python -m pytest tests/ -m "not slow" -v
```

### Marcadores disponibles (en pytest.ini)

- `unit` - Pruebas unitarias
- `functional` - Pruebas funcionales
- `integration` - Pruebas de integración
- `admin` - Requiere credenciales de admin
- `slow` - Tests que toman tiempo
- `asyncio` - Tests asincronos
- `skip_in_ci` - Saltar en CI

---

## 🔧 Configuración de Fixtures

### conftest.py proporciona:

```python
# Base de datos de prueba
@pytest_asyncio.fixture
async def db_session():
    """Sesión de BD limpia para cada test"""

# Cliente HTTP async
@pytest_asyncio.fixture
async def client():
    """Cliente para hacer requests HTTP"""

# Credenciales de prueba
@pytest.fixture
def admin_credentials():
    """Admin del sistema"""

@pytest.fixture
def test_user_credentials():
    """Usuario de prueba"""

# Datos de evaluación
@pytest.fixture
def sample_assessment_data():
    """Datos de evaluación normales"""

@pytest.fixture
def sample_assessment_data_high_risk():
    """Datos de evaluación de alto riesgo"""
```

---

## 📈 Reportes HTML

Los reportes HTML incluyen:

✅ Resumen general de tests  
✅ Lista detallada de cada test  
✅ Tiempos de ejecución  
✅ Mensajes de error  
✅ Stack traces  
✅ Screenshots (si está configurado)  

### Características del reporte

- **--self-contained-html**: Todo en un archivo (sin dependencias externas)
- **-v**: Modo verbose con todos los detalles
- **--tb=short**: Stack traces cortos (defecto)

---

## 🐛 Troubleshooting

### Error: "pytest: command not found"

**Solución**:
```bash
python -m pytest tests/ -v
```

### Error: "ModuleNotFoundError: No module named 'app'"

**Solución**: Ejecutar desde el directorio `backend/`
```bash
cd backend
python -m pytest tests/ -v
```

### Error: "KeyError: 'access_token'"

**Causa**: Endpoint de login no retorna token correctamente  
**Solución**: Revisar `app/api/auth.py` - verificar que login retorna `{"access_token": "...", "token_type": "bearer"}`

### Error: "Status 400 instead of 200"

**Causa**: Validación de entrada fallando  
**Solución**: 
1. Revisar logs del backend
2. Verificar que `sample_user_credentials` tiene datos válidos
3. Verificar que la BD está inicializada

### Tests lentos

**Solución**: Omitir tests lentos
```bash
python -m pytest tests/ -m "not slow" -v
```

---

## 💡 Tips Útiles

### 1. Ejecutar un archivo de tests completo

```bash
python -m pytest tests/test_auth.py -v
```

### 2. Ejecutar tests que fallan

```bash
python -m pytest tests/ --lf -v
```

### 3. Ver output de print()

```bash
python -m pytest tests/ -v -s
```

### 4. Parar en el primer fallo

```bash
python -m pytest tests/ -x -v
```

### 5. Saltar tests

```python
@pytest.mark.skip(reason="Not implemented yet")
def test_something():
    pass
```

### 6. Saltar tests en CI

```python
@pytest.mark.skip_in_ci
def test_something():
    pass
```

---

## 📚 Documentación Relacionada

- [pytest.ini](pytest.ini) - Configuración de pytest
- [conftest.py](tests/conftest.py) - Fixtures compartidas
- [REPORTE_TESTS_RESUMEN.md](REPORTE_TESTS_RESUMEN.md) - Resumen de resultados
- [pytest docs](https://docs.pytest.org/) - Documentación oficial

---

## 🎯 Objetivo de Cobertura

| Módulo | Objetivo | Estado |
|--------|----------|--------|
| app/api | 80% | 🟡 En progreso |
| app/services | 85% | 🟢 OK |
| app/models | 75% | 🟡 En progreso |
| app/core | 70% | 🟡 En progreso |
| **Total** | **75%** | 🟡 |

---

## 📞 Ayuda

Para más información o reportar problemas, contactar al equipo de QA.

**Última actualización**: 5 de Junio de 2026

