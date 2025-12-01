

import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { PROMPT_CONFIG } from '../promptOptions';
import { 
  X, UserRoundCog, Shirt, Map, Zap, 
  CheckCircle, Scissors, PenTool, BookOpen, 
  Mountain, Sun, Cpu, Baby, Users, Footprints, 
  RefreshCw, Palette, RotateCcw, FileText,
  CloudSun, Aperture, Sword, Smile, Eye, Gem, Download, Upload,
  Copy, Repeat
} from 'lucide-react';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'subject' | 'gear' | 'world' | 'style' | 'tools'>('subject');

  // Prevent hook errors by returning ONLY after hooks
  if (!isOpen) return null;

  const tabs = [
    { id: 'subject', label: 'Subject', icon: UserRoundCog },
    { id: 'gear', label: 'Gear & Companions', icon: Sword },
    { id: 'world', label: 'World & Atmosphere', icon: Map },
    { id: 'style', label: 'Style & Camera', icon: Aperture },
    { id: 'tools', label: 'Tools', icon: Zap },
  ] as const;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all options to their default values?')) {
      // Create a completely new object reference to ensure React triggers updates
      const resetSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      onUpdate(resetSettings);
    }
  };

  const handleSaveConfig = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date();
    // Format: YYYY-MM-DD_HH-mm
    const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 16); 
    const link = document.createElement("a");
    link.href = url;
    link.download = `options_${timestamp}.kct`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Merge to ensure new keys exist if loading old config
        onUpdate({ ...DEFAULT_SETTINGS, ...json });
        alert('Configuration loaded successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to load configuration. Invalid file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  const renderSelect = (label: string, icon: React.ReactNode, value: string, onChange: (val: string) => void, options: {value: string, label: string}[], disabled = false) => (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">{icon} {label}</label>
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-600 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
  );

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
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#0d1117] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            
            {/* Subject Tab */}
            {activeTab === 'subject' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserRoundCog className="text-purple-400"/> Character & Appearance</h3>
                   <p className="text-gray-500 mt-1">Define the physical traits of the primary subject.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderSelect("Species / Race", <UserRoundCog size={14}/>, settings.targetSpecies, (v) => onUpdate({...settings, targetSpecies: v}), PROMPT_CONFIG.species)}
                  {renderSelect("Gender", <Users size={14}/>, settings.targetGender, (v) => onUpdate({...settings, targetGender: v}), PROMPT_CONFIG.genders)}
                  {renderSelect("Age Group", <Baby size={14}/>, settings.targetAge, (v) => onUpdate({...settings, targetAge: v}), PROMPT_CONFIG.ageGroups)}
                  {renderSelect("Skin Tone", <Palette size={14}/>, settings.targetSkin, (v) => onUpdate({...settings, targetSkin: v}), PROMPT_CONFIG.skinTones)}
                  {renderSelect("Hair Color", <Scissors size={14}/>, settings.targetHair, (v) => onUpdate({...settings, targetHair: v}), PROMPT_CONFIG.hairColors)}
                  {renderSelect("Eye Color", <Eye size={14}/>, settings.eyeColor, (v) => onUpdate({...settings, eyeColor: v}), PROMPT_CONFIG.eyeColors)}
                  {renderSelect("Body Modifications", <Gem size={14}/>, settings.bodyMod, (v) => onUpdate({...settings, bodyMod: v}), PROMPT_CONFIG.bodyMods)}
                </div>
              </div>
            )}

            {/* Gear Tab */}
            {activeTab === 'gear' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sword className="text-blue-400"/> Attire & Gear</h3>
                   <p className="text-gray-500 mt-1">Configure clothing, items, and companions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderSelect("Clothing Amount", <Shirt size={14}/>, settings.clothingAmount, (v) => onUpdate({...settings, clothingAmount: v}), PROMPT_CONFIG.clothing)}
                  {renderSelect("Footwear", <Footprints size={14}/>, settings.footwear, (v) => onUpdate({...settings, footwear: v}), PROMPT_CONFIG.footwear)}
                  {renderSelect("Held Item / Accessory", <Sword size={14}/>, settings.heldItem, (v) => onUpdate({...settings, heldItem: v}), PROMPT_CONFIG.items)}
                  {renderSelect("Companion / Creature", <Smile size={14}/>, settings.creature, (v) => onUpdate({...settings, creature: v}), PROMPT_CONFIG.creatures)}
                </div>
              </div>
            )}

            {/* World Tab */}
            {activeTab === 'world' && (
               <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Map className="text-green-400"/> World & Atmosphere</h3>
                   <p className="text-gray-500 mt-1">Set the scene, weather, and lighting.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderSelect("Background", <Mountain size={14}/>, settings.background, (v) => onUpdate({...settings, background: v}), PROMPT_CONFIG.backgrounds, settings.revertToLineArt || settings.extractCharacter)}
                  {renderSelect("Time of Day", <Sun size={14}/>, settings.timeOfDay, (v) => onUpdate({...settings, timeOfDay: v}), PROMPT_CONFIG.timeOfDay)}
                  {renderSelect("Weather", <CloudSun size={14}/>, settings.weather, (v) => onUpdate({...settings, weather: v}), PROMPT_CONFIG.weather)}
                  {renderSelect("Lighting", <Zap size={14}/>, settings.lighting, (v) => onUpdate({...settings, lighting: v}), PROMPT_CONFIG.lighting)}
                </div>
              </div>
            )}

            {/* Style Tab */}
            {activeTab === 'style' && (
               <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="pb-4 border-b border-gray-800">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Aperture className="text-orange-400"/> Style & Camera</h3>
                   <p className="text-gray-500 mt-1">Adjust the mood, tech level, and camera settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderSelect("Mood", <Smile size={14}/>, settings.mood, (v) => onUpdate({...settings, mood: v}), PROMPT_CONFIG.moods)}
                  {renderSelect("Tech Level", <Cpu size={14}/>, settings.techLevel, (v) => onUpdate({...settings, techLevel: v}), PROMPT_CONFIG.techLevels)}
                  {renderSelect("Camera Shot/Lens", <Aperture size={14}/>, settings.cameraType, (v) => onUpdate({...settings, cameraType: v}), PROMPT_CONFIG.cameraAngles)}
                  {renderSelect("Aspect Ratio", <Aperture size={14}/>, settings.aspectRatio, (v) => onUpdate({...settings, aspectRatio: v}), PROMPT_CONFIG.aspectRatios)}
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
                   
                   {/* Default Iterations */}
                   <div className="bg-[#161b22] p-5 rounded-xl border border-gray-800">
                      <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><Repeat size={14} /> Default Iterations</h4>
                      <div className="flex items-center gap-4">
                        <input 
                           type="number" 
                           min="1" 
                           max="100" 
                           value={settings.defaultIterations} 
                           onChange={(e) => onUpdate({...settings, defaultIterations: Math.max(1, parseInt(e.target.value) || 1)})}
                           className="w-24 bg-black/30 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500">Number of times to generate each new image added to the queue.</p>
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

                      {/* Generate Reports */}
                      <button
                        onClick={() => onUpdate({ ...settings, generateReports: !settings.generateReports })}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          settings.generateReports
                            ? 'bg-red-900/20 border-red-500/50 text-red-200' 
                            : 'bg-[#161b22] border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${settings.generateReports ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                             <FileText size={20} />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold">Generate Reports</span>
                            <span className="text-xs opacity-70">Analyze failed images</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${settings.generateReports ? 'bg-red-500 border-red-500' : 'border-gray-600'}`} />
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-[#161b22] border-t border-gray-800 flex justify-between shrink-0">
          <div className="flex items-center gap-3">
             <button
               onClick={handleReset}
               className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
               title="Reset to Factory Defaults"
             >
               <RotateCcw size={16} />
               <span className="hidden sm:inline">Reset</span>
             </button>

             <div className="h-6 w-px bg-gray-700"></div>

             <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-gray-700">
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
                <input type="file" accept=".kct,.json" onChange={handleLoadConfig} className="hidden" />
             </label>

             <button
               onClick={handleSaveConfig}
               className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700"
               title="Save Configuration as .kct"
             >
               <Download size={16} />
               <span className="hidden sm:inline">Export</span>
             </button>
          </div>

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