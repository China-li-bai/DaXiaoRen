import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { troubles } from '../utils/bazi';

interface OnboardingData {
  birthYear: number;
  bedDirection: string;
  doorDirection: string;
  currentTroubles: string[];
}

interface Props {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  lang: Language;
}

const directions = [
  { id: 'north', labelKey: 'north', icon: '⬆️' },
  { id: 'south', labelKey: 'south', icon: '⬇️' },
  { id: 'east', labelKey: 'east', icon: '➡️' },
  { id: 'west', labelKey: 'west', icon: '⬅️' },
  { id: 'northeast', labelKey: 'northeast', icon: '↗️' },
  { id: 'southeast', labelKey: 'southeast', icon: '↘️' },
  { id: 'northwest', labelKey: 'northwest', icon: '↖️' },
  { id: 'southwest', labelKey: 'southwest', icon: '↙️' }
];

const Onboarding: React.FC<Props> = ({ onComplete, onSkip, lang }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    birthYear: new Date().getFullYear() - 25,
    bedDirection: 'south',
    doorDirection: 'south',
    currentTroubles: []
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

  const toggleTrouble = (troubleId: string) => {
    setData(prev => ({
      ...prev,
      currentTroubles: prev.currentTroubles.includes(troubleId)
        ? prev.currentTroubles.filter(id => id !== troubleId)
        : [...prev.currentTroubles, troubleId]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step1Title}</h2>
      <p className="text-slate-300">{t.step1Desc}</p>
      
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <label className="block text-sm text-slate-400 mb-3">{t.birthYear}</label>
        <select
          value={data.birthYear}
          onChange={(e) => setData({ ...data, birthYear: parseInt(e.target.value) })}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-amber-500 focus:outline-none"
        >
          {Array.from({ length: 80 }, (_, i) => {
            const year = 1940 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step2Title}</h2>
      <p className="text-slate-300">{t.step2Desc}</p>
      
      <div className="grid grid-cols-4 gap-3">
        {directions.map((dir) => (
          <button
            key={dir.id}
            onClick={() => setData({ ...data, bedDirection: dir.id })}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.bedDirection === dir.id
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">{dir.icon}</div>
            <div className="text-xs">{t.directions[dir.labelKey as keyof typeof t.directions]}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step3Title}</h2>
      <p className="text-slate-300">{t.step3Desc}</p>
      
      <div className="grid grid-cols-4 gap-3">
        {directions.map((dir) => (
          <button
            key={dir.id}
            onClick={() => setData({ ...data, doorDirection: dir.id })}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.doorDirection === dir.id
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">{dir.icon}</div>
            <div className="text-xs">{t.directions[dir.labelKey as keyof typeof t.directions]}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">{t.step4Title}</h2>
      <p className="text-slate-300">{t.step4Desc}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {troubles.map((trouble) => (
          <button
            key={trouble.id}
            onClick={() => toggleTrouble(trouble.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              data.currentTroubles.includes(trouble.id)
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">{trouble.icon}</div>
            <div className="text-xs">{t.troubles[trouble.id as keyof typeof t.troubles]}</div>
          </button>
        ))}
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
              className={`h-1 flex-1 mx-1 rounded ${
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
