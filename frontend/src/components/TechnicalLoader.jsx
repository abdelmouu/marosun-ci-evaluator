import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function TechnicalLoader() {
  const { apiData, apiError, setAppPhase } = useAppContext();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(0);
  const [showError, setShowError] = useState(false);
  
  // Initialisation à null pour un rendu strictement pur et idempotent
  const startTime = useRef(null);

  // 1. Déclenchement au montage (Side-effects autorisés ici)
  useEffect(() => {
    // On capture le timestamp exact du montage ici
    startTime.current = Date.now();

    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1000);
    return () => { 
      clearTimeout(timer1); 
      clearTimeout(timer2); 
    };
  }, []);

  // 2. Écoute de la réponse API et gestion du temps minimum perçu (1200ms)
  useEffect(() => {
    if (apiData || apiError) {
      // Sécurité : au cas où l'API répondrait avant l'exécution du premier useEffect
      const start = startTime.current || Date.now();
      const timePassed = Date.now() - start;
      const minDelay = 1200;
      const remainingTime = Math.max(0, minDelay - timePassed);

      const transitionTimer = setTimeout(() => {
        if (apiError) {
          setShowError(true);
          setStep(3);
          setTimeout(() => setAppPhase('dashboard'), 3000);
        } else {
          setStep(3);
          setTimeout(() => setAppPhase('dashboard'), 300);
        }
      }, remainingTime);

      return () => clearTimeout(transitionTimer);
    }
  }, [apiData, apiError, setAppPhase]);

  const messages = [
    t('loader.ingesting_nasa'),
    t('loader.generating_load'),
    t('loader.modeling_law')
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-card-surface border border-card-border rounded-sm p-8 flex flex-col items-center">
        
        {!showError ? (
          <svg className="w-12 h-12 animate-spin text-brand mb-8" viewBox="0 0 50 50">
            <circle 
              cx="25" 
              cy="25" 
              r="20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeDasharray="80 125" 
              strokeLinecap="round" 
            />
          </svg>
        ) : (
          <div className="w-12 h-12 rounded-sm bg-rose-100 flex items-center justify-center mb-8 animate-in zoom-in duration-300">
            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        )}

        <div className="w-full flex flex-col gap-4">
          {messages.map((msg, idx) => {
            const isVisible = step >= idx;
            const isDone = step > idx || (step === 3 && !showError);
            const isActive = step === idx && !showError;

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <div className="mt-1.5 shrink-0">
                  <div className={`w-2 h-2 rounded-sm transition-colors duration-300 ${
                    isDone ? 'bg-data-co2' :
                    isActive ? 'bg-brand animate-pulse' :
                    'bg-text-faint'
                  }`} />
                </div>
                
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDone || step === 3 ? 'text-text-heading' : 
                  isActive ? 'text-text-body' : 
                  'text-text-muted'
                }`}>
                  {msg}
                </p>
              </div>
            );
          })}
        </div>

        {showError && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-sm w-full animate-in fade-in zoom-in-95 duration-300">
            <p className="text-sm font-semibold text-rose-600 text-center leading-relaxed">
              {t('loader.nasa_unavailable')}
              <br/>
              <span className="text-xs font-medium text-rose-500">{t('loader.failing_over')}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}