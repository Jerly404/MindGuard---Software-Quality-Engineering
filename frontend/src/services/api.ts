import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Autodetección de entorno para Render y corrección de URLs
if (window.location.hostname !== 'localhost') {
    if (!API_URL.startsWith('http')) {
        API_URL = `https://${API_URL}`;
    }
    
    const urlObj = new URL(API_URL);
    if (!urlObj.hostname.includes('.')) {
        API_URL = API_URL.replace(urlObj.hostname, `${urlObj.hostname}.onrender.com`);
    }
}

if (!API_URL.endsWith('/api/v1')) {
    API_URL = API_URL.replace(/\/$/, '') + '/api/v1';
}

console.log("MindGuard API initialized at:", API_URL);

// Habilitar withCredentials para transmitir las cookies HttpOnly en las llamadas CORS
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    // Interceptor simplificado: Las cookies se manejan automáticamente por withCredentials
    return config;
});

// Interceptor para debugging de errores
api.interceptors.response.use(
    response => response,
    error => {
        console.error("API Error:", error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const premiumApi = {
    getProfessionals: () => api.get('/premium/professionals'),
    payAndAssign: (id_profesional: number, monto: number, metodo: string) => 
        api.post('/premium/payment/mock', { id_profesional, monto, metodo }),
    getAssignedPatients: () => api.get('/premium/assigned-patients'),
    getEarnings: () => api.get('/premium/earnings'),
    getPatientHistory: (patientId: number) => api.get(`/premium/patient-history/${patientId}`),
    createAppointment: (data: { id_paciente: number, fecha_cita: string, mensaje_seguimiento?: string }) => 
        api.post('/premium/appointments', data),
    getMyAppointments: () => api.get('/premium/appointments/me'),
    resendAppointmentEmail: (appointmentId: number) => 
        api.post(`/premium/appointments/${appointmentId}/resend-email`),
};

export const authApi = {
    login: async (credentials: { username: string, password: string }) => {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        
        const response = await api.post('/auth/login/access-token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Extraer metadatos no sensibles del token decodificándolo una sola vez
        const token = response.data.access_token;
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                
                // Almacenamos únicamente información no crítica de UI. Nunca el JWT Token.
                localStorage.setItem('user', JSON.stringify({ 
                    sub: decoded.sub, 
                    rol: decoded.rol || 'usuario' 
                }));
            } catch (e) {
                console.error("Error al decodificar metadatos de usuario:", e);
            }
        }
        return response;
    },
    signup: (userData: any) => api.post('/auth/signup', userData),
    createProfessional: (userData: any) => api.post('/auth/create-professional', userData),
    getUsers: () => api.get('/auth/users/'),
    deleteUser: (userId: number) => api.delete(`/auth/users/${userId}/`),
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('user');
        }
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
};

export const assessmentApi = {
    submit: (data: any) => api.post('/assessments/', data),
    submitChat: (messages: any[], step: string) => api.post('/assessments/chat/', { messages, step }),
    getChatGreeting: () => api.get('/assessments/chat/greeting/'),
    getChatMessage: (messages: any[], step: string) => api.post('/assessments/chat/message/', { messages, step }),
    getHistory: () => api.get('/assessments/me'),
};

export default api;
