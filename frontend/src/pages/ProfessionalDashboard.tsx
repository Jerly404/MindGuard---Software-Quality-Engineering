import React, { useState, useEffect } from 'react';
import { 
    Users, Calendar, DollarSign, Activity, 
    MessageSquare, Clock, ArrowRight, ExternalLink, 
    ChevronRight, CheckCircle2, AlertCircle, RefreshCw,
    Send, Video
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
    }, []);

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

    const sendLinkToPatient = (link: string, patientName: string) => {
        // Simulación de envío de notificación
        alert(`🚀 Link enviado a ${patientName}.\nLa sesión ya está activa en su panel.`);
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
        const fecha = prompt("Ingresa la fecha y hora (YYYY-MM-DD HH:MM):", new Date().toISOString().slice(0,16).replace('T',' '));
        if (!fecha) return;
        try {
            await premiumApi.createAppointment({
                id_paciente: patientId,
                fecha_cita: fecha,
                mensaje_seguimiento: "Sesión de control MindGuard"
            });
            alert("Cita programada. El link único ha sido generado.");
            loadData();
        } catch (e) {
            alert("Error al agendar");
        }
    };

    const attendNow = async (patientId: number, patientName: string) => {
        const now = new Date().toISOString();
        try {
            const res = await premiumApi.createAppointment({
                id_paciente: patientId,
                fecha_cita: now,
                mensaje_seguimiento: "Sesión inmediata iniciada por el profesional"
            });
            const link = res.data.link;
            
            // Simular envío de notificación (el backend ya guardó la cita y el paciente la verá)
            alert(`🚀 Sesión inmediata generada para ${patientName}.\nEl link ha sido enviado a su panel y se abrirá tu sala ahora.`);
            
            // Abrir el link
            window.open(link, '_blank');
            loadData();
        } catch (e) {
            console.error(e);
            alert("Error al iniciar sesión inmediata");
        }
    };

    return (
        <div className="container-fluid min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Panel Profesional</h1>
                        <p className="text-slate-500 font-medium">Gestión de Pacientes y Supervisión Clínica</p>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Pacientes</p>
                        <span className="text-4xl font-black text-slate-800">{patients.length}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Ganancias</p>
                        <span className="text-4xl font-black text-slate-800">${earnings?.total_ganado || '0'}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Citas Hoy</p>
                        <span className="text-4xl font-black text-slate-800">
                            {appointments.filter(a => new Date(a.fecha).toDateString() === new Date().toDateString()).length}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Pacientes bajo supervisión</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {patients.map(p => (
                                    <div key={p.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all">
                                        <p className="font-bold text-slate-800">{p.nombre}</p>
                                        <p className="text-[10px] text-slate-500 mb-4">{p.email}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => viewHistory(p)} className="py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold hover:bg-slate-100">Historial</button>
                                            <button onClick={() => scheduleMeeting(p.id)} className="py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold hover:bg-slate-100">Agendar</button>
                                            <button 
                                                onClick={() => attendNow(p.id, p.nombre)} 
                                                className="col-span-2 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                            >
                                                <Video size={14} /> ATENDER AHORA
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedPatient && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-5">
                                <h3 className="text-xl font-black text-slate-800 mb-6">Historial: {selectedPatient.nombre}</h3>
                                <div className="space-y-4">
                                    {patientHistory.map(ev => (
                                        <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-2">
                                                <span>{new Date(ev.fecha).toLocaleDateString()}</span>
                                                <span className="text-indigo-600">P:{ev.phq9Score} G:{ev.gad7Score}</span>
                                            </div>
                                            <p className="text-xs text-slate-700">"{ev.resultadoIA}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Video size={20} className="text-indigo-600" /> Sala de Espera</h3>
                        <div className="space-y-4">
                            {appointments.map(app => (
                                <div key={app.id} className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Video size={40}/></div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Cita con {app.con}</p>
                                    <p className="text-sm font-black text-slate-800 mb-4">{new Date(app.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    
                                    <div className="flex flex-col gap-2">
                                        <a href={app.link} target="_blank" rel="noreferrer" className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                            <ExternalLink size={14} /> INICIAR SESIÓN
                                        </a>
                                        <button 
                                            onClick={() => sendLinkToPatient(app.link, app.con)}
                                            className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-50"
                                        >
                                            <Send size={14} /> ENVIAR LINK AL PACIENTE
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && <p className="text-center text-[10px] text-slate-400 py-10 border-2 border-dashed border-slate-100 rounded-3xl">No hay citas programadas para hoy</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
