import React, { useState, useEffect } from 'react';
import { 
    Shield, Activity, Users, UserPlus, Trash2, 
    CheckCircle, XCircle, Mail, Briefcase, 
    Hash, User as UserIcon, AlertCircle, RefreshCw
} from 'lucide-react';
import { authApi } from '../services/api';

const AdminDashboard: React.FC = () => {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pacientes' | 'profesionales' | 'todos'>('pacientes');
    const [isAddingPro, setIsAddingPro] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Formulario para nuevo profesional
    const [newPro, setNewPro] = useState({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await authApi.getUsers();
            console.log("Usuarios cargados:", response.data);
            setAllUsers(response.data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar a "${name}"?\nEsta acción borrará todos sus datos permanentemente.`)) {
            try {
                await authApi.deleteUser(id);
                setAllUsers(prev => prev.filter(u => u.id !== id));
            } catch (error: any) {
                alert(error.response?.data?.detail || "Error al eliminar");
            }
        }
    };

    const handleAddPro = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authApi.createProfessional(newPro);
            await loadData();
            setIsAddingPro(false);
            setNewPro({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
        } catch (error: any) {
            alert(error.response?.data?.detail || "Error al registrar profesional");
        } finally {
            setSubmitting(false);
        }
    };

    // Lógica de filtrado inteligente (insensible a mayúsculas y tipos de rol)
    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const role = u.rol?.toLowerCase() || '';
        if (activeTab === 'pacientes') return matchesSearch && !['profesional', 'admin', 'administrador'].includes(role);
        if (activeTab === 'profesionales') return matchesSearch && role === 'profesional';
        return matchesSearch;
    });

    const stats = {
        total: allUsers.length,
        pacientes: allUsers.filter(u => !['profesional', 'admin', 'administrador'].includes(u.rol?.toLowerCase())).length,
        profesionales: allUsers.filter(u => u.rol?.toLowerCase() === 'profesional').length
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            {/* Header Moderno */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Shield className="text-indigo-600" /> Panel de Control Maestro
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gestión centralizada de la red MindGuard IA</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={loadData}
                        className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => setIsAddingPro(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                        <UserPlus size={18} /> Nuevo Profesional
                    </button>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-500">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Usuarios</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black text-slate-800">{stats.total}</h2>
                        <Users className="text-indigo-200" size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pacientes Activos</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black text-slate-800">{stats.pacientes}</h2>
                        <Activity className="text-emerald-200" size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Cuerpo Médico</p>
                    <div className="flex justify-between items-end">
                        <h2 className="text-4xl font-black text-slate-800">{stats.profesionales}</h2>
                        <Shield className="text-amber-200" size={32} />
                    </div>
                </div>
            </div>

            {/* Filtros y Buscador */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('pacientes')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'pacientes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pacientes
                    </button>
                    <button 
                        onClick={() => setActiveTab('profesionales')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'profesionales' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Profesionales
                    </button>
                    <button 
                        onClick={() => setActiveTab('todos')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todos
                    </button>
                </div>
                <div className="relative w-full flex-1">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Users className="absolute left-4 top-3.5 text-slate-400" size={18} />
                </div>
            </div>

            {/* Listado de Usuarios Estilizado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <RefreshCw className="animate-spin mx-auto text-indigo-500 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">Sincronizando con la red neuronal...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
                                    user.rol?.toLowerCase() === 'profesional' ? 'bg-amber-100 text-amber-600' : 
                                    user.rol?.toLowerCase().includes('admin') ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                    {user.nombre?.[0] || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">{user.nombre}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                            user.rol?.toLowerCase() === 'profesional' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {user.rol || 'paciente'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <p className="text-slate-500 text-xs flex items-center gap-1.5"><Mail size={12} /> {user.email}</p>
                                        {user.rol?.toLowerCase() === 'profesional' && (
                                            <p className="text-indigo-500 text-[10px] font-bold flex items-center gap-1.5 uppercase">
                                                <Briefcase size={12} /> {user.especialidad || 'Psicología General'} • {user.colegiatura || 'Sin registro'}
                                            </p>
                                        )}
                                        <p className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-1"><Hash size={12} /> ID Interno: #{user.id}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleDelete(user.id, user.nombre)}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    title="Eliminar usuario permanentemente"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500">No se encontraron registros que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Modal para Agregar Profesional */}
            {isAddingPro && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <h2 className="text-2xl font-black">Registrar Profesional</h2>
                            <p className="text-indigo-100 text-sm mt-1">Vincula un nuevo especialista a la plataforma MindGuard.</p>
                            <button onClick={() => setIsAddingPro(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><XCircle size={28}/></button>
                        </div>
                        <form onSubmit={handleAddPro} className="p-8 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Dr. Alberto García"
                                        value={newPro.nombre}
                                        onChange={(e) => setNewPro({...newPro, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Institucional</label>
                                    <input 
                                        type="email" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="alberto@mindguard.ai"
                                        value={newPro.email}
                                        onChange={(e) => setNewPro({...newPro, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña de Acceso</label>
                                <input 
                                    type="password" required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                    value={newPro.password}
                                    onChange={(e) => setNewPro({...newPro, password: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Colegiatura (CPPe)</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="12345"
                                        value={newPro.colegiatura}
                                        onChange={(e) => setNewPro({...newPro, colegiatura: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Especialidad</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                        value={newPro.especialidad}
                                        onChange={(e) => setNewPro({...newPro, especialidad: e.target.value})}
                                    >
                                        <option>Psicología Clínica</option>
                                        <option>Psicoterapia TCC</option>
                                        <option>Neuropsicología</option>
                                        <option>Psiquiatría General</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'VINCULANDO...' : 'REGISTRAR EN LA RED'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
