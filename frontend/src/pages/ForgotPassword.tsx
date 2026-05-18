import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
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
            await api.post(`/auth/password-recovery/${email}`);
            setMessage('Se ha enviado un correo con las instrucciones para recuperar tu contraseña.');
            setTimeout(() => navigate('/reset-password'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} /> Volver al login
                </Link>
                <h1>Recuperar Contraseña</h1>
                <p>Ingresa tu correo electrónico y te enviaremos un código de recuperación.</p>
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail size={18} />
                        <input 
                            type="email" 
                            placeholder="Correo Electrónico" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Correo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
