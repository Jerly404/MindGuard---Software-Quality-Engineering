import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

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

export const premiumApi = {
    getProfessionals: () => api.get('/premium/professionals'),
    payAndAssign: (id_profesional: number, monto: number, metodo: string) => 
        api.post('/premium/payment/mock', { id_profesional, monto, metodo }),
    getAssignedPatients: () => api.get('/premium/assigned-patients'),
    getEarnings: () => api.get('/premium/earnings'),
    getPatientHistory: (patientId: number) => api.get(`/premium/patient-history/${patientId}`)
};

export const authApi = {
    login: (formData: FormData) => api.post('/auth/login/access-token', formData),
    signup: (userData: any) => api.post('/auth/signup', userData),
    createProfessional: (userData: any) => api.post('/auth/create-professional', userData),
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
    submitChat: (messages: any[], step: string) => api.post('/assessments/chat', { messages, step }),
    getChatGreeting: () => api.get('/assessments/chat/greeting'),
    getChatMessage: (messages: any[], step: string) => api.post('/assessments/chat/message', { messages, step }),
    getHistory: () => api.get('/assessments/me'),
};

export default api;
