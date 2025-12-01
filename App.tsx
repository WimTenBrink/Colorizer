import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Console } from './components/Console';
import { SettingsModal } from './components/SettingsModal';
import { ManualModal } from './components/ManualModal';
import { QueueManagementModal } from './components/QueueManagementModal';
import { OptionsModal } from './components/OptionsModal';
import { GeminiService, fileToGenerativePart } from './services/geminiService';
import { loadQueue, syncQueue } from './services/storageService';
import { LogEntry, QueueItem, ProcessedItem, AppSettings, DEFAULT_SETTINGS } from './types';
import { PROMPT_CONFIG } from './promptOptions';
import { Settings, Terminal, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Trash2, RotateCcw, Maximize2, Eraser, ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, Book, AlertTriangle, Play, Pause, ChevronDown } from 'lucide-react';

// Polyfill process.env for browser environments if needed
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!process.env) {
  (process as any).env = {};
}

interface ZoomState {
  id?: string;
  url: string;
  name: string;
  originalUrl?: string;
  isProcessed: boolean;
}

export const App: React.FC = () => {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processed, setProcessed] = useState<ProcessedItem[]>([]);
  // Start in paused state to allow configuration
  const [isPaused, setIsPaused] = useState(true);
  const [zoomedItem, setZoomedItem] = useState<ZoomState | null>(null);
  
  // Storage State
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  
  // Error History State
  const [recentErrors, setRecentErrors] = useState<string[]>([]);
  const [showErrorHistory, setShowErrorHistory] = useState(false);
  
  // API Key State (Manual + System)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('katje-api-key') || '');

  // Settings with Local Storage Persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('katje-settings');
      // Merge saved settings with default to handle removed keys or new keys
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  });

  // UI State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Management Modal State
  const [managementModal, setManagementModal] = useState<{isOpen: boolean, type: 'error' | 'queue'}>({ isOpen: false, type: 'error' });

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

  // Load Queue from Storage on Mount
  useEffect(() => {
    const initQueue = async () => {
      try {
        const savedQueue = await loadQueue();
        if (savedQueue.length > 0) {
          // Fix: Reset 'processing' items to 'pending' on load
          // Items stuck in 'processing' state when the app closes will block the queue forever otherwise.
          const sanitizedQueue = savedQueue.map(q => 
            q.status === 'processing' ? { ...q, status: 'pending' as const } : q
          );
          setQueue(sanitizedQueue);
          
          addLog('INFO', `Restored ${savedQueue.length} items from storage. Press Play to start.`, {});
        }
      } catch (e) {
        addLog('ERROR', 'Failed to load queue from storage', e);
      } finally {
        setIsStorageInitialized(true);
      }
    };
    initQueue();
  }, []);

  // Sync Queue to Storage on Change
  useEffect(() => {
    if (isStorageInitialized) {
      syncQueue(queue);
    }
  }, [queue, isStorageInitialized]);

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
  const lastRequestTime = useRef<number>(0);
  
  // Download Queue Refs
  const downloadQueueRef = useRef<{url: string, filename: string}[]>([]);
  const isDownloadingRef = useRef(false);

  // Helper: Logging
  const addLog = useCallback((type: LogEntry['type'], title: string, details: any = {}) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      details: details || {}
    };
    // Limit logs to latest 100 entries
    setLogs(prev => [entry, ...prev].slice(0, 100));

    // Capture Errors for Header Display
    if (type === 'ERROR') {
      let msg = title;
      if (details) {
         if (typeof details === 'string') msg = details;
         else if (details.message) msg = details.message;
         else if (details.error && details.error.message) msg = details.error.message;
      }
      
      const cleanMsg = String(msg || 'Unknown Error').substring(0, 100);
      
      setRecentErrors(prev => {
        // Add to top, remove duplicates (distinct), keep max 5
        const distinct = [cleanMsg, ...prev.filter(e => e !== cleanMsg)];
        return distinct.slice(0, 5);
      });
    }
  }, []);

  // Helper: Download Queue Processor
  const processDownloadQueue = useCallback(() => {
    if (isDownloadingRef.current || downloadQueueRef.current.length === 0) return;
    
    isDownloadingRef.current = true;
    const item = downloadQueueRef.current.shift();
    
    if (item) {
      try {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("Download failed", e);
      }
    }
    
    // Add delay to prevent browser blocking multiple downloads
    setTimeout(() => {
      isDownloadingRef.current = false;
      // Continue queue if items exist
      if (downloadQueueRef.current.length > 0) {
        processDownloadQueue();
      }
    }, 1500); // 1.5s delay
  }, []);

  const queueDownload = useCallback((url: string, filename: string) => {
    downloadQueueRef.current.push({ url, filename });
    processDownloadQueue();
  }, [processDownloadQueue]);


  // Helper: Process Queue
  const processNext = useCallback(async () => {
    // CONCURRENCY CONTROL: Allow up to 2 simultaneous jobs
    // We check queue inside the function to get the latest state via closure or ref, 
    // but here we rely on the useEffect dependency chain to keep 'queue' fresh.
    const activeJobs = queue.filter(q => q.status === 'processing').length;
    // Check pause and concurrency before doing anything
    if (activeJobs >= 2 || isPaused || queue.length === 0) return;

    // Find first pending item
    const item = queue.find(item => item.status === 'pending');
    if (!item) return;

    // Critical: Capture ID for reliable updates
    const itemId = item.id;
    
    // Update status to processing immediately using ID matching to avoid race condition
    setQueue(prev => prev.map(q => q.id === itemId ? { ...q, status: 'processing', errorMessage: undefined } : q));

    // Throttling: Ensure spacing between requests
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime.current;
    const MIN_DELAY = 1000; // 1 second spacing

    if (timeSinceLast < MIN_DELAY) {
      await new Promise(resolve => setTimeout(resolve, MIN_DELAY - timeSinceLast));
    }
    lastRequestTime.current = Date.now();

    try {
      addLog('INFO', `Starting job: ${item.originalName}`, { itemId, settings });

      // Call Service
      const result = await geminiService.current.colorizeImage(item.file, settings);

      // Add Service Logs
      result.logs.forEach((log: any) => {
        let type: LogEntry['type'] = 'INFO';
        if (log.type === 'req') type = log.title.includes('Image') ? 'IMAGEN_REQ' : 'GEMINI_REQ';
        if (log.type === 'res') type = log.title.includes('Image') ? 'IMAGEN_RES' : 'GEMINI_RES';
        if (log.type === 'err') type = 'ERROR';
        addLog(type, log.title, log.data);
      });

      if (result.imageUrl) {
        
        const finalFilename = settings.revertToLineArt 
          ? `lineart.${result.filename}` 
          : result.filename;

        const processedItem: ProcessedItem = {
          id: crypto.randomUUID(),
          originalUrl: item.previewUrl,
          processedUrl: result.imageUrl,
          fileName: finalFilename,
          timestamp: Date.now()
        };

        setProcessed(prev => [processedItem, ...prev].slice(0, 50));
        queueDownload(result.imageUrl, `${finalFilename}.png`);
        addLog('INFO', `Completed: ${finalFilename}.png`, {});
        
        // Describe Mode
        if (settings.describeMode && !settings.revertToLineArt) {
          addLog('INFO', `Generating story for: ${finalFilename}`, {});
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
             queueDownload(mdUrl, `${finalFilename}.md`);
          }
        }

        // Remove from queue on success
        setQueue(prev => prev.filter(q => q.id !== itemId));

      } else {
        throw new Error("No image URL returned");
      }

    } catch (error: any) {
      addLog('ERROR', `Failed to process ${item.originalName}`, error);
      if (error.logs) {
         error.logs.forEach((log: any) => addLog('ERROR', log.title, log.data));
      }
      
      const errMsg = error.error?.message || error.message || 'Unknown processing error';

      // --- FAILURE ANALYSIS REPORT ---
      // Only run if configured
      if (settings.generateReports) {
          try {
             addLog('INFO', `Generating forensic report for failed item: ${item.originalName}...`, {});
             
             const analysis = await geminiService.current.generateFailureReport(item.file);
             
             analysis.logs.forEach((log: any) => {
                 let type: LogEntry['type'] = 'INFO';
                 if (log.type === 'req') type = 'GEMINI_REQ';
                 if (log.type === 'res') type = 'GEMINI_RES';
                 if (log.type === 'err') type = 'ERROR';
                 addLog(type, log.title, log.data);
             });
    
             // Prepare Markdown with embedded image
             if (analysis.report && analysis.report.length > 50) {
                 const base64Data = await fileToGenerativePart(item.file);
                 const dataUrl = `data:${item.file.type};base64,${base64Data}`;
                 
                 const finalMarkdown = `${analysis.report}\n\n---\n\n## Source Image\n\n![Source Image](${dataUrl})`;
                 
                 const blob = new Blob([finalMarkdown], { type: 'text/markdown' });
                 const url = URL.createObjectURL(blob);
                 const reportName = `REPORT_${item.originalName.replace(/\.[^/.]+$/, "")}.md`;
                 
                 queueDownload(url, reportName);
                 addLog('INFO', `Report downloaded: ${reportName}`, {});
             } else {
                 addLog('ERROR', 'Skipped report download: Analysis result was empty or too short.', {});
             }
    
          } catch (reportErr) {
              console.error(reportErr);
              addLog('ERROR', 'Failed to generate forensic report', reportErr);
          }
      }
      // ------------------------------------

      // Mark as error using ID
      setQueue(prev => prev.map(q => {
          if (q.id === itemId) {
             return { ...q, status: 'error', errorMessage: errMsg };
          }
          return q;
      }));
    }
  }, [queue, isPaused, settings, addLog, queueDownload]);

  // Queue Watcher
  useEffect(() => {
    const activeJobs = queue.filter(q => q.status === 'processing').length;
    // Process next if slots available and not paused
    if (activeJobs < 2 && !isPaused && queue.some(q => q.status === 'pending')) {
      processNext();
    }
  }, [queue, isPaused, processNext]);

  // Zoom Navigation
  const handleZoomNext = useCallback(() => {
    if (!zoomedItem || !zoomedItem.isProcessed || !zoomedItem.id) return;
    const idx = processed.findIndex(p => p.id === zoomedItem.id);
    if (idx !== -1 && idx < processed.length - 1) {
      const next = processed[idx + 1];
      setZoomedItem({ 
          id: next.id, 
          url: next.processedUrl, 
          name: next.fileName, 
          originalUrl: next.originalUrl, 
          isProcessed: true 
      });
    }
  }, [zoomedItem, processed]);

  const handleZoomPrev = useCallback(() => {
    if (!zoomedItem || !zoomedItem.isProcessed || !zoomedItem.id) return;
    const idx = processed.findIndex(p => p.id === zoomedItem.id);
    if (idx > 0) {
      const prev = processed[idx - 1];
      setZoomedItem({ 
          id: prev.id, 
          url: prev.processedUrl, 
          name: prev.fileName, 
          originalUrl: prev.originalUrl, 
          isProcessed: true 
      });
    }
  }, [zoomedItem, processed]);

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
    addLog('INFO', `Added ${files.length} files to queue`, {});
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'pending', errorMessage: undefined, retryCount: 0 } : item
    ));
  };

  const handleRetryAll = () => {
    setQueue(prev => prev.map(item => 
      item.status === 'error' ? { ...item, status: 'pending', errorMessage: undefined, retryCount: 0 } : item
    ));
  };
  
  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear the upload queue?')) {
      setQueue([]);
    }
  };
  
  // Use callback to ensure stable reference for the modal
  const handleBulkDelete = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    setQueue(prev => prev.filter(item => !ids.includes(item.id)));
    addLog('INFO', `Bulk deleted ${ids.length} items`, {});
  }, [addLog]);

  const handleBulkRetry = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    setQueue(prev => prev.map(item => 
      ids.includes(item.id) 
        ? { ...item, status: 'pending', errorMessage: undefined, retryCount: 0 } 
        : item
    ));
    addLog('INFO', `Bulk retrying ${ids.length} items`, {});
  }, [addLog]);

  const errorQueue = queue.filter(q => q.status === 'error');
  const activeQueue = queue.filter(q => q.status === 'pending' || q.status === 'processing');

  return (
    <div 
      className="flex flex-col h-screen bg-[#0d1117] text-gray-200 font-sans"
      onPaste={handlePaste}
    >
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
          
          <button
             onClick={() => setIsPaused(!isPaused)}
             className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${isPaused ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'}`}
             title={isPaused ? "Start Processing" : "Pause Processing"}
          >
            {isPaused ? <Play size={20} className="fill-current" /> : <Pause size={20} className="fill-current" />}
          </button>

          {recentErrors.length > 0 && (
            <div className="relative z-50">
                <button 
                  onClick={() => setShowErrorHistory(!showErrorHistory)}
                  className="flex items-center gap-2 max-w-[200px] md:max-w-[300px] px-3 py-1.5 bg-red-950/30 border border-red-900/50 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/50 transition-colors"
                >
                   <AlertTriangle size={14} className="shrink-0" />
                   <span className="truncate">{recentErrors[0]}</span>
                   {recentErrors.length > 1 && <ChevronDown size={12} className="opacity-50" />}
                </button>
                {showErrorHistory && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowErrorHistory(false)} />
                    <div className="absolute top-full left-0 mt-2 w-80 bg-[#161b22] border border-red-900/50 rounded-xl shadow-2xl z-40 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-red-950/30 border-b border-red-900/30">
                            <span className="text-[10px] font-bold text-red-400 uppercase">Recent Errors</span>
                             <button onClick={(e) => { e.stopPropagation(); setRecentErrors([]); setShowErrorHistory(false); }} className="text-red-400 hover:text-white p-1 rounded hover:bg-red-900/50"><Trash2 size={12} /></button>
                        </div>
                        {recentErrors.map((err, i) => (
                            <div key={i} className={`px-3 py-2 text-xs text-red-300 border-b border-red-900/10 last:border-0 ${i === 0 ? 'bg-red-900/10 font-medium' : ''}`}>
                                {err}
                            </div>
                        ))}
                    </div>
                  </>
                )}
            </div>
          )}

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
           <button
             onClick={() => setIsOptionsModalOpen(true)}
             className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700 hover:text-white rounded-lg text-sm font-medium transition-all"
           >
             <SlidersHorizontal size={16} />
             <span className="hidden sm:inline">Options</span>
           </button>

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
            onClick={() => setIsManualOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all"
          >
            <Book size={16} />
            <span className="hidden sm:inline">Manual</span>
          </button>
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
        
        <div className="hidden md:flex w-[200px] lg:w-80 bg-[#0d1117] border-r border-gray-800 flex-col shadow-xl z-10">
           <div 
             className="p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors group"
             onClick={() => {
                setIsPaused(true);
                setManagementModal({ isOpen: true, type: 'error' });
             }}
           >
             <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center justify-between gap-2 group-hover:text-red-300">
               <span className="flex items-center gap-2"><AlertCircle size={16} /> Failed Items ({errorQueue.length})</span>
               <span className="text-[10px] bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50 group-hover:border-red-500/50">MANAGE</span>
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
                 <div 
                    className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden relative mb-3 cursor-pointer"
                    onClick={() => setZoomedItem({ url: item.previewUrl, name: item.originalName, isProcessed: false })}
                 >
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
             <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 pb-20">
                {processed.map(item => (
                  <div 
                    key={item.id} 
                    className="break-inside-avoid mb-6 group relative bg-[#161b22] rounded-xl overflow-hidden shadow-xl border border-gray-800 transition-transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => setZoomedItem({ 
                        id: item.id,
                        url: item.processedUrl, 
                        name: item.fileName, 
                        originalUrl: item.originalUrl,
                        isProcessed: true
                    })}
                  >
                    <div className="relative bg-gray-900 overflow-hidden">
                      <img 
                        src={item.processedUrl} 
                        alt={item.fileName} 
                        className="w-full h-auto block"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                         <div className="p-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full">
                           <Maximize2 size={20} />
                         </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-800">
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

        <aside 
          className="w-80 bg-[#161b22] border-l border-gray-800 flex flex-col shadow-2xl z-10"
        >
          <div className="p-6 border-b border-gray-800">
            <div 
                className="flex items-center justify-between mb-4 cursor-pointer hover:text-white transition-colors group"
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return; 
                    setIsPaused(true);
                    setManagementModal({ isOpen: true, type: 'queue' });
                 }}
            >
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 group-hover:text-gray-300">
                    Upload Queue
                    {isPaused && <span className="text-yellow-500 text-[10px] bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-500/30">PAUSED</span>}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded border border-gray-700 text-gray-400 group-hover:text-white group-hover:border-gray-500">MANAGE</span>
                    {activeQueue.length > 0 && (
                    <button 
                        onClick={handleClearQueue}
                        className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-red-400 transition-colors"
                        title="Clear Queue"
                    >
                        <Trash2 size={14} />
                    </button>
                    )}
                </div>
            </div>
            
            <label className="flex flex-col items-center justify-center w-10 h-32 border-2 border-dashed border-gray-700 rounded-xl hover:border-gray-500 hover:bg-gray-800/50 transition-all cursor-pointer group">
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
                 <div 
                    className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3 relative cursor-pointer"
                    onClick={() => setZoomedItem({ url: item.previewUrl, name: item.originalName, isProcessed: false })}
                 >
                   <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                   {item.status === 'pending' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQueue(q => q.filter(i => i.id !== item.id)); }}
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

      <footer className="px-6 py-3 bg-[#161b22] border-t border-gray-800 text-center text-[10px] text-gray-600 tracking-wide shrink-0">
        KATJE - Knowledge And Technology Joyfully Engaged
      </footer>

      <Console 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        logs={logs} 
        onClear={() => setLogs([])}
      />
      
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdate={setSettings}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />
      
      <OptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        settings={settings}
        onUpdate={setSettings}
      />
      
      <QueueManagementModal 
          isOpen={managementModal.isOpen}
          onClose={() => {
              setManagementModal(prev => ({ ...prev, isOpen: false }));
              // Do not auto-unpause here; let user control it
          }}
          title={managementModal.type === 'error' ? 'Failed Items Manager' : 'Upload Queue Manager'}
          items={managementModal.type === 'error' ? errorQueue : activeQueue}
          onDelete={handleBulkDelete}
          onRetry={managementModal.type === 'error' ? handleBulkRetry : undefined}
      />

      {zoomedItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-default animate-in fade-in duration-200"
          onClick={(e) => {
             if (e.target === e.currentTarget) setZoomedItem(null);
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomPrev(); }}
            className={`absolute left-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed ${!zoomedItem.isProcessed ? 'hidden' : ''}`}
            disabled={!zoomedItem.isProcessed || processed.findIndex(p => p.id === zoomedItem.id) === 0}
          >
            <ChevronLeft size={48} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleZoomNext(); }}
            className={`absolute right-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed ${!zoomedItem.isProcessed ? 'hidden' : ''}`}
            disabled={!zoomedItem.isProcessed || processed.findIndex(p => p.id === zoomedItem.id) === processed.length - 1}
          >
            <ChevronRight size={48} />
          </button>

          <img 
            src={zoomedItem.url} 
            alt={zoomedItem.name} 
            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-sm pointer-events-none select-none"
          />
          
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={() => setZoomedItem(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <Trash2 size={24} className="rotate-45" />
            </button>
          </div>
          
          <div className="absolute top-6 left-6 text-white text-lg font-bold drop-shadow-md">
              {zoomedItem.name}
              {!zoomedItem.isProcessed && <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">PREVIEW</span>}
          </div>

          {zoomedItem.isProcessed && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm bg-black/50 px-4 py-2 rounded-full">
              {processed.findIndex(p => p.id === zoomedItem.id) + 1} / {processed.length} • Use arrow keys to navigate
            </div>
          )}
        </div>
      )}
    </div>
  );
};