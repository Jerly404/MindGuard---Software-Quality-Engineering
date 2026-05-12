# Guía de Despliegue - MindGuard IA (Render.com)

Para subir tu proyecto a la web de forma gratuita, sigue estos pasos:

### 1. Preparación en GitHub
1. Asegúrate de que todos los cambios (incluyendo el nuevo archivo `render.yaml`) estén subidos a tu repositorio.

### 2. En Render.com
1. Crea una cuenta en [Render.com](https://render.com/) (puedes usar tu cuenta de GitHub).
2. Haz clic en el botón **"New +"** y selecciona **"Blueprint"**.
3. Conecta tu repositorio de GitHub `MindGuard---Software-Quality-Engineering`.
4. Render leerá el archivo `render.yaml` y te mostrará los servicios a crear.
5. Haz clic en **"Apply"**.

### 3. Configuración de Variables (MUY IMPORTANTE)
Una vez que el despliegue comience, ve al servicio `mindguard-backend` -> **Environment** y añade manualmente estas claves que son secretas:
- `GOOGLE_API_KEY`: Tu clave de Google AI.
- `GROQ_API_KEY`: Tu clave de Groq.
- `SMTP_USER`: Tu correo de Gmail.
- `SMTP_PASSWORD`: Tu contraseña de aplicación de Google.
- `EMAILS_FROM_EMAIL`: Tu correo de remitente.

### 4. Acceso
- El frontend tendrá una URL parecida a: `https://mindguard-frontend.onrender.com`
- El backend tendrá una URL parecida a: `https://mindguard-backend.onrender.com`

**Nota:** Como es un plan gratuito, el servidor "se duerme" tras 15 minutos sin uso. La primera vez que abras la web puede tardar unos 30 segundos en cargar.

### Datos de Prueba (se crean solos al desplegar):
- **Admin:** `admin@mindguard.ai` | `admin123`
- **Psicólogo:** `psicologo@mindguard.ai` | `admin123`
