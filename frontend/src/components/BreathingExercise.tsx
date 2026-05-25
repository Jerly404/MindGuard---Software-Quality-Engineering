import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause, RefreshCw } from 'lucide-react';

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala' | 'Espera'>('Inhala');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds > 1) {
          return prevSeconds - 1;
        }

        // Logic for next phase
        setPhase((currentPhase) => {
          switch (currentPhase) {
            case 'Inhala':
              setSeconds(7);
              return 'Mantén';
            case 'Mantén':
              setSeconds(8);
              return 'Exhala';
            case 'Exhala':
              setCycles((c) => c + 1);
              setSeconds(4);
              return 'Espera';
            case 'Espera':
              setSeconds(4);
              return 'Inhala';
            default:
              return 'Inhala';
          }
        });
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

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
