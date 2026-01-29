import React, { useState } from 'react';
import { Language, PaymentRegion } from '../types';
import { TRANSLATIONS, PAYMENT_CONFIG } from '../constants';

interface Props {
  lang: Language;
  onPaymentComplete: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ lang, onPaymentComplete, onClose }) => {
  const t = TRANSLATIONS[lang];
  const [region, setRegion] = useState<PaymentRegion>('CHINA');

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
            <span>🧧</span> {t.paymentTitle}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Region Switcher */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setRegion('CHINA')}
            className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
              region === 'CHINA' ? 'bg-amber-600/20 text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {t.payChina}
          </button>
          <button
            onClick={() => setRegion('GLOBAL')}
            className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
              region === 'GLOBAL' ? 'bg-amber-600/20 text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {t.payGlobal}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow text-center">
          <p className="text-slate-300 mb-6 font-serif leading-relaxed">
            {t.paymentDesc}
          </p>

          {region === 'CHINA' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-lg inline-block mx-auto shadow-inner">
                {/* QR Codes - You would typically put two tabs here or show both side by side */}
                <div className="flex flex-col gap-4">
                    <img 
                        src={PAYMENT_CONFIG.wechatQr} 
                        alt="WeChat Pay" 
                        className="w-48 h-48 object-contain" 
                    />
                    <div className="text-slate-900 font-bold text-xs">{t.scanToPay}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                支持微信 / 支付宝
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in py-4">
              {/* Creem.io Button */}
              <button
                onClick={() => handleLinkClick(PAYMENT_CONFIG.creemUrl)}
                className="w-full bg-[#ff4d4d] hover:bg-[#e60000] text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <span className="text-xl">🍦</span>
                {t.payWithCreem}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              {/* Stripe Button */}
              <button
                onClick={() => handleLinkClick(PAYMENT_CONFIG.stripeUrl)}
                className="w-full bg-[#635bff] hover:bg-[#4e45e4] text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <span className="text-xl">💳</span>
                {t.payWithStripe}
              </button>
            </div>
          )}
        </div>

        {/* Footer / Confirmation */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onPaymentComplete}
            className="w-full border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 font-bold py-3 rounded-lg transition-colors"
          >
            {t.iHavePaid}
          </button>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            * This is a demo. Clicking the button above simulates a successful payment verification.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
