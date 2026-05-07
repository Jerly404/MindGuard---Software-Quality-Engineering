import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { premiumApi } from '../services/api';
import { Users, FileText, Activity } from 'lucide-react';

const ProfessionalDashboard = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await premiumApi.getAssignedPatients();
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Panel del Profesional</h1>
                <p className="mt-2 text-slate-600">Bienvenido. Aquí puedes gestionar a tus pacientes asignados.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-500" />
                    <h3 className="text-lg leading-6 font-medium text-slate-900">Mis Pacientes</h3>
                </div>
                
                {loading ? (
                    <div className="p-6 text-center text-slate-500">Cargando pacientes...</div>
                ) : patients.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-sm font-medium text-slate-900">No hay pacientes</h3>
                        <p className="mt-1 text-sm text-slate-500">Aún no tienes pacientes asignados a tu supervisión.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {patients.map((patient) => (
                            <li key={patient.id} className="hover:bg-slate-50 transition-colors">
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-indigo-700 font-bold">{patient.nombre.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{patient.nombre}</p>
                                            <p className="text-sm text-slate-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Última Evaluación</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                                ${patient.ultima_evaluacion_riesgo === 'ALTO' ? 'bg-red-100 text-red-800' : 
                                                patient.ultima_evaluacion_riesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' : 
                                                patient.ultima_evaluacion_riesgo === 'BAJO' ? 'bg-green-100 text-green-800' : 
                                                'bg-slate-100 text-slate-800'}`}>
                                                {patient.ultima_evaluacion_riesgo}
                                            </span>
                                        </div>
                                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            Ver Historial
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ProfessionalDashboard;