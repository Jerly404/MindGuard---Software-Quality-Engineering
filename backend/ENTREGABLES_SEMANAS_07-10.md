# Entregables — Semanas 07 a 10
## Proyecto: MindGuard Backend
## Unidad: Diseño y Ejecución de Pruebas con Herramientas Modernas
## Herramientas: pytest + pytest-html + coverage.py

---

## Resumen ejecutivo

| Métrica | Resultado |
|---------|-----------|
| Tests totales | **57** |
| Tests unitarios | **34** ✅ |
| Tests funcionales | **23** ✅ |
| Tasa de éxito | **100%** |
| Cobertura de código | **~65%** |
| Credenciales admin (funcionales) | `admin@mindguard.ai` / `admin123` |

**Caso de uso principal probado:** Evaluación clínica de salud mental (PHQ-9 + GAD-7) con autenticación JWT y cálculo de nivel de riesgo.

---

## Semana 07 — Implementar pruebas unitarias

**Actividad:** *Implementar las pruebas unitarias del Software para un caso de uso principal.*

### Caso de uso principal
**Evaluación clínica:** el usuario envía puntajes PHQ-9/GAD-7 y texto; el sistema valida datos, calcula riesgo y procesa la evaluación.

### Archivos de pruebas unitarias

| Archivo | Qué prueba |
|---------|------------|
| `tests/test_unit_logic.py` | Conversión `level_to_score`, hashing de contraseñas |
| `tests/test_unit_extended.py` | Seguridad (bcrypt), validación PHQ-9/GAD-7, riesgo combinado |
| `tests/test_services_logic.py` | Esquemas Pydantic, chatbot, servicio clínico |
| `tests/test_auth.py` | Signup/login (marcado como unitario con API en memoria) |

### Casos de prueba unitarios (ejemplos)

| ID | Caso de prueba | Entrada | Resultado esperado |
|----|----------------|---------|-------------------|
| U-01 | Mapeo nivel ALTO | `"ALTO"` | Puntaje 18 |
| U-02 | Mapeo nivel BAJO | `"leve"` | Puntaje 5 |
| U-03 | Nivel desconocido | `"xyz"` | Puntaje 0 |
| U-04 | Hash de contraseña | `"secret"` | Hash ≠ texto plano |
| U-05 | Verificar contraseña correcta | hash + password | `True` |
| U-06 | Verificar contraseña incorrecta | hash + wrong | `False` |
| U-07 | PHQ-9 fuera de rango | score 50 | No válido (0–27) |
| U-08 | GAD-7 fuera de rango | score 50 | No válido (0–21) |
| U-09 | Riesgo combinado bajo | PHQ=2, GAD=1 | `"bajo"` |
| U-10 | Riesgo combinado alto | PHQ=15, GAD=10 | `"alto"` |
| U-11 | Email admin válido | `admin@mindguard.ai` | Formato válido |
| U-12 | Esquema EvaluationCreate | datos correctos | Objeto válido |

### Comando de ejecución

```powershell
cd backend
python -m pytest tests/ -m unit -v --html=reporte_unitarios.html --self-contained-html
```

### Evidencia
- Reporte HTML: `backend/reporte_unitarios.html`
- Captura sugerida: tabla con 34 tests Passed

---

## Semana 08 — Depurar para pasar pruebas unitarias

**Actividad:** *Depurar el Software para pasar con éxito las pruebas unitarias.*

### Problemas detectados y correcciones

| Problema | Causa | Corrección |
|----------|-------|------------|
| `level_to_score(" ALTO ")` fallaba | No se eliminaban espacios | `.strip()` en `assessments.py` |
| Test contraseña larga fallaba | bcrypt trunca a 72 bytes | Ajuste del caso de prueba |
| Validación PHQ-9/GAD-7 ausente | Schema sin límites | `Field(ge=0, le=27/21)` en `evaluation.py` |
| Servicio IA sin Groq | Retornaba error sin campos | Fallback con estructura completa en `clinical.py` |

### Archivos modificados (depuración)

- `app/api/assessments.py` — `level_to_score`, cálculo de riesgo
- `app/schemas/evaluation.py` — validadores Pydantic
- `app/services/clinical.py` — fallback cuando Groq no está configurado
- `tests/test_unit_extended.py` — test de contraseña larga

### Comando de verificación

```powershell
python -m pytest tests/ -m unit -v
# Resultado esperado: 34 passed
```

### Evidencia
- Reporte unitario con 0 fallos: `reporte_unitarios.html`
- Cobertura (opcional): `htmlcov/index.html`

---

## Semana 09 — Diseñar casos de prueba funcionales

**Actividad:** *Diseñar casos de prueba para evaluar la funcionalidad del Software.*

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@mindguard.ai` | `admin123` |

> El usuario admin se crea automáticamente en la BD de prueba (`tests/conftest.py`).

### Archivos de pruebas funcionales

| Archivo | Suite | Casos |
|---------|-------|-------|
| `tests/test_functional.py` | Admin, Evaluaciones, Auth, Errores | 17 |
| `tests/test_flow.py` | Flujo completo usuario | 3 |
| `tests/test_assessments.py` | CRUD evaluaciones | 2 |

### Diseño de casos funcionales

#### Módulo: Autenticación Admin

| ID | Caso | Pasos | Resultado esperado |
|----|------|-------|-------------------|
| F-01 | Login admin válido | POST login con credenciales admin | 200 + `access_token` |
| F-02 | Login contraseña incorrecta | POST login password wrong | 401 |
| F-03 | Login usuario inexistente | POST login email fake | 401 |
| F-04 | Ruta protegida con token | Login → GET `/assessments/me` | 200 |
| F-05 | Ruta sin token | GET `/assessments/me` sin header | 401 |
| F-06 | Token inválido | GET con Bearer inválido | 401 |

#### Módulo: Evaluaciones clínicas

| ID | Caso | Datos | Resultado esperado |
|----|------|-------|-------------------|
| F-07 | Crear evaluación válida | PHQ=8, GAD=6 | 200 + `nivelRiesgo` |
| F-08 | Alto riesgo | PHQ=20, GAD=18 | 200 + riesgo "alto" |
| F-09 | Bajo riesgo | PHQ=2, GAD=1 | 200 + riesgo "bajo" |
| F-10 | Historial de evaluaciones | Crear + GET `/me` | Lista ≥ 1 |
| F-11 | Sin autenticación | POST sin token | 401 |
| F-12 | PHQ-9 inválido | score=50 | 422 |

#### Módulo: Flujo completo

| ID | Caso | Flujo | Resultado esperado |
|----|------|-------|-------------------|
| F-13 | Usuario nuevo | Signup → Login → Evaluación → Historial | Todo 200 |
| F-14 | Email duplicado | Signup × 2 mismo email | Segundo: 400/409/422 |
| F-15 | Flujo simulado | Registro → sesión → evaluación → historial | Persistencia OK |

### Comando de ejecución

```powershell
python -m pytest tests/ -m functional -v --html=reporte_funcionales.html --self-contained-html
```

### Evidencia
- Reporte HTML: `backend/reporte_funcionales.html`
- Captura sugerida: tabla con 23 tests Passed

---

## Semana 10 — Ejecutar y depurar pruebas funcionales

**Actividad:** *Ejecutar los casos de prueba y depurar el software para pasar con éxito las pruebas funcionales.*

### Problemas detectados y correcciones

| Problema | Causa | Corrección |
|----------|-------|------------|
| Login admin fallaba | Admin no existía en BD de prueba | Seed en `conftest.py` |
| Login retornaba 400 | Código HTTP incorrecto | Cambio a 401 en `auth.py` |
| Token inválido retornaba 403 | Código en `deps.py` | Cambio a 401 |
| Riesgo siempre "Leve" | Valor hardcodeado | `calculate_overall_risk()` |
| Colisión de emails en tests | Mismo email en todos los tests | UUID único por test |
| Historial contaminado | BD compartida entre tests | Limpieza automática entre tests |

### Comando de ejecución completa

```powershell
# Solo funcionales
.\run_tests_advanced.ps1 -Type functional -OpenReport

# Todos los tests + reporte completo
.\run_tests_advanced.ps1 -Type all -OpenReport

# Cobertura
.\run_tests_advanced.ps1 -Type coverage -OpenReport
```

### Evidencia
- Reporte completo: `backend/reporte_completo.html` (57/57 Passed)
- Reporte funcional: `backend/reporte_funcionales.html` (23/23 Passed)
- Cobertura: `backend/htmlcov/index.html` (~65%)

---

## Estructura del proyecto de pruebas

```
backend/
├── tests/
│   ├── conftest.py              # Fixtures, admin, BD en memoria
│   ├── test_unit_logic.py       # Unitarias básicas
│   ├── test_unit_extended.py    # Unitarias extendidas
│   ├── test_services_logic.py   # Servicios y schemas
│   ├── test_auth.py             # Auth (unit)
│   ├── test_functional.py       # Funcionales (admin + evaluaciones)
│   ├── test_flow.py             # Flujos completos
│   └── test_assessments.py      # Evaluaciones
├── reporte_unitarios.html       # Evidencia Semana 07-08
├── reporte_funcionales.html     # Evidencia Semana 09-10
├── reporte_completo.html        # Evidencia general
├── htmlcov/index.html           # Cobertura de código
├── pytest.ini                   # Configuración pytest
└── run_tests_advanced.ps1       # Script de ejecución
```

---

## Guía rápida para regenerar evidencias

```powershell
cd backend

# 1. Unitarias
python -m pytest tests/ -m unit -v --html=reporte_unitarios.html --self-contained-html

# 2. Funcionales
python -m pytest tests/ -m functional -v --html=reporte_funcionales.html --self-contained-html

# 3. Todo + cobertura
python -m pytest tests/ --cov=app --cov-report=html --html=reporte_completo.html --self-contained-html

# 4. Abrir reportes
Start-Process reporte_unitarios.html
Start-Process reporte_funcionales.html
Start-Process reporte_completo.html
Start-Process htmlcov/index.html
```

---

## Qué captura incluir en cada entrega

| Semana | Captura recomendada | Archivo |
|--------|---------------------|---------|
| 07 | Reporte pytest-html unitarios (34 Passed) | `reporte_unitarios.html` |
| 08 | Mismo reporte con 0 fallos + nota de correcciones | `reporte_unitarios.html` |
| 09 | Tabla de casos de prueba (este documento) + diseño funcional | Sección Semana 09 |
| 10 | Reporte pytest-html funcionales (23 Passed) | `reporte_funcionales.html` |
| Extra | Reporte completo + cobertura | `reporte_completo.html`, `htmlcov/` |

---

*Generado para MindGuard — Calidad de Software — Junio 2026*
