# MindGuard IA - Sistema de Monitoreo y Apoyo en Salud Mental 🌙

MindGuard IA es una plataforma integral diseñada para el monitoreo, evaluación y apoyo de la salud mental mediante el uso de Inteligencia Artificial avanzada. El sistema permite a los usuarios realizar un seguimiento de su bienestar emocional, completar evaluaciones clínicas estandarizadas y recibir apoyo en tiempo real a través de un asistente virtual especializado.

## 🚀 Características Principales

### 1. Evaluaciones Clínicas Inteligentes
- **PHQ-9 & GAD-7:** Implementación de cuestionarios estandarizados para la detección de síntomas de depresión y ansiedad.
- **Análisis con IA:** Procesamiento de resultados mediante modelos de lenguaje (LLMs) para proporcionar interpretaciones detalladas y niveles de riesgo.
- **Detección de Riesgo:** Algoritmos para identificar señales de alerta temprana y distress emocional.

### 2. Asistente Virtual MindGuard (Chatbot)
- **Triaje Inicial:** Proceso de evaluación PHQ-4 integrado al inicio de la interacción.
- **Conversación Empática:** Chatbot con personalidad de psicólogo clínico experto basado en Llama 3.3 (vía Groq).
- **Soporte Dinámico:** Recomendaciones personalizadas de música, cine y ejercicios de respiración.

### 3. Gestión Profesional y de Pacientes
- **Roles Diferenciados:** Acceso para Pacientes, Profesionales (Psicólogos/Psiquiatras) y Administradores.
- **Dashboard de Profesional:** Panel para que especialistas monitoreen el progreso de sus pacientes asignados.
- **Agenda de Citas:** Sistema de programación de sesiones con enlaces a reuniones virtuales integrados.

### 4. Seguimiento Emocional
- **Registro Diario:** Herramienta para registrar emociones, intensidad y disparadores.
- **Visualización de Datos:** Gráficos dinámicos (Recharts) que muestran la evolución del estado de ánimo a lo largo del tiempo.

### 5. Funciones Premium
- **Informes Detallados:** Generación de reportes clínicos profesionales en PDF (jsPDF).
- **Pagos Integrados:** Procesamiento de pagos mediante PayPal para suscripciones o servicios premium.

---

## 🛠️ Stack Tecnológico

### Backend (API REST)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Base de Datos:** SQLite (Desarrollo) / PostgreSQL (Producción) con [SQLAlchemy](https://www.sqlalchemy.org/)
- **Migraciones:** Alembic
- **IA/LLMs:** Groq SDK (Llama 3.3), Google Generative AI (Gemini)
- **Autenticación:** JWT (JSON Web Tokens) con bcrypt para hashing de contraseñas.
- **Correo:** FastAPI-mail (Jinja2 para plantillas).

### Frontend (SPA)
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** TypeScript
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Gestión de Estado:** TanStack Query (React Query)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Testing:** Vitest y Playwright (E2E)

---

## 📦 Estructura del Proyecto

```text
/
├── backend/                # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints (auth, assessments, premium)
│   │   ├── core/           # Configuración y seguridad
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio e integración IA
│   └── migrations/         # Migraciones de base de datos
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # UI reusable
│   │   ├── pages/          # Vistas principales
│   │   ├── hooks/          # Hooks personalizados
│   │   └── services/       # Llamadas a API
└── database/               # Scripts de inicialización SQL
```

---

## ⚙️ Configuración del Entorno

### Requisitos Previos
- Python 3.10+
- Node.js 18+
- API Keys de Groq y/o Google Gemini.

### Instalación Backend
1. Ir al directorio: `cd backend`
2. Crear venv: `python -m venv venv`
3. Instalar dependencias: `pip install -r requirements.txt`
4. Configurar `.env` con:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `SECRET_KEY`
5. Ejecutar migraciones: `alembic upgrade head`
6. Iniciar servidor: `uvicorn app.main:app --reload`

### Instalación Frontend
1. Ir al directorio: `cd frontend`
2. Instalar dependencias: `npm install`
3. Iniciar desarrollo: `npm run dev`

---

## 🛡️ Seguridad
- Encriptación de contraseñas con `Passlib` y `bcrypt`.
- Protección de rutas mediante Middlewares de autenticación.
- Manejo de CORS configurado para entornos de producción y desarrollo.

## 📄 Licencia
Este proyecto es para fines educativos y clínicos. Todos los derechos reservados.
