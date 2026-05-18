import React, { useState, useEffect } from 'react';
import { 
    Users, Calendar, DollarSign, Activity, 
    MessageSquare, Clock, ArrowRight, ExternalLink, 
    ChevronRight, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { premiumApi } from '../services/api';

const ProfessionalDashboard: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [earnings, setEarnings] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        // Reloj para apertura automática de citas
        const timer = setInterval(checkAutoOpenLink, 30000);
        return () => clearInterval(timer);
    }, [appointments]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [patRes, earnRes, appoRes] = await Promise.all([
                premiumApi.getAssignedPatients(),
                premiumApi.getEarnings(),
                premiumApi.getMyAppointments()
            ]);
            setPatients(patRes.data);
            setEarnings(earnRes.data);
            setAppointments(appoRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const checkAutoOpenLink = () => {
        const now = new Date();
        appointments.forEach(app => {
            const appDate = new Date(app.fecha);
            const diff = (appDate.getTime() - now.getTime()) / 60000;
            if (diff <= 0 && diff > -5 && app.estado === 'programada') {
                window.open(app.link, '_blank');
                app.estado = 'en_curso';
            }
        });
    };

    const viewHistory = async (patient: any) => {
        setSelectedPatient(patient);
        try {
            const res = await premiumApi.getPatientHistory(patient.id);
            setPatientHistory(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const scheduleMeeting = async (patientId: number) => {
        const fecha = prompt("Ingresa la fecha y hora (YYYY-MM-DD HH:MM):", "2024-05-18 10:00");
        if (!fecha) return;
        try {
            await premiumApi.createAppointment({
                id_paciente: patientId,
                fecha_cita: fecha,
                mensaje_seguimiento: "Sesión de control semanal"
            });
            alert("Cita programada con éxito");
            loadData();
        } catch (e) {
            alert("Error al agendar");
        }
    };

    return (
        <div className="container-fluid min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900">Panel Profesional</h1>
                    <p className="text-slate-500 font-medium">Gestión de Pacientes y Supervisión Clínica</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Pacientes Asignados</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">{patients.length}</span>
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Users size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Ingresos Estimados</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">${earnings?.total_ganado || '0'}</span>
                            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><DollarSign size={24} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Citas Hoy</p>
                        <div className="flex justify-between items-center">
                            <span className="text-4xl font-black text-slate-800">
                                {appointments.filter(a => new Date(a.fecha).toDateString() === new Date().toDateString()).length}
                            </span>
                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Clock size={24} /></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Users className="text-indigo-600" /> Mis Pacientes</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {patients.map(p => (
                                    <div key={p.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">{p.nombre[0]}</div>
                                            <div>
                                                <p className="font-bold text-slate-800">{p.nombre}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Riesgo: {p.riesgo}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => viewHistory(p)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold hover:bg-slate-100">Historial</button>
                                            <button onClick={() => scheduleMeeting(p.id)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-700">Agendar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedPatient && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-800">Historial: {selectedPatient.nombre}</h3>
                                    <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600"><ChevronRight className="rotate-90" /></button>
                                </div>
                                <div className="space-y-4">
                                    {patientHistory.map(ev => (
                                        <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-500">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(ev.fecha).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-indigo-600">PHQ9: {ev.phq9Score} | GAD7: {ev.gad7Score}</span>
                                            </div>
                                            <p className="text-xs text-slate-700 italic">"{ev.resultadoIA}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-indigo-600" /> Agenda de Hoy</h3>
                        <div className="space-y-4">
                            {appointments.map(app => (
                                <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Cita con {app.con}</p>
                                    <p className="text-xs font-black text-slate-800 mb-3">{new Date(app.fecha).toLocaleTimeString()}</p>
                                    <a href={app.link} target="_blank" rel="noreferrer" className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2">
                                        <ExternalLink size={12} /> Unirse ahora
                                    </a>
                                </div>
                            ))}
                            {appointments.length === 0 && <p className="text-center text-[10px] text-slate-400 py-4">No hay citas para hoy</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
