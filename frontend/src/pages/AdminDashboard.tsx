import React, { useState } from 'react';
import { 
    Shield, Server, Database, Activity, Users, UserPlus, Bell, 
    TrendingUp, TrendingDown, Minus, Trash2, Edit, CheckCircle, 
    XCircle, Info, MessageSquare, AlertTriangle 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    // State for Users
    const [users] = useState([
        { id: 1, nombre: "Himer Jerly", email: "hjerlycondorluna@gmail.com", ultimaEval: "2024-04-27", riesgo: "Moderado", tendencia: "Deterioro", phq9: 14, gad7: 12, ai: "Distress detectado" },
        { id: 2, nombre: "Luis Miguel", email: "lm@mindguard.ai", ultimaEval: "2024-04-26", riesgo: "Bajo", tendencia: "Mejora", phq9: 4, gad7: 3, ai: "Estable" },
        { id: 3, nombre: "Julio Cesar", email: "jc@mindguard.ai", ultimaEval: "2024-04-25", riesgo: "Alto", tendencia: "Estable", phq9: 22, gad7: 18, ai: "Crisis potencial" },
    ]);

    // State for Professionals
    const [professionals, setProfessionals] = useState([
        { id: 1, nombre: "Dr. Roberto Silva", email: "rsilva@mindguard.ai", colegiatura: "CPPe 12345", especialidad: "Ansiedad y Depresión", pacientes: 12 },
        { id: 2, nombre: "Dra. Ana Valdivia", email: "avaldivia@mindguard.ai", colegiatura: "CPPe 67890", especialidad: "Terapia Cognitiva", pacientes: 8 },
    ]);

    // State for Notifications/Alerts
    const [alerts] = useState([
        { id: 1, usuario: "Julio Cesar", tipo: "Riesgo Crítico", detalle: "Puntaje PHQ-9 de 22 detectado. Requiere intervención.", fecha: "Hace 10 min", leido: false },
        { id: 2, usuario: "Himer Jerly", tipo: "Deterioro", detalle: "IA detectó cambio de tono negativo en el diario emocional.", fecha: "Hace 2 horas", leido: false },
    ]);

    const [isAddingPsychologist, setIsAddingPsychologist] = useState(false);
    const [activeTab, setActiveTab] = useState<'usuarios' | 'profesionales' | 'alertas'>('usuarios');
    const [viewingAlert, setViewingAlert] = useState<any | null>(null);

    const handleDeleteProfessional = (id: number) => {
        if (window.confirm("¿Está seguro de eliminar a este profesional? Se desvincularán sus pacientes.")) {
            setProfessionals(professionals.filter(p => p.id !== id));
        }
    };

    return (
        <div className="container admin-dashboard animate-fade-in">
            <header className="dashboard-top">
                <div className="welcome-text">
                    <h1>Administración del Ecosistema</h1>
                    <p>IA en producción: <strong>DistilBERT (v2.1)</strong> | Nodo Central: <strong>Operativo</strong></p>
                </div>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>Usuarios</button>
                    <button className={`tab-btn ${activeTab === 'profesionales' ? 'active' : ''}`} onClick={() => setActiveTab('profesionales')}>Profesionales</button>
                    <button className={`tab-btn ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => setActiveTab('alertas')}>
                        Alertas {alerts.filter(a => !a.leido).length > 0 && <span className="tab-badge">{alerts.filter(a => !a.leido).length}</span>}
                    </button>
                </div>
            </header>

            <div className="stats-summary-grid">
                <div className="stat-card">
                    <span className="stat-label">Usuarios Totales</span>
                    <div className="stat-value-row">
                        <span className="stat-value">{users.length}</span>
                        <Users size={24} className="text-info" />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Alertas Activas</span>
                    <div className="stat-value-row">
                        <span className="stat-value text-error">{alerts.length}</span>
                        <AlertTriangle size={24} className="text-error" />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Servicios IA</span>
                    <div className="stat-value-row">
                        <span className="stat-value">99.9%</span>
                        <Activity size={24} className="text-success" />
                    </div>
                </div>
            </div>

            <div className="admin-main-grid-v2">
                <div className="card-professional main-admin-card">
                    
                    {activeTab === 'usuarios' && (
                        <>
                            <div className="section-header">
                                <h3>Gestión de Usuarios Independientes</h3>
                                <p className="subtitle">Reporte de salud y monitoreo de actividad.</p>
                            </div>
                            <table className="admin-table-v2">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Puntajes (P/G)</th>
                                        <th>Riesgo IA</th>
                                        <th>Tendencia</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-info-v2">
                                                    <div className="avatar-admin">{u.nombre[0]}</div>
                                                    <div>
                                                        <div className="name">{u.nombre}</div>
                                                        <div className="email">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="score-pill">{u.phq9}</span> / <span className="score-pill">{u.gad7}</span></td>
                                            <td><span className={`risk-tag risk-${u.riesgo.toLowerCase()}`}>{u.riesgo}</span></td>
                                            <td>
                                                <div className="trend-cell">
                                                    {u.tendencia === 'Mejora' && <TrendingDown size={14} className="text-success" />}
                                                    {u.tendencia === 'Deterioro' && <TrendingUp size={14} className="text-error" />}
                                                    {u.tendencia === 'Estable' && <Minus size={14} className="text-muted" />}
                                                    <span>{u.tendencia}</span>
                                                </div>
                                            </td>
                                            <td><button className="btn-icon"><Info size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'profesionales' && (
                        <>
                            <div className="section-header-flex">
                                <div>
                                    <h3>Directorio de Profesionales</h3>
                                    <p className="subtitle">Gestión de psicólogos registrados y sus cargas de pacientes.</p>
                                </div>
                                <button className="btn-primary btn-sm" onClick={() => setIsAddingPsychologist(true)}>
                                    <UserPlus size={16} /> Agregar Psicólogo
                                </button>
                            </div>
                            <table className="admin-table-v2">
                                <thead>
                                    <tr>
                                        <th>Profesional</th>
                                        <th>Colegiatura</th>
                                        <th>Especialidad</th>
                                        <th>Pacientes</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {professionals.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="user-info-v2">
                                                    <div className="avatar-prof">{p.nombre[0]}</div>
                                                    <div>
                                                        <div className="name">{p.nombre}</div>
                                                        <div className="email">{p.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{p.colegiatura}</td>
                                            <td>{p.especialidad}</td>
                                            <td><strong>{p.pacientes}</strong></td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon text-primary"><Edit size={16} /></button>
                                                    <button className="btn-icon text-error" onClick={() => handleDeleteProfessional(p.id)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'alertas' && (
                        <>
                            <div className="section-header">
                                <h3>Alertas de Monitoreo Crítico</h3>
                                <p className="subtitle">Intervenciones sugeridas por detección de crisis o deterioro severo.</p>
                            </div>
                            <div className="alerts-list">
                                {alerts.map(a => (
                                    <div key={a.id} className={`alert-item-card ${a.leido ? '' : 'unread'}`} onClick={() => setViewingAlert(a)}>
                                        <div className="alert-icon-box">
                                            {a.tipo.includes('Crítico') ? <XCircle className="text-error" /> : <AlertTriangle className="text-warning" />}
                                        </div>
                                        <div className="alert-content">
                                            <div className="alert-header-row">
                                                <strong>{a.usuario}</strong>
                                                <span className="alert-date">{a.fecha}</span>
                                            </div>
                                            <p className="alert-type">{a.tipo}</p>
                                            <p className="alert-snippet">{a.detalle}</p>
                                        </div>
                                        <div className="alert-action">
                                            <button className="btn-text">Ver Detalle</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </div>

                <aside className="admin-sidebar-v2">
                    <div className="card-professional sidebar-stats">
                        <h3>Salud de Infraestructura</h3>
                        <div className="status-grid-v2">
                            <div className="status-row"><span>Base de Datos</span><span className="indicator online"></span></div>
                            <div className="status-row"><span>Motor IA</span><span className="indicator online"></span></div>
                            <div className="status-row"><span>Email Service</span><span className="indicator online"></span></div>
                        </div>
                    </div>
                    
                    <div className="card-professional sidebar-stats">
                        <h3>Auditoría Rápida</h3>
                        <div className="audit-mini-list">
                            <div className="audit-mini-item">
                                <div className="time">15:04</div>
                                <div className="text">Admin eliminó psicólogo ID: 04</div>
                            </div>
                            <div className="audit-mini-item">
                                <div className="time">14:50</div>
                                <div className="text">Nueva cuenta: Dra. Laura M.</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {isAddingPsychologist && (
                <div className="modal-overlay">
                    <div className="modal-content card-professional animate-slide-up">
                        <div className="modal-header">
                            <h3>Registrar Profesional de Salud</h3>
                            <button className="btn-close" onClick={() => setIsAddingPsychologist(false)}><XCircle /></button>
                        </div>
                        <form className="admin-form-v2" onSubmit={(e) => { e.preventDefault(); setIsAddingPsychologist(false); }}>
                            <div className="input-field">
                                <label>Nombre Completo</label>
                                <input type="text" placeholder="Ej. Dr. Juan Pérez" required />
                            </div>
                            <div className="input-field">
                                <label>Correo Institucional</label>
                                <input type="email" placeholder="email@mindguard.ai" required />
                            </div>
                            <div className="input-field">
                                <label>Número de Colegiatura</label>
                                <input type="text" placeholder="CPPe XXXXX" required />
                            </div>
                            <div className="input-field">
                                <label>Especialidad</label>
                                <select>
                                    <option>Psicología Clínica</option>
                                    <option>Terapia Conductual</option>
                                    <option>Neuropsicología</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsAddingPsychologist(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Vincular al Sistema</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingAlert && (
                <div className="modal-overlay">
                    <div className="modal-content card-professional alert-detail-modal">
                        <div className="alert-modal-header">
                            <AlertTriangle className="text-error" size={32} />
                            <div>
                                <h3>Detalle de Alerta Crítica</h3>
                                <p>{viewingAlert.usuario} - {viewingAlert.fecha}</p>
                            </div>
                        </div>
                        <div className="alert-full-detail">
                            <div className="detail-section">
                                <h4>Resumen de Hallazgos</h4>
                                <p>{viewingAlert.detalle}</p>
                            </div>
                            <div className="detail-section-grid">
                                <div className="metric-box">
                                    <span>PHQ-9</span>
                                    <strong>22/27</strong>
                                </div>
                                <div className="metric-box">
                                    <span>GAD-7</span>
                                    <strong>18/21</strong>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h4><MessageSquare size={16} /> Sentimiento IA</h4>
                                <div className="sentiment-callout">
                                    "Me siento muy solo, no puedo más con esto, todo me sobrepasa..."
                                    <br/>
                                    <strong>Predicción:</strong> CRISIS SEVERA (Confianza 0.94)
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setViewingAlert(null)}>Cerrar</button>
                            <button className="btn-primary bg-error">Notificar Urgencia</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
