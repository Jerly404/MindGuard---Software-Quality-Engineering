import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause, RefreshCw } from 'lucide-react';

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala' | 'Espera'>('Inhala');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (seconds === 0) {
      if (phase === 'Inhala') {
        setPhase('Mantén');
        setSeconds(7);
      } else if (phase === 'Mantén') {
        setPhase('Exhala');
        setSeconds(8);
      } else if (phase === 'Exhala') {
        setPhase('Espera');
        setSeconds(4);
        setCycles(prev => prev + 1); // Solo se incrementa aquí cuando los segundos llegan a 0 exactamente
      } else if (phase === 'Espera') {
        setPhase('Inhala');
        setSeconds(4);
      }
    }
  }, [seconds, phase]);

  return (
    <div className="breathing-modal-overlay">
      <div className="breathing-card animate-scale-in">
        <button className="breathing-close-btn" onClick={onClose} title="Cerrar">
          <X size={24} />
        </button>
        
        <div className="breathing-content">
          <div className="cycles-badge">Ciclo {cycles} / 4</div>
          
          <div className={`breathing-circle-container`}>
            <div className={`breathing-circle ${phase === 'Inhala' ? 'expand' : phase === 'Exhala' ? 'shrink' : ''}`}>
              <Wind size={40} className="text-white" />
            </div>
          </div>
          
          <div className="breathing-info">
            <h2 className="phase-text">{phase}</h2>
            <div className="timer-display">{seconds}s</div>
            <p className="instruction-text">Inhala por la nariz, mantén y exhala profundamente.</p>
          </div>
          
          <div className="breathing-controls">
            <button className={`btn-circle ${isActive ? 'active' : ''}`} onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button className="btn-circle secondary" onClick={() => { setIsActive(false); setSeconds(4); setPhase('Inhala'); setCycles(0); }}>
              <RefreshCw size={22} />
            </button>
          </div>

          {cycles >= 4 && (
            <button className="btn-finish-exercise animate-bounce-in" onClick={onClose}>
              Finalizar Sesión de Calma
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
