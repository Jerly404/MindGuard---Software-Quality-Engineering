# Guía de Despliegue - MindGuard IA

Este documento detalla los pasos para desplegar el sistema completo (Frontend, Backend y Base de Datos) utilizando servicios gratuitos o de bajo costo.

## 1. Preparación Local (Prueba de Fuego)
Antes de subir a la nube, asegúrate de que todo funcione en tu PC con Docker:

```bash
# Iniciar todo el sistema
docker-compose up --build
```
*   **Frontend:** http://localhost (Puerto 80)
*   **Backend:** http://localhost:8000
*   **Base de Datos:** PostgreSQL corriendo internamente.

---

## 2. Opción Recomendada: Despliegue en Railway (Más Fácil)
Railway permite tener todo en un solo lugar.

### Pasos:
1.  **Sube tu código a GitHub:**
    ```bash
    git add .
    git commit -m "feat: setup deployment"
    git push origin main
    ```
2.  **Crea un proyecto en [Railway.app](https://railway.app/):**
    *   Dale a "New Project" -> "Provision PostgreSQL".
    *   Dale a "New" -> "GitHub Repo" -> Selecciona tu repositorio.
3.  **Configurar el Backend:**
    *   En la pestaña **Variables** del servicio backend en Railway, añade:
        *   `DATABASE_URL`: Haz clic en "Add Reference" y selecciona la URL de la base de datos PostgreSQL que creaste. *Nota: Asegúrate de que empiece con `postgresql+asyncpg://` (Railway suele dar `postgresql://`, solo cámbialo en la variable).*
        *   `GOOGLE_API_KEY`: Tu llave de Gemini.
        *   `GROQ_API_KEY`: Tu llave de Groq.
    *   En **Settings**, asegúrate de que el "Root Directory" sea `/backend`.
4.  **Configurar el Frontend:**
    *   En la pestaña **Variables** del servicio frontend:
        *   `VITE_API_URL`: La URL que Railway le asignó a tu backend (ej: `https://backend-production.up.railway.app/api/v1`).
    *   En **Settings**, asegúrate de que el "Root Directory" sea `/frontend`.

---

## 3. Pruebas de Carga y Resistencia
Una vez desplegado, puedes probar cuánta gente soporta el sistema:

### Usando Locust (Prueba de Estrés)
1.  Instala locust: `pip install locust`
2.  Crea un archivo `locustfile.py`:
    ```python
    from locust import HttpUser, task, ceremonies

    class MindGuardUser(HttpUser):
        @task
        def check_health(self):
            self.client.get("/health")

        @task
        def view_assessments(self):
            self.client.get("/api/v1/assessments/chat/greeting")
    ```
3.  Corre la prueba: `locust -f locustfile.py --host=https://tu-backend.railway.app`
4.  Abre `http://localhost:8089` en tu navegador y lanza 100, 500 o 1000 usuarios simultáneos.

---

## 4. Recomendaciones Finales
*   **Escalabilidad:** Railway escalará la RAM automáticamente si el sistema recibe muchas visitas.
*   **Logs:** Revisa la pestaña "Logs" en Railway para ver si hay errores en tiempo real.
*   **Seguridad:** Una vez que tengas tu dominio final, vuelve a `backend/app/main.py` y cambia `origins = ["*"]` por tu dominio real.
