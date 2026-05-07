import React, { useState, useEffect } from 'react';
import { useAssessments } from '../hooks/useAssessments';
import BreathingExercise from '../components/BreathingExercise';
import { generateClinicalReport } from '../services/pdfService';
import { authApi, premiumApi } from '../services/api';
import { 
    Activity, Calendar, TrendingUp, TrendingDown, Minus, 
    Brain, Lightbulb, MessageCircle, Music, BookOpen, 
    Video, ChevronDown, ChevronUp, Download, Wind, AlertTriangle, ShieldCheck, CreditCard, X, User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard: React.FC = () => {
    const { history, isLoading: loading } = useAssessments();
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [showBreathing, setShowBreathing] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedPro, setSelectedPro] = useState<number | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [assignedPro, setAssignedPro] = useState<any>(null); // TODO: fetch actual assignment if exists

    const currentUser = authApi.getCurrentUser();

    useEffect(() => {
        if (showPremiumModal && professionals.length === 0) {
            premiumApi.getProfessionals().then(res => setProfessionals(res.data)).catch(console.error);
        }
    }, [showPremiumModal]);

    const handlePayment = async () => {
        if (!selectedPro) return;
        setPaymentProcessing(true);
        try {
            await premiumApi.payAndAssign(selectedPro, 49.99); // Mock 49.99 price
            alert("Pago simulado exitoso. Profesional asignado.");
            setShowPremiumModal(false);
            // idealmente recargar datos
        } catch (error) {
            alert("Error al procesar el pago");
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleDownloadReport = () => {
        if (currentUser && history.length > 0) {
            generateClinicalReport(currentUser, history);
        } else {
            alert("No hay suficientes datos para generar el reporte.");
        }
    };

    const chartData = history.map((item: any) => ({
        fecha: new Date(item.fecha || item.fecha_evaluacion).toLocaleDateString(),
        Depresión: item.phq9Score || 0,
        Ansiedad: item.gad7Score || 0
    }));

    const lastAssessment = history.length > 0 ? history[history.length - 1] : null;
    const hasActiveCrisis = lastAssessment?.has_high_risk;

    const getTrendIcon = (scoreType: 'phq9Score' | 'gad7Score') => {
        if (history.length < 2) return <Minus size={16} className="text-slate-400" />;
        const last = history[history.length - 1][scoreType];
        const prev = history[history.length - 2][scoreType];
        if (last < prev) return <TrendingDown size={16} className="text-green-500" />;
        if (last > prev) return <TrendingUp size={16} className="text-red-500" />;
        return <Minus size={16} className="text-slate-400" />;
    };

    const getRecommendations = (risk: string) => {
        const r = (risk || '').toLowerCase();
        if (r.includes('grave') || r.includes('alto') || hasActiveCrisis) {
            return {
                text: "Detección de riesgo significativo. Es prioritario que contactes a tu profesional de salud o llames a una línea de ayuda ahora mismo.",
                links: [
                    { type: 'youtube', label: '📞 Línea 113 (Ayuda 24/7)', url: 'tel:113' },
                    { type: 'book', label: 'Protocolo de Seguridad Personal', url: 'https://www.msf.es/actualidad/primeros-auxilios-psicologicos-que-son-y-como-se-aplican' }
                ]
            };
        }
        if (r.includes('moderado')) {
            return {
                text: "Malestar moderado detectado. Mantén rutinas saludables y busca apoyo psicológico preventivo.",
                links: [
                    { type: 'music', label: 'Lofi para calmar la mente', url: 'https://www.youtube.com/results?search_query=lofi+hip+hop+radio' },
                    { type: 'youtube', label: 'Meditación Guiada TCC', url: 'https://www.youtube.com/results?search_query=meditacion+guiada+10+minutos' }
                ]
            };
        }
        return {
            text: "Indicadores estables. Sigue fortaleciendo tus hábitos de bienestar y autocuidado.",
            links: [
                { type: 'book', label: 'Recursos de Autoayuda', url: 'https://papsicologia.es/recursos-autoayuda/' },
                { type: 'music', label: 'Playlist de Energía Positiva', url: 'https://www.youtube.com/results?search_query=positive+energy+music' }
            ]
        };
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-medium">Cargando tu panel clínico...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
            
            {hasActiveCrisis && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex justify-between items-center shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800">Protocolo de Ayuda Activo</h3>
                            <p className="text-red-700 text-sm mt-1">Tu última evaluación indica que podrías necesitar apoyo prioritario.</p>
                        </div>
                    </div>
                    <a href="tel:113" className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors shadow-sm">
                        Llamar a Línea 113
                    </a>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Bienestar</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-1">
                        <Activity className="h-4 w-4" /> Tecnología Clínica: Multilingual XLM-RoBERTa v3.0
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadReport} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <Download size={16} /> Exportar Historial
                    </button>
                    <Link to="/assessment" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Realizar Nueva Evaluación
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Depresión (PHQ-9)</span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-slate-900">{lastAssessment ? lastAssessment.phq9Score : '-'}</span>
                                {getTrendIcon('phq9Score')}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ansiedad (GAD-7)</span>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-slate-900">{lastAssessment ? lastAssessment.gad7Score : '-'}</span>
                                {getTrendIcon('gad7Score')}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Estado de Riesgo</span>
                            <div className="mt-2">
                                {lastAssessment ? (
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold 
                                        ${lastAssessment.nivelRiesgo === 'ALTO' || lastAssessment.has_high_risk ? 'bg-red-100 text-red-800' : 
                                        lastAssessment.nivelRiesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {lastAssessment.has_high_risk ? 'PRIORITARIO' : lastAssessment.nivelRiesgo}
                                    </span>
                                ) : <span className="text-slate-400 font-medium">-</span>}
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-900">Evolución de Bienestar</h3>
                        </div>
                        <div className="h-72">
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="fecha" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 27]} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line name="Depresión" type="monotone" dataKey="Depresión" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                                        <Line name="Ansiedad" type="monotone" dataKey="Ansiedad" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Activity className="h-12 w-12 mb-2" />
                                    <p>Realiza tu primera evaluación para ver tus gráficas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Historial Clínico</h2>
                            <span className="text-sm text-slate-500 font-medium">{history.length} registros</span>
                        </div>
                        <div className="space-y-4">
                            {[...history].reverse().map((item: any, index: number) => {
                                const isExpanded = expandedCard === index;
                                const recs = getRecommendations(item.nivelRiesgo);
                                
                                return (
                                    <div key={index} className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${item.has_high_risk ? 'border-red-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <div 
                                            className="px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-slate-50"
                                            onClick={() => setExpandedCard(isExpanded ? null : index)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{new Date(item.fecha || item.fecha_evaluacion).toLocaleDateString()}</p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                                                        ${item.has_high_risk || item.nivelRiesgo === 'ALTO' ? 'bg-red-100 text-red-800' : 
                                                        item.nivelRiesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                        {item.has_high_risk ? 'ALERTA' : item.nivelRiesgo}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="hidden sm:flex gap-4 text-sm">
                                                    <div className="text-slate-500">PHQ-9: <strong className="text-slate-900">{item.phq9Score}</strong></div>
                                                    <div className="text-slate-500">GAD-7: <strong className="text-slate-900">{item.gad7Score}</strong></div>
                                                </div>
                                                <div className="text-slate-400">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                                                        <Brain className="h-4 w-4 text-indigo-600" /> Análisis IA
                                                    </h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{item.resultadoIA}</p>
                                                    {item.notas_personales && (
                                                        <div className="mt-3 p-3 bg-indigo-50/50 rounded border border-indigo-100">
                                                            <strong className="text-xs text-indigo-800 uppercase tracking-wider block mb-1">Tu nota:</strong>
                                                            <p className="text-sm text-indigo-900 italic">"{item.notas_personales}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                                                        <Lightbulb className="h-4 w-4 text-yellow-500" /> Plan de Acción
                                                    </h4>
                                                    <p className="text-sm text-slate-600 mb-3">{recs.text}</p>
                                                    <div className="flex flex-col gap-2">
                                                        {recs.links.map((link, i) => (
                                                            <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                                                               className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-white border border-slate-200 rounded hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                                                {link.type === 'youtube' && <Video className="h-4 w-4 text-red-500" />}
                                                                {link.type === 'music' && <Music className="h-4 w-4 text-emerald-500" />}
                                                                {link.type === 'book' && <BookOpen className="h-4 w-4 text-blue-500" />}
                                                                <span className="font-medium">{link.label}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Premium Card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>
                        <ShieldCheck className="h-8 w-8 text-indigo-300 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Supervisión Profesional</h3>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            Acelera tu proceso de mejora. Un psicólogo colegiado revisará tu progreso y te guiará personalmente.
                        </p>
                        <button 
                            onClick={() => setShowPremiumModal(true)}
                            className="w-full bg-white text-indigo-900 font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Obtener Guía Premium
                        </button>
                    </div>

                    {/* Breathing Card */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
                            <Wind className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Pausa de Calma</h3>
                        <p className="text-sm text-slate-600 mb-4">¿Sientes tensión? Dedica 2 minutos a estabilizar tu respiración ahora.</p>
                        <button 
                            onClick={() => setShowBreathing(true)}
                            className="w-full bg-teal-50 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                            Iniciar Ejercicio
                        </button>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
                        <MessageCircle className="h-6 w-6 text-slate-400 mb-3" />
                        <h3 className="font-bold text-slate-900 mb-2">Consistencia</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            El seguimiento continuo permite que nuestra IA detecte patrones sutiles antes de que se conviertan en crisis.
                        </p>
                        <Link to="/assessment" className="text-indigo-600 text-sm font-bold hover:text-indigo-800">Agendar Recordatorio →</Link>
                    </div>
                </aside>
            </div>

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                MindGuard Premium
                            </h3>
                            <button onClick={() => setShowPremiumModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <p className="text-sm text-slate-600 mb-6">
                                Elige un profesional para que revise tus evaluaciones clínicas y te proporcione retroalimentación personalizada.
                            </p>

                            <div className="space-y-3 mb-6">
                                {professionals.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4 border rounded bg-slate-50">Cargando profesionales...</p>
                                ) : (
                                    professionals.map(pro => (
                                        <div 
                                            key={pro.id} 
                                            onClick={() => setSelectedPro(pro.id)}
                                            className={`p-3 border rounded-xl cursor-pointer flex items-center gap-3 transition-all
                                                ${selectedPro === pro.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex justify-center items-center">
                                                <UserIcon className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Dr/a. {pro.nombre}</p>
                                                <p className="text-xs text-slate-500">{pro.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-600">Suscripción Mensual</span>
                                    <span className="font-bold text-slate-900">$49.99</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-start gap-2">
                                    <CreditCard className="h-4 w-4 shrink-0" />
                                    <span>Este es un entorno de pruebas. No se realizarán cobros reales.</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePayment}
                                disabled={!selectedPro || paymentProcessing}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                            >
                                {paymentProcessing ? (
                                    <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</>
                                ) : (
                                    <>Completar Pago Seguro</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;