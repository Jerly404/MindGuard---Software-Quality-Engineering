import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { User, Mail, Lock } from 'lucide-react';

const Signup: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [nombre, setNombre] = React.useState('');
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await authApi.signup({ email, password, nombre, rol: 'usuario' });
            
            // Login automático corregido
            const response = await authApi.login({ username: email, password: password });
            
            localStorage.setItem('token', response.data.access_token);
            onSignup();
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Crear Cuenta</h1>
                <p>Únete a MindGuard IA</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <User size={18} />
                        <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <Mail size={18} />
                        <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <Lock size={18} />
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary">Registrarse</button>
                </form>
                <div className="auth-footer">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
