import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import ProgressIndicator from './ui/ProgressIndicator';
import GlassCard from './ui/GlassCard';
import SmoothTransition from './ui/SmoothTransition';

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
  const [isAnimating, setIsAnimating] = useState(false);

  const t = TRANSLATIONS[lang];
  const totalSteps = 3;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [step]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!data.birthYear || data.birthYear < 1950 || data.birthYear > 2010) {
        newErrors.birthYear = lang === 'zh' ? '请输入有效的出生年份' : 'Please enter a valid birth year';
      }
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

  const renderStep1 = () => (
    <SmoothTransition>
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">
          {t.step1Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">
          {t.step1Desc}
        </p>
        
        <GlassCard className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-3 font-medium">
              {lang === 'zh' ? '出生日期' : 'Birth Date'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  {lang === 'zh' ? '年' : 'Year'}
                </label>
                <input
                  type="number"
                  min="1950"
                  max="2010"
                  value={data.birthYear}
                  onChange={(e) => setData({ ...data, birthYear: parseInt(e.target.value) || 1995 })}
                  className={`w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-amber-500 focus:outline-none transition-all ${
                    errors.birthYear ? 'border-red-500' : ''
                  }`}
                />
                {errors.birthYear && (
                  <p className="text-red-400 text-xs mt-1">{errors.birthYear}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  {lang === 'zh' ? '月' : 'Month'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={data.birthMonth}
                  onChange={(e) => setData({ ...data, birthMonth: parseInt(e.target.value) || 1 })}
                  className={`w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-amber-500 focus:outline-none transition-all ${
                    errors.birthMonth ? 'border-red-500' : ''
                  }`}
                />
                {errors.birthMonth && (
                  <p className="text-red-400 text-xs mt-1">{errors.birthMonth}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  {lang === 'zh' ? '日' : 'Day'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={data.birthDay}
                  onChange={(e) => setData({ ...data, birthDay: parseInt(e.target.value) || 1 })}
                  className={`w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-amber-500 focus:outline-none transition-all ${
                    errors.birthDay ? 'border-red-500' : ''
                  }`}
                />
                {errors.birthDay && (
                  <p className="text-red-400 text-xs mt-1">{errors.birthDay}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-3 font-medium">
              {lang === 'zh' ? '出生时辰' : 'Birth Hour'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
                <button
                  key={hour}
                  onClick={() => setData({ ...data, birthHour: hour })}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    data.birthHour === hour
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {hour}:00
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {lang === 'zh' ? '选择大致出生时段即可' : 'Select approximate birth time period'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-3 font-medium">{t.gender}</label>
            <div className="grid grid-cols-3 gap-2">
              {['male', 'female', 'other'].map(gender => (
                <button
                  key={gender}
                  onClick={() => setData({ ...data, gender })}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    data.gender === gender
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {t[gender as keyof typeof t]}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </SmoothTransition>
  );

  const renderStep2 = () => (
    <SmoothTransition>
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">
          {t.step2Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">
          {t.step2Desc}
        </p>
        
        <GlassCard className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(t.stressTypes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => toggleStressType(key)}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${
                  data.stressTypes.includes(key)
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105 shadow-amber-500/20'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">{getStressIcon(key)}</div>
                <div className="text-xs">{value}</div>
              </button>
            ))}
          </div>
          {errors.stressTypes && (
            <p className="text-red-400 text-sm mt-4 text-center">{errors.stressTypes}</p>
          )}
        </GlassCard>
      </div>
    </SmoothTransition>
  );

  const renderStep3 = () => (
    <SmoothTransition>
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">
          {t.step3Title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">
          {t.step3Desc}
        </p>
        
        <GlassCard className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-3 font-medium">
              {lang === 'zh' ? '睡眠模式' : 'Sleep Pattern'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['poor', 'normal', 'good'].map(pattern => (
                <button
                  key={pattern}
                  onClick={() => setData({ ...data, sleepPattern: pattern })}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    data.sleepPattern === pattern
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
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
            <label className="block text-sm text-slate-400 mb-3 font-medium">
              {lang === 'zh' ? '运动频率' : 'Exercise Frequency'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'moderate', 'high'].map(freq => (
                <button
                  key={freq}
                  onClick={() => setData({ ...data, exercise: freq })}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    data.exercise === freq
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
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
            <label className="block text-sm text-slate-400 mb-3 font-medium">
              {lang === 'zh' ? '社交活动' : 'Social Activity'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'moderate', 'high'].map(activity => (
                <button
                  key={activity}
                  onClick={() => setData({ ...data, socialActivity: activity })}
                  className={`py-3 rounded-lg border-2 transition-all font-medium ${
                    data.socialActivity === activity
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
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
        </GlassCard>
      </div>
    </SmoothTransition>
  );

  const getStressIcon = (key: string) => {
    const icons: Record<string, string> = {
      work: '💼',
      relationship: '💔',
      health: '🤒',
      finance: '💰',
      study: '📚',
      anxiety: '😰',
      insomnia: '😴',
      anger: '😡'
    };
    return icons[key] || '😰';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator current={step} total={totalSteps} lang={lang} />
        
        <div className="mt-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              step === 1
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {lang === 'zh' ? '上一步' : 'Previous'}
          </button>
          
          {step === totalSteps ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all transform hover:scale-105 active:scale-95"
            >
              {lang === 'zh' ? '开始诊断' : 'Start Diagnosis'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all transform hover:scale-105 active:scale-95"
            >
              {lang === 'zh' ? '下一步' : 'Next'}
            </button>
          )}
        </div>
        
        <button
          onClick={onSkip}
          className="mt-4 w-full text-slate-500 hover:text-slate-400 text-sm transition-colors"
        >
          {lang === 'zh' ? '跳过诊断' : 'Skip Diagnosis'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;