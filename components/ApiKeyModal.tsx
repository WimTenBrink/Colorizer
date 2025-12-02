import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimationVisible(true);
      // Pre-fill if existing in localStorage to allow easy editing if popped up manually
      const existing = localStorage.getItem('katje-api-key');
      if (existing) setInputKey(existing);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inputKey.trim()) {
      setError('Please enter a valid API Key');
      return;
    }
    if (inputKey.length < 30) {
        setError('That looks too short to be a valid Gemini API Key.');
        return;
    }
    onSave(inputKey.trim());
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      setInputKey(text.trim());
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-opacity duration-300 ${isAnimationVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#161b22] w-full max-w-lg p-0 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden flex flex-col">
        {/* Header Decor */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full" />
        
        <div className="p-8 pb-6 text-center">
          <div className="w-20 h-20 bg-[#0d1117] rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-700 shadow-inner relative group">
             <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
             <Key size={36} className="text-blue-400 relative z-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Setup Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            To use Katje Colorizer, you must provide your own <span className="text-white font-medium">Google Gemini API Key</span>.
          </p>
        </div>

        <div className="px-8 space-y-5">
           {/* Info Box */}
           <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl flex items-start gap-4">
              <ShieldCheck className="text-blue-400 shrink-0 mt-1" size={20} />
              <div className="text-xs text-gray-300 text-left space-y-1">
                <p className="font-semibold text-blue-200">Private & Secure</p>
                <p>Your key is stored locally in your browser and used directly to communicate with Google. It is never sent to our servers.</p>
              </div>
           </div>

           {/* Warning Box */}
           <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-xl flex items-start gap-4">
              <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={20} />
              <div className="text-xs text-gray-300 text-left space-y-1">
                <p className="font-semibold text-yellow-500">Fixing "Quota Exceeded" Errors</p>
                <p>If you see budget errors, you are likely using a free-tier key or an exhausted key. Please use an API key from a Google Cloud Project with billing enabled (Pay-as-you-go).</p>
              </div>
           </div>

           {/* Input */}
           <div className="space-y-2 text-left pt-2">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gemini API Key</label>
                <span className="text-[10px] text-gray-500 font-mono">Starts with AIzaSy...</span>
             </div>
             <div className="relative group">
                <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                    onPaste={handlePaste}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Paste your API Key here..."
                    className="w-full bg-[#0d1117] border border-gray-600 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm transition-all shadow-inner placeholder:text-gray-600 group-hover:border-gray-500"
                />
                {inputKey && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in">
                        <CheckCircle size={16} />
                    </div>
                )}
             </div>
             {error && (
                 <div className="flex items-center gap-2 text-red-400 text-xs animate-in slide-in-from-top-1">
                     <AlertTriangle size={12} />
                     {error}
                 </div>
             )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-6">
           <button 
             onClick={handleSave}
             className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
           >
             Save Key & Continue
           </button>

           <div className="mt-6 text-center">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-400 transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
             >
               Get a key from Google AI Studio <ExternalLink size={12} />
             </a>
           </div>
        </div>
      </div>
    </div>
  );
};
