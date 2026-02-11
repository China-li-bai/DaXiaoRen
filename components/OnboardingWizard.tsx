import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import ProgressIndicator from './ui/ProgressIndicator';
import CyberBackground from './ui/CyberBackground';
import InteractiveBaguaWheel from './Inter31activeBaguaWheel';
import { AlertTriangle, Battery, Zap, Trees, ShieldAlert, Briefcase, Heart, Activity, DollarSign, BookOpen, Frown, Moon, Angry } from 'lucide-react';

export interface OnboardingData {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: string;
  stressTypes: string[];
  sleepPattern: string;
  exercise: string;
  socialActivity: string;
}

interface Props {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  lang: Language;
}

const THEME = {
  colors: {
    bg: '#000000',
    red: '#FF3B30',
    green: '#00FF41',
    gold: '#FFD700',
    grey: '#4A4A4A',
  },
  fonts: {
    title: '"Press Start 2P", cursive',
    body: '"Inter", sans-serif',
  }
};

const OnboardingWizard: React.FC<Props> = ({ onComplete, onSkip, lang }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    birthYear: 1995,
    birthMonth: 6,
    birthDay: 15,
    birthHour: 12,
    gender: 'male',
    stressTypes: [],
    sleepPattern: 'normal',
    exercise: 'moderate',
    socialActivity: 'moderate'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [charging, setCharging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = TRANSLATIONS[lang];
  const totalSteps = 3;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!data.birthMonth || data.birthMonth < 1 || data.birthMonth > 12) {
        newErrors.birthMonth = lang === 'zh' ? '请输入有效的月份' : 'Please enter a valid month';
      }
      if (!data.birthDay || data.birthDay < 1 || data.birthDay > 31) {
        newErrors.birthDay = lang === 'zh' ? '请输入有效的日期' : 'Please enter a valid day';
      }
    }

    if (currentStep === 2) {
      if (data.stressTypes.length === 0) {
        newErrors.stressTypes = lang === 'zh' ? '请至少选择一个压力类型' : 'Please select at least one stress type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      onComplete(data);
    }
  };

  const toggleStressType = (type: string) => {
    setData(prev => ({
      ...prev,
      stressTypes: prev.stressTypes.includes(type)
        ? prev.stressTypes.filter(t => t !== type)
        : [...prev.stressTypes, type]
    }));
    setErrors(prev => ({ ...prev, stressTypes: '' }));
  };

  const startCharge = () => {
    if (isFull) return;
    setCharging(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          setIsFull(true);
          setTimeout(() => handleSubmit(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const endCharge = () => {
    if (isFull) return;
    setCharging(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  const getStressIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      work: <Briefcase size={32} />,
      relationship: <Heart size={32} />,
      health: <Activity size={32} />,
      finance: <DollarSign size={32} />,
      study: <BookOpen size={32} />,
      anxiety: <Frown size={32} />,
      insomnia: <Moon size={32} />,
      anger: <Angry size={32} />
    };
    return icons[key] || <Frown size={32} />;
  };

  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      wood: '#00FF41',
      fire: '#FF3B30',
      earth: '#FFD700',
      metal: '#C0C0C0',
      water: '#3B82F6'
    };
    return colors[element] || '#FFFFFF';
  };

  const getElementIcon = (element: string) => {
    const icons: Record<string, React.ReactNode> = {
      wood: <Trees size={48} />,
      fire: <Zap size={48} />,
      earth: <ShieldAlert size={48} />,
      metal: <AlertTriangle size={48} />,
      water: <Activity size={48} />
    };
    return icons[element] || <Trees size={48} />;
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border border-[#FF3B30] bg-[#FF3B30]/10 p-3 flex items-center justify-center gap-2 animate-pulse">
        <AlertTriangle color="#FF3B30" size={20} />
        <span className="text-[#FF3B30] text-xs font-bold tracking-widest" style={{ fontFamily: THEME.fonts.body }}>
          STEP 1: BIRTH DATA INPUT
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2" style={{ fontFamily: THEME.fonts.title }}>
          {t.step1Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base" style={{ fontFamily: THEME.fonts.body }}>
          {t.step1Desc}
        </p>
      </div>

      <div className="bg-black/80 backdrop-blur-sm border border-[#4A4A4A]/50 p-6 space-y-6">
        <div>
          <label className="block text-sm text-[#4A4A4A] mb-4 font-medium text-center font-mono">
            BIRTH_YEAR: {data.birthYear}
          </label>
          <InteractiveBaguaWheel
            value={data.birthYear}
            onChange={(year) => setData({ ...data, birthYear: year })}
            min={1950}
            max={2010}
            lang={lang}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">MONTH</label>
            <input
              type="number"
              min="1"
              max="12"
              value={data.birthMonth}
              onChange={(e) => setData({ ...data, birthMonth: parseInt(e.target.value) || 1 })}
              className={`w-full bg-black border-2 text-white rounded-lg px-4 py-3 font-mono text-center text-lg transition-all ${
                errors.birthMonth ? 'border-red-500' : 'border-[#4A4A4A] focus:border-[#FFD700]'
              }`}
            />
            {errors.birthMonth && (
              <p className="text-red-500 text-xs mt-1 font-mono">ERROR: INVALID MONTH</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">DAY</label>
            <input
              type="number"
              min="1"
              max="31"
              value={data.birthDay}
              onChange={(e) => setData({ ...data, birthDay: parseInt(e.target.value) || 1 })}
              className={`w-full bg-black border-2 text-white rounded-lg px-4 py-3 font-mono text-center text-lg transition-all ${
                errors.birthDay ? 'border-red-500' : 'border-[#4A4A4A] focus:border-[#FFD700]'
              }`}
            />
            {errors.birthDay && (
              <p className="text-red-500 text-xs mt-1 font-mono">ERROR: INVALID DAY</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">HOUR</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
              <button
                key={hour}
                onClick={() => setData({ ...data, birthHour: hour })}
                className={`py-2 rounded border-2 transition-all font-mono text-xs ${
                  data.birthHour === hour
                    ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]'
                    : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
                }`}
              >
                {hour}:00
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">GENDER</label>
          <div className="grid grid-cols-3 gap-2">
            {['male', 'female', 'other'].map(gender => (
              <button
                key={gender}
                onClick={() => setData({ ...data, gender })}
                className={`py-2 rounded border-2 transition-all font-mono text-xs ${
                  data.gender === gender
                    ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]'
                    : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
                }`}
              >
                {t[gender as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border border-[#FF3B30] bg-[#FF3B30]/10 p-3 flex items-center justify-center gap-2 animate-pulse">
        <AlertTriangle color="#FF3B30" size={20} />
        <span className="text-[#FF3B30] text-xs font-bold tracking-widest" style={{ fontFamily: THEME.fonts.body }}>
          STEP 2: STRESS PATTERN ANALYSIS
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2" style={{ fontFamily: THEME.fonts.title }}>
          {t.step2Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base" style={{ fontFamily: THEME.fonts.body }}>
          {t.step2Desc}
        </p>
      </div>

      <div className="w-full relative h-48 border-x border-[#4A4A4A]/50 flex items-center justify-between px-4 mb-6">
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-20 pointer-events-none">
          {[...Array(24)].map((_, i) => <div key={i} className="border border-[#4A4A4A]/30"></div>)}
        </div>

        <div className="flex flex-col items-center z-10">
          <span className="text-xs text-[#4A4A4A] mb-2 font-mono">USER_ID: {data.birthYear}</span>
          <div className="w-16 h-16 border-2 border-[#00FF41]/50 bg-[#00FF41]/10 rounded-lg flex items-center justify-center relative overflow-hidden">
            <motion.div
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 bg-[#FF3B30] mix-blend-overlay"
            />
            <Trees size={32} className="text-[#00FF41]" />
          </div>
          <h3 className="mt-2 text-sm font-bold text-[#00FF41]" style={{ fontFamily: THEME.fonts.title }}>
            本命木
          </h3>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <motion.div
            animate={{ rotate: [0, -45, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShieldAlert size={24} className="text-[#FF3B30] mb-1" />
          </motion.div>
          <div className="text-[10px] text-[#FF3B30] bg-black px-1 border border-[#FF3B30] font-mono">
            CONFLICT
          </div>
        </div>

        <div className="flex flex-col items-center z-10">
          <span className="text-xs text-[#4A4A4A] mb-2 font-mono">ENEMY: UNKNOWN</span>
          <div className="w-16 h-16 border-2 border-[#FFD700]/50 bg-[#FFD700]/10 rounded-lg flex items-center justify-center">
            <motion.div
              animate={{ x: [0, -5, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'anticipate' }}
            >
              <AlertTriangle size={32} className="text-[#FFD700]" />
            </motion.div>
          </div>
          <h3 className="mt-2 text-sm font-bold text-[#FFD700]" style={{ fontFamily: THEME.fonts.title }}>
            煞气
          </h3>
        </div>
      </div>

      <div className="bg-black/80 backdrop-blur-sm border border-[#4A4A4A]/50 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(t.stressTypes).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleStressType(key)}
              className={`p-3 rounded-xl border-2 transition-all font-mono text-xs ${
                data.stressTypes.includes(key)
                  ? 'border-[#FF3B30] bg-[#FF3B30]/20 text-[#FF3B30]'
                  : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
              }`}
            >
              <div className="flex justify-center mb-2">{getStressIcon(key)}</div>
              <div className="text-center">{value}</div>
            </button>
          ))}
        </div>
        {errors.stressTypes && (
          <p className="text-[#FF3B30] text-sm mt-4 text-center font-mono">ERROR: SELECT AT LEAST ONE</p>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border border-[#FF3B30] bg-[#FF3B30]/10 p-3 flex items-center justify-center gap-2 animate-pulse">
        <AlertTriangle color="#FF3B30" size={20} />
        <span className="text-[#FF3B30] text-xs font-bold tracking-widest" style={{ fontFamily: THEME.fonts.body }}>
          STEP 3: SYSTEM ACTIVATION
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2" style={{ fontFamily: THEME.fonts.title }}>
          {t.step3Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base" style={{ fontFamily: THEME.fonts.body }}>
          {t.step3Desc}
        </p>
      </div>

      <div className="bg-black/80 backdrop-blur-sm border border-[#4A4A4A]/50 p-6 space-y-6">
        <div>
          <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">SLEEP_PATTERN</label>
          <div className="grid grid-cols-3 gap-2">
            {['poor', 'normal', 'good'].map(pattern => (
              <button
                key={pattern}
                onClick={() => setData({ ...data, sleepPattern: pattern })}
                className={`py-2 rounded border-2 transition-all font-mono text-xs ${
                  data.sleepPattern === pattern
                    ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]'
                    : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
                }`}
              >
                {lang === 'zh'
                  ? (pattern === 'poor' ? '差' : pattern === 'normal' ? '一般' : '好')
                  : (pattern === 'poor' ? 'Poor' : pattern === 'normal' ? 'Normal' : 'Good')
                }
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">EXERCISE</label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'moderate', 'high'].map(freq => (
              <button
                key={freq}
                onClick={() => setData({ ...data, exercise: freq })}
                className={`py-2 rounded border-2 transition-all font-mono text-xs ${
                  data.exercise === freq
                    ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]'
                    : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
                }`}
              >
                {lang === 'zh'
                  ? (freq === 'low' ? '少' : freq === 'moderate' ? '中' : '多')
                  : (freq === 'low' ? 'Low' : freq === 'moderate' ? 'Moderate' : 'High')
                }
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#4A4A4A] mb-2 font-mono">SOCIAL_ACTIVITY</label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'moderate', 'high'].map(activity => (
              <button
                key={activity}
                onClick={() => setData({ ...data, socialActivity: activity })}
                className={`py-2 rounded border-2 transition-all font-mono text-xs ${
                  data.socialActivity === activity
                    ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]'
                    : 'border-[#4A4A4A] bg-black text-[#4A4A4A] hover:border-[#4A4A4A]'
                }`}
              >
                {lang === 'zh'
                  ? (activity === 'low' ? '少' : activity === 'moderate' ? '中' : '多')
                  : (activity === 'low' ? 'Low' : activity === 'moderate' ? 'Moderate' : 'High')
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-[#4A4A4A] mb-2 font-mono">
        <span>WEAPON: RED_SLIPPER</span>
        <span>ELEMENT: FIRE</span>
      </div>

      <button
        className="relative w-full h-16 bg-transparent border-2 border-[#FF3B30] overflow-hidden group active:scale-95 transition-transform"
        onPointerDown={startCharge}
        onPointerUp={endCharge}
        onPointerLeave={endCharge}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#FF3B30]"
          style={{ width: `${progress}%` }}
          transition={{ type: 'tween', ease: 'linear', duration: 0 }}
        />

        <div className="absolute inset-0 flex items-center justify-center gap-3 z-10 mix-blend-difference">
          {isFull ? (
            <>
              <Zap className="text-white animate-bounce" fill="white" />
              <span className="text-white font-bold tracking-wider" style={{ fontFamily: THEME.fonts.title }}>
                SYSTEM READY
              </span>
            </>
          ) : (
            <>
              <Battery className={`text-white ${charging ? 'animate-pulse' : ''}`} />
              <span className="text-white font-bold tracking-wider text-sm sm:text-base" style={{ fontFamily: THEME.fonts.title }}>
                {charging ? `CHARGING ${Math.floor(progress)}%` : 'HOLD TO ACTIVATE'}
              </span>
            </>
          )}
        </div>

        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#FF3B30] bg-black"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#FF3B30] bg-black"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#FF3B30] bg-black"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#FF3B30] bg-black"></div>
      </button>

      <p className="text-center text-[10px] text-[#4A4A4A] mt-4 opacity-60 font-mono">
        HOLD 1 SECOND TO ACTIVATE • PHYSICAL ENGINE PREHEATING
      </p>
    </motion.div>
  );

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Press+Start+2P&display=swap');`}</style>

      <CyberBackground />

      <div className="relative z-10 flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <ProgressIndicator current={step} total={totalSteps} lang={lang} />

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {step === 1 && <motion.div key="step1">{renderStep1()}</motion.div>}
              {step === 2 && <motion.div key="step2">{renderStep2()}</motion.div>}
              {step === 3 && <motion.div key="step3">{renderStep3()}</motion.div>}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={`px-6 py-3 rounded font-bold transition-all font-mono text-sm ${
                step === 1
                  ? 'bg-[#4A4A4A] text-[#4A4A4A]/50 cursor-not-allowed'
                  : 'bg-[#4A4A4A] hover:bg-[#4A4A4A]/80 text-white'
              }`}
            >
              &lt; PREV
            </button>

            {step === totalSteps ? null : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFD700]/80 hover:to-[#FFA500]/80 text-black transition-all transform hover:scale-105 active:scale-95 font-mono text-sm"
              >
                NEXT &gt;
              </button>
            )}
          </div>

          <button
            onClick={onSkip}
            className="mt-4 w-full text-[#4A4A4A] hover:text-[#4A4A4A]/80 text-xs transition-colors font-mono"
          >
            [ SKIP DIAGNOSIS ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
