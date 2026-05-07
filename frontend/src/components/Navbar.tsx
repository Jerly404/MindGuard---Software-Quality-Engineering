import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, Shield, User } from 'lucide-react';
import { authApi } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = authApi.getCurrentUser();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isAdmin = user?.rol === 'administrador';

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">MindGuard IA</Link>
                {user?.rol && <span className="role-badge-nav">{user.rol}</span>}
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link"><Home size={18} /> Panel Principal</Link>
                {!isAdmin && (
                    <Link to="/assessment" className="nav-link"><FileText size={18} /> Nueva Evaluación</Link>
                )}
                {isAdmin && (
                    <Link to="/" className="nav-link"><Shield size={18} /> Administración</Link>
                )}
                <div className="user-profile-nav">
                    <User size={18} />
                    <span>{user?.sub || 'Usuario'}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout"><LogOut size={18} /> Cerrar Sesión</button>
            </div>
        </nav>
    );
};

export default Navbar;
