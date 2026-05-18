import React, { useState, useEffect } from 'react';
import { 
    Shield, Server, Database, Activity, Users, UserPlus, Bell, 
    TrendingUp, TrendingDown, Minus, Trash2, Edit, CheckCircle, 
    XCircle, Info, MessageSquare, AlertTriangle, Lock
} from 'lucide-react';
import { authApi } from '../services/api';

const AdminDashboard: React.FC = () => {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'usuarios' | 'profesionales' | 'alertas'>('usuarios');
    const [isAddingPsychologist, setIsAddingPsychologist] = useState(false);
    
    // Form states
    const [newPro, setNewPro] = useState({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const response = await authApi.getUsers();
            setAllUsers(response.data);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleDeleteUser = async (id: number, name: string) => {
        if (window.confirm(`¿Está seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) {
            try {
                await authApi.deleteUser(id);
                setAllUsers(allUsers.filter(u => u.id !== id));
                alert("Usuario eliminado correctamente.");
            } catch (error: any) {
                alert(error.response?.data?.detail || "Error al eliminar usuario");
            }
        }
    };

    const handleAddProfessional = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authApi.createProfessional({
                nombre: newPro.nombre,
                email: newPro.email,
                password: newPro.password,
                rol: "profesional",
                colegiatura: newPro.colegiatura,
                especialidad: newPro.especialidad
            });
            
            await loadData();
            setIsAddingPsychologist(false);
            setNewPro({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
            alert("Profesional registrado exitosamente.");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Error al registrar profesional");
        } finally {
            setSubmitting(false);
        }
    };

    // Filtros por rol para las tablas
    const regularUsers = allUsers.filter(u => u.rol !== 'profesional' && u.rol !== 'admin');
    const professionalUsers = allUsers.filter(u => u.rol === 'profesional');

    return (
        <div className="container admin-dashboard animate-fade-in">
            <header className="dashboard-top">
                <div className="welcome-text">
                    <h1>Administración del Ecosistema</h1>
                    <p>Estado del Servidor: <strong>Operativo</strong> | Usuarios en BD: <strong>{allUsers.length}</strong></p>
                </div>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>Usuarios</button>
                    <button className={`tab-btn ${activeTab === 'profesionales' ? 'active' : ''}`} onClick={() => setActiveTab('profesionales')}>Profesionales</button>
                </div>
            </header>

            <div className="stats-summary-grid">
                <div className="stat-card">
                    <span className="stat-label">Pacientes</span>
                    <div className="stat-value-row">
                        <span className="stat-value">{regularUsers.length}</span>
                        <Users size={24} className="text-info" />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Profesionales</span>
                    <div className="stat-value-row">
                        <span className="stat-value">{professionalUsers.length}</span>
                        <Shield size={24} className="text-success" />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Estado Global</span>
                    <div className="stat-value-row">
                        <span className="stat-value">Estable</span>
                        <Activity size={24} className="text-success" />
                    </div>
                </div>
            </div>

            <div className="admin-main-grid-v2">
                <div className="card-professional main-admin-card">
                    
                    {loadingData ? (
                        <div className="loading-state">Cargando base de datos...</div>
                    ) : (
                        <>
                            {activeTab === 'usuarios' && (
                                <>
                                    <div className="section-header">
                                        <h3>Pacientes Registrados</h3>
                                        <p className="subtitle">Listado de usuarios que utilizan el chatbot.</p>
                                    </div>
                                    <table className="admin-table-v2">
                                        <thead>
                                            <tr>
                                                <th>Usuario</th>
                                                <th>ID</th>
                                                <th>Rol</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regularUsers.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-info-v2">
                                                            <div className="avatar-admin">{u.nombre?.[0] || 'U'}</div>
                                                            <div>
                                                                <div className="name">{u.nombre || 'Sin nombre'}</div>
                                                                <div className="email">{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><code>#{u.id}</code></td>
                                                    <td><span className="risk-tag risk-bajo">{u.rol}</span></td>
                                                    <td>
                                                        <button 
                                                            className="btn-icon text-error" 
                                                            onClick={() => handleDeleteUser(u.id, u.nombre)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {activeTab === 'profesionales' && (
                                <>
                                    <div className="section-header-flex">
                                        <div>
                                            <h3>Directorio de Profesionales</h3>
                                            <p className="subtitle">Psicólogos con acceso a funciones de supervisión.</p>
                                        </div>
                                        <button className="btn-primary btn-sm" onClick={() => setIsAddingPsychologist(true)}>
                                            <UserPlus size={16} /> Agregar Psicólogo
                                        </button>
                                    </div>
                                    <table className="admin-table-v2">
                                        <thead>
                                            <tr>
                                                <th>Profesional</th>
                                                <th>Especialidad</th>
                                                <th>Colegiatura</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {professionalUsers.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div className="user-info-v2">
                                                            <div className="avatar-prof">{p.nombre?.[0] || 'P'}</div>
                                                            <div>
                                                                <div className="name">{p.nombre}</div>
                                                                <div className="email">{p.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{p.especialidad || 'General'}</td>
                                                    <td>{p.colegiatura || 'N/A'}</td>
                                                    <td>
                                                        <button 
                                                            className="btn-icon text-error" 
                                                            onClick={() => handleDeleteUser(p.id, p.nombre)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isAddingPsychologist && (
                <div className="modal-overlay">
                    <div className="modal-content card-professional animate-slide-up">
                        <div className="modal-header">
                            <h3>Registrar Profesional de Salud</h3>
                            <button className="btn-close" onClick={() => setIsAddingPsychologist(false)}><XCircle /></button>
                        </div>
                        <form className="admin-form-v2" onSubmit={handleAddProfessional}>
                            <div className="input-field">
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Dr. Juan Pérez" 
                                    value={newPro.nombre}
                                    onChange={(e) => setNewPro({...newPro, nombre: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="input-field">
                                <label>Correo Institucional</label>
                                <input 
                                    type="email" 
                                    placeholder="email@mindguard.ai" 
                                    value={newPro.email}
                                    onChange={(e) => setNewPro({...newPro, email: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="input-field">
                                <label>Contraseña Temporal</label>
                                <input 
                                    type="password" 
                                    placeholder="********" 
                                    value={newPro.password}
                                    onChange={(e) => setNewPro({...newPro, password: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="input-field">
                                <label>Número de Colegiatura</label>
                                <input 
                                    type="text" 
                                    placeholder="CPPe XXXXX" 
                                    value={newPro.colegiatura}
                                    onChange={(e) => setNewPro({...newPro, colegiatura: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsAddingPsychologist(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Registrando...' : 'Vincular al Sistema'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
