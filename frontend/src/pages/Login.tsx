import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authApi.login({ username: email, password: password });
            localStorage.setItem('token', response.data.access_token);
            onLogin();
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Bienvenido</h1>
                <p>Inicia sesión en MindGuard IA</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <Mail size={18} />
                        <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <Lock size={18} />
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="forgot-password-link">
                        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                    </div>
                    <button type="submit" className="btn-primary">Iniciar Sesión</button>
                </form>
                <div className="auth-footer">
                    ¿No tienes una cuenta? <Link to="/signup">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
