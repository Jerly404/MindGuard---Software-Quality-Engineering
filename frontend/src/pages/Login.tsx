import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Mail, Lock } from 'lucide-react';
import { useA11y } from '../context/A11yContext';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const { t } = useA11y();

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
                <h1>{t('auth.welcome')}</h1>
                <p>{t('auth.loginSub')}</p>
                {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="login-email" className="sr-only">{t('auth.email')}</label>
                        <Mail size={18} aria-hidden="true" />
                        <input 
                            id="login-email"
                            type="email" 
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-password" className="sr-only">{t('auth.password')}</label>
                        <Lock size={18} aria-hidden="true" />
                        <input 
                            id="login-password"
                            type="password" 
                            placeholder={t('auth.password')} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="forgot-password-link">
                        <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                    </div>
                    <button type="submit" className="btn-primary" aria-label={t('auth.loginBtn')}>{t('auth.loginBtn')}</button>
                </form>
                <div className="auth-footer">
                    {t('auth.noAccount')}{' '}
                    <Link to="/signup">{t('auth.registerHere')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
