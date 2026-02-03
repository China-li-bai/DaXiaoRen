import React, { useState } from 'react';
import { VillainData, VillainType, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { identifyVillain } from '../services/geminiService';
import { checkContentCompliance, sanitizeInput } from '../services/contentModeration';


interface Props {
  lang: Language;
  onSubmit: (data: VillainData) => void;
}

const VillainForm: React.FC<Props> = ({ lang, onSubmit }) => {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<'MANUAL' | 'SEARCH'>('SEARCH');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<VillainType>(VillainType.BOSS);
  const [reason, setReason] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  const [complianceResult, setComplianceResult] = useState<ReturnType<typeof checkContentCompliance> | null>(null);

  const handleCheck = (input: string) => {
    const result = checkContentCompliance(input, lang);
    setComplianceResult(result);
    return result;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const sanitizedQuery = sanitizeInput(searchQuery);
    const check = handleCheck(sanitizedQuery);
    if (!check.passed && check.severity === 'error') return;

    setIsSearching(true);
    const result = await identifyVillain(sanitizedQuery, lang);
    setIsSearching(false);

    setName(result.name);
    setReason(result.reason);
    setMode('MANUAL');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const sanitizedName = sanitizeInput(name);
    const check = handleCheck(sanitizedName);
    if (!check.passed && check.severity === 'error') return;
    
    onSubmit({ name: sanitizedName, type, reason, imageUrl });
  };

  return (
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-amber-600/30 shadow-2xl animate-fade-in-up">
      <div className="flex mb-6 border-b border-slate-700">
        <button
          onClick={() => setMode('SEARCH')}
          className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${
            mode === 'SEARCH' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {lang === 'en' ? 'Smart Search' : '智能搜索'}
        </button>
        <button
          onClick={() => setMode('MANUAL')}
          className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${
            mode === 'MANUAL' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {lang === 'en' ? 'Manual Input' : '手动输入'}
        </button>
      </div>

      {/* Content Warning Banner */}
      <div className="mb-4 bg-amber-900/30 border border-amber-600/50 p-3 rounded text-xs text-amber-200">
          {lang === 'en' 
            ? "⚠️ IMPORTANT: Enter fictional names only! This is a game - do NOT enter real people's names. Violations may result in account termination." 
            : "⚠️ 重要提示：请勿输入真实人名！这只是虚拟游戏，禁止输入任何真实姓名。违规将可能导致账号被封禁。"}
      </div>

      {mode === 'SEARCH' ? (
         <form onSubmit={handleSearch} className="space-y-4">
           <div>
             <label className="block text-slate-300 mb-1 text-sm font-semibold">
                {lang === 'en' ? 'Who are you looking for?' : '你要打谁？'}
             </label>
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => {
                   setSearchQuery(e.target.value);
                   handleCheck(e.target.value);
               }}
               placeholder={lang === 'en' ? "e.g., My Micromanaging Boss" : "例如：我的老板"}
               className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                 complianceResult?.severity === 'error' 
                   ? 'border-red-500 focus:ring-red-500' 
                   : 'border-slate-700'
               }`}
             />
             {complianceResult && complianceResult.severity === 'warning' && (
               <p className="text-amber-400 text-xs mt-1">⚠️ {complianceResult.reason}</p>
             )}
             <p className="text-xs text-slate-500 mt-2">
               {lang === 'en' 
                 ? "AI will search Google to find the name and role." 
                 : "AI 将通过谷歌搜索自动查找人名和职位。"}
             </p>
           </div>
           <button
             type="submit"
             disabled={isSearching || (complianceResult?.severity === 'error')}
             className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSearching ? (
               <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 {lang === 'en' ? 'Searching...' : '搜索中...'}
               </span>
             ) : (
               lang === 'en' ? 'Find Villain' : '查找小人'
             )}
           </button>
         </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-semibold">{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                  setName(e.target.value);
                  handleCheck(e.target.value);
              }}
              placeholder={t.placeholderName}
              className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                complianceResult?.severity === 'error' 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-slate-700'
              }`}
              required
            />
            {complianceResult && complianceResult.severity === 'warning' && (
              <p className="text-amber-400 text-xs mt-1">⚠️ {complianceResult.reason}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm font-semibold">{t.typeLabel}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as VillainType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {Object.values(VillainType).map((vt) => (
                <option key={vt} value={vt}>
                  {t.types[vt]}
                </option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-slate-300 mb-1 text-sm font-semibold">
               {lang === 'en' ? 'Upload Avatar (Optional)' : '上传头像 / 照片 (选填)'}
             </label>
             <div className="flex items-center gap-4">
               {imageUrl && (
                 <img src={imageUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-amber-500" />
               )}
               <input
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                 className="block w-full text-sm text-slate-400
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-slate-700 file:text-amber-500
                   hover:file:bg-slate-600 cursor-pointer"
               />
             </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-sm font-semibold">{t.reasonLabel}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.placeholderReason}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none h-20 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95 border border-red-500 mt-4"
          >
            {t.submit}
          </button>
        </form>
      )}
    </div>
  );
};

export default VillainForm;