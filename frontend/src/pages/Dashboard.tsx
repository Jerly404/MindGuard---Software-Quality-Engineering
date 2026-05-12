import React, { useState, useEffect } from 'react';
import { useAssessments } from '../hooks/useAssessments';
import BreathingExercise from '../components/BreathingExercise';
import { generateClinicalReport } from '../services/pdfService';
import api, { authApi, premiumApi } from '../services/api';
import { 
    Activity, Calendar, TrendingUp, Download, Wind, ShieldCheck, CreditCard, X, CheckCircle2, Clock, Star, Video, MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FloatingChatbot from '../components/FloatingChatbot';

const Dashboard: React.FC = () => {
    const { history, isLoading: loading } = useAssessments();
    const [showBreathing, setShowBreathing] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumData, setPremiumData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [appointments, setAppointments] = useState<any[]>([]);

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedPro, setSelectedPro] = useState<number | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'paypal' | 'yape' | 'prueba'>('tarjeta');

    const currentUser = authApi.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/premium/my-assignment');
                setPremiumData(res.data);
                
                const appRes = await premiumApi.getMyAppointments();
                setAppointments(appRes.data);
            } catch (e) {}
        };
        fetchData();
        
        if (showPremiumModal && professionals.length === 0) {
            premiumApi.getProfessionals().then(res => setProfessionals(res.data)).catch(console.error);
        }
    }, [showPremiumModal]);

    useEffect(() => {
        if (!premiumData?.fecha_expiracion) return;
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(premiumData.fecha_expiracion).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Expirado');
                clearInterval(timer);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${mins}m ${secs}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [premiumData]);

    const handlePayment = async () => {
        if (!selectedPro) return;
        setPaymentProcessing(true);
        const monto = paymentMethod === 'prueba' ? 0 : 49.99;
        try {
            await premiumApi.payAndAssign(selectedPro, monto, paymentMethod);
            setShowPremiumModal(false);
            window.location.reload();
        } catch (error) {
            alert("Error al procesar solicitud");
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleDownloadReport = () => {
        if (currentUser && history.length > 0) {
            generateClinicalReport(currentUser, history);
        }
    };

    const chartData = [...history].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((item: any) => ({
        fecha: new Date(item.fecha || item.fecha_evaluacion).toLocaleDateString(),
        Depresión: item.phq9Score || 0,
        Ansiedad: item.gad7Score || 0
    }));

    const lastAssessment = history.length > 0 ? history[history.length - 1] : null;

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Bienestar</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-1">
                            <Activity className="h-4 w-4" /> Tecnología Clínica: MindGuard AI Chatbot v2.0
                        </p>
                    </div>
                    <button onClick={handleDownloadReport} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <Download size={16} /> Exportar Historial
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Última Depresión</span>
                                <p className="text-3xl font-black text-slate-900 mt-1">{lastAssessment?.phq9Score ?? '-'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Última Ansiedad</span>
                                <p className="text-3xl font-black text-slate-900 mt-1">{lastAssessment?.gad7Score ?? '-'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</span>
                                <div className="mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        lastAssessment?.nivelRiesgo === 'Alto' ? 'bg-rose-100 text-rose-800' : 
                                        lastAssessment?.nivelRiesgo === 'Moderado' ? 'bg-amber-100 text-amber-800' : 
                                        'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {lastAssessment?.nivelRiesgo ?? 'Estable'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" style={{ minHeight: '350px' }}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-indigo-500" /> Evolución Temporal
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 27]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Depresión" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="Ansiedad" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Historial */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-500" /> Historial Reciente
                                </h3>
                                <span className="text-xs text-slate-400 font-medium">{history.length} registros</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PHQ-9</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GAD-7</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Riesgo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[...history].reverse().slice(0, 10).map((ev, idx) => (
                                            <tr key={ev.id || idx} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-slate-700">{new Date(ev.fecha).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center font-black text-indigo-600">{ev.phq9Score}</td>
                                                <td className="px-6 py-4 text-center font-black text-amber-600">{ev.gad7Score}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                        ev.nivelRiesgo === 'Alto' ? 'bg-rose-100 text-rose-800' : 
                                                        ev.nivelRiesgo === 'Moderado' ? 'bg-amber-100 text-amber-800' : 
                                                        'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {ev.nivelRiesgo}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        {/* Próximas Citas */}
                        {appointments.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm shadow-indigo-50">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Video size={18} /></div>
                                    <h3 className="font-bold text-slate-900">Teleconsulta Pendiente</h3>
                                </div>
                                {appointments.slice(0, 2).map(app => (
                                    <div key={app.id} className="space-y-3 mb-4 last:mb-0">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Con el Dr. {app.con}</p>
                                            <p className="text-sm font-black text-indigo-600 mb-2">{new Date(app.fecha).toLocaleString()}</p>
                                            {app.mensaje && (
                                                <div className="flex gap-2 p-2 bg-white rounded-xl border border-indigo-50 mb-3">
                                                    <MessageSquare size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-slate-600 italic">"{app.mensaje}"</p>
                                                </div>
                                            )}
                                            <a 
                                                href={app.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors"
                                            >
                                                Entrar a Reunión
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {premiumData ? (
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                                    <Star size={80} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Plan Prueba</span>
                                        <ShieldCheck size={16} />
                                    </div>
                                    <h3 className="text-xl font-black mb-1">Supervisión Activa</h3>
                                    <p className="text-indigo-100 text-xs mb-6 font-medium italic">Dr. {premiumData.profesional}</p>
                                    
                                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase mb-2 flex items-center gap-1">
                                            <Clock size={12}/> Tiempo Restante:
                                        </p>
                                        <p className="text-2xl font-mono font-black tracking-tighter text-white">
                                            {timeLeft}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                <ShieldCheck className="h-8 w-8 text-indigo-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2 tracking-tight">Acceso Premium</h3>
                                <p className="text-indigo-200 text-xs mb-6 leading-relaxed">
                                    Obtén una prueba gratuita de 2 días con supervisión de un profesional colegiado.
                                </p>
                                <button onClick={() => setShowPremiumModal(true)} className="w-full bg-white text-indigo-900 font-black py-3 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:scale-105 active:scale-95">
                                    Iniciar Prueba Gratis
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                            <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Wind size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900">Pausa de Calma</h3>
                            <p className="text-xs text-slate-500 mb-4">Ejercicio de respiración guiada de 2 minutos.</p>
                            <button onClick={() => setShowBreathing(true)} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-2xl hover:bg-slate-800 transition-colors">
                                Iniciar ahora
                            </button>
                        </div>
                    </aside>
                </div>
            </main>

            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
            <FloatingChatbot onResult={() => {}} />

            {showPremiumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900">Activar Premium</h3>
                                <button onClick={() => setShowPremiumModal(false)} className="bg-slate-100 p-2 rounded-full"><X size={20}/></button>
                            </div>
                            
                            <p className="text-sm text-slate-500 mb-6 font-medium">Selecciona el profesional:</p>
                            
                            <div className="space-y-3 mb-8 max-h-48 overflow-y-auto pr-2">
                                {professionals.map(pro => (
                                    <div 
                                        key={pro.id} 
                                        onClick={() => setSelectedPro(pro.id)}
                                        className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all
                                            ${selectedPro === pro.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200'}`}
                                    >
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {pro.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Dr. {pro.nombre}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button onClick={() => setPaymentMethod('tarjeta')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-1 ${paymentMethod === 'tarjeta' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}>
                                    <CreditCard size={20}/>
                                    <span className="text-[10px] font-bold">TARJETA</span>
                                </button>
                                <button onClick={() => setPaymentMethod('prueba')} className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-1 ${paymentMethod === 'prueba' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100'}`}>
                                    <CheckCircle2 size={20}/>
                                    <span className="text-[10px] font-bold">PRUEBA</span>
                                </button>
                            </div>

                            <button 
                                onClick={handlePayment}
                                disabled={!selectedPro || paymentProcessing}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
                            >
                                {paymentProcessing ? 'Procesando...' : 'Confirmar ahora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
