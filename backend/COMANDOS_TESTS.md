# 🚀 Comandos para Ejecutar Tests - MindGuard Backend

**Ubicación de ejecución**: `backend/`

---

## ⚡ Comandos Rápidos (Lo que más usarás)

### 1. Ejecutar TODO con reporte (RECOMENDADO)
```powershell
.\run_tests_advanced.ps1 -Type all -OpenReport
```

### 2. Solo tests unitarios
```powershell
.\run_tests_advanced.ps1 -Type unit -OpenReport
```

### 3. Solo tests funcionales
```powershell
.\run_tests_advanced.ps1 -Type functional -OpenReport
```

### 4. Con cobertura de código
```powershell
.\run_tests_advanced.ps1 -Type coverage -OpenReport
```

### 5. Resumen rápido
```powershell
.\test_summary.ps1 -OpenReport
```

---

## 💻 Comandos Directos (Python/pytest)

### Todos los tests
```bash
python -m pytest tests/ -v --html=reporte.html --self-contained-html
```

### Solo unitarios
```bash
python -m pytest tests/ -m unit -v --html=reporte_unit.html --self-contained-html
```

### Solo funcionales
```bash
python -m pytest tests/ -m functional -v --html=reporte_func.html --self-contained-html
```

### Solo admin
```bash
python -m pytest tests/ -m admin -v
```

### Con cobertura
```bash
python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
```

### Con salida detallada (ver prints)
```bash
python -m pytest tests/ -v -s
```

### Parar en primer fallo
```bash
python -m pytest tests/ -x -v
```

### Test específico
```bash
python -m pytest tests/test_auth.py::TestAuthBasics::test_login -v
```

### Por patrón de nombre
```bash
python -m pytest tests/ -k "login" -v
```

### Solo tests que fallaron
```bash
python -m pytest tests/ --lf -v
```

### Con stack trace completo
```bash
python -m pytest tests/ -v --tb=long
```

---

## 🎯 Casos Comunes

### Revisar autenticación
```bash
python -m pytest tests/test_auth.py -v
```

### Revisar evaluaciones
```bash
python -m pytest tests/test_assessments.py -v
```

### Revisar admin
```bash
python -m pytest tests/test_functional.py::TestAdminFunctionality -v
```

### Todos los tests que incluyan "login"
```bash
python -m pytest tests/ -k "login" -v
```

### Todos menos los lentos
```bash
python -m pytest tests/ -m "not slow" -v
```

### Generar cobertura y abrir en navegador
```bash
python -m pytest tests/ --cov=app --cov-report=html && Start-Process htmlcov/index.html
```

---

## 📊 Flags Más Útiles

| Flag | Significado |
|------|------------|
| `-v` | Verbose (detallado) |
| `-vv` | Muy verbose |
| `-s` | Mostrar prints (sin capturar) |
| `-x` | Parar en primer fallo |
| `-k "pattern"` | Filtrar por nombre |
| `-m "marker"` | Filtrar por marcador |
| `--lf` | Last failed (solo los que fallaron) |
| `--ff` | Failed first (fallos primero) |
| `--tb=short` | Stack trace corto |
| `--tb=long` | Stack trace largo |
| `--cov=app` | Generar cobertura |
| `--html=file.html` | Generar reporte HTML |
| `--self-contained-html` | HTML sin dependencias |

---

## 📝 Marcadores Disponibles

```bash
# Solo unitarios
python -m pytest tests/ -m unit -v

# Solo funcionales
python -m pytest tests/ -m functional -v

# Solo admin
python -m pytest tests/ -m admin -v

# Solo integración
python -m pytest tests/ -m integration -v

# Excluir lentos
python -m pytest tests/ -m "not slow" -v
```

---

## 📁 Archivos Generados

Los reportes se generan en `backend/`:

- `reporte.html` - Reporte principal
- `reporte_unit.html` - Solo unitarios
- `reporte_func.html` - Solo funcionales
- `reporte_admin.html` - Solo admin
- `htmlcov/index.html` - Cobertura de código

---

## 🔥 Mis Comandos Favoritos

### Para desarrollo (rápido)
```bash
python -m pytest tests/ -x -v -s
```

### Para CI/CD (completo)
```bash
python -m pytest tests/ -v --html=reporte.html --self-contained-html --cov=app --cov-report=html
```

### Para revisar un módulo
```bash
python -m pytest tests/test_auth.py -v --tb=short
```

### Para antes de hacer commit
```bash
.\run_tests_advanced.ps1 -Type all -OpenReport
```

---

## 🎓 Ejemplos Paso a Paso

### 1. Ejecutar y ver todo
```bash
cd backend
.\run_tests_advanced.ps1 -Type all -OpenReport
```
→ Abrirá automáticamente `reporte_completo.html`

### 2. Revisar solo lo que falló
```bash
python -m pytest tests/ --lf -v
```

### 3. Generar cobertura
```bash
python -m pytest tests/ --cov=app --cov-report=html
Start-Process htmlcov/index.html
```

### 4. Debuggear un test
```bash
python -m pytest tests/test_auth.py::TestAuthBasics::test_login -v -s --tb=long
```

### 5. Correr todo antes de commit
```bash
.\run_tests_advanced.ps1 -Type all -OpenReport
```

---

## ⚠️ Notas Importantes

1. **Ubicación**: Siempre ejecutar desde `backend/`
2. **PowerShell**: `.\` es obligatorio para scripts locales
3. **Reportes HTML**: Se abren automáticamente con `-OpenReport`
4. **Cobertura**: Requiere instalar `pytest-cov` (ya instalado)

---

**Guardado como referencia rápida** ✨

