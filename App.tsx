import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Console } from './components/Console';
import { SettingsModal } from './components/SettingsModal';
import { GeminiService } from './services/geminiService';
import { LogEntry, QueueItem, ProcessedItem, AppSettings, DEFAULT_SETTINGS } from './types';
import { Settings, Terminal, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Trash2, RotateCcw, Maximize2, Eraser, ChevronLeft, ChevronRight, RefreshCw, Footprints, SlidersHorizontal, ChevronDown, Mountain, PenTool, BookOpen, Scissors } from 'lucide-react';

// Polyfill process.env for browser environments if needed
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!process.env) {
  (process as any).env = {};
}

const App: React.FC = () => {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processed, setProcessed] = useState<ProcessedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomedItem, setZoomedItem] = useState<ProcessedItem | null>(null);
  
  // API Key State (Manual + System)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('katje-api-key') || '');

  // Settings with Local Storage Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('katje-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // UI State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Stats
  const stats = {
    queued: queue.filter(q => q.status === 'pending').length,
    processing: queue.filter(q => q.status === 'processing').length,
    generated: processed.length,
    errors: queue.filter(q => q.status === 'error').length
  };

  // Sync API Key to Environment & Storage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('katje-api-key', apiKey);
      // Inject into process.env for GeminiService
      Object.assign(process.env, { API_KEY: apiKey });
    }
  }, [apiKey]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('katje-settings', JSON.stringify(settings));
  }, [settings]);

  // Check API Key on Mount & Auto-open Settings if missing
  useEffect(() => {
    const checkKey = async () => {
      let systemKeyExists = false;
      try {
        // Check if injected by AI Studio environment
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
           systemKeyExists = await (window as any).aistudio.hasSelectedApiKey();
        }
      } catch (e) {
        // Ignore error if aistudio object is missing
      }

      // If no key from system AND no manual key, open settings
      if (!systemKeyExists && !localStorage.getItem('katje-api-key')) {
        setIsSettingsOpen(true);
      }
    };
    checkKey();
  }, []);
  
  // Refs
  const geminiService = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Click outside listener for options menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    if (isOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsOpen]);


  // Helper: Logging
  const addLog = useCallback((type: LogEntry['type'], title: string, details: any) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      details
    };
    setLogs(prev => [entry, ...prev]);
  }, []);

  // Helper: Process Queue
  const processNext = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    // Find first pending item
    const nextItemIndex = queue.findIndex(item => item.status === 'pending');
    if (nextItemIndex === -1) return;

    const item = queue[nextItemIndex];
    setIsProcessing(true);

    // Update status to processing
    setQueue(prev => prev.map((q, i) => i === nextItemIndex ? { ...q, status: 'processing', errorMessage: undefined } : q));

    try {
      addLog('INFO', `Starting job: ${item.originalName}`, { itemId: item.id, settings });

      // Call Service
      const result = await geminiService.current.colorizeImage(item.file, settings);

      // Add Service Logs to App Logs
      result.logs.forEach((log: any) => {
        let type: LogEntry['type'] = 'INFO';
        if (log.type === 'req') type = log.title.includes('Image') ? 'IMAGEN_REQ' : 'GEMINI_REQ';
        if (log.type === 'res') type = log.title.includes('Image') ? 'IMAGEN_RES' : 'GEMINI_RES';
        if (log.type === 'err') type = 'ERROR';
        addLog(type, log.title, log.data);
      });

      if (result.imageUrl) {
        // Create processed item
        const processedItem: ProcessedItem = {
          id: crypto.randomUUID(),
          originalUrl: item.previewUrl,
          processedUrl: result.imageUrl,
          fileName: result.filename,
          timestamp: Date.now()
        };

        setProcessed(prev => [processedItem, ...prev]);

        // Auto Download Image
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `${result.filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog('INFO', `Downloaded: ${result.filename}.png`, { url: result.imageUrl });
        
        // Describe Mode - Generate Story
        if (settings.describeMode && !settings.revertToLineArt) {
          addLog('INFO', `Generating story for: ${result.filename}`);
          // Extract base64 from data url
          const base64Data = result.imageUrl.split(',')[1];
          const storyResult = await geminiService.current.generateStory(base64Data, settings.geminiModel);
          
          storyResult.logs.forEach((log: any) => {
             let type: LogEntry['type'] = 'INFO';
             if (log.type === 'req') type = 'GEMINI_REQ';
             if (log.type === 'res') type = 'GEMINI_RES';
             if (log.type === 'err') type = 'ERROR';
             addLog(type, log.title, log.data);
          });

          if (storyResult.content) {
             const mdContent = `${storyResult.content}\n\n---\n\n![Generated Image](${result.imageUrl})`;
             const blob = new Blob([mdContent], { type: 'text/markdown' });
             const mdUrl = URL.createObjectURL(blob);
             const mdLink = document.createElement('a');
             mdLink.href = mdUrl;
             mdLink.download = `${result.filename}.md`;
             document.body.appendChild(mdLink);
             mdLink.click();
             document.body.removeChild(mdLink);
             addLog('INFO', `Downloaded description: ${result.filename}.md`);
          }
        }

        // Remove from queue on success as requested
        setQueue(prev => prev.filter(q => q.id !== item.id));

      } else {
        throw new Error("No image URL returned");
      }

    } catch (error: any) {
      addLog('ERROR', `Failed to process ${item.originalName}`, error);
      // Service logs might be in the error object if thrown customly
      if (error.logs) {
         error.logs.forEach((log: any) => addLog('ERROR', log.title, log.data));
      }
      
      const errMsg = error.error?.message || error.message || 'Unknown processing error';

      // Update logic: Check retry count. If it was a retry, remove it. If first failure, move to error.
      setQueue(prev => {
        return prev.reduce((acc, q) => {
          if (q.id === item.id) {
            // This is the item that failed
            const currentRetryCount = q.retryCount || 0;
            if (currentRetryCount >= 1) {
              // It failed a second time (original + 1 retry)
              // Log removal
              console.log(`Item ${q.originalName} failed after retry. Removing.`);
              // Don't push to acc, effectively removing it
            } else {
              // Move to error state
              acc.push({ ...q, status: 'error', errorMessage: errMsg });
            }
          } else {
            acc.push(q);
          }
          return acc;
        }, [] as QueueItem[]);
      });

    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing, settings, addLog]);

  // Queue Watcher
  useEffect(() => {
    if (!isProcessing && queue.some(q => q.status === 'pending')) {
      processNext();
    }
  }, [queue, isProcessing, processNext]);

  // Zoom Navigation Logic
  const handleZoomNext = useCallback(() => {
    if (!zoomedItem) return;
    const idx = processed.findIndex(p => p.id === zoomedItem.id);
    if (idx !== -1 && idx < processed.length - 1) {
      setZoomedItem(processed[idx + 1]);
    }
  }, [zoomedItem, processed]);

  const handleZoomPrev = useCallback(() => {
    if (!zoomedItem) return;
    const idx = processed.findIndex(p => p.id === zoomedItem.id);
    if (idx > 0) {
      setZoomedItem(processed[idx - 1]);
    }
  }, [zoomedItem, processed]);

  // Keyboard Navigation for Zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!zoomedItem) return;
      if (e.key === 'ArrowRight') handleZoomNext();
      if (e.key === 'ArrowLeft') handleZoomPrev();
      if (e.key === 'Escape') setZoomedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedItem, handleZoomNext, handleZoomPrev]);


  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      addFilesToQueue(files);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFilesToQueue = (files: File[]) => {
    const newItems: QueueItem[] = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: 'pending',
        originalName: f.name,
        retryCount: 0
      }));
    
    setQueue(prev => [...prev, ...newItems]);
    addLog('INFO', `Added ${files.length} files to queue`, newItems.map(i => i.originalName));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we are leaving the main container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      addFilesToQueue(files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files = Array.from(e.clipboardData.files) as File[];
      addFilesToQueue(files);
    }
  };

  const handleRetry = (id: string) => {
    addLog('INFO', 'Retrying item', { id });
    setQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: 'pending', errorMessage: undefined, retryCount: (item.retryCount || 0) + 1 } 
        : item
    ));
  };

  const handleRetryAll = () => {
    const errorItems = queue.filter(q => q.status === 'error');
    if (errorItems.length === 0) return;
    
    addLog('INFO', 'Retrying all failed items', { count: errorItems.length });
    setQueue(prev => prev.map(item => 
      item.status === 'error'
        ? { ...item, status: 'pending', errorMessage: undefined, retryCount: (item.retryCount || 0) + 1 }
        : item
    ));
  };

  // Filter queues for display
  const errorQueue = queue.filter(q => q.status === 'error');
  const activeQueue = queue.filter(q => q.status === 'pending' || q.status === 'processing');

  return (
    <div 
      className="flex flex-col h-screen bg-[#0d1117] text-gray-200 font-sans"
      onPaste={handlePaste}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800 shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-pink-500/20">
              <ImageIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Katje Colorizer</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Beta</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="hidden lg:flex items-center gap-2 bg-[#0d1117] px-3 py-1.5 rounded-lg border border-gray-800">
             <div className="flex items-center gap-1.5 px-2 border-r border-gray-800">
               <span className="w-2 h-2 rounded-full bg-gray-500"></span>
               <span className="text-xs text-gray-400">Queued: <span className="font-mono text-gray-200">{stats.queued}</span></span>
             </div>
             <div className="flex items-center gap-1.5 px-2 border-r border-gray-800">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               <span className="text-xs text-gray-400">Processing: <span className="font-mono text-gray-200">{stats.processing}</span></span>
             </div>
             <div className="flex items-center gap-1.5 px-2 border-r border-gray-800">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span className="text-xs text-gray-400">Done: <span className="font-mono text-gray-200">{stats.generated}</span></span>
             </div>
             <div className="flex items-center gap-1.5 px-2">
               <span className={`w-2 h-2 rounded-full ${stats.errors > 0 ? 'bg-red-500' : 'bg-gray-800'}`}></span>
               <span className="text-xs text-gray-400">Errors: <span className="font-mono text-gray-200">{stats.errors}</span></span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           
           {/* Options Dropdown */}
           <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isOptionsOpen 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Options</span>
                <ChevronDown size={14} className={`transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOptionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#1e232b] border border-gray-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    {/* Resolution Section */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quality (Pro Models)</h4>
                      <div className="grid grid-cols-4 gap-1">
                        {['1K', '2K', '4K', '8K'].map((res) => (
                          <button
                            key={res}
                            onClick={() => setSettings(s => ({ ...s, resolution: res as any }))}
                            className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${
                              settings.resolution === res
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-700" />

                    {/* Toggles */}
                    <div className="space-y-2">
                       {/* Barefoot */}
                      <button
                        onClick={() => setSettings(s => ({ ...s, barefootMode: !s.barefootMode }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.barefootMode 
                            ? 'bg-pink-900/30 text-pink-300 border border-pink-700/50' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Footprints size={14} />
                          <span>Barefoot Mode</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${settings.barefootMode ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-gray-600'}`} />
                      </button>
                      
                      {/* Extract Character */}
                      <button
                        onClick={() => setSettings(s => ({ ...s, extractCharacter: !s.extractCharacter }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.extractCharacter
                            ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700/50' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Scissors size={14} />
                          <span>Extract Character</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${settings.extractCharacter ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-gray-600'}`} />
                      </button>

                      {/* Remove Background */}
                      <button
                        onClick={() => setSettings(s => ({ ...s, removeBackground: !s.removeBackground }))}
                         disabled={settings.revertToLineArt || settings.extractCharacter}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.removeBackground && !settings.revertToLineArt && !settings.extractCharacter
                            ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                        } ${(settings.revertToLineArt || settings.extractCharacter) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <div className="flex items-center gap-2">
                          <Mountain size={14} />
                          <span>Remove BG</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${settings.removeBackground && !settings.revertToLineArt && !settings.extractCharacter ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                      </button>

                      {/* Revert to Line Art */}
                      <button
                        onClick={() => setSettings(s => ({ ...s, revertToLineArt: !s.revertToLineArt }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.revertToLineArt 
                            ? 'bg-gray-100 text-gray-900 border border-white/50' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                         <div className="flex items-center gap-2">
                          <PenTool size={14} />
                          <span>Line Art Mode</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${settings.revertToLineArt ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-gray-600'}`} />
                      </button>

                      {/* Describe Mode */}
                       <button
                        onClick={() => setSettings(s => ({ ...s, describeMode: !s.describeMode }))}
                        disabled={settings.revertToLineArt}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.describeMode && !settings.revertToLineArt
                            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/50' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                        } ${settings.revertToLineArt ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                         <div className="flex items-center gap-2">
                          <BookOpen size={14} />
                          <span>Describe</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${settings.describeMode && !settings.revertToLineArt ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-gray-600'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
           </div>

           {stats.errors > 0 && (
             <button
               onClick={handleRetryAll}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50 hover:text-indigo-300 border border-indigo-900/50 rounded-lg text-sm font-medium transition-all mr-2"
             >
               <RefreshCw size={16} />
               <span className="hidden sm:inline">Retry All</span>
             </button>
           )}
           {processed.length > 0 && (
             <button
               onClick={() => setProcessed([])}
               className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 border border-red-900/50 rounded-lg text-sm font-medium transition-all mr-2"
             >
               <Eraser size={16} />
               <span className="hidden sm:inline">Clear Gallery</span>
             </button>
           )}
           <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button 
            onClick={() => setIsConsoleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
          >
            <Terminal size={16} />
            <span className="hidden sm:inline">Console</span>
            {logs.filter(l => l.type === 'ERROR').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Grid with Drag & Drop */}
      <div 
        className={`flex flex-grow overflow-hidden relative transition-colors duration-200 ${isDragging ? 'bg-blue-900/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm pointer-events-none border-4 border-blue-500/50 border-dashed m-4 rounded-3xl">
            <div className="bg-[#161b22] p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce">
              <Upload size={48} className="text-blue-400 mb-4" />
              <h2 className="text-xl font-bold text-white">Drop Images Here</h2>
            </div>
          </div>
        )}
        
        {/* Left Sidebar - Failed Items */}
        <div className="hidden md:flex w-[200px] lg:w-80 bg-[#0d1117] border-r border-gray-800 flex-col shadow-xl z-10">
           <div className="p-4 border-b border-gray-800">
             <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
               <AlertCircle size={16} />
               Failed Items ({errorQueue.length})
             </h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]">
             {errorQueue.length === 0 && (
               <div className="text-center py-10 text-gray-600 text-xs italic">
                 No failed items
               </div>
             )}
             {errorQueue.map((item) => (
               <div key={item.id} className="flex flex-col p-3 bg-[#161b22] rounded-xl border border-red-900/30 relative group shadow-lg">
                 <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden relative mb-3">
                   <img src={item.previewUrl} alt="" className="w-full h-full object-cover opacity-50" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <AlertCircle size={32} className="text-red-500" />
                   </div>
                 </div>
                 <div className="flex flex-col gap-2">
                   <p className="text-sm font-medium text-gray-300 truncate" title={item.originalName}>{item.originalName}</p>
                   {item.errorMessage && (
                     <div className="text-[10px] text-red-400 bg-red-950/30 p-2 rounded border border-red-900/30 truncate" title={item.errorMessage}>
                       {item.errorMessage}
                     </div>
                   )}
                   <div className="flex items-center gap-2 mt-1">
                     <button 
                       onClick={() => handleRetry(item.id)}
                       className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-xs font-medium text-white transition-colors"
                     >
                       <RotateCcw size={12} /> Retry
                     </button>
                     <button 
                       onClick={() => setQueue(q => q.filter(i => i.id !== item.id))}
                       className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 hover:border-red-500 rounded-lg text-xs font-medium text-red-200 transition-colors"
                     >
                       <Trash2 size={12} /> Delete
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Main Area - Gallery */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0d1117] relative">
          {processed.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none">
               <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                 <Upload size={48} className="opacity-50" />
               </div>
               <h3 className="text-xl font-medium text-gray-400 mb-2">No Images Processed Yet</h3>
               <p className="max-w-md text-center text-sm">
                 Drop images anywhere or use the panel on the right. 
                 They will be processed and appear here automatically.
               </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processed.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative bg-[#161b22] rounded-xl overflow-hidden shadow-xl border border-gray-800 transition-transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => setZoomedItem(item)}
                  >
                    <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                      <img 
                        src={item.processedUrl} 
                        alt={item.fileName} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                         <div className="p-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full">
                           <Maximize2 size={20} />
                         </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-white truncate" title={item.fileName}>{item.fileName}</h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                        <span>Original: {queue.find(q => q.previewUrl === item.originalUrl)?.originalName || 'unknown'}</span>
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </main>

        {/* Right Sidebar - Active Queue & Upload */}
        <aside 
          className="w-80 bg-[#161b22] border-l border-gray-800 flex flex-col shadow-2xl z-10"
        >
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Upload Queue</h2>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-800/50 transition-all cursor-pointer group">
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden" 
              />
              <div className="p-3 bg-gray-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Click or Drag images here</p>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {activeQueue.length === 0 && (
               <div className="text-center py-10 text-gray-600 text-xs italic">
                 Queue is empty
               </div>
             )}
             {activeQueue.map((item) => (
               <div key={item.id} className="flex flex-col p-3 bg-[#0d1117] rounded-xl border border-gray-800 relative group animate-in slide-in-from-right-2 duration-300 shadow-lg">
                 <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3 relative">
                   <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                   {item.status === 'pending' && (
                    <button 
                      onClick={() => setQueue(q => q.filter(i => i.id !== item.id))}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                   )}
                 </div>
                 <div className="flex flex-col gap-1">
                   <p className="text-sm font-medium text-gray-300 truncate" title={item.originalName}>{item.originalName}</p>
                   <div className="flex items-center gap-2 mt-1">
                     {item.status === 'pending' && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Pending</span>}
                     {item.status === 'processing' && <span className="text-xs text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Processing...</span>}
                     {item.status === 'completed' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Done</span>}
                   </div>
                   {item.retryCount! > 0 && (
                     <span className="text-[10px] text-yellow-500">Retry attempt #{item.retryCount}</span>
                   )}
                 </div>
               </div>
             ))}
          </div>
        </aside>

      </div>

      {/* Footer */}
      <footer className="px-6 py-3 bg-[#161b22] border-t border-gray-800 text-center text-[10px] text-gray-600 tracking-wide shrink-0">
        KATJE - Knowledge And Technology Joyfully Engaged
      </footer>

      {/* Modals */}
      <Console 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        logs={logs} 
        onClear={() => setLogs([])}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={setSettings}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      {/* Zoom Modal */}
      {zoomedItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-default animate-in fade-in duration-200"
          onClick={(e) => {
             // Close only if clicking the background
             if (e.target === e.currentTarget) setZoomedItem(null);
          }}
        >
          {/* Navigation Buttons */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomPrev(); }}
            className="absolute left-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            disabled={processed.findIndex(p => p.id === zoomedItem.id) === 0}
          >
            <ChevronLeft size={48} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomNext(); }}
            className="absolute right-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            disabled={processed.findIndex(p => p.id === zoomedItem.id) === processed.length - 1}
          >
            <ChevronRight size={48} />
          </button>

          <img 
            src={zoomedItem.processedUrl} 
            alt={zoomedItem.fileName} 
            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-sm pointer-events-none select-none"
          />
          
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={() => setZoomedItem(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <Trash2 size={24} className="rotate-45" /> {/* Use rotate to simulate X if X not imported, but X is usually closed. Let's stick to X if imported or just rely on bg click */}
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/50 px-4 py-2 rounded-full">
            {processed.findIndex(p => p.id === zoomedItem.id) + 1} / {processed.length} • Use arrow keys to navigate
          </div>
        </div>
      )}
    </div>
  );
};

export default App;