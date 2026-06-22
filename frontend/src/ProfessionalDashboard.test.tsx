import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import { premiumApi } from './services/api';
import React from 'react';

// Mock the API service
vi.mock('./services/api', () => {
    return {
        premiumApi: {
            getAssignedPatients: vi.fn(),
            getEarnings: vi.fn(),
            getMyAppointments: vi.fn(),
            createAppointment: vi.fn(),
            resendAppointmentEmail: vi.fn(),
        }
    };
});

describe('ProfessionalDashboard tests', () => {
    const mockPatients = [
        { id: 101, nombre: 'Juan Perez', email: 'juan@example.com', riesgo: 'Estable' }
    ];
    const mockEarnings = { total_ganado: 250 };
    const mockAppointments = [
        {
            id: 201,
            con: 'Juan Perez',
            fecha: '2026-06-23T10:00:00',
            link: 'https://meet.jit.si/MindGuard-testroom123',
            mensaje: 'Sesión de control',
            estado: 'programada'
        }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        
        // Mock default implementation
        vi.mocked(premiumApi.getAssignedPatients).mockResolvedValue({ data: mockPatients } as any);
        vi.mocked(premiumApi.getEarnings).mockResolvedValue({ data: mockEarnings } as any);
        vi.mocked(premiumApi.getMyAppointments).mockResolvedValue({ data: mockAppointments } as any);
        vi.mocked(premiumApi.createAppointment).mockResolvedValue({ data: { mensaje: 'Cita programada con éxito', link: 'https://meet.jit.si/MindGuard-newroom' } } as any);
        vi.mocked(premiumApi.resendAppointmentEmail).mockResolvedValue({ data: { mensaje: 'Correo reenviado con éxito' } } as any);

        // Mock window.open and alert
        vi.spyOn(window, 'open').mockImplementation(() => null);
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('should render patients, earnings, and appointments correctly', async () => {
        render(<ProfessionalDashboard />);

        // Wait for data load
        await waitFor(() => {
            expect(screen.getByText('Juan Perez')).toBeInTheDocument();
        });

        // Check stats
        expect(screen.getByText('Pacientes Premium')).toBeInTheDocument();
        expect(screen.getByText('$250')).toBeInTheDocument();

        // Check patient info
        expect(screen.getByText('juan@example.com')).toBeInTheDocument();

        // Check appointment info
        expect(screen.getByText('Cita con Juan Perez')).toBeInTheDocument();
        expect(screen.getByText('ENTRAR A SALA')).toBeInTheDocument();
        expect(screen.getByText('REENVIAR ACCESO')).toBeInTheDocument();
    });

    it('should call resendAppointmentEmail when clicking REENVIAR ACCESO', async () => {
        render(<ProfessionalDashboard />);

        await waitFor(() => {
            expect(screen.getByText('REENVIAR ACCESO')).toBeInTheDocument();
        });

        const resendButton = screen.getByText('REENVIAR ACCESO');
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(premiumApi.resendAppointmentEmail).toHaveBeenCalledWith(201);
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('La sesión ya está activa en el panel de Juan Perez'));
        });
    });

    it('should open scheduling modal and submit a new appointment', async () => {
        render(<ProfessionalDashboard />);

        await waitFor(() => {
            expect(screen.getByText('AGENDAR')).toBeInTheDocument();
        });

        // Open Modal
        const agendarButton = screen.getByText('AGENDAR');
        fireEvent.click(agendarButton);

        // Check modal open
        expect(screen.getByText('Programar Cita')).toBeInTheDocument();
        expect(screen.getByText('CONFIRMAR AGENDAMIENTO')).toBeInTheDocument();

        // Select Date Input and set value
        const dateInput = screen.getByLabelText(/Fecha y Hora/i);
        fireEvent.change(dateInput, { target: { value: '2026-06-25T14:30' } });

        // Submit
        const submitButton = screen.getByText('CONFIRMAR AGENDAMIENTO');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(premiumApi.createAppointment).toHaveBeenCalledWith({
                id_paciente: 101,
                fecha_cita: '2026-06-25T14:30',
                mensaje_seguimiento: 'Sesión de control MindGuard'
            });
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cita programada con éxito'));
        });
    });
});
