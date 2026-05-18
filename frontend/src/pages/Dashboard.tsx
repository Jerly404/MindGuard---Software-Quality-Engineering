import React, { useState, useEffect } from 'react';
import { 
    Activity, History, Shield, Brain, Calendar, 
    ArrowRight, Star, Heart, FileText, CheckCircle, 
    Zap, Sparkles, MessageSquare, ExternalLink, RefreshCw,
    X, DollarSign, Wallet
} from 'lucide-react';
import api, { assessmentApi, premiumApi } from '../services/api';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import yapeQR from '../assets/yape-qr.png';

const Dashboard: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<any>(null);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPro, setSelectedPro] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'yape' | 'paypal' | null>(null);
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        
        // Reloj para apertura automática de citas
        const timer = setInterval(checkAutoOpenLink, 30000); // Cada 30 seg
        return () => clearInterval(timer);
    }, [appointments]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [histRes, asigRes, proRes, appoRes] = await Promise.all([
                assessmentApi.getHistory(),
                api.get('/premium/my-assignment'),
                premiumApi.getProfessionals(),
                premiumApi.getMyAppointments()
            ]);
            setHistory(histRes.data);
            setAssignment(asigRes.data);
            setProfessionals(proRes.data);
            setAppointments(appoRes.data);
        } catch (e) {
            console.error("Dashboard Load Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const checkAutoOpenLink = () => {
        const now = new Date();
        appointments.forEach(app => {
            const appDate = new Date(app.fecha);
            // Si la cita es hoy, ahora, y no han pasado más de 5 minutos
            const diff = (appDate.getTime() - now.getTime()) / 60000;
            
            if (diff <= 0 && diff > -5 && app.estado === 'programada') {
                console.log("¡Hora de la cita! Abriendo videoconferencia...");
                window.open(app.link, '_blank');
                // Opcional: Marcar localmente como abierta para que no se abra mil veces
                app.estado = 'en_curso';
            }
        });
    };

    const handleYapePayment = async () => {
        try {
            const res = await premiumApi.payAndAssign(selectedPro.id, 20, 'yape');
            alert(res.data.mensaje);
            setIsPaymentModalOpen(false);
            loadData();
        } catch (e) {
            alert("Error al procesar el pago");
        }
    };

    const lastEval = history[history.length - 1];

    return (
        <div className="container-fluid min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            Panel de Bienestar <Zap className="text-amber-500" fill="currentColor" size={24} />
                        </h1>
                        <p className="text-slate-500 font-medium">Tecnología Clínica: MindGuard AI Chatbot v2.0</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <FileText size={18} /> Exportar Historial
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sección Principal */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Indicadores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Brain size={80} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Última Depresión</p>
                                <div className="flex items-end gap-2">
                                    <h2 className="text-5xl font-black">{lastEval?.phq9Score || '-'}</h2>
                                    <span className="text-slate-500 mb-2 font-bold">/ 27</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Última Ansiedad</p>
                                <div className="flex items-end gap-2">
                                    <h2 className="text-5xl font-black text-slate-800">{lastEval?.gad7Score || '-'}</h2>
                                    <span className="text-slate-300 mb-2 font-bold">/ 21</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Estado</p>
                                <div className="flex flex-col gap-2">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase w-fit ${
                                        lastEval?.nivelRiesgo === 'Alto' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {lastEval?.nivelRiesgo || 'Estable'}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-medium leading-tight">Analizado por Motor IA v2.1</p>
                                </div>
                            </div>
                        </div>

                        {/* Evolución Temporal */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Activity className="text-indigo-600" /> Evolución Temporal
                                </h3>
                            </div>
                            <div className="h-48 flex items-end gap-1 border-b border-slate-100 pb-2 relative">
                                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 text-4xl font-black tracking-widest uppercase">Analítica Activa</p>
                            </div>
                        </div>

                        {/* Historial */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                                <History className="text-indigo-600" /> Historial Reciente
                            </h3>
                            <div className="space-y-4">
                                {history.map((ev, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{new Date(ev.fecha).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{ev.resultadoIA}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase">P: {ev.phq9Score}</span>
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase">G: {ev.gad7Score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Premium */}
                        {!assignment ? (
                            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl">
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">Acceso Premium <Sparkles className="text-amber-400" size={20} /></h3>
                                <p className="text-indigo-100 text-xs mb-6">Prueba gratuita de 2 días con supervisión profesional.</p>
                                <div className="space-y-3 mb-8">
                                    {professionals.map(pro => (
                                        <div key={pro.id} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between" onClick={() => setSelectedPro(pro)}>
                                            <p className="text-[11px] font-bold">{pro.nombre}</p>
                                            <button 
                                                onClick={() => {setSelectedPro(pro); setIsPaymentModalOpen(true);}}
                                                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-amber-400 hover:text-white"
                                            >SUSCRIBIRSE</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2">Modo Premium <CheckCircle size={20} /></h3>
                                <div className="bg-white/10 p-4 rounded-2xl mb-4">
                                    <p className="text-[10px] text-emerald-100 uppercase font-bold">Supervisor</p>
                                    <p className="text-sm font-black">{assignment.profesional}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase">Días restantes</p>
                                    <p className="text-2xl font-black">{Math.ceil(assignment.dias_restantes)}</p>
                                </div>
                            </div>
                        )}

                        {/* Citas con Auto-Apertura */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-indigo-600" /> Próximas Citas
                            </h3>
                            <div className="space-y-4">
                                {appointments.length > 0 ? appointments.map(app => (
                                    <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{new Date(app.fecha).toLocaleString()}</p>
                                                <p className="text-[9px] text-indigo-600 font-bold uppercase mt-1">Video-Sesión MindGuard</p>
                                            </div>
                                        </div>
                                        <a href={app.link} target="_blank" rel="noreferrer" className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2">
                                            <ExternalLink size={12} /> Abrir Reunión
                                        </a>
                                    </div>
                                )) : <p className="text-[10px] text-slate-400 text-center py-4">No tienes citas programadas</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Pago */}
            {isPaymentModalOpen && selectedPro && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white">
                            <h3 className="text-2xl font-black">Pagar con Yape o PayPal</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={28}/></button>
                        </div>
                        <div className="p-8">
                            <div className="flex gap-4 mb-8 bg-slate-100 p-2 rounded-2xl">
                                <button onClick={() => setPaymentMethod('yape')} className={`flex-1 py-3 rounded-xl font-black text-xs ${paymentMethod === 'yape' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>YAPE</button>
                                <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 py-3 rounded-xl font-black text-xs ${paymentMethod === 'paypal' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>PAYPAL</button>
                            </div>
                            {paymentMethod === 'yape' && (
                                <div className="text-center space-y-4">
                                    <img src={yapeQR} alt="Yape QR" className="w-48 h-48 mx-auto" />
                                    <button onClick={handleYapePayment} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">YA YAPEE, ACTIVAR</button>
                                </div>
                            )}
                            {paymentMethod === 'paypal' && (
                                <PayPalScriptProvider options={{ "client-id": "test" }}>
                                    <PayPalButtons style={{ layout: "vertical" }} onApprove={async () => {
                                        await premiumApi.payAndAssign(selectedPro.id, 5, 'paypal');
                                        setIsPaymentModalOpen(false);
                                        loadData();
                                    }} />
                                </PayPalScriptProvider>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
