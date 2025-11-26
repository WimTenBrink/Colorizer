import React from 'react';
import { AppSettings, MODELS } from '../types';
import { X, Settings, Wand2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e232b] w-[90vw] max-w-2xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-[#252b36] border-b border-gray-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Settings size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Configuration</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Models Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Model Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Image Generation Model</label>
                <select 
                  value={settings.imagenModel}
                  onChange={(e) => onUpdate({ ...settings, imagenModel: e.target.value })}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  {MODELS.image.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Selected model used for colorization.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Naming & Analysis Model</label>
                <select 
                  value={settings.geminiModel}
                  onChange={(e) => onUpdate({ ...settings, geminiModel: e.target.value })}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  {MODELS.text.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Model used to generate filenames.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-700" />

          {/* Prompt Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Wand2 size={16} />
              Prompt Customization
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Additional Instructions</label>
              <textarea 
                value={settings.customPrompt}
                onChange={(e) => onUpdate({ ...settings, customPrompt: e.target.value })}
                placeholder="E.g., Make the sky stormy, use warm tones for the skin..."
                className="w-full h-24 bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
              />
              <p className="text-xs text-gray-500">
                This text is appended to the base instruction: "Colorize this image realistically. Use oil paint. Add a proper background. It should almost be a photo."
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-700" />

          {/* Resolution */}
           <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Output Quality</h3>
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Resolution (Pro models only)</label>
                <div className="flex gap-3">
                  {['1K', '2K', '4K'].map((res) => (
                    <button
                      key={res}
                      onClick={() => onUpdate({...settings, resolution: res as any})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.resolution === res 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-black/30 text-gray-400 hover:bg-gray-700 border border-gray-600'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </div>
        
        <div className="px-6 py-4 bg-[#161b22] border-t border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
