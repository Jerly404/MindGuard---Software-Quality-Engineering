import React from 'react';
import { 
    Activity, Brain, Calendar, 
    Zap, Sparkles, ExternalLink,
    X, Moon, Sun, Wind, CheckCircle, Music, Film, Coffee
} from 'lucide-react';
import api, { assessmentApi, premiumApi } from '../services/api';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import BreathingExercise from '../components/BreathingExercise';
import yapeQR from '../assets/yape-qr.png';

interface Appointment {
    id: number;
    fecha: string;
    estado: string;
    link: string;
    con?: string;
}

const Dashboard: React.FC = () => {
    const [history, setHistory] = React.useState<any[]>([]);
    const [assignment, setAssignment] = React.useState<any>(null);
    const [professionals, setProfessionals] = React.useState<any[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
    const [selectedPro, setSelectedPro] = React.useState<any>(null);
    const [paymentMethod, setPaymentMethod] = React.useState<'yape' | 'paypal' | null>(null);
    const [appointments, setAppointments] = React.useState<Appointment[]>([]);
    const [showBreathing, setShowBreathing] = React.useState(false);

    const loadData = React.useCallback(async () => {
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
        } catch (error) {
            // console.error("Dashboard Load Error:", error);
        }
    }, []);

    const checkAutoOpenLink = React.useCallback(() => {
        const now = new Date();
        appointments.forEach(app => {
            if (app.estado !== 'programada') return;
            const appDate = new Date(app.fecha);
            const diff = (appDate.getTime() - now.getTime()) / 60000;
            
            if (diff <= 0 && diff > -10) {
                console.log("¡Hora de la cita! Abriendo videoconferencia...");
                window.open(app.link, '_blank');
                app.estado = 'en_curso';
            }
        });
    }, [appointments]);

    const handleYapePayment = async () => {
        try {
            const res = await premiumApi.payAndAssign(selectedPro.id, 20, 'yape');
            alert(res.data.mensaje);
            setIsPaymentModalOpen(false);
            loadData();
        } catch (error) {
            alert("Error al procesar el pago");
        }
    };

    React.useEffect(() => {
        loadData();
        const dataInterval = setInterval(loadData, 30000);
        return () => clearInterval(dataInterval);
    }, [loadData]);

    React.useEffect(() => {
        const timer = setInterval(checkAutoOpenLink, 30000);
        return () => clearInterval(timer);
    }, [checkAutoOpenLink]);

    const lastEval = history[history.length - 1];

    const recommendations = React.useMemo(() => {
        if (!lastEval) return null;
        const p = lastEval.phq9Score || 0;
        const g = lastEval.gad7Score || 0;

        if (g > p && g > 10) {
            return {
                title: "Enfoque en Calma y Relajación",
                color: "amber",
                icon: <Moon />,
                activities: ["Práctica de respiración 4-7-8", "Escuchar ruidos blancos o naturaleza", "Caminata consciente de 10 min"],
                media: { type: "Música", title: "Weightless - Marconi Union", desc: "Diseñada para reducir el pulso cardíaco." }
            };
        } else if (p > 10) {
            return {
                title: "Impulso de Energía y Ánimo",
                color: "indigo",
                icon: <Sun />,
                activities: ["Escuchar playlist 'Upbeat'", "Ver una comedia ligera", "Llamar a un amigo cercano"],
                media: { type: "Serie/Peli", title: "Ted Lasso", desc: "Excelente para mejorar el optimismo." }
            };
        }
        return {
            title: "Mantenimiento del Bienestar",
            color: "emerald",
            icon: <Coffee />,
            activities: ["Escribir 3 gratitudes del día", "Leer 20 páginas de un libro", "Planear algo para mañana"],
            media: { type: "Podcast", title: "Entiende tu Mente", desc: "Psicología aplicada al día a día." }
        };
    }, [lastEval]);

    const chartData = React.useMemo(() => {
        return history.slice(-7).map(ev => ({
            date: new Date(ev.fecha).toLocaleDateString([], {day:'2-digit', month:'short'}),
            depresion: ev.phq9Score,
            ansiedad: ev.gad7Score
        }));
    }, [history]);

    return (
        <div className="container-fluid min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            Panel de Bienestar <Zap className="text-amber-500" fill="currentColor" size={24} />
                        </h1>
                        <p className="text-slate-500 font-medium">MindGuard AI Chatbot v2.0 • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowBreathing(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <Wind size={18} /> Respiración Guiada
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Brain size={80} />
                                </div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Última Depresión</p>
                                <div className="flex items-end gap-2">
                                    <h2 className="text-5xl font-black">{lastEval?.phq9Score ?? '-'}</h2>
                                    <span className="text-slate-500 mb-2 font-bold">/ 27</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Última Ansiedad</p>
                                <div className="flex items-end gap-2">
                                    <h2 className="text-5xl font-black text-slate-800">{lastEval?.gad7Score ?? '-'}</h2>
                                    <span className="text-slate-300 mb-2 font-bold">/ 21</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Estado General</p>
                                <div className="flex flex-col gap-2">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase w-fit ${
                                        (lastEval?.phq9Score > 15 || lastEval?.gad7Score > 15) ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {lastEval?.nivelRiesgo || 'Sincronizando...'}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-medium leading-tight">Analizado por Motor IA v2.1</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Activity className="text-indigo-600" /> Evolución del Estado de Ánimo
                                </h3>
                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-indigo-500 rounded-full"></div> Depresión</div>
                                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-rose-400 rounded-full"></div> Ansiedad</div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorAns" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                            <YAxis hide domain={[0, 27]} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                                labelStyle={{fontWeight: 'black', marginBottom: '4px'}}
                                            />
                                            <Area type="monotone" dataKey="depresion" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorDep)" />
                                            <Area type="monotone" dataKey="ansiedad" stroke="#fb7185" strokeWidth={4} fillOpacity={1} fill="url(#colorAns)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">Iniciando Analítica...</div>
                                )}
                            </div>
                        </div>

                        {recommendations && (
                            <div className={`bg-${recommendations.color}-50 p-8 rounded-[3rem] border border-${recommendations.color}-100 animate-in slide-in-from-left-5`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`text-xl font-black text-${recommendations.color}-900 flex items-center gap-3`}>
                                            <span className={`p-2 bg-white rounded-xl text-${recommendations.color}-600 shadow-sm`}>{recommendations.icon}</span>
                                            Recomendaciones para Hoy
                                        </h3>
                                        <p className={`text-${recommendations.color}-700 text-xs font-bold mt-1 uppercase tracking-tight`}>{recommendations.title}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Actividades Sugeridas</p>
                                        {recommendations.activities.map((act, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl text-[11px] font-bold text-slate-700">
                                                <CheckCircle className={`text-${recommendations.color}-500`} size={16} /> {act}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Contenido Recomendado</p>
                                        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3 mb-2">
                                                {recommendations.media.type === 'Música' ? <Music className="text-pink-500" size={18}/> : <Film className="text-indigo-500" size={18}/>}
                                                <p className="text-[10px] font-black text-slate-400 uppercase">{recommendations.media.type}</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 mb-1">{recommendations.media.title}</p>
                                            <p className="text-[10px] text-slate-500 italic">"{recommendations.media.desc}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {!assignment ? (
                            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl">
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">Acceso Premium <Sparkles className="text-amber-400" size={20} /></h3>
                                <p className="text-indigo-100 text-xs mb-6">Prueba gratuita de 1 día con supervisión profesional.</p>
                                <div className="space-y-3 mb-8">
                                    {professionals.map(pro => (
                                        <div key={pro.id} className="bg-white/10 p-4 rounded-2xl flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold">{pro.nombre}</p>
                                                <span className="bg-amber-400 text-white px-2 py-0.5 rounded-lg text-[8px] font-black">PRO</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => {setSelectedPro(pro); setIsPaymentModalOpen(true);}}
                                                    className="flex-1 bg-white text-indigo-600 py-2 rounded-xl text-[10px] font-black hover:bg-amber-400 hover:text-white transition-all"
                                                >SUSCRIBIRSE</button>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await premiumApi.payAndAssign(pro.id, 0, 'prueba');
                                                            alert("✅ Prueba de 1 día activada. ¡Bienvenido!");
                                                            loadData();
                                                        } catch {
                                                            alert("Error al activar la prueba");
                                                        }
                                                    }}
                                                    className="flex-1 bg-indigo-500 text-white border border-indigo-400 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-400 transition-all"
                                                >PRUEBA 1 DÍA</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2">Modo Premium <CheckCircle size={20} /></h3>
                                <div className="bg-white/10 p-4 rounded-2xl mb-4">
                                    <p className="text-[10px] text-emerald-100 uppercase font-bold">Supervisor Asignado</p>
                                    <p className="text-sm font-black">{assignment.profesional}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase">Estado de supervisión</p>
                                    <p className="text-2xl font-black tracking-tighter">ACTIVA</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-indigo-600" /> Próximas Sesiones
                            </h3>
                            <div className="space-y-4">
                                {appointments.length > 0 ? appointments.map(app => (
                                    <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{new Date(app.fecha).toLocaleString([], {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                                                <p className="text-[9px] text-indigo-600 font-bold uppercase mt-1">Video-Sesión MindGuard</p>
                                            </div>
                                        </div>
                                        <a href={app.link} target="_blank" rel="noreferrer" className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                                            <ExternalLink size={12} /> Unirse a Reunión
                                        </a>
                                    </div>
                                )) : <p className="text-[10px] text-slate-400 text-center py-4">No tienes citas programadas</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPaymentModalOpen && selectedPro && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative">
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
                                <PayPalScriptProvider options={{ clientId: "test" }}>
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

            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
        </div>
    );
};

export default Dashboard;
