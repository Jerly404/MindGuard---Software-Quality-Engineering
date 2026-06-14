# Resumen Ejecución de Tests - MindGuard Backend

**Fecha:** Junio 2026  
**Ambiente:** Windows 11, Python 3.14.5, pytest 8.4.2  
**Estado:** ✅ Todos los tests pasando

---

## Resultados generales

| Métrica | Resultado |
|---------|-----------|
| **Tests totales** | 57 |
| **Pasados** | 57 ✅ |
| **Fallidos** | 0 |
| **Tasa de éxito** | 100% |
| **Unitarios** | 34 |
| **Funcionales** | 23 |
| **Cobertura** | ~65% |

---

## Desglose por módulo

| Módulo | Tests | Estado |
|--------|-------|--------|
| unit_logic | 2 | ✅ |
| unit_extended | 27 | ✅ |
| services_logic | 4 | ✅ |
| auth | 5 | ✅ |
| functional | 17 | ✅ |
| flow | 3 | ✅ |
| assessments | 2 | ✅ |

---

## Credenciales funcionales

| Campo | Valor |
|-------|-------|
| Email | `admin@mindguard.ai` |
| Contraseña | `admin123` |

El usuario admin se crea automáticamente en `tests/conftest.py` al ejecutar las pruebas.

---

## Archivos de reporte

| Archivo | Contenido |
|---------|-----------|
| `reporte_unitarios.html` | 34 tests unitarios |
| `reporte_funcionales.html` | 23 tests funcionales |
| `reporte_completo.html` | 57 tests totales |
| `htmlcov/index.html` | Cobertura de código |
| `ENTREGABLES_SEMANAS_07-10.md` | Documento de entrega por semana |

---

## Comandos útiles

```powershell
cd backend

# Unitarios (Semanas 07-08)
python -m pytest tests/ -m unit -v --html=reporte_unitarios.html --self-contained-html

# Funcionales (Semanas 09-10)
python -m pytest tests/ -m functional -v --html=reporte_funcionales.html --self-contained-html

# Todo
python -m pytest tests/ -v --html=reporte_completo.html --self-contained-html

# Con cobertura
python -m pytest tests/ --cov=app --cov-report=html

# Script interactivo
.\run_tests_advanced.ps1 -Type all -OpenReport
```

---

## Correcciones aplicadas (depuración)

1. Admin sembrado en BD de prueba (`conftest.py`)
2. Login inválido retorna HTTP 401 (`auth.py`)
3. Token inválido retorna HTTP 401 (`deps.py`)
4. Cálculo dinámico de riesgo PHQ-9 + GAD-7 (`assessments.py`)
5. Validación de rangos en schema (`evaluation.py`)
6. Emails únicos y limpieza de BD entre tests (`conftest.py`)
