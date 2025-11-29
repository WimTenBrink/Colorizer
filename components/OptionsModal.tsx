
import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { PROMPT_CONFIG } from '../promptOptions';
import { 
  X, UserRoundCog, Shirt, Map, Zap, 
  CheckCircle, Scissors, PenTool, BookOpen, 
  Mountain, Sun, Cpu, Baby, Users, Footprints, 
  RefreshCw, Palette, RotateCcw
} from 'lucide-react';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'attire' | 'world' | 'tools'>('character');

  if (!isOpen) return null;

  const tabs = [
    { id: 'character', label: 'Character', icon: UserRoundCog },
    { id: 'attire', label: 'Attire', icon: Shirt },
    { id: 'world', label: 'World', icon: Map },
    { id: 'tools', label: 'Tools', icon: Zap },
  ] as const;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all options to their default values?')) {
      onUpdate(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] w-[95vw] h-[95vh] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#161b22] border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Generation Options</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-[#161b22] border-r border-gray-800 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#0d1117] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            
            {/* Character Tab */}
            {activeTab === 'character' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserRoundCog className="text-purple-400"/> Character Definition</h3>
                   <p className="text-gray-500 mt-1">Define the physical traits of the primary subject.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Species */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><UserRoundCog size={14}/> Species / Race</label>
                    <select 
                      value={settings.targetSpecies}
                      onChange={(e) => onUpdate({ ...settings, targetSpecies: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.species.map(sp => (
                        <option key={sp.value} value={sp.value}>{sp.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Users size={14}/> Gender Presentation</label>
                    <select 
                      value={settings.targetGender}
                      onChange={(e) => onUpdate({ ...settings, targetGender: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.genders.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age Group */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Baby size={14}/> Age Group</label>
                    <select 
                      value={settings.targetAge}
                      onChange={(e) => onUpdate({ ...settings, targetAge: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.ageGroups.map(age => (
                        <option key={age.value} value={age.value}>{age.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Skin Tone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Palette size={14}/> Skin Tone / Ethnicity</label>
                    <select 
                      value={settings.targetSkin}
                      onChange={(e) => onUpdate({ ...settings, targetSkin: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.skinTones.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hair Color */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Scissors size={14}/> Hair Color</label>
                    <select 
                      value={settings.targetHair}
                      onChange={(e) => onUpdate({ ...settings, targetHair: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.hairColors.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Attire Tab */}
            {activeTab === 'attire' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Shirt className="text-blue-400"/> Attire & Style</h3>
                   <p className="text-gray-500 mt-1">Configure clothing and accessories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Clothing Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Shirt size={14}/> Clothing Amount</label>
                    <select 
                      value={settings.clothingAmount}
                      onChange={(e) => onUpdate({ ...settings, clothingAmount: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.clothing.map(cl => (
                          <option key={cl.value} value={cl.value}>{cl.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Footwear */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Footprints size={14}/> Footwear</label>
                    <select 
                      value={settings.footwear}
                      onChange={(e) => onUpdate({ ...settings, footwear: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.footwear.map(fw => (
                        <option key={fw.value} value={fw.value}>{fw.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* World Tab */}
            {activeTab === 'world' && (
               <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Map className="text-green-400"/> World & Environment</h3>
                   <p className="text-gray-500 mt-1">Set the scene, time, and technological context.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Background */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Mountain size={14}/> Background</label>
                    <select 
                      value={settings.background}
                      onChange={(e) => onUpdate({ ...settings, background: e.target.value })}
                      disabled={settings.revertToLineArt || settings.extractCharacter}
                      className={`w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors ${settings.revertToLineArt || settings.extractCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {PROMPT_CONFIG.backgrounds.map(bg => (
                        <option key={bg.value} value={bg.value}>{bg.label}</option>
                      ))}
                    </select>
                    {(settings.revertToLineArt || settings.extractCharacter) && (
                      <p className="text-xs text-yellow-500 flex items-center gap-1">
                         Disabled by Extraction or Line Art mode
                      </p>
                    )}
                  </div>

                  {/* Time of Day */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Sun size={14}/> Time of Day</label>
                    <select 
                      value={settings.timeOfDay}
                      onChange={(e) => onUpdate({ ...settings, timeOfDay: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.timeOfDay.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tech Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Cpu size={14}/> Tech Level</label>
                    <select 
                      value={settings.techLevel}
                      onChange={(e) => onUpdate({ ...settings, techLevel: e.target.value })}
                      className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors"
                    >
                      {PROMPT_CONFIG.techLevels.map(tl => (
                        <option key={tl.value} value={tl.value}>{tl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="text-yellow-400"/> Processing Tools</h3>
                   <p className="text-gray-500 mt-1">Configure generation parameters and special modes.</p>
                </div>

                <div className="space-y-6">
                   {/* Resolution */}
                   <div className="bg-[#161b22] p-5 rounded-xl border border-gray-800">
                      <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><RefreshCw size={14} /> Resolution</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {['1K', '2K', '4K', '8K'].map((res) => (
                          <button
                            key={res}
                            onClick={() => onUpdate({ ...settings, resolution: res as any })}
                            className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all border ${
                              settings.resolution === res
                                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20'
                                : 'bg-black/30 text-gray-400 border-gray-700 hover:bg-gray-800'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fix Errors */}
                      <button
                        onClick={() => onUpdate({ ...settings, fixErrors: !settings.fixErrors })}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          settings.fixErrors
                            ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-200' 
                            : 'bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.fixErrors ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                             <CheckCircle size={20} />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Fix Anatomy</span>
                            <span className="text-xs opacity-70">Correct hands/limbs</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${settings.fixErrors ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`} />
                      </button>

                      {/* Extract Character */}
                      <button
                        onClick={() => onUpdate({ ...settings, extractCharacter: !settings.extractCharacter })}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          settings.extractCharacter
                            ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-200' 
                            : 'bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.extractCharacter ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                             <Scissors size={20} />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Extract Subject</span>
                            <span className="text-xs opacity-70">Remove background</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${settings.extractCharacter ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'}`} />
                      </button>

                      {/* Revert to Line Art */}
                      <button
                        onClick={() => onUpdate({ ...settings, revertToLineArt: !settings.revertToLineArt })}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          settings.revertToLineArt 
                            ? 'bg-gray-100 text-gray-900 border-white' 
                            : 'bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.revertToLineArt ? 'bg-black/10 text-gray-900' : 'bg-gray-800 text-gray-500'}`}>
                             <PenTool size={20} />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Line Art Mode</span>
                            <span className="text-xs opacity-70">B&W Sketch only</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${settings.revertToLineArt ? 'bg-gray-900 border-gray-900' : 'border-gray-600'}`} />
                      </button>

                      {/* Describe Mode */}
                       <button
                        onClick={() => onUpdate({ ...settings, describeMode: !settings.describeMode })}
                        disabled={settings.revertToLineArt}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          settings.describeMode && !settings.revertToLineArt
                            ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-200' 
                            : 'bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-600'
                        } ${settings.revertToLineArt ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.describeMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                             <BookOpen size={20} />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Describe Mode</span>
                            <span className="text-xs opacity-70">Generate text story</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${settings.describeMode && !settings.revertToLineArt ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600'}`} />
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-[#161b22] border-t border-gray-800 flex justify-between shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>

          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
