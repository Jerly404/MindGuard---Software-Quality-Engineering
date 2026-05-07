import React, { useState } from 'react';
import { useAssessments } from '../hooks/useAssessments';
import BreathingExercise from '../components/BreathingExercise';
import { generateClinicalReport } from '../services/pdfService';
import { authApi } from '../services/api';
import { 
    Activity, Calendar, TrendingUp, TrendingDown, Minus, 
    Brain, Lightbulb, MessageCircle, Music, BookOpen, 
    Video, ChevronDown, ChevronUp, Download, Wind, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard: React.FC = () => {
    const { history, isLoading: loading } = useAssessments();
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [showBreathing, setShowBreathing] = useState(false);
    const currentUser = authApi.getCurrentUser();

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
        if (history.length < 2) return <Minus size={16} />;
        const last = history[history.length - 1][scoreType];
        const prev = history[history.length - 2][scoreType];
        if (last < prev) return <TrendingDown size={16} className="text-success" />;
        if (last > prev) return <TrendingUp size={16} className="text-error" />;
        return <Minus size={16} />;
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

    if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Cargando tu panel de bienestar clínico...</p></div>;

    return (
        <div className="container dashboard-container animate-fade-in">
            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
            
            {hasActiveCrisis && (
                <div className="crisis-banner-dashboard animate-pulse">
                    <div className="crisis-content">
                        <AlertTriangle size={24} />
                        <div>
                            <strong>Protocolo de Ayuda Activo:</strong> Tu última evaluación indica que podrías necesitar apoyo prioritario.
                        </div>
                    </div>
                    <div className="crisis-actions">
                        <a href="tel:113" className="btn-crisis-action">Llamar a Línea 113</a>
                    </div>
                </div>
            )}

            <header className="dashboard-top">
                <div className="welcome-text">
                    <h1>Panel de Bienestar</h1>
                    <p>Tecnología Clínica: <strong>Multilingual XLM-RoBERTa v3.0</strong></p>
                </div>
                <div className="header-actions">
                    <button onClick={handleDownloadReport} className="btn-secondary" style={{marginRight: '10px'}}>
                        <Download size={18} /> Exportar Historial
                    </button>
                    <Link to="/assessment" className="btn-primary btn-cta">Realizar Nueva Evaluación</Link>
                </div>
            </header>
            
            <div className="dashboard-main-grid">
                <div className="main-content-area">
                    <div className="stats-summary-grid">
                        <div className="stat-card">
                            <span className="stat-label">Depresión (PHQ-9)</span>
                            <div className="stat-value-row">
                                <span className="stat-value">{lastAssessment ? lastAssessment.phq9Score : '-'}</span>
                                {getTrendIcon('phq9Score')}
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Ansiedad (GAD-7)</span>
                            <div className="stat-value-row">
                                <span className="stat-value">{lastAssessment ? lastAssessment.gad7Score : '-'}</span>
                                {getTrendIcon('gad7Score')}
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Estado de Riesgo</span>
                            <div className="stat-value-row">
                                {lastAssessment ? (
                                    <span className={`risk-tag risk-${lastAssessment.nivelRiesgo.toLowerCase().replace(' ', '-')} ${lastAssessment.has_high_risk ? 'priority-risk' : ''}`}>
                                        {lastAssessment.has_high_risk ? 'PRIORITARIO' : lastAssessment.nivelRiesgo}
                                    </span>
                                ) : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="chart-section card-professional">
                        <div className="section-header-row">
                            <Activity size={20} className="text-primary" />
                            <h3>Evolución de Bienestar</h3>
                        </div>
                        <div className="chart-container">
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="fecha" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 27]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line name="Depresión" type="monotone" dataKey="Depresión" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line name="Ansiedad" type="monotone" dataKey="Ansiedad" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">
                                    <Activity size={48} />
                                    <p>Realiza tu primera evaluación para ver tus gráficas de evolución clínica.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="history-section">
                        <div className="section-header-row">
                            <h2>Historial de Evaluaciones</h2>
                            <p className="text-muted">{history.length} registros clínicos</p>
                        </div>
                        
                        <div className="history-list-modern">
                            {[...history].reverse().map((item: any, index: number) => {
                                const isExpanded = expandedCard === index;
                                const recs = getRecommendations(item.nivelRiesgo);
                                
                                return (
                                    <div key={index} className={`history-item-card ${isExpanded ? 'expanded' : ''} ${item.has_high_risk ? 'border-priority' : ''} animate-fade-in`}>
                                        <div className="history-item-header" onClick={() => setExpandedCard(isExpanded ? null : index)}>
                                            <div className="header-main">
                                                <div className="date-box">
                                                    <Calendar size={14} />
                                                    <span>{new Date(item.fecha || item.fecha_evaluacion).toLocaleDateString()}</span>
                                                </div>
                                                <div className={`risk-pill risk-${(item.nivelRiesgo || '').toLowerCase().replace(' ', '-')} ${item.has_high_risk ? 'priority-risk' : ''}`}>
                                                    {item.has_high_risk ? 'ALERTA DE RIESGO' : item.nivelRiesgo}
                                                </div>
                                            </div>
                                            <div className="header-scores">
                                                <div className="mini-score"><span>PHQ-9:</span> <strong>{item.phq9Score}</strong></div>
                                                <div className="mini-score"><span>GAD-7:</span> <strong>{item.gad7Score}</strong></div>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="history-item-body">
                                                <div className="body-grid">
                                                    <div className="analysis-box">
                                                        <h4><Brain size={16} /> Análisis de IA Clínica</h4>
                                                        <p>{item.resultadoIA}</p>
                                                        {item.notas_personales && (
                                                            <div className="diary-note">
                                                                <strong>Nota del día:</strong>
                                                                <p>"{item.notas_personales}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="resources-box">
                                                        <h4><Lightbulb size={16} /> Recomendación Profesional</h4>
                                                        <p className="rec-text">{recs.text}</p>
                                                        <div className="rec-links">
                                                            {recs.links.map((link, i) => (
                                                                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="rec-link-pill">
                                                                    {link.type === 'youtube' && <Video size={14} />}
                                                                    {link.type === 'music' && <Music size={14} />}
                                                                    {link.type === 'book' && <BookOpen size={14} />}
                                                                    {link.label}
                                                                </a>
                                                            ))}
                                                        </div>
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

                <aside className="dashboard-sidebar">
                    <div className="card-professional sidebar-card bg-primary text-white">
                        <div className="card-header-icon bg-white">
                            <Wind className="text-primary" size={24} />
                        </div>
                        <h3 className="text-white">Pausa de Calma</h3>
                        <p className="text-white opacity-90">
                            ¿Te sientes abrumado ahora? Tómate un minuto para estabilizar tu respiración.
                        </p>
                        <button 
                            className="btn-secondary w-full" 
                            style={{marginTop: '1rem', backgroundColor: 'white', color: 'var(--primary)', border: 'none'}}
                            onClick={() => setShowBreathing(true)}
                        >
                            Comenzar Respiración
                        </button>
                    </div>

                    <div className="card-professional sidebar-card recommendation-card">
                        <div className="card-header-icon bg-warning-light">
                            <Lightbulb className="text-warning" size={24} />
                        </div>
                        <h3>Recomendación de Hoy</h3>
                        <p className="recommendation-text">
                            {lastAssessment ? getRecommendations(lastAssessment.nivelRiesgo).text : "Realiza una evaluación para recibir consejos personalizados basados en estándares clínicos."}
                        </p>
                    </div>

                    <div className="card-professional sidebar-card diary-preview">
                        <div className="card-header-icon bg-purple-light">
                            <MessageCircle className="text-purple" size={24} />
                        </div>
                        <h3>Seguimiento Continuo</h3>
                        <p className="diary-text">
                            La constancia en las evaluaciones permite detectar cambios sutiles en tu estado de ánimo antes de que se conviertan en crisis.
                        </p>
                        <Link to="/assessment" className="link-text">Nueva Evaluación →</Link>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Dashboard;