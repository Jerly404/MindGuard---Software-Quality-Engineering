# MindGuard - Pruebas y Calidad de Software

Este documento describe la estrategia de pruebas y los estándares de calidad del proyecto MindGuard, diseñado específicamente para asegurar la integridad, funcionalidad y robustez del sistema.

## 1. Pirámide de Pruebas

### Pruebas Unitarias (Backend)
- **Framework:** `pytest`
- **Ubicación:** `/backend/tests/`
- **Objetivo:** Probar funciones individuales, especialmente la lógica de negocio en `services/clinical.py`. Se utilizan "mocks" para aislar la base de datos y comprobar los resultados bajo diferentes casos borde.
- **Ejecución:**
  ```bash
  cd backend
  pytest tests/
  ```

### Pruebas E2E / Integración (Frontend)
- **Framework:** Playwright (Próximamente activo en CI)
- **Ubicación:** `/frontend/e2e/` (o tests integrados)
- **Objetivo:** Simular la experiencia real de un usuario interactuando con la interfaz gráfica, asegurando que los flujos críticos (como responder una evaluación clínica) funcionen de extremo a extremo.
- **Ejecución:**
  ```bash
  cd frontend
  npx playwright test
  ```

## 2. Análisis Estático de Código (Static Analysis)

Para mantener la calidad y consistencia del código, usamos herramientas que revisan el código antes de ejecutarlo.

### Backend (Python)
- **Ruff:** Actúa como linter y formatter. Es extremadamente rápido y agrupa las reglas de `flake8`, `isort` y `black`.
- **Configuración:** `backend/pyproject.toml`
- **Ejecución:**
  ```bash
  cd backend
  ruff check .      # Busca errores
  ruff format .     # Formatea el código
  ```

### Frontend (TypeScript)
- **ESLint:** Asegura que el código de React siga las mejores prácticas, evite errores comunes y mantenga una sintaxis estricta mediante TypeScript.

## 3. Integración y Entrega Continua (CI/CD)

- **Plataforma:** GitHub Actions (`.github/workflows/ci.yml`)
- **Proceso:** Cada vez que se hace un `push` o `Pull Request` a la rama principal (`master`/`main`), GitHub ejecuta automáticamente:
  1. Instalación de dependencias.
  2. Análisis estático (Linters y Formatters).
  3. Ejecución de la suite de pruebas automatizadas.
- **Objetivo:** Prevenir que código defectuoso llegue a producción.

## 4. Controles Locales (Pre-commit)
Para evitar hacer `commit` de código roto, usamos `pre-commit hooks`.
- **Configuración:** `.pre-commit-config.yaml`
- **Activación:** (Solo se necesita hacer una vez por desarrollador)
  ```bash
  pip install pre-commit
  pre-commit install
  ```
Esto ejecutará automáticamente verificaciones de sintaxis y formateo cada vez que ejecutes `git commit`.
