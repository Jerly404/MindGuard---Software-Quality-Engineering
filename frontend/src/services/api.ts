import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Autodetección de entorno para Render y corrección de URLs
if (window.location.hostname !== 'localhost') {
    // Si la URL no empieza con http, se la añadimos
    if (!API_URL.startsWith('http')) {
        API_URL = `https://${API_URL}`;
    }
    
    // Si el host no tiene un punto (ej: "mindguard-backend-k5py"), 
    // es un host interno de Render y necesita el dominio público.
    const urlObj = new URL(API_URL);
    if (!urlObj.hostname.includes('.')) {
        API_URL = API_URL.replace(urlObj.hostname, `${urlObj.hostname}.onrender.com`);
    }
}

// Asegurar que termine en /api/v1 sin duplicados
if (!API_URL.endsWith('/api/v1')) {
    API_URL = API_URL.replace(/\/$/, '') + '/api/v1';
}

console.log("MindGuard API initialized at:", API_URL);

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
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
};

export const authApi = {
    login: (credentials: { username: string, password: string }) => {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        return api.post('/auth/login/access-token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    signup: (userData: any) => api.post('/auth/signup', userData),
    createProfessional: (userData: any) => api.post('/auth/create-professional', userData),
    getUsers: () => api.get('/auth/users/'),
    deleteUser: (userId: number) => api.delete(`/auth/users/${userId}/`),
    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
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
