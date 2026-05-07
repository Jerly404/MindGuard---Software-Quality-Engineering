import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessments } from '../hooks/useAssessments';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, RESPONSE_OPTIONS } from '../services/questions';
import { 
    ArrowLeft, ArrowRight, CheckCircle, Brain, HeartPulse, 
    ShieldCheck, AlertTriangle, MessageSquare, Save, Info, Video
} from 'lucide-react';

const Assessment: React.FC = () => {
    const { submitEvaluation, isSubmitting: loading } = useAssessments();
    const [step, setStep] = useState(0); 
    const [phq9Answers, setPhq9Answers] = useState<number[]>(new Array(9).fill(-1));
    const [gad7Answers, setGad7Answers] = useState<number[]>(new Array(7).fill(-1));
    const [textInput, setTextInput] = useState('');
    const [result, setResult] = useState<any>(null);
    const navigate = useNavigate();

    const handlePhq9Change = (index: number, value: number) => {
        const newAnswers = [...phq9Answers];
        newAnswers[index] = value;
        setPhq9Answers(newAnswers);
    };

    const handleGad7Change = (index: number, value: number) => {
        const newAnswers = [...gad7Answers];
        newAnswers[index] = value;
        setGad7Answers(newAnswers);
    };

    const handleSubmit = async () => {
        const phq9Total = phq9Answers.reduce((a, b) => a + (b === -1 ? 0 : b), 0);
        const gad7Total = gad7Answers.reduce((a, b) => a + (b === -1 ? 0 : b), 0);
        
        try {
            const response = await submitEvaluation({
                phq9Score: phq9Total,
                gad7Score: gad7Total,
                phq9Answers: phq9Answers,
                gad7Answers: gad7Answers,
                text_input: textInput
            });
            // La respuesta de axios tiene los datos en response.data
            setResult(response.data);
            setStep(4);
        } catch (error) {
            console.error(error);
            alert('Error al enviar la evaluación. Por favor intenta de nuevo.');
        }
    };

    const isStepValid = () => {
        if (step === 1) return phq9Answers.every(a => a !== -1);
        if (step === 2) return gad7Answers.every(a => a !== -1);
        if (step === 3) return textInput.trim().length > 10;
        return true;
    };

    const renderConsent = () => (
        <div className="card-professional animate-fade-in-up">
            <div className="card-header-icon text-primary bg-primary-light">
                <ShieldCheck size={32} />
            </div>
            <h2 className="title-large">Espacio Seguro y Privado</h2>
            <p className="subtitle">Tu bienestar es nuestra prioridad. Antes de comenzar, es importante establecer este acuerdo de confianza.</p>
            
            <div className="consent-content">
                <div className="consent-item">
                    <CheckCircle size={20} className="text-success" />
                    <p><strong>Privacidad:</strong> Tus datos están encriptados y solo tú (y tu profesional si lo autorizas) tienen acceso.</p>
                </div>
                <div className="consent-item">
                    <CheckCircle size={20} className="text-success" />
                    <p><strong>Propósito:</strong> Esta es una herramienta de monitoreo clínico, no un diagnóstico definitivo.</p>
                </div>
                <div className="consent-item">
                    <AlertTriangle size={20} className="text-warning" />
                    <p><strong>Urgencias:</strong> Si sientes que estás en peligro inmediato, llama al 113 (Perú) o acude al centro de salud más cercano.</p>
                </div>
            </div>
            
            <div className="action-row-wizard">
                <button className="btn-secondary" onClick={() => navigate('/')}>Volver</button>
                <button className="btn-primary" onClick={() => setStep(1)}>Acepto y Comenzar <ArrowRight size={18} /></button>
            </div>
        </div>
    );

    const renderQuestionnaire = (questions: string[], answers: number[], onChange: (i: number, v: number) => void, title: string, icon: React.ReactNode, nextStep: number) => (
        <div className="card-professional animate-fade-in-up">
            <div className="assessment-header-wizard">
                <div className="icon-box">{icon}</div>
                <div className="text-box">
                    <h2>{title}</h2>
                    <p>Responde con sinceridad basándote en las últimas 2 semanas.</p>
                </div>
            </div>
            
            <div className="modern-questions-list">
                {questions.map((q, i) => (
                    <div key={i} className={`modern-question-card ${answers[i] !== -1 ? 'answered' : ''}`}>
                        <p className="question-text">{i + 1}. {q}</p>
                        <div className="modern-options-group">
                            {RESPONSE_OPTIONS.map(opt => (
                                <button 
                                    key={opt.value}
                                    type="button"
                                    className={`modern-option-btn color-${opt.value} ${answers[i] === opt.value ? 'selected' : ''}`}
                                    onClick={() => onChange(i, opt.value)}
                                >
                                    <span className="dot"></span>
                                    <span className="label">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="action-row-wizard">
                <button className="btn-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={18} /> Anterior</button>
                <button 
                    className="btn-primary" 
                    onClick={() => setStep(nextStep)}
                    disabled={!isStepValid()}
                >
                    Continuar <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    const renderDiary = () => (
        <div className="card-professional animate-fade-in-up">
            <div className="assessment-header-wizard">
                <div className="icon-box bg-purple-light"><MessageSquare size={24} className="text-purple" /></div>
                <div className="text-box">
                    <h2>Diario de Bienestar</h2>
                    <p>Escribe libremente. La IA analizará el tono emocional para ayudarte mejor.</p>
                </div>
            </div>
            
            <div className="diary-container">
                <textarea 
                    className="modern-diary-input"
                    value={textInput} 
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Hoy me siento especialmente..."
                />
                <div className="char-count">{textInput.length} caracteres (mínimo 10)</div>
            </div>

            <div className="info-alert">
                <Brain size={18} />
                <p>Nuestro modelo <strong>Multilingual XLM-RoBERTa</strong> detectará patrones de malestar y palabras clave de riesgo.</p>
            </div>

            <div className="action-row-wizard">
                <button className="btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={18} /> Anterior</button>
                <button 
                    className="btn-primary btn-pulse" 
                    onClick={handleSubmit} 
                    disabled={loading || !isStepValid()}
                >
                    {loading ? 'Analizando...' : 'Finalizar y Ver Resultados'} <Save size={18} />
                </button>
            </div>
        </div>
    );

    const renderResult = () => {
        const risk = result.nivelRiesgo.toLowerCase();
        const isHighRisk = result.has_high_risk;
        
        return (
            <div className="card-professional result-view animate-fade-in">
                {isHighRisk && (
                    <div className="crisis-alert-banner animate-pulse">
                        <AlertTriangle size={32} className="text-white" />
                        <div>
                            <h4>Detección de Riesgo Prioritario</h4>
                            <p>Tus respuestas sugieren que estás pasando por un momento crítico. Por favor, llama a la Línea 113 (opción 5) en Perú para apoyo inmediato gratuito.</p>
                        </div>
                    </div>
                )}

                <div className="result-hero">
                    {isHighRisk ? <AlertTriangle size={64} className="text-error" /> : <CheckCircle size={64} className="text-success" />}
                    <h1>Evaluación Finalizada</h1>
                    <div className={`risk-hero-badge risk-${risk.replace(' ', '-')}`}>
                        {result.nivelRiesgo}
                    </div>
                </div>

                <div className="result-sections-grid">
                    <div className="result-main-card">
                        <h3><Brain size={20} /> Análisis Cognitivo-Emocional</h3>
                        <p className="ai-feedback">{result.resultadoIA}</p>
                        
                        <div className="ethical-notice-inline">
                            <Info size={16} />
                            <p>Este análisis es una herramienta de apoyo, no sustituye la consulta con un psicólogo colegiado.</p>
                        </div>
                    </div>

                    <div className="therapeutic-resources">
                        <h3><HeartPulse size={20} /> Recursos de Bienestar</h3>
                        <p>Basado en tu estado actual, hemos seleccionado estos recursos para ti:</p>
                        
                        <div className="resource-chips-grid">
                            {isHighRisk ? (
                                <>
                                    <div className="res-chip highlight-red">
                                        <span className="icon">📞</span>
                                        <div>
                                            <strong>Línea de Vida (113)</strong>
                                            <a href="tel:113" className="emergency-link">Llamar Ahora</a>
                                        </div>
                                    </div>
                                    <div className="res-chip">
                                        <span className="icon">🏥</span>
                                        <div>
                                            <strong>Centros Comunitarios</strong>
                                            <a href="https://www.gob.pe/institucion/minsa/campañas/716-centros-de-salud-mental-comunitaria" target="_blank" rel="noreferrer">Ver Mapa</a>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="res-chip">
                                        <span className="icon">🧘</span>
                                        <div>
                                            <strong>Respiración Cuadrada</strong>
                                            <button onClick={() => navigate('/exercise')} className="text-link">Empezar Ejercicio</button>
                                        </div>
                                    </div>
                                    <div className="res-chip">
                                        <span className="icon">📚</span>
                                        <div>
                                            <strong>Lectura Sugerida</strong>
                                            <a href="https://papsicologia.es/recursos-autoayuda/" target="_blank" rel="noreferrer">Guías TCC</a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="action-row center-aligned">
                    <button className="btn-secondary" onClick={() => navigate('/')}>Ir al Panel</button>
                    <button className="btn-primary" onClick={() => window.print()}>Descargar Reporte Clínico</button>
                </div>
            </div>
        );
    };

    return (
        <div className="container assessment-wizard-container">
            <div className="wizard-stepper">
                {['Inicio', 'Depresión', 'Ansiedad', 'Diario', 'Resultado'].map((label, i) => (
                    <div key={i} className={`stepper-item ${step === i ? 'current' : ''} ${step > i ? 'done' : ''}`}>
                        <div className="step-num">{step > i ? <CheckCircle size={16} /> : i + 1}</div>
                        <span className="step-label">{label}</span>
                    </div>
                ))}
            </div>

            <div className="wizard-content">
                {step === 0 && renderConsent()}
                {step === 1 && renderQuestionnaire(PHQ9_QUESTIONS, phq9Answers, handlePhq9Change, "Cuestionario PHQ-9", <HeartPulse size={24} className="text-blue" />, 2)}
                {step === 2 && renderQuestionnaire(GAD7_QUESTIONS, gad7Answers, handleGad7Change, "Cuestionario GAD-7", <Brain size={24} className="text-orange" />, 3)}
                {step === 3 && renderDiary()}
                {step === 4 && result && renderResult()}
            </div>
        </div>
    );
};

const ActivityIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

export default Assessment;
