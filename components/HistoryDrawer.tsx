import React from 'react';
import { VillainRecord, Language, VillainType } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  records: VillainRecord[];
  onSelect: (record: VillainRecord) => void;
  onDelete: (id: string) => void;
}

const HistoryDrawer: React.FC<Props> = ({ lang, isOpen, onClose, records, onSelect, onDelete }) => {
  const t = TRANSLATIONS[lang];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-amber-900/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-amber-900/30 flex justify-between items-center bg-slate-800">
          <h2 className="text-amber-500 font-bold text-lg flex items-center gap-2">
            <span>📜</span> {t.historyTitle}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {records.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 italic">
              {t.noHistory}
            </div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id} 
                className="group relative bg-slate-800 border border-slate-700 rounded-lg p-3 transition-all hover:border-amber-500 hover:shadow-lg cursor-pointer flex gap-3"
                onClick={() => onSelect(record)}
              >
                {/* Avatar / Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center border border-slate-600">
                   {record.imageUrl ? (
                     <img src={record.imageUrl} alt={record.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-2xl">👤</span>
                   )}
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="text-slate-200 font-bold text-sm truncate">{record.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{t.types[record.type]}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions (appear on hover) */}
                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                     className="text-slate-600 hover:text-red-500 p-1"
                     title={t.deleteRecord}
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <polyline points="3 6 5 6 21 6"></polyline>
                       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                     </svg>
                   </button>
                </div>
                
                <div className="absolute bottom-2 right-2">
                   <span className="text-xs text-amber-600 font-bold bg-amber-900/20 px-2 py-0.5 rounded">
                     {t.loadRecord}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;
