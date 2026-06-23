import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key } from 'lucide-react';
import api from '../services/api';
import { useA11y } from '../context/A11yContext';

const ResetPassword: React.FC = () => {
    const [token, setToken] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
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
            await api.post(`/auth/reset-password/`, {
                token: token,
                new_password: newPassword
            });
            setMessage(t('auth.newPasswordTitle') + ': ' + t('auth.changing'));
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>{t('auth.newPasswordTitle')}</h1>
                <p>{t('auth.newPasswordSub')}</p>
                {message && <div className="success-message" role="alert" aria-live="polite">{message}</div>}
                {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="reset-token" className="sr-only">{t('auth.tokenPlaceholder')}</label>
                        <Key size={18} aria-hidden="true" />
                        <input 
                            id="reset-token"
                            type="text" 
                            placeholder={t('auth.tokenPlaceholder')} 
                            value={token} 
                            onChange={(e) => setToken(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="reset-newpassword" className="sr-only">{t('auth.newPasswordPlaceholder')}</label>
                        <Lock size={18} aria-hidden="true" />
                        <input 
                            id="reset-newpassword"
                            type="password" 
                            placeholder={t('auth.newPasswordPlaceholder')} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            aria-required="true"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t('auth.changing') : t('auth.changePasswordBtn')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
