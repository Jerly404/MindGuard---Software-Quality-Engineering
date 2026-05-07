import React, { useState } from 'react';
import { Users, UserPlus, Bell, Search, Filter } from 'lucide-react';

const ProfessionalDashboard: React.FC = () => {
    // Mock data based on requirements
    const [patients] = useState([
        { id: 1, nombre: "Juan Pérez", ultimaEvaluacion: "2024-04-25", riesgo: "Moderado", tendencia: "Deterioro", alerta: true },
        { id: 2, nombre: "Maria Garcia", ultimaEvaluacion: "2024-04-26", riesgo: "Bajo", tendencia: "Mejora", alerta: false },
        { id: 3, nombre: "Carlos Ruiz", ultimaEvaluacion: "2024-04-24", riesgo: "Alto", tendencia: "Deterioro", alerta: true },
    ]);

    return (
        <div className="container professional-dashboard animate-fade-in">
            <header className="dashboard-top">
                <div className="welcome-text">
                    <h1>Panel del Profesional</h1>
                    <p>Gestión longitudinal y seguimiento de pacientes asignados.</p>
                </div>
                <button className="btn-primary"><UserPlus size={18} /> Vincular Nuevo Paciente</button>
            </header>

            <div className="stats-summary-grid">
                <div className="stat-card">
                    <span className="stat-label">Total Pacientes</span>
                    <div className="stat-value-row">
                        <span className="stat-value">{patients.length}</span>
                        <Users size={24} className="text-muted" />
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Alertas Activas</span>
                    <div className="stat-value-row">
                        <span className="stat-value text-error">2</span>
                        <Bell size={24} className="text-error" />
                    </div>
                </div>
            </div>

            <div className="card-professional">
                <div className="table-controls">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Buscar paciente..." />
                    </div>
                    <button className="btn-secondary"><Filter size={18} /> Filtros</button>
                </div>

                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>Nombre del Paciente</th>
                            <th>Última Evaluación</th>
                            <th>Nivel de Riesgo</th>
                            <th>Tendencia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(p => (
                            <tr key={p.id} className={p.alerta ? 'row-alert' : ''}>
                                <td>
                                    <div className="patient-info">
                                        <div className="avatar">{p.nombre[0]}</div>
                                        <span>{p.nombre}</span>
                                        {p.alerta && <span className="alert-dot" title="Alerta de deterioro"></span>}
                                    </div>
                                </td>
                                <td>{new Date(p.ultimaEvaluacion).toLocaleDateString()}</td>
                                <td><span className={`risk-tag risk-${p.riesgo.toLowerCase()}`}>{p.riesgo}</span></td>
                                <td>{p.tendencia}</td>
                                <td>
                                    <button className="btn-small">Ver Detalles</button>
                                    <button className="btn-small btn-outline">Protocolo</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
