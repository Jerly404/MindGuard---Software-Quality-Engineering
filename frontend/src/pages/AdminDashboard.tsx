import React from 'react';
import { 
    Shield, Activity, Users, UserPlus, Trash2, 
    Mail, RefreshCw, 
    Search, XCircle
} from 'lucide-react';
import { authApi } from '../services/api';

const AdminDashboard: React.FC = () => {
    const [allUsers, setAllUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'pacientes' | 'profesionales' | 'todos'>('pacientes');
    const [isAddingPro, setIsAddingPro] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    // Formulario para nuevo profesional
    const [newPro, setNewPro] = React.useState({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
    const [submitting, setSubmitting] = React.useState(false);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await authApi.getUsers();
            console.log("DATOS RECIBIDOS DEL BACKEND:", response.data);
            setAllUsers(response.data);
        } catch (error) {
            console.error("ERROR CARGANDO USUARIOS:", error);
            alert("Error al conectar con el servidor. Verifica tu conexión.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDelete = async (id: number, name: string) => {
        const confirm = window.confirm(`❗ ELIMINACIÓN PERMANENTE\n\n¿Seguro que quieres borrar a ${name}?\nTodos sus datos, historial y citas se perderán.`);
        if (confirm) {
            try {
                await authApi.deleteUser(id);
                setAllUsers(prev => prev.filter(u => u.id !== id));
            } catch (error: any) {
                alert("No se pudo eliminar al usuario: " + (error.response?.data?.detail || "Error desconocido"));
            }
        }
    };

    const handleAddPro = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authApi.createProfessional(newPro);
            await loadData(); // Recargar lista
            setIsAddingPro(false);
            setNewPro({ nombre: '', email: '', password: '', colegiatura: '', especialidad: 'Psicología Clínica' });
            alert("✅ Profesional registrado con éxito.");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Error al registrar profesional");
        } finally {
            setSubmitting(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Filtrado robusto
    const filteredUsers = allUsers.filter(u => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatches = u.nombre?.toLowerCase().includes(searchLower);
        const emailMatches = u.email?.toLowerCase().includes(searchLower);
        const matchesSearch = nameMatches || emailMatches;
        
        const role = (u.rol || 'usuario').toLowerCase();
        if (activeTab === 'pacientes') return matchesSearch && (role === 'usuario' || role === 'paciente');
        if (activeTab === 'profesionales') return matchesSearch && role === 'profesional';
        return matchesSearch;
    });

    const stats = {
        total: allUsers.length,
        pacientes: allUsers.filter(u => ['usuario', 'paciente'].includes((u.rol || '').toLowerCase())).length,
        profesionales: allUsers.filter(u => u.rol?.toLowerCase() === 'profesional').length
    };

    return (
        <div className="container-fluid p-6 bg-slate-50 min-h-screen">
            {/* Header Principal */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={36} /> 
                            Centro de Mando MindGuard
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Supervisión en tiempo real de usuarios y personal clínico</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={() => setIsAddingPro(true)}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                            <UserPlus size={20} /> Registrar Especialista
                        </button>
                    </div>
                </div>

                {/* Grid de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Población Total</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">{stats.total}</span>
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Users size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Pacientes Registrados</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">{stats.pacientes}</span>
                            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Activity size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Especialistas</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">{stats.profesionales}</span>
                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Shield size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Estado Servidor</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-black text-emerald-600">ONLINE</span>
                            <div className="h-4 w-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto">
                        <button 
                            onClick={() => setActiveTab('pacientes')}
                            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'pacientes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            PACIENTES
                        </button>
                        <button 
                            onClick={() => setActiveTab('profesionales')}
                            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'profesionales' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            PSICÓLOGOS
                        </button>
                        <button 
                            onClick={() => setActiveTab('todos')}
                            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'todos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            TODOS
                        </button>
                    </div>
                    
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o correo electrónico..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Listado de Entidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-24 text-center">
                            <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
                            <p className="text-slate-500 font-bold">Sincronizando registros clínicos...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full opacity-5 ${
                                    user.rol?.toLowerCase() === 'profesional' ? 'bg-amber-500' : 'bg-indigo-500'
                                }`}></div>
                                
                                <div className="flex items-start gap-5">
                                    <div className={`h-16 w-16 min-w-[64px] rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${
                                        user.rol?.toLowerCase() === 'profesional' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                        {user.nombre?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-lg truncate max-w-[150px]">{user.nombre}</h3>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                                user.rol?.toLowerCase() === 'profesional' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                                            }`}>
                                                {user.rol}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-3 flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" /> {user.email}
                                        </p>
                                        
                                        {user.rol?.toLowerCase() === 'profesional' && (
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Especialidad</p>
                                                <p className="text-xs font-bold text-slate-700">{user.especialidad || 'Psicoterapeuta'}</p>
                                                <p className="text-[10px] text-indigo-600 font-medium mt-1">Col. {user.colegiatura || '98765-P'}</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: DB_ENTRY_{user.id}</span>
                                            <button 
                                                onClick={() => handleDelete(user.id, user.nombre)}
                                                className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                            <div className="bg-slate-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Search size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">No se encontraron resultados</h3>
                            <p className="text-slate-500 mt-2">Prueba ajustando los filtros o el término de búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Registro de Especialista */}
            {isAddingPro && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
                        <div className="bg-indigo-600 p-10 text-white relative">
                            <h2 className="text-3xl font-black">Vincular Profesional</h2>
                            <p className="text-indigo-100 mt-2">Agrega un nuevo especialista a la red médica de MindGuard.</p>
                            <button onClick={() => setIsAddingPro(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all">
                                <XCircle size={32} />
                            </button>
                        </div>
                        <form onSubmit={handleAddPro} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" required placeholder="Dr. Julian Casablancas"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                                        value={newPro.nombre}
                                        onChange={(e) => setNewPro({...newPro, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Email Institucional</label>
                                    <input 
                                        type="email" required placeholder="julian@mindguard.ai"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                                        value={newPro.email}
                                        onChange={(e) => setNewPro({...newPro, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase ml-1">Contraseña Temporal</label>
                                <input 
                                    type="password" required placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                                    value={newPro.password}
                                    onChange={(e) => setNewPro({...newPro, password: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Colegiatura (CPPe)</label>
                                    <input 
                                        type="text" required placeholder="123456"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                                        value={newPro.colegiatura}
                                        onChange={(e) => setNewPro({...newPro, colegiatura: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Especialidad</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm appearance-none"
                                        value={newPro.especialidad}
                                        onChange={(e) => setNewPro({...newPro, especialidad: e.target.value})}
                                    >
                                        <option>Psicología Clínica</option>
                                        <option>Psicoterapia Cognitiva</option>
                                        <option>Terapia de Pareja</option>
                                        <option>Neuropsicología</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'PROCESANDO REGISTRO...' : 'CREAR CUENTA PROFESIONAL'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
