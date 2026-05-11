import React, { useState, useEffect, useRef } from 'react';
import { assessmentApi } from '../services/api';
import { 
    X, Send, Bot, User, MessageCircle, Sparkles, RefreshCw, ChevronRight, Heart
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const FLOW = ["mood", "energy", "sleep", "anxiety", "conclusion"];

const FloatingChatbot: React.FC<{ onResult?: (res: any) => void }> = ({ onResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [stepIndex, setStepIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadGreeting();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const loadGreeting = async () => {
        setIsTyping(true);
        try {
            const res = await assessmentApi.getChatGreeting();
            setMessages([{ role: 'assistant', content: res.data.response }]);
        } catch (e) {
            setMessages([{ role: 'assistant', content: "Hola, soy MindGuard 🌙. ¿Cómo te has sentido hoy?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            const currentStep = FLOW[stepIndex];
            
            if (stepIndex < FLOW.length - 1) {
                const res = await assessmentApi.getChatMessage(newMessages, currentStep);
                setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
                setStepIndex(stepIndex + 1);
            } else {
                // Finalizar y obtener reporte detallado
                setLoadingResult(true);
                const response = await assessmentApi.submitChat(newMessages, currentStep);
                if (onResult) onResult(response.data);
                setMessages([...newMessages, { role: 'assistant', content: "He generado tu análisis y plan de acción. Puedes revisarlo ahora mismo en tu pantalla." }]);
            }
        } catch (e) {
            setMessages([...newMessages, { role: 'assistant', content: "Hubo un pequeño error, pero sigo aquí para escucharte. ¿Quieres continuar?" }]);
        } finally {
            setIsTyping(false);
            setLoadingResult(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-16 w-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce"
            >
                <MessageCircle size={32} />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-100 animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <div>
                        <p className="text-xs font-bold leading-none">MindGuard AI</p>
                        <p className="text-[10px] text-indigo-200">En línea ahora</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                            m.role === 'assistant' 
                            ? 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100' 
                            : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                            <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                            <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                            <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                {loadingResult && (
                    <div className="text-center py-2 flex flex-col items-center gap-1">
                        <RefreshCw size={16} className="animate-spin text-indigo-600" />
                        <p className="text-[10px] text-slate-500">Analizando sentimientos...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
                <div className="relative">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="w-full p-3 pr-10 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1.5 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingChatbot;
