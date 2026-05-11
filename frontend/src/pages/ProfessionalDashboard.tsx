import React, { useEffect, useState } from 'react';
import { 
    Users, FileText, Activity, Search, AlertCircle, 
    CheckCircle2, Clock, Filter, ArrowUpRight, ChevronRight,
    Wallet, TrendingUp, X
} from 'lucide-react';
import { premiumApi } from '../services/api';

const ProfessionalDashboard = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'todos' | 'riesgo-alto' | 'estable'>('todos');
    
    // Wallet & History States
    const [earnings, setEarnings] = useState({ total_acumulado: 0, moneda: 'PEN' });
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = patients;
        if (searchTerm) {
            result = result.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filter === 'riesgo-alto') {
            result = result.filter(p => p.ultima_evaluacion_riesgo === 'Grave' || p.ultima_evaluacion_riesgo === 'Moderadamente Grave');
        } else if (filter === 'estable') {
            result = result.filter(p => p.ultima_evaluacion_riesgo === 'Mínimo' || p.ultima_evaluacion_riesgo === 'Leve');
        }
        setFilteredPatients(result);
    }, [searchTerm, filter, patients]);

    const fetchData = async () => {
        try {
            const [patientsRes, earningsRes] = await Promise.all([
                premiumApi.getAssignedPatients(),
                premiumApi.getEarnings()
            ]);
            setPatients(patientsRes.data);
            setFilteredPatients(patientsRes.data);
            setEarnings(earningsRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async (patient: any) => {
        setSelectedPatient(patient);
        setLoadingHistory(true);
        try {
            const response = await premiumApi.getPatientHistory(patient.id);
            setPatientHistory(response.data);
        } catch (error) {
            alert("No se pudo cargar el historial del paciente.");
        } finally {
            setLoadingHistory(false);
        }
    };

    const getRiskColor = (risk: string) => {
        const r = risk?.toLowerCase() || '';
        if (r.includes('grave')) return 'text-red-600 bg-red-50 border-red-100';
        if (r.includes('moderado')) return 'text-orange-600 bg-orange-50 border-orange-100';
        if (r.includes('leve')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (r.includes('mínimo')) return 'text-green-600 bg-green-50 border-green-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    const highRiskCount = patients.filter(p => p.ultima_evaluacion_riesgo === 'Grave' || p.ultima_evaluacion_riesgo === 'Moderadamente Grave').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Panel Clínico</h1>
                    <p className="mt-2 text-lg text-slate-600">Supervisión y gestión de ingresos.</p>
                </div>
                <div className="flex items-center gap-3 bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-indigo-100 uppercase tracking-widest">Mi Billetera</span>
                        <span className="text-2xl font-black">{earnings.moneda} {earnings.total_acumulado.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
                    </div>
                    <span className="text-slate-500 font-medium">Pacientes</span>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{patients.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><AlertCircle size={24} /></div>
                    </div>
                    <span className="text-slate-500 font-medium">Prioridad</span>
                    <h3 className="text-3xl font-bold text-red-600 mt-1">{highRiskCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24} /></div>
                    </div>
                    <span className="text-slate-500 font-medium">Tasa de Estabilidad</span>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                        {patients.length > 0 ? (((patients.length - highRiskCount) / patients.length) * 100).toFixed(0) : 0}%
                    </h3>
                </div>
            </div>

            {/* ToolBar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar paciente..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl">
                    {['todos', 'riesgo-alto', 'estable'].map((f) => (
                        <button 
                            key={f}
                            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                            onClick={() => setFilter(f as any)}
                        >
                            {f.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Patients Grid */}
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-200 transition-all shadow-sm group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {patient.nombre.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900">{patient.nombre}</h4>
                                        <p className="text-sm text-slate-500">{patient.email}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold ${getRiskColor(patient.ultima_evaluacion_riesgo)}`}>
                                    {patient.ultima_evaluacion_riesgo}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PHQ-9</span>
                                    <div className="text-2xl font-black">{patient.ultimo_phq9 ?? '--'}</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GAD-7</span>
                                    <div className="text-2xl font-black">{patient.ultimo_gad7 ?? '--'}</div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleViewHistory(patient)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-colors"
                            >
                                <FileText size={18} />
                                VER HISTORIAL COMPLETO
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* History Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Historial Clínico</h2>
                                <p className="text-slate-500 font-medium">{selectedPatient.nombre} • {selectedPatient.email}</p>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            {loadingHistory ? (
                                <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>
                            ) : patientHistory.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">No hay evaluaciones registradas.</div>
                            ) : (
                                <div className="space-y-6">
                                    {patientHistory.map((evalu) => (
                                        <div key={evalu.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={20} /></div>
                                                    <span className="font-bold text-slate-900">{new Date(evalu.fecha).toLocaleString()}</span>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-xl border text-sm font-bold ${getRiskColor(evalu.nivelRiesgo)}`}>
                                                    {evalu.nivelRiesgo}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-slate-50 p-3 rounded-xl">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">PHQ-9</span>
                                                    <div className="text-lg font-bold">{evalu.phq9Score}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">GAD-7</span>
                                                    <div className="text-lg font-bold">{evalu.gad7Score}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Análisis IA</span>
                                                    <div className="text-sm font-medium line-clamp-1">{evalu.resultadoIA}</div>
                                                </div>
                                            </div>
                                            {evalu.text_input && (
                                                <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 italic text-slate-700 text-sm">
                                                    "{evalu.text_input}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                            <button onClick={() => setSelectedPatient(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
                                Cerrar Historial
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;
