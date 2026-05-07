# MindGuard IA - Plataforma de Acompañamiento y Gestión en Salud Mental

**MindGuard IA** es una solución tecnológica avanzada diseñada para reducir la brecha de atención en salud mental. Su objetivo es proporcionar un **seguimiento clínico longitudinal** y una respuesta preventiva ante crisis emocionales, utilizando Inteligencia Artificial para transformar datos subjetivos (sentimientos) y objetivos (escalas clínicas) en información accionable.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una **Arquitectura Multi-Capa (N-Tier)** con una clara separación de responsabilidades, lo que garantiza escalabilidad y facilidad de mantenimiento:

### 1. Capa de Presentación (Frontend - PWA)
*   **Tecnología:** React 19 + TypeScript + Vite.
*   **Responsabilidad:** Interfaz de usuario reactiva y profesional. Gestiona el enrutamiento protegido, la visualización de datos mediante gráficas (`Recharts`) y el flujo del "Wizard Terapéutico".
*   **Arquitectura:** Basada en Componentes y Servicios. Utiliza el patrón de **Estado Centralizado** y **Hooks Personalizados** para la lógica de consumo de API.

### 2. Capa de Aplicación y Negocio (Backend - API REST)
*   **Tecnología:** FastAPI (Python 3.9+).
*   **Responsabilidad:** Orquestación de la lógica clínica. Valida las reglas de negocio (cálculo de puntajes PHQ-9/GAD-7), gestiona la autenticación JWT y coordina los servicios de IA.
*   **Arquitectura:** Estilo **Arquitectura Limpia (Clean Architecture)** simplificada, dividida en:
    *   `api/`: Controladores de entrada (Endpoints).
    *   `services/`: Lógica de negocio pura (IA y Clínica).
    *   `models/`: Definición de entidades de datos.
    *   `schemas/`: DTOs (Data Transfer Objects) para validación con Pydantic.

### 3. Capa de Inteligencia Artificial (IA Local)
*   **Tecnología:** Hugging Face Transformers + DistilBERT.
*   **Responsabilidad:** Inferencia local de procesamiento de lenguaje natural (NLP). Clasifica el sentimiento y detecta señales de alerta en el diario emocional sin depender de nubes externas, garantizando la **privacidad médica**.

### 4. Capa de Datos (Persistencia)
*   **Tecnología:** SQLite (Desarrollo) / SQLAlchemy (ORM).
*   **Responsabilidad:** Almacenamiento relacional de usuarios, evaluaciones y registros históricos con integridad referencial.

---

## 📂 Estructura del Proyecto

```text
calidad/
├── backend/                # Motor Clínico e IA
│   ├── app/
│   │   ├── api/            # Endpoints (auth, assessments)
│   │   ├── core/           # Seguridad (JWT) y Configuración
│   │   ├── models/         # Entidades de Base de Datos (SQLAlchemy)
│   │   ├── schemas/        # Validadores de datos (Pydantic)
│   │   └── services/       # Lógica IA (DistilBERT) y Clínica
│   ├── tests/              # Pruebas Unitarias e Integración (Pytest)
│   └── mindguard.db        # Base de Datos Local
├── frontend/               # Interfaz Terapéutica
│   ├── src/
│   │   ├── components/     # UI Reutilizable (Navbar, etc.)
│   │   ├── pages/          # Vistas (Dashboard, Assessment, Admin)
│   │   ├── services/       # Conexión con API (Axios)
│   │   └── index.css       # Estilos Profesionales
│   └── package.json        # Dependencias y Scripts
└── README.md               # Documentación General
```

---

## ⚙️ Metodología de Desarrollo

Para garantizar la alta calidad exigida en un software de salud mental, se aplicó una metodología **Ágil - Incremental** con enfoque en la **Ingeniería de Calidad**:

1.  **Desarrollo Iterativo:** El sistema se construyó en ciclos, comenzando por el núcleo clínico (tests oficiales) y evolucionando hacia el análisis emocional con IA.
2.  **Enfoque en Calidad y Pruebas (QA):**
    *   **Unit Testing:** Pruebas de los cálculos matemáticos de las escalas PHQ-9/GAD-7.
    *   **Integration Testing:** Validación del flujo completo desde el registro de usuario hasta la detección de alerta por IA.
    *   **Defensive Programming:** Implementación de verificaciones de tipos y manejo de errores para evitar fallos críticos (pantallas blancas).
3.  **Seguridad por Diseño (Security by Design):**
    *   Encriptación de contraseñas con `bcrypt`.
    *   Control de Acceso Basado en Roles (RBAC).
    *   Tokens JWT con expiración para proteger la privacidad del paciente.

---

## 🚀 Funcionalidades Clave

*   **Triaje Híbrido:** Combinación de escalas clínicas (objetivas) y diario emocional IA (subjetivo).
*   **Prescripción Digital:** Recomendación de recursos (YouTube, lecturas) basada en riesgo.
*   **Management Hub:** Panel de administración con alertas críticas en tiempo real y gestión de psicólogos.
*   **Trazabilidad:** Historial longitudinal con gráficas de evolución temporal.

---

## 🏃 Ejecución y Acceso

### Backend & IA
```bash
cd backend && source venv/bin/activate
export PYTHONPATH=$PYTHONPATH:.
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend && npm run dev
```

**Credenciales Admin:** `admin@mindguard.ai` | `admin123`
