import React from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Shield, LogOut, User as UserIcon, Eye, Type } from 'lucide-react';

const Navbar = ({ onLogout }: { onLogout: () => void }) => {
    const user = authApi.getCurrentUser();

    // Estados de accesibilidad persistentes en localStorage
    const [highContrast, setHighContrast] = React.useState(() => {
        return localStorage.getItem('a11y-high-contrast') === 'true';
    });
    const [fontSize, setFontSize] = React.useState(() => {
        return localStorage.getItem('a11y-font-size') || 'normal';
    });

    // Efecto para aplicar alto contraste al elemento raíz (html)
    React.useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.classList.add('a11y-high-contrast');
        } else {
            root.classList.remove('a11y-high-contrast');
        }
        localStorage.setItem('a11y-high-contrast', String(highContrast));
    }, [highContrast]);

    // Efecto para aplicar tamaño de letra al elemento raíz (html)
    React.useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('a11y-font-large', 'a11y-font-xlarge');
        if (fontSize === 'large') {
            root.classList.add('a11y-font-large');
        } else if (fontSize === 'xlarge') {
            root.classList.add('a11y-font-xlarge');
        }
        localStorage.setItem('a11y-font-size', fontSize);
    }, [fontSize]);

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
        <nav className="bg-white shadow-sm border-b border-slate-200" role="navigation" aria-label="Barra de navegación principal">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <Shield className="h-8 w-8 text-indigo-600" />
                                <span className="font-bold text-xl text-slate-900">MindGuard</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Controles de Accesibilidad */}
                        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                            <button
                                onClick={toggleHighContrast}
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                                title="Alternar Alto Contraste"
                                aria-label="Alternar modo de alto contraste para personas con baja visión"
                            >
                                <Eye className="h-5 w-5" />
                            </button>
                            <button
                                onClick={cycleFontSize}
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 font-bold text-xs"
                                title="Cambiar tamaño de texto"
                                aria-label="Cambiar tamaño de texto (Normal, Grande, Muy Grande)"
                            >
                                <Type className="h-5 w-5" />
                                <span className="uppercase text-[10px]" aria-hidden="true">
                                    {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                                </span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <UserIcon className="h-5 w-5" />
                            <span className="font-medium">{user?.rol === 'profesional' ? 'Dr/a. ' : ''}Usuario</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                {user?.rol || 'usuario'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            aria-label="Cerrar sesión de la cuenta"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;