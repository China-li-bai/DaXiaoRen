import React, { useState, useEffect } from 'react';
import { AppStep, Language, VillainData, ChantResponse, ResolutionResponse } from './types';
import { TRANSLATIONS, PAYMENT_CONFIG } from './constants';
import { generateRitualChant, generateResolution } from './services/geminiService';
import LanguageSwitch from './components/LanguageSwitch';
import VillainForm from './components/VillainForm';
import RitualStage from './components/RitualStage';
import Conclusion from './components/Conclusion';
import PaymentModal from './components/PaymentModal';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [villain, setVillain] = useState<VillainData | null>(null);
  const [chant, setChant] = useState<ChantResponse | null>(null);
  const [resolution, setResolution] = useState<ResolutionResponse | null>(null);
  
  // Credits System
  const [credits, setCredits] = useState<number>(PAYMENT_CONFIG.freeCredits);
  const [showPayment, setShowPayment] = useState(false);

  const t = TRANSLATIONS[lang];

  // Optional: Persist credits to local storage
  useEffect(() => {
    const savedCredits = localStorage.getItem('vs_credits');
    if (savedCredits) {
      setCredits(parseInt(savedCredits, 10));
    }
  }, []);

  const saveCredits = (amount: number) => {
    setCredits(amount);
    localStorage.setItem('vs_credits', amount.toString());
  };

  const handleStart = () => {
    if (!hasAgreed) return;

    if (credits > 0) {
      setStep(AppStep.INPUT);
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = () => {
    saveCredits(credits + 5); // Add 5 credits on "payment"
    setShowPayment(false);
    // If we were blocked at start, go to input
    if (step === AppStep.INTRO) {
        setStep(AppStep.INPUT);
    }
  };

  const handleFormSubmit = async (data: VillainData) => {
    // Double check credits before API call
    if (credits <= 0) {
        setShowPayment(true);
        return;
    }

    setVillain(data);
    setStep(AppStep.PREPARING);
    // Call Gemini to generate chant
    const result = await generateRitualChant(data, lang);
    setChant(result);
    setStep(AppStep.RITUAL);
  };

  const handleRitualComplete = async () => {
    setStep(AppStep.RESOLVING);
    
    // Deduct credit here
    if (credits > 0) {
        saveCredits(credits - 1);
    }

    if (villain) {
      const res = await generateResolution(villain, lang);
      setResolution(res);
      setStep(AppStep.CONCLUSION);
    }
  };

  const handleReset = () => {
    setVillain(null);
    setChant(null);
    setResolution(null);
    setHasAgreed(false); 
    setStep(AppStep.INTRO);
  };

  // Background visual elements
  const renderBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[100px]" />
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative font-serif text-slate-100 overflow-hidden">
      {renderBackground()}
      
      <LanguageSwitch lang={lang} setLang={setLang} />

      {/* Credit Counter */}
      <div className="absolute top-4 left-4 z-40 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2 text-amber-500 cursor-pointer hover:bg-slate-800 transition-colors"
           onClick={() => setShowPayment(true)}>
         <span>🪙</span>
         <span>{credits}</span>
         <span className="text-slate-500 text-xs ml-1 hover:text-white">+</span>
      </div>

      <main className="z-10 w-full flex flex-col items-center justify-center flex-grow">
        
        {step === AppStep.INTRO && (
          <div className="text-center animate-fade-in space-y-8 max-w-2xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 drop-shadow-sm mb-2">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 tracking-widest uppercase">
              {t.subtitle}
            </p>
            
            <div className="mt-12">
               {/* Decorative Shoes Icon */}
               <div className="flex justify-center gap-4 mb-8 opacity-70">
                 <span className="text-4xl">👞</span>
                 <span className="text-4xl">⚡</span>
                 <span className="text-4xl">🐯</span>
               </div>

               {/* Disclaimer Box */}
               <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700 backdrop-blur-sm text-left mb-8 shadow-xl">
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
                    {t.disclaimer}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 border-2 border-slate-500 rounded bg-slate-800 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                      <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className={`text-sm font-medium transition-colors select-none ${hasAgreed ? 'text-amber-400' : 'text-slate-300 group-hover:text-white'}`}>
                      {t.agreeLabel}
                    </span>
                  </label>
               </div>

              <button
                onClick={handleStart}
                disabled={!hasAgreed}
                className={`group relative px-8 py-4 bg-slate-800 border-2 border-red-600 text-red-500 font-bold text-xl uppercase tracking-widest rounded transition-all duration-300 ${
                  hasAgreed 
                    ? 'hover:bg-red-900/30 hover:text-red-400 cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                    : 'opacity-50 grayscale cursor-not-allowed'
                }`}
              >
                <span className={`absolute inset-0 w-full h-full bg-red-600/10 blur opacity-0 transition-opacity ${hasAgreed ? 'group-hover:opacity-100' : ''}`} />
                {credits > 0 ? t.start : t.recharge}
              </button>
            </div>
          </div>
        )}

        {step === AppStep.INPUT && (
          <VillainForm lang={lang} onSubmit={handleFormSubmit} />
        )}

        {step === AppStep.PREPARING && (
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-amber-500">{t.generating}</h2>
            <p className="text-slate-400 mt-2 text-sm">{lang === 'en' ? "Consulting the digital spirits..." : "正在连接赛博神婆..."}</p>
          </div>
        )}

        {step === AppStep.RITUAL && villain && chant && (
          <RitualStage 
            lang={lang} 
            villain={villain} 
            chantData={chant} 
            onComplete={handleRitualComplete} 
          />
        )}

        {step === AppStep.RESOLVING && (
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-blue-400">{t.resolving}</h2>
          </div>
        )}

        {step === AppStep.CONCLUSION && resolution && (
          <Conclusion 
            lang={lang} 
            resolution={resolution} 
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal 
            lang={lang} 
            onPaymentComplete={handlePaymentSuccess} 
            onClose={() => setShowPayment(false)} 
        />
      )}

      <footer className="z-10 mt-8 text-slate-600 text-xs text-center pb-4">
        © {new Date().getFullYear()} VillainSmash. 
        <br/>
        {lang === 'en' ? 'Digital Ritual.' : '赛博仪式 · 心诚则灵'}
      </footer>
    </div>
  );
};

export default App;
