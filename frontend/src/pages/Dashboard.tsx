import React, { useState, useEffect } from 'react';
import { 
    Activity, History, Shield, Brain, Calendar, 
    ArrowRight, Star, Heart, FileText, CheckCircle, 
    Zap, Sparkles, MessageSquare, ExternalLink, RefreshCw,
    X, DollarSign, Wallet
} from 'lucide-react';
import { assessmentApi, premiumApi } from '../services/api';
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
    }, []);

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
            console.error(e);
        } finally {
            setLoading(false);
        }
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
                    {/* Sección Principal: Último Estado */}
                    <div className="lg:col-span-2 space-y-8">
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
                                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase w-fit">
                                        {lastEval?.nivelRiesgo || 'Estable'}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-medium leading-tight">Analizado por Motor IA v2.1</p>
                                </div>
                            </div>
                        </div>

                        {/* Evolución Temporal (Mock Chart) */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Activity className="text-indigo-600" /> Evolución Temporal
                                </h3>
                                <div className="flex gap-4 text-[10px] font-black uppercase">
                                    <span className="flex items-center gap-2"><div className="h-2 w-2 bg-amber-500 rounded-full"></div> Ansiedad</span>
                                    <span className="flex items-center gap-2"><div className="h-2 w-2 bg-indigo-600 rounded-full"></div> Depresión</span>
                                </div>
                            </div>
                            <div className="h-48 flex items-end gap-1 border-b border-slate-100 pb-2 relative">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    <div className="border-t border-slate-50 w-full h-0"></div>
                                    <div className="border-t border-slate-50 w-full h-0"></div>
                                    <div className="border-t border-slate-50 w-full h-0"></div>
                                </div>
                                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200 text-4xl font-black tracking-widest uppercase opacity-20">Analítica Activa</p>
                            </div>
                        </div>

                        {/* Historial Reciente */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                                <History className="text-indigo-600" /> Historial Reciente
                            </h3>
                            <div className="space-y-4">
                                {history.map((ev, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{new Date(ev.fecha).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-500">{ev.resultadoIA.substring(0, 40)}...</p>
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

                    {/* Sidebar: Premium y Citas */}
                    <div className="space-y-8">
                        {/* Acceso Premium */}
                        {!assignment ? (
                            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 p-8 opacity-20 group-hover:scale-110 transition-transform">
                                    <Shield size={120} />
                                </div>
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                    Acceso Premium <Sparkles className="text-amber-400" size={20} />
                                </h3>
                                <p className="text-indigo-100 text-xs leading-relaxed mb-6">
                                    Obtén una prueba gratuita de 2 días con supervisión de un profesional colegiado.
                                </p>
                                
                                <div className="space-y-3 mb-8">
                                    {professionals.map(pro => (
                                        <div key={pro.id} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer border border-white/5" onClick={() => setSelectedPro(pro)}>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">{pro.nombre[0]}</div>
                                                <div>
                                                    <p className="text-[11px] font-bold">{pro.nombre}</p>
                                                    <p className="text-[9px] text-indigo-200">Psicólogo Colegiado</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {setSelectedPro(pro); setIsPaymentModalOpen(true);}}
                                                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-amber-400 hover:text-white transition-all"
                                            >
                                                SUSCRIBIRSE
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {setSelectedPro(professionals[0]); setIsPaymentModalOpen(true);}}
                                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Iniciar Prueba Gratis <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-100">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        Modo Premium <CheckCircle size={20} />
                                    </h3>
                                    <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Activo</span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 mb-6">
                                    <p className="text-[10px] text-emerald-100 uppercase font-bold mb-1">Supervisor Asignado</p>
                                    <p className="text-sm font-black">{assignment.profesional}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase text-emerald-100">Días restantes</p>
                                    <p className="text-2xl font-black">{Math.ceil(assignment.dias_restantes)}</p>
                                </div>
                            </div>
                        )}

                        {/* Mis Citas Próximas */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-indigo-600" /> Próximas Citas
                            </h3>
                            <div className="space-y-4">
                                {appointments.length > 0 ? appointments.map(app => (
                                    <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase">Sesión de Seguimiento</p>
                                                <p className="text-xs font-black text-slate-800 mt-1">{new Date(app.fecha).toLocaleString()}</p>
                                            </div>
                                            <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-[8px] font-bold uppercase">Confirmada</span>
                                        </div>
                                        <a 
                                            href={app.link} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                        >
                                            <ExternalLink size={12} /> Unirse a Reunión
                                        </a>
                                    </div>
                                )) : (
                                    <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                        <MessageSquare className="mx-auto text-slate-200 mb-2" size={32} />
                                        <p className="text-[10px] text-slate-400 font-medium">No tienes citas programadas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Pago Integral (Yape y PayPal) */}
            {isPaymentModalOpen && selectedPro && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <h3 className="text-2xl font-black">Activar MindGuard Premium</h3>
                            <p className="text-indigo-100 text-sm mt-1">Suscripción para supervisión con {selectedPro.nombre}</p>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={28}/></button>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex gap-4 mb-8 bg-slate-100 p-2 rounded-2xl">
                                <button 
                                    onClick={() => setPaymentMethod('yape')}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all ${paymentMethod === 'yape' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                                >
                                    <Wallet size={16} /> YAPE
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all ${paymentMethod === 'paypal' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                                >
                                    <DollarSign size={16} /> PAYPAL
                                </button>
                            </div>

                            {paymentMethod === 'yape' && (
                                <div className="text-center space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-slate-50 p-6 rounded-3xl inline-block border-2 border-indigo-100 shadow-inner">
                                        <img src={yapeQR} alt="Yape QR" className="w-48 h-48 mx-auto rounded-lg shadow-sm" />
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-xs text-indigo-700 font-bold">Escanea el QR y envía S/ 20.00</p>
                                        <p className="text-[10px] text-indigo-500 mt-1">Una vez enviado, presiona el botón inferior para activar.</p>
                                    </div>
                                    <button 
                                        onClick={handleYapePayment}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                                    >
                                        YA YAPEE, ACTIVAR AHORA
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'paypal' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
                                        <p className="text-xs text-amber-700 font-bold text-center italic">"Pago seguro procesado por PayPal Inc."</p>
                                    </div>
                                    <PayPalScriptProvider options={{ "client-id": "test" }}> {/* CAMBIAR A TU CLIENT ID REAL */}
                                        <PayPalButtons 
                                            style={{ layout: "vertical", shape: "pill" }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{ amount: { value: "5.00" } }]
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const res = await premiumApi.payAndAssign(selectedPro.id, 5, 'paypal');
                                                alert(res.data.mensaje);
                                                setIsPaymentModalOpen(false);
                                                loadData();
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}

                            {!paymentMethod && (
                                <div className="py-12 text-center text-slate-400">
                                    <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-bold">Selecciona un método para continuar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
