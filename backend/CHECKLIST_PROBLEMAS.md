# 🔍 Checklist de Problemas Encontrados - MindGuard Backend

**Generado**: 5 de Junio de 2026  
**Estado**: 20 tests fallidos identificados

---

## 🚨 Problemas Críticos (Afectan múltiples tests)

### Problema 1: Endpoint `/signup` retorna 400 (Bad Request)
- **Archivos afectados**: 
  - `app/api/auth.py` (signup endpoint)
  - `app/schemas/user.py` (validación de usuario)
- **Tests fallidos**: 
  - `test_login_after_signup`
  - `test_complete_user_flow_signup_login_assessment`
  - `test_duplicate_email_signup_fails`
  - `test_full_user_flow`
- **Tarea**: 
  - [ ] Revisar la validación de entrada en signup
  - [ ] Verificar el esquema de usuario
  - [ ] Probar con datos válidos: `{"email": "test@example.com", "password": "pass123"}`
  - [ ] Revisar logs del servidor para ver el error específico

---

### Problema 2: Endpoint `/login` retorna 400 en lugar de 401 para credenciales inválidas
- **Archivos afectados**: 
  - `app/api/auth.py` (login endpoint)
- **Tests fallidos**: 
  - `test_login_invalid_credentials`
  - `test_login_nonexistent_user`
  - `test_admin_login_with_invalid_password`
  - `test_admin_login_with_nonexistent_user`
- **Tarea**: 
  - [ ] Revisar validación de credenciales en login
  - [ ] Asegurar que retorna 401 cuando credenciales son inválidas
  - [ ] Retorna 400 solo cuando hay error en entrada (validación)

---

### Problema 3: Response de login no incluye `access_token`
- **Archivos afectados**: 
  - `app/api/auth.py` (login response schema)
- **Tests fallidos**: 
  - `test_admin_can_access_protected_routes` 
  - `test_create_assessment_with_valid_data`
  - `test_create_assessment_with_high_risk_data`
  - `test_create_assessment_with_low_risk_data`
  - `test_get_user_assessments_history`
  - `test_create_assessment_with_invalid_phq9_score`
  - `test_invalid_json_payload`
  - `test_missing_required_fields`
- **Tarea**: 
  - [ ] Verificar que login retorna: `{"access_token": "...", "token_type": "bearer", ...}`
  - [ ] Revisar `app/api/auth.py` línea donde se genera el token
  - [ ] Asegurar que el token JWT se genera correctamente

---

### Problema 4: Token inválido retorna 403 en lugar de 401
- **Archivos afectados**: 
  - `app/api/deps.py` (get_current_user dependency)
- **Tests fallidos**: 
  - `test_protected_route_with_invalid_token_returns_401`
- **Tarea**: 
  - [ ] Revisar la función `get_current_user` en `app/api/deps.py`
  - [ ] Asegurar que levanta HTTPException con status_code 401
  - [ ] NO retornar 403

---

## ⚠️ Problemas Secundarios

### Problema 5: Test de contraseña muy larga falla
- **Archivos afectados**: 
  - `app/core/security.py` (verify_password)
- **Tests fallidos**: 
  - `test_very_long_password`
- **Detalles**: 
  - Contraseña de 499 caracteres debería fallar en verificación
  - Actualmente retorna `True` en lugar de `False`
- **Tarea**: 
  - [ ] Revisar función `verify_password` en `app/core/security.py`
  - [ ] Agregar validación de longitud de contraseña
  - [ ] O revisar por qué bcrypt acepta contraseñas tan largas

---

## 📋 Plan de Corrección

### Fase 1: Autenticación (ALTA PRIORIDAD)
```
1. Corregir endpoint /signup
   - [ ] Validación de entrada
   - [ ] Retornar 200 si es exitoso
   
2. Corregir endpoint /login
   - [ ] Retornar 401 para credenciales inválidas
   - [ ] Retornar 400 para error de validación
   - [ ] Incluir access_token en respuesta
   
3. Corregir protección de rutas
   - [ ] Token inválido retorna 401 (no 403)
```

### Fase 2: Tests de Admin
```
4. Probar credenciales admin
   - [ ] Email: admin@mindguard.ai
   - [ ] Password: admin123
   - [ ] Asegurar que puede acceder a rutas protegidas
```

### Fase 3: Evaluaciones
```
5. Crear evaluaciones
   - [ ] Solo después de que funcione autenticación
   - [ ] Verificar validación de scores
```

### Fase 4: Seguridad
```
6. Validación de contraseñas
   - [ ] Corregir test de contraseña muy larga
```

---

## 🔧 Archivos a Revisar

```
backend/
├── app/api/
│   ├── auth.py              ← CRÍTICO: signup, login
│   ├── deps.py              ← CRÍTICO: get_current_user
│   └── assessments.py       ← IMPORTANTE: crear evaluación
├── app/core/
│   ├── config.py
│   ├── security.py          ← IMPORTANTE: verify_password
├── app/schemas/
│   └── user.py              ← IMPORTANTE: validación
└── tests/
    ├── conftest.py
    ├── test_auth.py         ← VER ESTO PRIMERO
    ├── test_functional.py   ← VER ESTO SEGUNDO
    └── test_unit_extended.py
```

---

## 📝 Checklist de Corrección

### Paso 1: Autenticación Básica
- [ ] Endpoint POST /signup acepta email y password
- [ ] Retorna 200 si es exitoso
- [ ] Retorna 400 si validación falla
- [ ] Retorna 409 si email ya existe

### Paso 2: Login
- [ ] Endpoint POST /login acepta email y password
- [ ] Retorna 200 con `access_token` si es correcto
- [ ] Retorna 401 si credenciales son inválidas
- [ ] Token tiene formato JWT válido

### Paso 3: Protección de Rutas
- [ ] Rutas protegidas retornan 401 sin token
- [ ] Rutas protegidas retornan 401 con token inválido
- [ ] Rutas protegidas retornan 403 si no tiene permisos (NO 401)

### Paso 4: Admin
- [ ] Credenciales `admin@mindguard.ai:admin123` funcionan
- [ ] Admin puede acceder a rutas administrativas

### Paso 5: Evaluaciones
- [ ] Crear evaluación con datos válidos
- [ ] Rechaza scores fuera de rango
- [ ] Persiste en base de datos

---

## 🧪 Testing Después de Corregir

```bash
# Después de cada corrección, ejecutar:

# Solo auth tests
python -m pytest tests/test_auth.py -v

# Después, tests funcionales
python -m pytest tests/test_functional.py -v

# Finalmente, cobertura completa
python -m pytest tests/ -v --html=reporte.html --self-contained-html
```

---

## 📊 Progreso

| Problema | Estado | Archivo | Línea Est. |
|----------|--------|---------|-----------|
| Signup error | ❌ | auth.py | ? |
| Login error | ❌ | auth.py | ? |
| Token missing | ❌ | auth.py | ? |
| Token status | ❌ | deps.py | ? |
| Password validation | ❌ | security.py | ? |

---

## 💬 Notas

- Los tests unitarios (37 ✅) están pasando
- Los problemas son en autenticación (integración)
- Necesita ser sincronizado con la BD real

**Última actualización**: 5 de Junio de 2026

