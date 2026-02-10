import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface OnboardingData {
  age: number;
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

const Onboarding: React.FC<Props> = ({ onComplete, onSkip, lang }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    age: 25,
    gender: 'male',
    stressTypes: [],
    sleepPattern: 'normal',
    exercise: 'moderate',
    socialActivity: 'moderate'
  });

  const t = TRANSLATIONS[lang];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(data);
  };

  const toggleStressType = (type: string) => {
    setData(prev => ({
      ...prev,
      stressTypes: prev.stressTypes.includes(type)
        ? prev.stressTypes.filter(t => t !== type)
        : [...prev.stressTypes, type]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step1Title}</h2>
      <p className="text-slate-300">{t.step1Desc}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <label className="block text-sm text-slate-400 mb-3">{t.age}</label>
          <input
            type="number"
            min="18"
            max="80"
            value={data.age}
            onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 18 })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <label className="block text-sm text-slate-400 mb-3">{t.gender}</label>
          <div className="grid grid-cols-3 gap-2">
            {['male', 'female', 'other'].map(gender => (
              <button
                key={gender}
                onClick={() => setData({ ...data, gender })}
                className={`py-3 rounded-lg border-2 transition-all ${
                  data.gender === gender
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                {t[gender as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step2Title}</h2>
      <p className="text-slate-300">{t.step2Desc}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(t.stressTypes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleStressType(key)}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.stressTypes.includes(key)
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">
              {key === 'work' && '💼'}
              {key === 'relationship' && '💔'}
              {key === 'health' && '🤒'}
              {key === 'finance' && '💰'}
              {key === 'study' && '📚'}
              {key === 'anxiety' && '😰'}
              {key === 'insomnia' && '😴'}
              {key === 'anger' && '😡'}
            </div>
            <div className="text-xs">{value}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step3Title}</h2>
      <p className="text-slate-300">{t.step3Desc}</p>
      
      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <label className="block text-sm text-slate-400 mb-3">{t.sleepPattern}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(t.sleepPatterns).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setData({ ...data, sleepPattern: key })}
                className={`py-3 rounded-lg border-2 transition-all ${
                  data.sleepPattern === key
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-sm">{value}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <label className="block text-sm text-slate-400 mb-3">{t.exercise}</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(t.exerciseLevels).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setData({ ...data, exercise: key })}
                className={`py-3 rounded-lg border-2 transition-all ${
                  data.exercise === key
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-xs">{value}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <label className="block text-sm text-slate-400 mb-3">{t.socialActivity}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(t.socialLevels).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setData({ ...data, socialActivity: key })}
                className={`py-3 rounded-lg border-2 transition-all ${
                  data.socialActivity === key
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="text-sm">{value}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step4Title}</h2>
      <p className="text-slate-300">{t.step4Desc}</p>
      
      <div className="bg-gradient-to-br from-amber-900/30 to-red-900/30 rounded-lg p-6 border-2 border-amber-500">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-amber-400 mb-2">
            {lang === 'zh' ? '你的个性化策略已生成' : 'Your personalized strategy is ready'}
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">📊</span>
              <span>{lang === 'zh' ? '基于行为心理学分析' : 'Based on behavioral psychology analysis'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🧠</span>
              <span>{lang === 'zh' ? '个性化压力缓解方案' : 'Personalized stress relief plan'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>{lang === 'zh' ? '即时反馈系统' : 'Instant feedback system'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-2xl">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔮</div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
          {t.onboardingTitle}
        </h1>
        <p className="text-slate-400 mt-2">{t.onboardingSubtitle}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 mx-1 rounded transition-all ${
                s <= step ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>

      <div className="min-h-[300px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {step === 4 ? (
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            {t.submitDiagnosis}
          </button>

          <button
            onClick={onSkip}
            className="w-full text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors"
          >
            {t.skipOnboarding}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex-1 font-bold py-3 rounded-lg transition-all ${
              step === 1
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {t.prev}
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
