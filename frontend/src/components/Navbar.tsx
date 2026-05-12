import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = ({ onLogout }: { onLogout: () => void }) => {
    const navigate = useNavigate();
    const user = authApi.getCurrentUser();

    const handleLogout = () => {
        localStorage.removeItem('token');
        // Limpiar toda la memoria local y forzar recarga para resetear React Query
        onLogout();
        window.location.href = '/login'; 
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
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
                        <div className="flex items-center gap-2 text-slate-600">
                            <UserIcon className="h-5 w-5" />
                            <span className="font-medium">{user?.rol === 'profesional' ? 'Dr/a. ' : ''}Usuario</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                {user?.rol}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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