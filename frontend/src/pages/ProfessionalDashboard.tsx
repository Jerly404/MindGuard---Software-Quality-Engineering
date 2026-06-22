import React from 'react';
import { 
    Users, Calendar, Activity, 
    Clock, ExternalLink, RefreshCw,
    Send, Video, X
} from 'lucide-react';
import { premiumApi } from '../services/api';

const ProfessionalDashboard: React.FC = () => {
    const [patients, setPatients] = React.useState<any[]>([]);
    const [earnings, setEarnings] = React.useState<any>(null);
    const [appointments, setAppointments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedPatient, setSelectedPatient] = React.useState<any | null>(null);
    const [patientHistory, setPatientHistory] = React.useState<any[]>([]);
    
    // Modal states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
    const [schedulingPatientId, setSchedulingPatientId] = React.useState<number | null>(null);
    const [scheduleDate, setScheduleDate] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const loadData = React.useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [patRes, earnRes, appoRes] = await Promise.all([
                premiumApi.getAssignedPatients(),
                premiumApi.getEarnings(),
                premiumApi.getMyAppointments()
            ]);
            setPatients(patRes.data);
            setEarnings(earnRes.data);
            setAppointments(appoRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const sendLinkToPatient = async (appointmentId: number, patientName: string) => {
        try {
            const res = await premiumApi.resendAppointmentEmail(appointmentId);
            alert(`🚀 ${res.data.mensaje}.\nLa sesión ya está activa en el panel de ${patientName}.`);
        } catch (error) {
            alert("Error al intentar reenviar el correo de la reunión.");
        }
    };

    const viewHistory = async (patient: any) => {
        setSelectedPatient(patient);
        try {
            const res = await premiumApi.getPatientHistory(patient.id);
            setPatientHistory(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedulingPatientId || !scheduleDate) return;
        
        setSubmitting(true);
        try {
            await premiumApi.createAppointment({
                id_paciente: schedulingPatientId,
                fecha_cita: scheduleDate,
                mensaje_seguimiento: "Sesión de control MindGuard"
            });
            alert("✅ Cita programada con éxito.");
            setIsScheduleModalOpen(false);
            setScheduleDate('');
            loadData();
        } catch (error) {
            alert("Error al agendar la cita. Verifica que el paciente tenga premium activo.");
        } finally {
            setSubmitting(false);
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
            alert(`🚀 Sesión inmediata generada para ${patientName}.\nEl link ha sido enviado a su panel.`);
            window.open(link, '_blank');
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión inmediata. El paciente debe tener premium activo.");
        }
    };

    React.useEffect(() => {
        loadData(false);
        const dataInterval = setInterval(() => loadData(true), 3000);
        return () => clearInterval(dataInterval);
    }, [loadData]);

    return (
        <div className="container-fluid min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Panel Clínico</h1>
                        <p className="text-slate-500 font-medium">Gestión de Pacientes y Supervisión en Tiempo Real</p>
                    </div>
                    <button onClick={() => loadData(false)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm transition-all">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={60}/></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Pacientes Premium</p>
                        <span className="text-4xl font-black text-slate-800">{patients.length}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={60}/></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Total Ganado</p>
                        <span className="text-4xl font-black text-emerald-600">${earnings?.total_ganado || '0'}</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Calendar size={60}/></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Citas del Día</p>
                        <span className="text-4xl font-black text-amber-500">
                            {appointments.filter(a => new Date(a.fecha).toDateString() === new Date().toDateString()).length}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2"><Users size={24} className="text-indigo-600" /> Lista de Pacientes</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {patients.map(p => (
                                    <div key={p.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black">{p.nombre[0]}</div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">{p.nombre}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{p.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => viewHistory(p)} className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-all">HISTORIAL</button>
                                            <button onClick={() => {setSchedulingPatientId(p.id); setIsScheduleModalOpen(true);}} className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-all">AGENDAR</button>
                                            <button 
                                                onClick={() => attendNow(p.id, p.nombre)} 
                                                className="col-span-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                            >
                                                <Video size={14} /> ATENDER AHORA (VIVO)
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {patients.length === 0 && <p className="col-span-full text-center text-slate-400 py-20 font-medium">No tienes pacientes asignados actualmente.</p>}
                            </div>
                        </div>

                        {selectedPatient && (
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-800">Análisis Clínico: {selectedPatient.nombre}</h3>
                                    <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {patientHistory.map(ev => (
                                        <div key={ev.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                                            <div className={`h-10 w-10 min-w-[40px] rounded-full flex items-center justify-center font-black text-[10px] ${ev.phq9Score > 15 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {ev.phq9Score}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(ev.fecha).toLocaleDateString([], {day:'2-digit', month:'long', year:'numeric'})}</p>
                                                    <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200">PHQ9: {ev.phq9Score} | GAD7: {ev.gad7Score}</span>
                                                </div>
                                                <p className="text-xs text-slate-700 leading-relaxed italic">"{ev.resultadoIA}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-fit sticky top-6">
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2"><Clock size={24} className="text-indigo-600" /> Sala de Espera</h3>
                        <div className="space-y-4">
                            {appointments.map(app => (
                                <div key={app.id} className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Video size={40}/></div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Cita con {app.con}</p>
                                    <p className="text-lg font-black text-slate-800 mb-6">{new Date(app.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    
                                    <div className="flex flex-col gap-2">
                                        <a href={app.link} target="_blank" rel="noreferrer" className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                                            <ExternalLink size={14} /> ENTRAR A SALA
                                        </a>
                                        <button 
                                            onClick={() => sendLinkToPatient(app.id, app.con)}
                                            className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
                                        >
                                            <Send size={14} /> REENVIAR ACCESO
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                    <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Calendar size={32}/></div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Sin citas activas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Agendamiento */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <h3 className="text-2xl font-black">Programar Cita</h3>
                            <p className="text-indigo-100 text-xs mt-1 font-medium">Define el momento de la próxima sesión clínica.</p>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all"><X size={28}/></button>
                        </div>
                        <form onSubmit={handleSchedule} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="fecha_cita" className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha y Hora</label>
                                <input 
                                    id="fecha_cita"
                                    type="datetime-local" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-bold"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'RESERVANDO...' : 'CONFIRMAR AGENDAMIENTO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;
