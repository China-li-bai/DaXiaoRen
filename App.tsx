import React, { useState, useEffect, lazy } from 'react';
import { AppStep, Language, VillainData, ChantResponse, ResolutionResponse, VillainRecord, VillainType } from './types';
import { TRANSLATIONS, PAYMENT_CONFIG } from './constants';
import { generateRitualChant, generateResolution } from './services/workerService';
import { getLocalRecords, saveLocalRecord, deleteLocalRecord } from './services/storageService';
import LanguageSwitch from './components/LanguageSwitch';
import GlobalStats from './components/GlobalStats';
import LeaderboardWidget from './components/LeaderboardWidget';

const VillainForm = lazy(() => import('./components/VillainForm'));
const RitualStage = lazy(() => import('./components/RitualStage'));
const Conclusion = lazy(() => import('./components/Conclusion'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const HistoryDrawer = lazy(() => import('./components/HistoryDrawer'));
const ShareModal = lazy(() => import('./components/ShareModal'));

// Live Ticker Component
const LiveTicker: React.FC<{ lang: Language }> = ({ lang }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [show, setShow] = useState(true);
  const messages = TRANSLATIONS[lang].liveTicker || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setShow(true);
      }, 500); // Wait for fade out
    }, 4000); // Change every 4s

    return () => clearInterval(interval);
  }, [lang, messages.length]);

  return (
    <div className="fixed top-20 w-full flex justify-center pointer-events-none z-0">
      <div 
        className={`bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 px-4 py-1.5 rounded-full text-xs text-slate-400 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="mr-2 text-amber-500">●</span>
        {messages[msgIndex]}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [step, setStep] = useState<AppStep>(AppStep.INTRO);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [villain, setVillain] = useState<VillainData | null>(null);
  const [chant, setChant] = useState<ChantResponse | null>(null);
  const [resolution, setResolution] = useState<ResolutionResponse | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isAssistMode, setIsAssistMode] = useState(false);
  
  // Credits System
  const [credits, setCredits] = useState<number>(PAYMENT_CONFIG.freeCredits);
  const [showPayment, setShowPayment] = useState(false);

  // History System
  const [showHistory, setShowHistory] = useState(false);
  const [records, setRecords] = useState<VillainRecord[]>([]);
  
  // Share System
  const [showShare, setShowShare] = useState(false);
  const [pendingVillain, setPendingVillain] = useState<VillainData | null>(null);
  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [pendingLeaderboardClicks, setPendingLeaderboardClicks] = useState(0);
  const t = TRANSLATIONS[lang];

  // Initialize: Load credits, history, and CHECK URL PARAMS for Assist Mode
  useEffect(() => {
    const savedCredits = localStorage.getItem('vs_credits');
    if (savedCredits) {
      setCredits(parseInt(savedCredits, 10));
    }
    setRecords(getLocalRecords());

    // Check for "Assist Mode" params
    const params = new URLSearchParams(window.location.search);
    const isAssist = params.get('assist');
    const sharedName = params.get('villain');
    
    if (isAssist && sharedName) {
      console.log("Entering Assist Mode for:", sharedName);
      const sharedType = (params.get('type') as VillainType) || VillainType.BOSS;
      const sharedReason = params.get('reason') || '';
      
      setIsAssistMode(true);
      setVillain({
        name: sharedName,
        type: sharedType,
        reason: sharedReason
      });
      // In assist mode, we skip the chant generation API call to be fast (or mock it)
      setChant({
        chantLines: lang === 'zh' 
          ? ["助阵好友打小人", "一打小人头，霉运不再留", "二打小人手，贵人身边走", "三打小人身，转运要翻身"]
          : ["Helping a friend smash evil", "Banish the bad luck now", "Clear the path for good", "Strike with all your might"],
        ritualInstruction: lang === 'zh' ? "点击屏幕，帮朋友狠打！" : "Tap to help your friend smash!"
      });
      setHasAgreed(true);
      setStep(AppStep.RITUAL);
      
      // Clean URL so refresh doesn't stick in assist mode forever
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [lang]);

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
    saveCredits(credits + 5); 
    setShowPayment(false);
    if (step === AppStep.INTRO) {
        setStep(AppStep.INPUT);
    }
  };

  const handleFormSubmit = async (data: VillainData) => {
    if (credits <= 0) {
        setShowPayment(true);
        return;
    }

    setVillain(data);
    setStep(AppStep.PREPARING);
    
    // Call Gemini
    const result = await generateRitualChant(data, lang);
    setChant(result);
    
    // Save to History immediately
    const newRecord: VillainRecord = {
      ...data,
      id: Date.now().toString(),
      timestamp: Date.now(),
      chant: result
    };
    const updatedRecords = saveLocalRecord(newRecord);
    setRecords(updatedRecords);

    // Show share modal before entering ritual
    setPendingVillain(data);
    setShowShare(true);
  };

  const handleHistorySelect = (record: VillainRecord) => {
    if (credits <= 0) {
      setShowPayment(true);
      return;
    }
    
    // Restore state from record
    setVillain({
      name: record.name,
      type: record.type,
      reason: record.reason,
      imageUrl: record.imageUrl
    });
    
    // If chant exists in record, use it, otherwise regenerate
    if (record.chant) {
      setChant(record.chant);
      setStep(AppStep.RITUAL);
    } else {
      handleFormSubmit({
         name: record.name,
         type: record.type,
         reason: record.reason,
         imageUrl: record.imageUrl
      });
    }
    
    setShowHistory(false);
    if (step === AppStep.INTRO) {
        setHasAgreed(true); 
    }
  };

  const handleHistoryDelete = (id: string) => {
    const updated = deleteLocalRecord(id);
    setRecords(updated);
  };

  const handleRitualComplete = async () => {
    if (isResolving) return;
    setIsResolving(true);
    
    setStep(AppStep.RESOLVING);
    
    if (credits > 0 && !isAssistMode) {
        saveCredits(credits - 1);
    }

    if (villain) {
      const res = await generateResolution(villain, lang);
      setResolution(res);
      setStep(AppStep.CONCLUSION);
    }
    setIsResolving(false);
  };

  const handleReset = () => {
    setIsResolving(false);
    setIsAssistMode(false); 
    setVillain(null);
    setChant(null);
    setResolution(null);
    setHasAgreed(false); 
    setStep(AppStep.INTRO);
  };

  const renderBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[100px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative font-serif text-slate-100 overflow-hidden">
      {renderBackground()}
      
      <LiveTicker lang={lang} />
      
      <LanguageSwitch lang={lang} setLang={setLang} />

      {/* Credit Counter */}
      <div className="absolute top-4 left-4 z-40 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2 text-amber-500 cursor-pointer hover:bg-slate-800 transition-colors"
           onClick={() => setShowPayment(true)}>
         <span>🪙</span>
         <span>{credits}</span>
         <span className="text-slate-500 text-xs ml-1 hover:text-white">+</span>
      </div>

      {/* History Button */}
      {(step === AppStep.INTRO || step === AppStep.INPUT) && !isAssistMode && (
        <button 
          onClick={() => setShowHistory(true)}
          className="absolute top-16 left-4 z-40 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-full text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors shadow-lg"
          title={t.openHistory}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </button>
      )}
      {/* Leaderboard Widget */}
      <LeaderboardWidget 
         clicksToAdd={pendingLeaderboardClicks} 
         onClicksSent={() => setPendingLeaderboardClicks(0)}
         isOpen={showLeaderboard}
         onToggle={() => setShowLeaderboard(!showLeaderboard)}
      />
      <main className="z-10 w-full flex flex-col items-center justify-center flex-grow">
        
        {step === AppStep.INTRO && (
          <div className="text-center animate-fade-in space-y-8 max-w-2xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 drop-shadow-sm mb-2">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 tracking-widest uppercase">
              {t.subtitle}
            </p>
            
            <GlobalStats lang={lang} />
            
            <div className="mt-8">
               <div className="flex justify-center gap-4 mb-8 opacity-70">
                 <span className="text-4xl">👞</span>
                 <span className="text-4xl">⚡</span>
                 <span className="text-4xl">🐯</span>
               </div>

               <div className="bg-slate-900/80 p-5 rounded-lg border border-amber-600/40 backdrop-blur-sm text-left mb-8 shadow-xl max-w-lg mx-auto">
                  <div className="flex items-center gap-2 mb-3 text-amber-400">
                    <span className="text-lg">⚠️</span>
                    <span className="font-bold text-sm uppercase tracking-wider">{t.disclaimerTitle || 'Disclaimer'}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-300 leading-relaxed font-sans max-h-48 overflow-y-auto">
                    {t.disclaimer.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('1') || line.startsWith('2') || line.startsWith('3') || line.startsWith('4') || line.startsWith('5') ? 'mt-2 first:mt-0' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group mt-4">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 border-2 border-amber-500 rounded bg-slate-800 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
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
            isAssistMode={isAssistMode} 
          />
        )}

        {step === AppStep.RESOLVING && (
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-blue-400">{t.resolving}</h2>
          </div>
        )}

        {step === AppStep.CONCLUSION && resolution && villain && (
          <Conclusion 
            lang={lang} 
            resolution={resolution} 
            villain={villain}
            onReset={handleReset}
            isAssistMode={isAssistMode} 
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

      {/* History Drawer */}
      <HistoryDrawer 
        lang={lang}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        records={records}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
      />

      {/* Share Modal */}
      {showShare && pendingVillain && (
        <ShareModal
          lang={lang}
          villain={pendingVillain}
          onClose={() => {
            setShowShare(false);
            // Enter ritual after closing share modal
            if (villain && chant) {
              setStep(AppStep.RITUAL);
            }
          }}
        />
      )}

      <footer className="z-10 mt-8 text-slate-600 text-xs text-center pb-4">
        © {new Date().getFullYear()} VillainSmash. 
        <br/>
        {lang === 'en' ? 'Digital Ritual.' : '赛博仪式 · 心诚则灵'}
      </footer>
    </div>
  );
}