import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft } from 'lucide-react';
import { useA11y } from '../context/A11yContext';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const { t } = useA11y();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/auth/password-recovery/${email}`);
            setMessage(t('auth.recoverTitle') + ': ' + t('auth.sending'));
            setTimeout(() => navigate('/reset-password'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/login" className="back-link" aria-label={t('auth.backToLogin')}>
                    <ArrowLeft size={16} aria-hidden="true" /> {t('auth.backToLogin')}
                </Link>
                <h1>{t('auth.recoverTitle')}</h1>
                <p>{t('auth.recoverSub')}</p>
                {message && <div className="success-message" role="alert" aria-live="polite">{message}</div>}
                {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="recovery-email" className="sr-only">{t('auth.email')}</label>
                        <Mail size={18} aria-hidden="true" />
                        <input 
                            id="recovery-email"
                            type="email" 
                            placeholder={t('auth.email')} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t('auth.sending') : t('auth.sendEmail')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
