import React, { createContext, useContext, useState, useEffect } from 'react';

export type LocaleMode = 'es' | 'en' | 'es-simple' | 'en-simple';
export type FontSizeMode = 'normal' | 'large' | 'xlarge';

interface A11yContextProps {
  locale: LocaleMode;
  highContrast: boolean;
  fontSize: FontSizeMode;
  setLocale: (locale: LocaleMode) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: FontSizeMode) => void;
  t: (key: string) => string;
}

const translations: Record<LocaleMode, Record<string, string>> = {
  es: {
    // Navbar
    'nav.title': 'MindGuard',
    'nav.logout': 'Cerrar Sesión',
    'nav.highContrast': 'Alternar Alto Contraste',
    'nav.fontSize': 'Cambiar tamaño de texto',
    'nav.langSelect': 'Cambiar idioma',
    'nav.professional': 'Dr/a. ',
    'nav.user': 'Usuario',

    // Auth (Login / Signup)
    'auth.welcome': 'Bienvenido',
    'auth.loginSub': 'Inicia sesión en MindGuard IA',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.loginBtn': 'Iniciar Sesión',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.registerHere': 'Regístrate aquí',
    'auth.createAccount': 'Crear Cuenta',
    'auth.join': 'Únete a MindGuard IA',
    'auth.fullName': 'Nombre Completo',
    'auth.registerBtn': 'Registrarse',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'auth.loginHere': 'Inicia sesión aquí',

    // Forgot / Reset Password
    'auth.recoverTitle': 'Recuperar Contraseña',
    'auth.recoverSub': 'Ingresa tu correo electrónico y te enviaremos un código de recuperación.',
    'auth.backToLogin': 'Volver al login',
    'auth.sendEmail': 'Enviar Correo',
    'auth.sending': 'Enviando...',
    'auth.newPasswordTitle': 'Nueva Contraseña',
    'auth.newPasswordSub': 'Ingresa el código que recibiste y tu nueva contraseña.',
    'auth.tokenPlaceholder': 'Código de recuperación (Token)',
    'auth.newPasswordPlaceholder': 'Nueva Contraseña',
    'auth.changePasswordBtn': 'Cambiar Contraseña',
    'auth.changing': 'Cambiando...',

    // Dashboard
    'dash.title': 'Panel de Bienestar Emocional',
    'dash.welcome': 'Hola, te damos la bienvenida a tu espacio seguro.',
    'dash.lastEval': 'Último Análisis de Estado de Ánimo',
    'dash.noEval': 'Aún no tienes evaluaciones registradas. ¡Te invitamos a conversar con nuestra IA para iniciar!',
    'dash.scoreDep': 'Puntaje de Depresión (PHQ-9):',
    'dash.scoreAnx': 'Puntaje de Ansiedad (GAD-7):',
    'dash.historyTitle': 'Tu Progreso de Salud Mental',
    'dash.historySub': 'Evolución de los niveles de bienestar en tus últimas evaluaciones',
    'dash.chartAnxiety': 'Nivel de Ansiedad',
    'dash.chartDepression': 'Nivel de Depresión',
    'dash.chartDate': 'Fecha',
    'dash.calmExercise': 'Ejercicio de Calma',
    'dash.calmExerciseSub': 'Realiza un ejercicio guiado de respiración de 4 ciclos para reducir la ansiedad.',
    'dash.startCalm': 'Iniciar Respiración',
    'dash.professionalTitle': 'Nuestros Especialistas de Salud',
    'dash.professionalSub': 'Profesionales recomendados listos para programar sesiones terapéuticas de 45 minutos.',
    'dash.proSpecialty': 'Especialidad:',
    'dash.proPrice': 'Precio sesión:',
    'dash.proButton': 'Agendar Cita',
    'dash.appointmentTitle': 'Tus Citas Programadas',
    'dash.appointmentSub': 'Enlaces seguros para tus próximas videollamadas con especialistas',
    'dash.appointmentJoin': 'Entrar a la videollamada',
    'dash.appointmentNo': 'No tienes citas programadas en este momento.',

    // Breathing Exercise Modal
    'breath.title': 'Ejercicio de Respiración',
    'breath.close': 'Cerrar ejercicio de respiración',
    'breath.cycle': 'Ciclo',
    'breath.inhale': 'Inhala',
    'breath.hold': 'Mantén',
    'breath.exhale': 'Exhala',
    'breath.wait': 'Espera',
    'breath.instruction': 'Inhala por la nariz, mantén y exhala profundamente.',
    'breath.start': 'Iniciar ejercicio de respiración',
    'breath.pause': 'Pausar ejercicio de respiración',
    'breath.reset': 'Reiniciar ejercicio de respiración',
    'breath.finish': 'Finalizar Sesión de Calma',

    // Assessment / Questionnaire Flow
    'assess.consentTitle': 'Chat Terapéutico MindGuard',
    'assess.consentSub': 'En lugar de formularios fríos, hoy tendremos una pequeña charla. Nuestra IA analizará tus respuestas para brindarte el mejor apoyo posible.',
    'assess.privacy': 'Privacidad Total',
    'assess.privacySub': 'Tus conversaciones son privadas y seguras.',
    'assess.analysis': 'Análisis Inteligente',
    'assess.analysisSub': 'Detectamos patrones emocionales en tiempo real.',
    'assess.startChat': 'Comenzar Conversación',
    'assess.aiActive': 'IA Activa',
    'assess.chatTitle': 'Asistente MindGuard',
    'assess.inputPlaceholder': 'Escribe tu respuesta aquí...',
    'assess.sendButton': 'Enviar mensaje',
    'assess.analyzing': 'Analizando patrones emocionales...',
    'assess.resultTitle': 'Resultados de tu Evaluación',
    'assess.resultSub': 'Análisis computacional basado en la conversación del estado mental de hoy.',
    'assess.severityHigh': 'Severidad Alta',
    'assess.severityMed': 'Severidad Moderada',
    'assess.severityLow': 'Severidad Leve',
    'assess.severityNone': 'Severidad Baja',
    'assess.aiInterpretation': 'Interpretación de Inteligencia Artificial',
    'assess.actionPlan': 'Plan de Acción y Recomendaciones',
    'assess.backHome': 'Volver al Inicio',
    'assess.reTake': 'Realizar una Nueva Evaluación',

    // Chatbot Widget
    'chat.header': 'MindGuard Pro',
    'chat.systemActive': 'Sistema Inteligente Activo',
    'chat.close': 'Cerrar chat de MindGuard',
    'chat.open': 'Abrir asistente de chat de MindGuard',
    'chat.placeholder': 'Conversa con MindGuard...',
    'chat.generateReport': 'Generar Reporte del Estado Mental',
    'chat.reportTitle': 'Reporte de Evaluación Diaria',
    'chat.interpretation': 'Interpretación:',
    'chat.actionPlan': 'Plan de Acción:',

    // Roles and Dashboards
    'role.admin': 'Administrador',
    'role.professional': 'Profesional',
    'role.user': 'Usuario / Paciente',
    'admin.title': 'Panel de Administración Global',
    'admin.sub': 'Gestión de usuarios y monitoreo de la salud del sistema',
    'prof.title': 'Panel Profesional de Salud',
    'prof.sub': 'Visualice y gestione sus pacientes y citas programadas'
  },
  en: {
    // Navbar
    'nav.title': 'MindGuard',
    'nav.logout': 'Log Out',
    'nav.highContrast': 'Toggle High Contrast',
    'nav.fontSize': 'Change text size',
    'nav.langSelect': 'Change language',
    'nav.professional': 'Dr. ',
    'nav.user': 'User',

    // Auth (Login / Signup)
    'auth.welcome': 'Welcome',
    'auth.loginSub': 'Log in to MindGuard AI',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.loginBtn': 'Log In',
    'auth.noAccount': "Don't have an account?",
    'auth.registerHere': 'Register here',
    'auth.createAccount': 'Create Account',
    'auth.join': 'Join MindGuard AI',
    'auth.fullName': 'Full Name',
    'auth.registerBtn': 'Sign Up',
    'auth.haveAccount': 'Already have an account?',
    'auth.loginHere': 'Log in here',

    // Forgot / Reset Password
    'auth.recoverTitle': 'Recover Password',
    'auth.recoverSub': 'Enter your email address and we will send you a recovery token.',
    'auth.backToLogin': 'Back to login',
    'auth.sendEmail': 'Send Email',
    'auth.sending': 'Sending...',
    'auth.newPasswordTitle': 'New Password',
    'auth.newPasswordSub': 'Enter the recovery token you received and your new password.',
    'auth.tokenPlaceholder': 'Recovery code (Token)',
    'auth.newPasswordPlaceholder': 'New Password',
    'auth.changePasswordBtn': 'Change Password',
    'auth.changing': 'Changing...',

    // Dashboard
    'dash.title': 'Emotional Well-being Dashboard',
    'dash.welcome': 'Hello, welcome to your safe space.',
    'dash.lastEval': 'Last Mood Assessment',
    'dash.noEval': 'No assessments recorded yet. We invite you to talk to our AI to start!',
    'dash.scoreDep': 'Depression Score (PHQ-9):',
    'dash.scoreAnx': 'Anxiety Score (GAD-7):',
    'dash.historyTitle': 'Your Mental Health Progress',
    'dash.historySub': 'Evolution of well-being levels in your last assessments',
    'dash.chartAnxiety': 'Anxiety Level',
    'dash.chartDepression': 'Depression Level',
    'dash.chartDate': 'Date',
    'dash.calmExercise': 'Calm Exercise',
    'dash.calmExerciseSub': 'Perform a guided 4-cycle breathing exercise to reduce anxiety.',
    'dash.startCalm': 'Start Breathing',
    'dash.professionalTitle': 'Our Health Specialists',
    'dash.professionalSub': 'Recommended professionals ready to schedule 45-minute therapy sessions.',
    'dash.proSpecialty': 'Specialty:',
    'dash.proPrice': 'Session price:',
    'dash.proButton': 'Schedule Appointment',
    'dash.appointmentTitle': 'Your Scheduled Appointments',
    'dash.appointmentSub': 'Secure links for your next video calls with specialists',
    'dash.appointmentJoin': 'Join video call',
    'dash.appointmentNo': 'You have no scheduled appointments at this time.',

    // Breathing Exercise Modal
    'breath.title': 'Breathing Exercise',
    'breath.close': 'Close breathing exercise',
    'breath.cycle': 'Cycle',
    'breath.inhale': 'Inhale',
    'breath.hold': 'Hold',
    'breath.exhale': 'Exhale',
    'breath.wait': 'Wait',
    'breath.instruction': 'Inhale through your nose, hold, and exhale deeply.',
    'breath.start': 'Start breathing exercise',
    'breath.pause': 'Pause breathing exercise',
    'breath.reset': 'Reset breathing exercise',
    'breath.finish': 'Finish Calm Session',

    // Assessment / Questionnaire Flow
    'assess.consentTitle': 'MindGuard Therapeutic Chat',
    'assess.consentSub': 'Instead of cold forms, today we will have a short talk. Our AI will analyze your responses to give you the best possible support.',
    'assess.privacy': 'Total Privacy',
    'assess.privacySub': 'Your conversations are private and secure.',
    'assess.analysis': 'Intelligent Analysis',
    'assess.analysisSub': 'We detect emotional patterns in real time.',
    'assess.startChat': 'Start Conversation',
    'assess.aiActive': 'AI Active',
    'assess.chatTitle': 'MindGuard Assistant',
    'assess.inputPlaceholder': 'Type your reply here...',
    'assess.sendButton': 'Send message',
    'assess.analyzing': 'Analyzing emotional patterns...',
    'assess.resultTitle': 'Your Evaluation Results',
    'assess.resultSub': 'Computational analysis based on today\'s mental state conversation.',
    'assess.severityHigh': 'High Severity',
    'assess.severityMed': 'Moderate Severity',
    'assess.severityLow': 'Mild Severity',
    'assess.severityNone': 'Low Severity',
    'assess.aiInterpretation': 'Artificial Intelligence Interpretation',
    'assess.actionPlan': 'Action Plan & Recommendations',
    'assess.backHome': 'Go to Home',
    'assess.reTake': 'Take a New Assessment',

    // Chatbot Widget
    'chat.header': 'MindGuard Pro',
    'chat.systemActive': 'Intelligent System Active',
    'chat.close': 'Close MindGuard chat',
    'chat.open': 'Open MindGuard chat assistant',
    'chat.placeholder': 'Talk with MindGuard...',
    'chat.generateReport': 'Generate Mental Health Report',
    'chat.reportTitle': 'Daily Evaluation Report',
    'chat.interpretation': 'Interpretation:',
    'chat.actionPlan': 'Action Plan:',

    // Roles and Dashboards
    'role.admin': 'Administrator',
    'role.professional': 'Professional',
    'role.user': 'User / Patient',
    'admin.title': 'Global Admin Dashboard',
    'admin.sub': 'Manage users and monitor system health',
    'prof.title': 'Professional Health Dashboard',
    'prof.sub': 'View and manage your patients and scheduled appointments'
  },
  'es-simple': {
    // Navbar
    'nav.title': 'MindGuard',
    'nav.logout': 'Salir de la cuenta',
    'nav.highContrast': 'Cambiar colores (Alto Contraste)',
    'nav.fontSize': 'Hacer la letra más grande',
    'nav.langSelect': 'Cambiar el idioma',
    'nav.professional': 'Doctor/a. ',
    'nav.user': 'Usuario',

    // Auth (Login / Signup)
    'auth.welcome': 'Hola',
    'auth.loginSub': 'Escribe tus datos para entrar a MindGuard IA',
    'auth.email': 'Tu correo de internet (Email)',
    'auth.password': 'Tu clave secreta (Contraseña)',
    'auth.forgotPassword': '¿No recuerdas tu clave?',
    'auth.loginBtn': 'Entrar ahora',
    'auth.noAccount': '¿No tienes una cuenta todavía?',
    'auth.registerHere': 'Crea una cuenta nueva aquí',
    'auth.createAccount': 'Crear una cuenta',
    'auth.join': 'Regístrate gratis para cuidar tu mente',
    'auth.fullName': 'Tu nombre y apellido',
    'auth.registerBtn': 'Crear mi cuenta',
    'auth.haveAccount': '¿Ya tienes una cuenta para entrar?',
    'auth.loginHere': 'Entra con tus datos aquí',

    // Forgot / Reset Password
    'auth.recoverTitle': 'Recuperar mi clave',
    'auth.recoverSub': 'Escribe tu correo. Te enviaremos un código para cambiar tu clave.',
    'auth.backToLogin': 'Regresar a la pantalla anterior',
    'auth.sendEmail': 'Enviar código al correo',
    'auth.sending': 'Enviando código...',
    'auth.newPasswordTitle': 'Crear clave nueva',
    'auth.newPasswordSub': 'Escribe el código que recibiste y tu nueva clave secreta.',
    'auth.tokenPlaceholder': 'Código que llegó a tu correo',
    'auth.newPasswordPlaceholder': 'Nueva clave secreta',
    'auth.changePasswordBtn': 'Guardar clave nueva',
    'auth.changing': 'Guardando...',

    // Dashboard
    'dash.title': 'Mi Panel de Bienestar',
    'dash.welcome': 'Hola. Este es un sitio seguro para cuidar cómo te sientes.',
    'dash.lastEval': 'Resultado de cómo te sientes hoy',
    'dash.noEval': 'Aún no has conversado con nosotros. ¡Toca el botón para empezar a hablar!',
    'dash.scoreDep': 'Nivel de Tristeza o Depresión:',
    'dash.scoreAnx': 'Nivel de Susto o Ansiedad:',
    'dash.historyTitle': 'Mi Camino hacia el Bienestar',
    'dash.historySub': 'Este gráfico muestra cómo ha cambiado tu ánimo en los últimos días',
    'dash.chartAnxiety': 'Nivel de Ansiedad',
    'dash.chartDepression': 'Nivel de Depresión',
    'dash.chartDate': 'Día',
    'dash.calmExercise': 'Ejercicio para Calmarte',
    'dash.calmExerciseSub': 'Toma aire despacio para sentirte más tranquilo y relajado.',
    'dash.startCalm': 'Empezar a respirar',
    'dash.professionalTitle': 'Especialistas listos para ayudarte',
    'dash.professionalSub': 'Médicos y psicólogos con los que puedes hablar para sentirte mejor.',
    'dash.proSpecialty': 'Trabajo / Especialidad:',
    'dash.proPrice': 'Costo de la consulta:',
    'dash.proButton': 'Pedir una cita con este doctor',
    'dash.appointmentTitle': 'Mis Citas con los Doctores',
    'dash.appointmentSub': 'Presiona el botón para entrar a la videollamada a la hora de tu cita',
    'dash.appointmentJoin': 'Entrar a la llamada ahora',
    'dash.appointmentNo': 'No tienes ninguna cita médica pedida por ahora.',

    // Breathing Exercise Modal
    'breath.title': 'Ejercicio para respirar y calmarte',
    'breath.close': 'Cerrar el juego de respirar',
    'breath.cycle': 'Vuelta número',
    'breath.inhale': 'Toma aire por la nariz lentamente',
    'breath.hold': 'Mantén el aire adentro',
    'breath.exhale': 'Bota el aire despacio por la boca',
    'breath.wait': 'Espera un momento antes de volver a empezar',
    'breath.instruction': 'Toma aire, mantén el aire adentro y luego bótalo despacio.',
    'breath.start': 'Empezar a respirar',
    'breath.pause': 'Detener un momento',
    'breath.reset': 'Volver a comenzar desde cero',
    'breath.finish': 'Terminar ejercicio de respiración',

    // Assessment / Questionnaire Flow
    'assess.consentTitle': 'Conversar para saber cómo estás',
    'assess.consentSub': 'No llenaremos formularios difíciles. Hablaremos como amigos. Nuestra computadora inteligente te escuchará para ver cómo ayudarte.',
    'assess.privacy': 'Tus secretos están seguros',
    'assess.privacySub': 'Nadie más puede leer lo que escribes aquí.',
    'assess.analysis': 'Cuidado de tu ánimo',
    'assess.analysisSub': 'Descubrimos si estás triste o asustado para darte consejos rápidos.',
    'assess.startChat': 'Empezar a hablar ya',
    'assess.aiActive': 'Computadora Inteligente Activa',
    'assess.chatTitle': 'Ayudante MindGuard',
    'assess.inputPlaceholder': 'Escribe aquí cómo te sientes...',
    'assess.sendButton': 'Enviar lo que escribí',
    'assess.analyzing': 'Pensando y analizando tus palabras...',
    'assess.resultTitle': 'Lo que encontramos hoy',
    'assess.resultSub': 'Este es el resumen de tu estado de ánimo según nuestra charla.',
    'assess.severityHigh': 'Necesitas mucha ayuda (Alto)',
    'assess.severityMed': 'Necesitas algo de ayuda (Medio)',
    'assess.severityLow': 'Estás un poco triste o asustado (Leve)',
    'assess.severityNone': 'Te sientes muy bien (Bajo)',
    'assess.aiInterpretation': 'Lo que la computadora entendió:',
    'assess.actionPlan': 'Cosas que puedes hacer hoy para sentirte mejor:',
    'assess.backHome': 'Volver a la pantalla principal',
    'assess.reTake': 'Volver a conversar para evaluarme',

    // Chatbot Widget
    'chat.header': 'MindGuard Ayudante',
    'chat.systemActive': 'Estoy listo para hablar contigo',
    'chat.close': 'Cerrar ventana de charla',
    'chat.open': 'Abrir chat para hablar con MindGuard',
    'chat.placeholder': 'Escríbeme para conversar...',
    'chat.generateReport': 'Crear resumen de mi salud mental',
    'chat.reportTitle': 'Resumen de mi salud de hoy',
    'chat.interpretation': 'Lo que significa:',
    'chat.actionPlan': 'Consejos para ti:',

    // Roles and Dashboards
    'role.admin': 'Jefe de Sistema',
    'role.professional': 'Doctor / Terapeuta',
    'role.user': 'Usuario / Paciente',
    'admin.title': 'Panel de Control de Administradores',
    'admin.sub': 'Revisar cómo funciona el sistema y ver los usuarios',
    'prof.title': 'Panel para Doctores y Especialistas',
    'prof.sub': 'Aquí puede ver la lista de sus pacientes y las citas que tiene programadas'
  },
  'en-simple': {
    // Navbar
    'nav.title': 'MindGuard',
    'nav.logout': 'Sign Out',
    'nav.highContrast': 'Change colors (High Contrast)',
    'nav.fontSize': 'Make text bigger',
    'nav.langSelect': 'Change language',
    'nav.professional': 'Dr. ',
    'nav.user': 'User',

    // Auth (Login / Signup)
    'auth.welcome': 'Hello',
    'auth.loginSub': 'Type your details to enter MindGuard AI',
    'auth.email': 'Your internet mail (Email)',
    'auth.password': 'Your secret password',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.loginBtn': 'Log in now',
    'auth.noAccount': 'Do you need a new account?',
    'auth.registerHere': 'Create a new account here',
    'auth.createAccount': 'Create Account',
    'auth.join': 'Sign up for free to care for your mind',
    'auth.fullName': 'Your full name',
    'auth.registerBtn': 'Create my account',
    'auth.haveAccount': 'Do you already have an account?',
    'auth.loginHere': 'Log in here',

    // Forgot / Reset Password
    'auth.recoverTitle': 'Recover my password',
    'auth.recoverSub': 'Type your email. We will send you a code to change your password.',
    'auth.backToLogin': 'Go back',
    'auth.sendEmail': 'Send code to email',
    'auth.sending': 'Sending code...',
    'auth.newPasswordTitle': 'Create new password',
    'auth.newPasswordSub': 'Type the code you received and your new secret password.',
    'auth.tokenPlaceholder': 'Code from your email',
    'auth.newPasswordPlaceholder': 'New secret password',
    'auth.changePasswordBtn': 'Save new password',
    'auth.changing': 'Saving...',

    // Dashboard
    'dash.title': 'My Well-being Panel',
    'dash.welcome': 'Hello. This is a safe place to care for how you feel.',
    'dash.lastEval': 'How you are feeling today',
    'dash.noEval': 'You have not talked to us yet. Click the button to start talking!',
    'dash.scoreDep': 'Sadness or Depression Level:',
    'dash.scoreAnx': 'Fear or Anxiety Level:',
    'dash.historyTitle': 'My Path to Well-being',
    'dash.historySub': 'This chart shows how your mood changed over the last days',
    'dash.chartAnxiety': 'Anxiety Level',
    'dash.chartDepression': 'Depression Level',
    'dash.chartDate': 'Day',
    'dash.calmExercise': 'Calming Exercise',
    'dash.calmExerciseSub': 'Breathe in slowly to feel more quiet and relaxed.',
    'dash.startCalm': 'Start breathing',
    'dash.professionalTitle': 'Specialists ready to help you',
    'dash.professionalSub': 'Doctors and therapists you can talk to feel better.',
    'dash.proSpecialty': 'Job / Specialty:',
    'dash.proPrice': 'Price of the visit:',
    'dash.proButton': 'Ask for a visit with this doctor',
    'dash.appointmentTitle': 'My Visits with Doctors',
    'dash.appointmentSub': 'Click the button to enter the video call at the visit time',
    'dash.appointmentJoin': 'Enter call now',
    'dash.appointmentNo': 'You have no scheduled visits at this time.',

    // Breathing Exercise Modal
    'breath.title': 'Exercise to breathe and calm down',
    'breath.close': 'Close breathing game',
    'breath.cycle': 'Round number',
    'breath.inhale': 'Breathe in slowly through your nose',
    'breath.hold': 'Keep the air inside',
    'breath.exhale': 'Breathe out slowly through your mouth',
    'breath.wait': 'Wait a moment before starting again',
    'breath.instruction': 'Breathe in, keep the air inside, and then breathe out slowly.',
    'breath.start': 'Start breathing',
    'breath.pause': 'Stop a moment',
    'breath.reset': 'Start again from zero',
    'breath.finish': 'Finish breathing exercise',

    // Assessment / Questionnaire Flow
    'assess.consentTitle': 'Talk to find out how you are',
    'assess.consentSub': 'We will not fill hard forms. We will talk like friends. Our smart computer will listen to see how to help you.',
    'assess.privacy': 'Your secrets are safe',
    'assess.privacySub': 'No one else can read what you write here.',
    'assess.analysis': 'Mood Care',
    'assess.analysisSub': 'We check if you are sad or scared to give you quick tips.',
    'assess.startChat': 'Start talking now',
    'assess.aiActive': 'Smart Computer Active',
    'assess.chatTitle': 'MindGuard Helper',
    'assess.inputPlaceholder': 'Type here how you feel...',
    'assess.sendButton': 'Send what I typed',
    'assess.analyzing': 'Thinking and looking at your words...',
    'assess.resultTitle': 'What we found today',
    'assess.resultSub': 'This is the summary of your mood from today\'s talk.',
    'assess.severityHigh': 'You need a lot of help (High)',
    'assess.severityMed': 'You need some help (Medium)',
    'assess.severityLow': 'You feel a bit sad or scared (Mild)',
    'assess.severityNone': 'You feel very well (Low)',
    'assess.aiInterpretation': 'What the computer understood:',
    'assess.actionPlan': 'Things you can do today to feel better:',
    'assess.backHome': 'Go back to main screen',
    'assess.reTake': 'Talk again to check my mood',

    // Chatbot Widget
    'chat.header': 'MindGuard Helper',
    'chat.systemActive': 'I am ready to talk with you',
    'chat.close': 'Close chat window',
    'chat.open': 'Open chat to talk with MindGuard',
    'chat.placeholder': 'Write me to talk...',
    'chat.generateReport': 'Create mental health summary',
    'chat.reportTitle': 'Summary of my health today',
    'chat.interpretation': 'What it means:',
    'chat.actionPlan': 'Tips for you:',

    // Roles and Dashboards
    'role.admin': 'System Manager',
    'role.professional': 'Doctor / Therapist',
    'role.user': 'User / Patient',
    'admin.title': 'Admin Control Panel',
    'admin.sub': 'Check how the system is working and view users',
    'prof.title': 'Panel for Doctors and Specialists',
    'prof.sub': 'Here you can see the list of your patients and scheduled appointments'
  }
};

const safeGetItem = (key: string, defaultValue: string): string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) || defaultValue;
    }
  } catch (e) {
    console.warn("localStorage is not accessible:", e);
  }
  return defaultValue;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn("localStorage is not accessible:", e);
  }
};

const A11yContext = createContext<A11yContextProps | undefined>(undefined);

export const A11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleMode>(() => {
    return (safeGetItem('a11y-locale', 'es') as LocaleMode);
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return safeGetItem('a11y-high-contrast', 'false') === 'true';
  });

  const [fontSize, setFontSizeState] = useState<FontSizeMode>(() => {
    return (safeGetItem('a11y-font-size', 'normal') as FontSizeMode);
  });

  // Persistir y aplicar idioma
  const setLocale = (mode: LocaleMode) => {
    setLocaleState(mode);
    safeSetItem('a11y-locale', mode);
    // Cambiar atributo lang del HTML para lectores de pantalla
    const langAttr = mode.startsWith('en') ? 'en' : 'es';
    document.documentElement.setAttribute('lang', langAttr);
  };

  // Persistir y aplicar alto contraste
  const setHighContrast = (contrast: boolean) => {
    setHighContrastState(contrast);
    safeSetItem('a11y-high-contrast', String(contrast));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }
  }, [highContrast]);

  // Persistir y aplicar tamaño de letra
  const setFontSize = (size: FontSizeMode) => {
    setFontSizeState(size);
    safeSetItem('a11y-font-size', size);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-font-large', 'a11y-font-xlarge');
    if (fontSize === 'large') {
      root.classList.add('a11y-font-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('a11y-font-xlarge');
    }
  }, [fontSize]);

  // Sincronizar atributos iniciales de HTML al montar
  useEffect(() => {
    const langAttr = locale.startsWith('en') ? 'en' : 'es';
    document.documentElement.setAttribute('lang', langAttr);
  }, []);

  // Función de traducción
  const t = (key: string): string => {
    // Si no encuentra la clave en el idioma seleccionado, intenta buscar en español estándar
    const str = translations[locale][key] || translations['es'][key] || key;
    return str;
  };

  return (
    <A11yContext.Provider
      value={{
        locale,
        highContrast,
        fontSize,
        setLocale,
        setHighContrast,
        setFontSize,
        t,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (context === undefined) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};
