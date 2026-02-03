import React, { useState } from 'react';
import { VillainData, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  villain: VillainData;
  onClose: () => void;
}

const ShareModal: React.FC<Props> = ({ lang, villain, onClose }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}${window.location.pathname}?assist=${Date.now()}&villain=${encodeURIComponent(villain.name)}`;
  
  const shareText = lang === 'zh' 
    ? `气死我了！我正在打小人【${villain.name}】，快来帮我补两刀！点击链接直接开打！`
    : `I can't take it anymore! Help me beat "${villain.name}" in this digital ritual. Click to join the fight!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-amber-600/50 p-6 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👋</div>
          <h3 className="text-xl font-bold text-amber-400 font-serif">{t.shareTitle}</h3>
          <p className="text-slate-400 text-sm mt-2">{t.shareDesc.replace('{name}', villain.name)}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg mb-4">
          <p className="text-slate-300 text-sm italic">"{shareText.substring(0, 50)}..."</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg transition-colors"
          >
            {navigator.share ? (lang === 'zh' ? '分享给好友' : 'Share Now') : (lang === 'zh' ? '复制链接' : 'Copy Link')}
          </button>
          
          {navigator.share && (
            <button
              onClick={handleCopy}
              className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {copied ? '✓' : '📋'}
            </button>
          )}
        </div>

        {copied && (
          <p className="text-center text-green-400 text-sm mt-3 animate-pulse">
            {t.copied}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            {lang === 'zh' ? '好友点击链接即可加入助阵，无需消耗功德' : 'Friends can join for free via the link - no karma required!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
