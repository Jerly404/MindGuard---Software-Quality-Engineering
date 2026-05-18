import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Key } from 'lucide-react';

import api from '../services/api';

const ResetPassword: React.FC = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/auth/reset-password/`, {
                token: token,
                new_password: newPassword
            });
            setMessage('Tu contraseña ha sido actualizada con éxito.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al restablecer la contraseña. Verifica el código.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Nueva Contraseña</h1>
                <p>Ingresa el código que recibiste y tu nueva contraseña.</p>
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Key size={18} />
                        <input 
                            type="text" 
                            placeholder="Código de recuperación (Token)" 
                            value={token} 
                            onChange={(e) => setToken(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} />
                        <input 
                            type="password" 
                            placeholder="Nueva Contraseña" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
