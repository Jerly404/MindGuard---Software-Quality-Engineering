import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { User, Mail, Lock } from 'lucide-react';
import { useA11y } from '../context/A11yContext';

const Signup: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [nombre, setNombre] = React.useState('');
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const { t } = useA11y();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await authApi.signup({ email, password, nombre, rol: 'usuario' });
            
            // Login automático
            await authApi.login({ username: email, password: password });
            onSignup();
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>{t('auth.createAccount')}</h1>
                <p>{t('auth.join')}</p>
                {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label htmlFor="signup-name" className="sr-only">{t('auth.fullName')}</label>
                        <User size={18} aria-hidden="true" />
                        <input 
                            id="signup-name"
                            type="text" 
                            placeholder={t('auth.fullName')} 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-email" className="sr-only">{t('auth.email')}</label>
                        <Mail size={18} aria-hidden="true" />
                        <input 
                            id="signup-email"
                            type="email" 
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-password" className="sr-only">{t('auth.password')}</label>
                        <Lock size={18} aria-hidden="true" />
                        <input 
                            id="signup-password"
                            type="password" 
                            placeholder={t('auth.password')} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <button type="submit" className="btn-primary" aria-label={t('auth.registerBtn')}>{t('auth.registerBtn')}</button>
                </form>
                <div className="auth-footer">
                    {t('auth.haveAccount')}{' '}
                    <Link to="/login">{t('auth.loginHere')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
