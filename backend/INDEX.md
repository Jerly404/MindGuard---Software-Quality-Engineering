# 📚 Índice de Documentación - Testing MindGuard Backend

> **Última actualización**: 5 de Junio de 2026  
> **Estado**: ✅ Setup completado | 🟡 Tests parcialmente pasados

---

## 🎯 Comienza Aquí

Elige según lo que necesites:

### Si quieres... 👇

1. **Ejecutar tests ahora**
   - 📖 Lee: [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md)
   - 🔧 Usa: `.\run_tests_advanced.ps1 -Type all -OpenReport`

2. **Ver los problemas encontrados**
   - ✅ Lee: [CHECKLIST_PROBLEMAS.md](CHECKLIST_PROBLEMAS.md)
   - 📊 Lee: [REPORTE_TESTS_RESUMEN.md](REPORTE_TESTS_RESUMEN.md)

3. **Entender la estructura de tests**
   - 📖 Lee: [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md#-estructura-de-tests)
   - 📂 Explora: `backend/tests/`

4. **Ver resultados en HTML**
   - 📄 Abre: `reporte_completo.html`
   - 📄 Abre: `reporte_tests.html`

5. **Corregir problemas de autenticación**
   - ✅ Lee: [CHECKLIST_PROBLEMAS.md](CHECKLIST_PROBLEMAS.md#-problemas-críticos)
   - 🔧 Edita: `app/api/auth.py`

---

## 📁 Archivos de Documentación

### Guías Principales
| Archivo | Descripción | Ideal Para |
|---------|-------------|-----------|
| [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md) | Guía exhaustiva de testing | Referencia completa |
| [REPORTE_TESTS_RESUMEN.md](REPORTE_TESTS_RESUMEN.md) | Resumen de resultados | Ver estado actual |
| [CHECKLIST_PROBLEMAS.md](CHECKLIST_PROBLEMAS.md) | Lista de issues encontrados | Planificar correcciones |

### Scripts PowerShell
| Archivo | Uso | Comando |
|---------|-----|---------|
| `run_tests_advanced.ps1` | Ejecutor avanzado | `.\run_tests_advanced.ps1 -Type all` |
| `test_summary.ps1` | Resumen rápido | `.\test_summary.ps1 -OpenReport` |
| `run_tests.ps1` | Ejecutor básico (antiguo) | `.\run_tests.ps1` |
| `run_all_tests.py` | Ejecutor Python | `python run_all_tests.py` |

### Reportes HTML
| Archivo | Contenido | Tamaño |
|---------|----------|--------|
| `reporte_completo.html` | Todos los 57 tests | 78.45 KB |
| `reporte_tests.html` | Tests unit + functional | 35.42 KB |
| `reporte_backend.html` | Histórico | 34.58 KB |

---

## 🚀 Comandos Rápidos

### Ejecutar Tests
```bash
# Todos los tests
.\run_tests_advanced.ps1 -Type all -OpenReport

# Solo unitarios
python -m pytest tests/ -m "unit" -v

# Solo funcionales  
python -m pytest tests/ -m "functional" -v

# Con cobertura
.\run_tests_advanced.ps1 -Type coverage -OpenReport
```

### Ver Reportes
```bash
# Abrir reporte HTML
Start-Process reporte_completo.html

# Abrir cobertura
Start-Process htmlcov/index.html
```

### Tests Específicos
```bash
# Solo autenticación
python -m pytest tests/test_auth.py -v

# Test específico
python -m pytest tests/test_auth.py::TestAuthBasics::test_login -v

# Con búsqueda
python -m pytest tests/ -k "login" -v
```

---

## 📊 Estado Actual

```
Total Tests:     57
✅ Pasados:      37 (64.9%)
❌ Fallidos:     20 (35.1%)

Problemas Críticos:
  1. ❌ Signup retorna 400 (debe 200)
  2. ❌ Login retorna 400 (debe 401 o 200)
  3. ❌ Token no se genera en respuesta
  4. ❌ Token inválido retorna 403 (debe 401)
  5. ⚠️  Validación de contraseña larga
```

---

## 🔐 Credenciales de Prueba

### Admin
```
Email:    admin@mindguard.ai
Password: admin123
```

### Usuario Regular
```
Email:    testuser@example.com
Password: TestPassword123!
```

---

## 🎯 Plan de Acción

### Fase 1: Diagnóstico (COMPLETO ✅)
- [x] Instalar dependencias
- [x] Ejecutar tests
- [x] Generar reportes
- [x] Identificar problemas

### Fase 2: Documentación (COMPLETO ✅)
- [x] Crear guía de testing
- [x] Crear checklist de problemas
- [x] Crear scripts de ejecución
- [x] Documentar credenciales

### Fase 3: Corrección (PENDIENTE ⏳)
- [ ] Revisar CHECKLIST_PROBLEMAS.md
- [ ] Corregir autenticación (app/api/auth.py)
- [ ] Corregir protección de rutas (app/api/deps.py)
- [ ] Ejecutar tests nuevamente

### Fase 4: Validación (PENDIENTE ⏳)
- [ ] Verificar signup
- [ ] Verificar login
- [ ] Verificar token
- [ ] Ejecutar suite completa

---

## 🔍 Problemas y Soluciones

### Problema 1: Tests de Signup Fallan
**Ubicación**: [CHECKLIST_PROBLEMAS.md#problema-1](CHECKLIST_PROBLEMAS.md#problema-1-endpoint-signup-retorna-400-bad-request)  
**Afecta**: 4 tests  
**Archivo a revisar**: `app/api/auth.py`

### Problema 2: Tests de Login Fallan
**Ubicación**: [CHECKLIST_PROBLEMAS.md#problema-2](CHECKLIST_PROBLEMAS.md#problema-2-endpoint-login-retorna-400-en-lugar-de-401-para-credenciales-inválidas)  
**Afecta**: 4 tests  
**Archivo a revisar**: `app/api/auth.py`

### Problema 3: Token No Generado
**Ubicación**: [CHECKLIST_PROBLEMAS.md#problema-3](CHECKLIST_PROBLEMAS.md#problema-3-response-de-login-no-incluye-access_token)  
**Afecta**: 8 tests  
**Archivo a revisar**: `app/api/auth.py`

### Problema 4: Token Status Incorrecto
**Ubicación**: [CHECKLIST_PROBLEMAS.md#problema-4](CHECKLIST_PROBLEMAS.md#problema-4-token-inválido-retorna-403-en-lugar-de-401)  
**Afecta**: 1 test  
**Archivo a revisar**: `app/api/deps.py`

### Problema 5: Validación de Contraseña
**Ubicación**: [CHECKLIST_PROBLEMAS.md#problema-5](CHECKLIST_PROBLEMAS.md#problema-5-test-de-contraseña-muy-larga-falla)  
**Afecta**: 1 test  
**Archivo a revisar**: `app/core/security.py`

---

## 📖 Estructura de Carpetas

```
backend/
├── 📄 TESTING_GUIDE_COMPLETE.md      ← Guía completa
├── 📄 REPORTE_TESTS_RESUMEN.md       ← Resultados
├── 📄 CHECKLIST_PROBLEMAS.md         ← Issues encontrados
├── 📄 TESTING_GUIDE.md               ← Guía original
├── 📄 TESTING_SETUP_SUMMARY.md       ← Setup info
├── 📄 TESTING_CONTRIBUTION_GUIDE.md  ← Guía contribución
│
├── 🔧 run_tests_advanced.ps1         ← Script avanzado
├── 🔧 test_summary.ps1               ← Resumen rápido
├── 🔧 run_tests.ps1                  ← Script básico (antiguo)
├── 🔧 run_all_tests.py               ← Python runner (antiguo)
│
├── 📄 reporte_completo.html          ← Reporte HTML
├── 📄 reporte_tests.html             ← Reporte unit+func
├── 📄 reporte_backend.html           ← Reporte histórico
│
├── 📁 tests/
│   ├── conftest.py                   ← Fixtures
│   ├── test_auth.py                  ← Auth tests
│   ├── test_functional.py            ← Functional tests
│   ├── test_assessments.py           ← Assessment tests
│   ├── test_flow.py                  ← Flow tests
│   ├── test_services_logic.py        ← Service tests
│   ├── test_unit_extended.py         ← Extended unit tests
│   └── test_unit_logic.py            ← Unit tests
│
├── 📁 app/
│   ├── 📁 api/
│   │   ├── auth.py                   ← 🔴 CRÍTICO: Revisar
│   │   ├── deps.py                   ← 🔴 CRÍTICO: Revisar
│   │   └── ...
│   ├── 📁 core/
│   │   ├── security.py               ← 🟡 IMPORTANTE: Revisar
│   │   └── ...
│   ├── 📁 services/
│   └── 📁 models/
│
├── pytest.ini                        ← Configuración pytest
├── requirements.txt                  ← Dependencias
└── pyproject.toml                    ← Config Python
```

---

## 💡 Tips Importantes

1. **Reportes HTML**
   - Son autosuficientes (--self-contained-html)
   - Pueden abrirse directamente sin servidor
   - Incluyen stack traces y timestamps

2. **Scripts PowerShell**
   - Requieren PowerShell 5.1 o superior
   - Pueden ejecutarse desde VS Code
   - Soportan colores y formateo

3. **Tests Async**
   - Uso de `@pytest_asyncio.fixture`
   - Soporte automático con `asyncio_mode = auto`
   - BD de prueba en memoria

4. **Fixtures Compartidas**
   - Definidas en `conftest.py`
   - Reutilizables en todos los tests
   - Include: db_session, client, credentials, data

---

## 📞 Referencia Rápida

| Necesito... | Comando | Archivo |
|-------------|---------|---------|
| Ver todos los tests | `.\run_tests_advanced.ps1 -Type all` | - |
| Ver unitarios | `python -m pytest tests/ -m unit -v` | - |
| Ver funcionales | `python -m pytest tests/ -m functional -v` | - |
| Ver cobertura | `.\run_tests_advanced.ps1 -Type coverage` | htmlcov/ |
| Leer guía | Abre [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md) | - |
| Ver problemas | Abre [CHECKLIST_PROBLEMAS.md](CHECKLIST_PROBLEMAS.md) | - |
| Ver resultados | Abre `reporte_completo.html` | - |

---

## ✅ Checklist de Inicio

- [ ] Leí [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md)
- [ ] Leí [CHECKLIST_PROBLEMAS.md](CHECKLIST_PROBLEMAS.md)
- [ ] Ejecuté `.\run_tests_advanced.ps1 -Type all -OpenReport`
- [ ] Abrí `reporte_completo.html` en navegador
- [ ] Identifiqué los 5 problemas principales
- [ ] Comencé a planificar correcciones

---

## 🎓 Aprender Más

- [Documentación pytest oficial](https://docs.pytest.org/)
- [pytest-html docs](https://pytest-html.readthedocs.io/)
- [FastAPI testing guide](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [SQLAlchemy async docs](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)

---

**Este índice se actualiza automáticamente**  
Última actualización: 5 de Junio de 2026

