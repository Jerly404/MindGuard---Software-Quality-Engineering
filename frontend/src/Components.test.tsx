import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BreathingExercise from './components/BreathingExercise';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './components/Navbar';

describe('Pruebas Unitarias de Componentes UI', () => {
  
  beforeEach(() => {
    // Mock de localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('BreathingExercise: debe mostrar las instrucciones de respiración', () => {
    render(<BreathingExercise onClose={() => {}} />);
    // Usamos getAllByText porque la palabra aparece en el título y en la descripción
    expect(screen.getAllByText(/Inhala/i).length).toBeGreaterThan(0);
  });

  it('Navbar: debe mostrar los enlaces de navegación básicos', () => {
    render(
      <MemoryRouter>
        <Navbar onLogout={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/MindGuard/i)).toBeDefined();
  });

  it('BreathingExercise: debe tener botones de control', () => {
    render(<BreathingExercise onClose={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
