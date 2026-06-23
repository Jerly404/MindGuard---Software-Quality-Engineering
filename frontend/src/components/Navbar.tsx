import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Shield, LogOut, User as UserIcon, Eye, Type, Globe } from 'lucide-react';
import { useA11y } from '../context/A11yContext';

const Navbar = ({ onLogout }: { onLogout: () => void }) => {
    const user = authApi.getCurrentUser();
    const { locale, setLocale, highContrast, setHighContrast, fontSize, setFontSize, t } = useA11y();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error("Logout failed on server, cleaning client state anyway", e);
            localStorage.removeItem('user');
        }
        onLogout();
        window.location.href = '/login'; 
    };

    const toggleHighContrast = () => setHighContrast(!highContrast);

    const cycleFontSize = () => {
        if (fontSize === 'normal') setFontSize('large');
        else if (fontSize === 'large') setFontSize('xlarge');
        else setFontSize('normal');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200" role="navigation" aria-label={t('nav.title')}>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center gap-2" aria-label={`${t('nav.title')} - ${t('nav.user')}`}>
                                <Shield className="h-8 w-8 text-indigo-600" />
                                <span className="font-bold text-xl text-slate-900">{t('nav.title')}</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Controles de Accesibilidad */}
                        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                            {/* Selector de Idioma */}
                            <div className="flex items-center gap-1.5 mr-2">
                                <Globe className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                <label htmlFor="nav-lang-select" className="sr-only">
                                    {t('nav.langSelect')}
                                </label>
                                <select
                                    id="nav-lang-select"
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value as any)}
                                    className="text-xs bg-slate-50 border border-slate-200 rounded-md p-1.5 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 outline-none"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="es-simple">Español (Lectura Fácil)</option>
                                    <option value="en-simple">English (Easy Read)</option>
                                </select>
                            </div>

                            <button
                                onClick={toggleHighContrast}
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                                title={t('nav.highContrast')}
                                aria-label={t('nav.highContrast')}
                            >
                                <Eye className="h-5 w-5" />
                            </button>
                            <button
                                onClick={cycleFontSize}
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 font-bold text-xs"
                                title={t('nav.fontSize')}
                                aria-label={t('nav.fontSize')}
                            >
                                <Type className="h-5 w-5" />
                                <span className="uppercase text-[10px]" aria-hidden="true">
                                    {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                                </span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <UserIcon className="h-5 w-5" />
                            <span className="font-medium">
                                {user?.rol === 'profesional' ? t('nav.professional') : ''}
                                {user?.nombre || t('nav.user')}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                {user?.rol === 'admin' || user?.rol === 'administrador'
                                    ? t('role.admin')
                                    : user?.rol === 'profesional'
                                    ? t('role.professional')
                                    : t('role.user')}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            aria-label={t('nav.logout')}
                        >
                            <LogOut className="h-4 w-4" />
                            {t('nav.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;