import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause, RefreshCw } from 'lucide-react';

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala' | 'Espera'>('Inhala');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            // Cycle: 4-7-8 breathing technique
            if (phase === 'Inhala') { setPhase('Mantén'); return 7; }
            if (phase === 'Mantén') { setPhase('Exhala'); return 8; }
            if (phase === 'Exhala') { setPhase('Espera'); return 4; }
            setPhase('Inhala'); return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  return (
    <div className="breathing-modal-overlay">
      <div className="breathing-card animate-scale-in">
        <button className="close-btn" onClick={onClose}><X /></button>
        <div className="breathing-content">
          <div className={`breathing-circle ${phase === 'Inhala' ? 'expand' : phase === 'Exhala' ? 'shrink' : ''}`}>
            <Wind size={48} className="text-white" />
          </div>
          <h2 className="phase-text">{phase}</h2>
          <div className="timer-display">{seconds}s</div>
          <p className="instruction-text">Técnica 4-7-8 para reducir la ansiedad inmediatamente.</p>
          
          <div className="controls">
            <button className="btn-circle" onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause /> : <Play />}
            </button>
            <button className="btn-circle" onClick={() => { setIsActive(false); setSeconds(4); setPhase('Inhala'); }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
