import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import { 
    ArrowRight, CheckCircle, Brain, HeartPulse, 
    ShieldCheck, AlertTriangle, Send, User, Bot, Sparkles, RefreshCw
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const FLOW = ["mood", "energy", "sleep", "anxiety", "conclusion"];

const Assessment: React.FC = () => {
    const [step, setStep] = React.useState(0); // 0: Consent, 1: Chat, 2: Result
    const [chatStepIndex, setChatStepIndex] = React.useState(0);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const [loadingResult, setLoadingResult] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = React.useState<any>(null);
    
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadGreeting = async () => {
        setIsTyping(true);
        try {
            const res = await assessmentApi.getChatGreeting();
            setMessages([{ role: 'assistant', content: res.data.response }]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            setMessages([{ role: 'assistant', content: "Hola, soy MindGuard 🌙. ¿Cómo te has sentido hoy?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const finishAssessment = async (finalMessages: Message[]) => {
        setLoadingResult(true);
        try {
            const currentStep = FLOW[chatStepIndex];
            const response = await assessmentApi.submitChat(finalMessages, currentStep);
            setResult(response.data);
            setStep(2);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Error al analizar la conversación.");
        } finally {
            setLoadingResult(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { role: 'user', content: inputValue };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        
        try {
            const currentStep = FLOW[chatStepIndex];
            
            if (chatStepIndex < FLOW.length - 1) {
                setIsTyping(true);
                const res = await assessmentApi.getChatMessage(newMessages, currentStep);
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
                setChatStepIndex(chatStepIndex + 1);
                setIsTyping(false);
            } else {
                finishAssessment(newMessages);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un pequeño error. ¿Podrías repetirme eso?" }]);
        }
    };

    React.useEffect(() => {
        if (step === 1 && messages.length === 0) {
            loadGreeting();
        }
        scrollToBottom();
    }, [step, messages, isTyping]);

    const renderConsent = () => (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
                <div className="h-20 w-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Chat Terapéutico MindGuard</h1>
                <p className="text-slate-600 mb-8 text-lg">
                    En lugar de formularios fríos, hoy tendremos una pequeña charla. 
                    Nuestra IA analizará tus respuestas para brindarte el mejor apoyo posible.
                </p>
                
                <div className="grid gap-4 text-left mb-10">
                    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                        <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                        <div>
                            <p className="font-bold text-slate-800">Privacidad Total</p>
                            <p className="text-sm text-slate-500">Tus conversaciones son privadas y seguras.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                        <Brain className="text-indigo-500 shrink-0" size={24} />
                        <div>
                            <p className="font-bold text-slate-800">Análisis Inteligente</p>
                            <p className="text-sm text-slate-500">Detectamos patrones emocionales en tiempo real.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setStep(1)}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    Comenzar Conversación <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden my-4 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold">Asistente MindGuard</h3>
                    <p className="text-xs text-indigo-100 flex items-center gap-1">
                        <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span> IA Activa
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
                        <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                m.role === 'assistant' 
                                ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                                : 'bg-indigo-600 text-white rounded-tr-none'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce"></span>
                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                            <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                {loadingResult && (
                    <div className="flex flex-col items-center justify-center py-8 text-indigo-600 gap-4">
                        <RefreshCw className="animate-spin" size={32} />
                        <p className="text-sm font-medium">Analizando patrones emocionales...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <textarea 
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full p-4 pr-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-sm"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping || loadingResult}
                        className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Tus mensajes son procesados localmente para garantizar tu privacidad.
                </p>
            </div>
        </div>
    );

    const renderResult = () => {
        const risk = result.nivelRiesgo.toLowerCase();
        const analysis = result.analisis_detallado || {};
        
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Header del Resultado */}
                    <div className={`p-8 text-center text-white ${
                        result.has_high_risk ? 'bg-rose-600' : 
                        risk === 'grave' ? 'bg-rose-600' :
                        risk === 'moderado' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                        <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                            {result.has_high_risk ? <AlertTriangle size={48} /> : <Sparkles size={48} />}
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2">Interpretación Emocional</h1>
                        <p className="text-white/90 text-lg uppercase font-bold tracking-wider">{analysis.riesgo_emocional ? `Riesgo: ${analysis.riesgo_emocional}` : result.nivelRiesgo}</p>
                    </div>

                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Análisis IA */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                        <Bot className="text-indigo-600" /> Mi Observación
                                    </h3>
                                    <p className="text-slate-700 text-sm leading-relaxed mb-4">
                                        {analysis.interpretacion || result.resultadoIA}
                                    </p>
                                    
                                    {analysis.factores_detectados && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-slate-500 mb-2">PATRONES DETECTADOS:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.factores_detectados.map((f: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                                                        • {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recomendación y Plan */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <HeartPulse className="text-rose-500" /> Recomendación Personalizada
                                </h3>
                                
                                <div className="p-6 bg-indigo-50 text-indigo-800 rounded-3xl border border-indigo-100">
                                    <p className="text-sm leading-relaxed italic">
                                        "{analysis.recomendacion || "Hoy intenta enfocar tu atención en algo físico y presente para descansar mentalmente."}"
                                    </p>
                                </div>

                                {result.has_high_risk && (
                                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                        <p className="font-bold text-rose-700 text-sm mb-1">Apoyo Inmediato</p>
                                        <p className="text-xs text-rose-600">Llama al 113 (Opción 5) - Línea gratuita de salud mental.</p>
                                        <a href="tel:113" className="mt-2 block bg-rose-600 text-white text-center py-2 rounded-lg text-sm font-bold">Llamar 113 Ahora</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico Simple de Emociones */}
                        {analysis.emociones_detectadas && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase text-center tracking-widest">Niveles Detectados</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {Object.entries(analysis.emociones_detectadas).map(([emo, val]: [string, any]) => (
                                        <div key={emo} className="text-center">
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${val * 100}%` }}></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{emo.replace('_', ' ')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={() => navigate('/')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                                Ir al Dashboard
                            </button>
                            <button onClick={() => window.print()} className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all">
                                Guardar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {step === 0 && renderConsent()}
            {step === 1 && renderChat()}
            {step === 2 && result && renderResult()}
        </div>
    );
};

export default Assessment;
