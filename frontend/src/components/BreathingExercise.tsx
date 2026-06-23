import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause, RefreshCw } from 'lucide-react';
import { useA11y } from '../context/A11yContext';

const BreathingExercise: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala' | 'Espera'>('Inhala');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const { t } = useA11y();

  // Keyboard accessibility: Escape to close, Space to pause/play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const getPhaseTranslation = (p: typeof phase) => {
    switch (p) {
      case 'Inhala':
        return t('breath.inhale');
      case 'Mantén':
        return t('breath.hold');
      case 'Exhala':
        return t('breath.exhale');
      case 'Espera':
        return t('breath.wait');
      default:
        return p;
    }
  };

  return (
    <div className="breathing-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="breathing-modal-title">
      <div className="breathing-card animate-scale-in">
        <button 
          className="breathing-close-btn" 
          onClick={onClose} 
          title={t('breath.close')}
          aria-label={t('breath.close')}
        >
          <X size={24} aria-hidden="true" />
        </button>
        
        <div className="breathing-content">
          <h1 id="breathing-modal-title" className="sr-only">{t('breath.title')}</h1>
          <div className="cycles-badge">{t('breath.cycle')} {cycles} / 4</div>
          
          <div className="breathing-circle-container">
            <div 
              className={`breathing-circle ${phase === 'Inhala' ? 'expand' : phase === 'Exhala' ? 'shrink' : ''}`}
              aria-label={`${t('breath.title')}: ${getPhaseTranslation(phase)}`}
            >
              <Wind size={40} className="text-white" aria-hidden="true" />
            </div>
          </div>
          
          <div className="breathing-info">
            <h2 className="phase-text" aria-live="assertive">{getPhaseTranslation(phase)}</h2>
            <div className="timer-display" aria-live="polite">{seconds}s</div>
            <p className="instruction-text">{t('breath.instruction')}</p>
          </div>
          
          <div className="breathing-controls">
            <button 
              className={`btn-circle ${isActive ? 'active' : ''}`} 
              onClick={() => setIsActive(!isActive)}
              aria-label={isActive ? t('breath.pause') : t('breath.start')}
              title={isActive ? t('breath.pause') : t('breath.start')}
            >
              {isActive ? <Pause size={28} aria-hidden="true" /> : <Play size={28} aria-hidden="true" />}
            </button>
            <button 
              className="btn-circle secondary" 
              onClick={() => { setIsActive(false); setSeconds(4); setPhase('Inhala'); setCycles(0); }}
              aria-label={t('breath.reset')}
              title={t('breath.reset')}
            >
              <RefreshCw size={22} aria-hidden="true" />
            </button>
          </div>

          {cycles >= 4 && (
            <button className="btn-finish-exercise animate-bounce-in" onClick={onClose}>
              {t('breath.finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
