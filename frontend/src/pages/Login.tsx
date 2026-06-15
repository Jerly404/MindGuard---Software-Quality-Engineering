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
            await authApi.login({ username: email, password: password });
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
                        <label htmlFor="login-email" className="sr-only">Correo Electrónico</label>
                        <Mail size={18} aria-hidden="true" />
                        <input 
                            id="login-email"
                            type="email" 
                            placeholder="Correo Electrónico" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-password" className="sr-only">Contraseña</label>
                        <Lock size={18} aria-hidden="true" />
                        <input 
                            id="login-password"
                            type="password" 
                            placeholder="Contraseña" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="forgot-password-link">
                        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                    </div>
                    <button type="submit" className="btn-primary" aria-label="Iniciar sesión en la aplicación">Iniciar Sesión</button>
                </form>
                <div className="auth-footer">
                    ¿No tienes una cuenta? <Link to="/signup">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
