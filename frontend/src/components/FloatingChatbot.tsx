import React from 'react';
import { assessmentApi } from '../services/api';
import { 
    X, Send, Bot, MessageCircle, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const FloatingChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [options, setOptions] = React.useState<string[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [report, setReport] = React.useState<any>(null);
    const [isLoadingReport, setIsLoadingReport] = React.useState(false);
    
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadGreeting = async () => {
        setIsTyping(true);
        try {
            const res = await assessmentApi.getChatGreeting();
            setMessages([{ role: 'assistant', content: res.data.response }]);
            setOptions(res.data.options || []);
        } catch {
            setMessages([{ role: 'assistant', content: "Hola, soy MindGuard 🌙. ¿Cómo te has sentido hoy?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (text?: string) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        const newMessages = [...messages, { role: 'user', content: messageText } as Message];
        setMessages(newMessages);
        setInputValue('');
        setOptions([]);
        setIsTyping(true);

        try {
            const res = await assessmentApi.getChatMessage(newMessages, "chat");
            setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
            setOptions(res.data.options || []);
        } catch {
            setMessages([...newMessages, { role: 'assistant', content: "Lo siento, tuve un problema de conexión." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateReport = async () => {
        setIsLoadingReport(true);
        try {
            // Reutilizamos el endpoint de análisis (ajustado en el backend si fuera necesario)
            const res = await assessmentApi.submitChat(messages, "final");
            setReport(res.data);
        } catch {
            alert("No se pudo generar el reporte en este momento.");
        } finally {
            setIsLoadingReport(false);
        }
    };

    React.useEffect(() => {
        if (isOpen && messages.length === 0) {
            Promise.resolve().then(() => loadGreeting());
        }
    }, [isOpen, messages.length]);

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, report]);

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)} 
                className="fixed bottom-6 right-6 h-16 w-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce"
                aria-label="Abrir asistente de chat de MindGuard"
                title="Chatear con MindGuard"
            >
                <MessageCircle size={32} aria-hidden="true" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-100 animate-in slide-in-from-bottom-10">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl"><Bot size={20} /></div>
                    <div>
                        <p className="text-xs font-bold leading-none">MindGuard Pro</p>
                        <p className="text-[10px] text-indigo-200 mt-1 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Sistema Inteligente Activo
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                    aria-label="Cerrar chat de MindGuard"
                    title="Cerrar chat"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" role="log" aria-live="polite" aria-label="Historial de conversación del chatbot">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                            m.role === 'assistant' ? 'bg-white text-slate-700 border border-slate-100' : 'bg-indigo-600 text-white'
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {options.length > 0 && !isTyping && (
                    <div className="flex flex-wrap gap-2 justify-start pt-2">
                        {options.map((opt, idx) => (
                            <button key={idx} onClick={() => handleSendMessage(opt)} className="bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-medium hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Botón de Reporte (Aparece tras 4 mensajes) */}
                {messages.length >= 5 && !report && !isTyping && (
                    <div className="flex justify-center py-4">
                        <button 
                            onClick={generateReport}
                            disabled={isLoadingReport}
                            className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-emerald-600 shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {isLoadingReport ? <RefreshCw className="animate-spin" size={16} /> : <FileText size={16} />}
                            Generar Reporte del Estado Mental
                        </button>
                    </div>
                )}

                {/* Visualización del Reporte */}
                {report && (
                    <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-xl animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 text-emerald-600 mb-3">
                            <CheckCircle2 size={18} />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Reporte de Evaluación Diaria</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-rose-50 p-3 rounded-2xl">
                                    <p className="text-[9px] text-rose-600 font-bold uppercase">Ansiedad</p>
                                    <p className="text-sm font-black text-rose-700">{report.nivel_ansiedad || report.riesgo_emocional}</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-2xl">
                                    <p className="text-[9px] text-indigo-600 font-bold uppercase">Depresión</p>
                                    <p className="text-sm font-black text-indigo-700">{report.nivel_depresion || "Baja"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 mb-1">Interpretación:</p>
                                <p className="text-[10px] text-slate-700 leading-relaxed italic">"{report.resumen || report.interpretacion}"</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-600 mb-2 flex items-center gap-1"><AlertCircle size={12}/> Plan de Acción:</p>
                                <ul className="text-[9px] text-slate-600 space-y-1">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(report.plan_accion || [report.recomendacion]).map((step: any, i: number) => (
                                        <li key={i} className="flex gap-2"><span>•</span> {step}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                            <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full animate-bounce"></div>
                            <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full animate-bounce delay-75"></div>
                            <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative">
                    <label htmlFor="floating-chat-input" className="sr-only">Conversa con MindGuard</label>
                    <input 
                        id="floating-chat-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Conversa con MindGuard..."
                        className="w-full p-4 pr-12 bg-slate-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-inner"
                        aria-label="Mensaje para el Asistente MindGuard"
                    />
                    <button 
                        onClick={() => handleSendMessage()} 
                        className="absolute right-3 top-2.5 p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                        aria-label="Enviar mensaje"
                        title="Enviar"
                    >
                        <Send size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingChatbot;
