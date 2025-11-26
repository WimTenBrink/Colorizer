import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Console } from './components/Console';
import { SettingsModal } from './components/SettingsModal';
import { GeminiService } from './services/geminiService';
import { LogEntry, QueueItem, ProcessedItem, AppSettings, DEFAULT_SETTINGS } from './types';
import { Settings, Terminal, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Download, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processed, setProcessed] = useState<ProcessedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // UI Toggles
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Refs
  const geminiService = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setQueue(prev => prev.map((q, i) => i === nextItemIndex ? { ...q, status: 'processing' } : q));

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

        // Auto Download
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `${result.filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog('INFO', `Downloaded: ${result.filename}.png`, { url: result.imageUrl });
        
        // Update Queue Status (Remove or Mark Complete)
        // We will remove it from queue to keep it clean, or mark complete. 
        // Prompt says "Images are just stored in local storage until they are processed."
        // Let's remove from queue once done to signify "processed".
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
      // Update status to error
      setQueue(prev => prev.map((q, i) => i === nextItemIndex ? { ...q, status: 'error' } : q));
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
        originalName: f.name
      }));
    
    setQueue(prev => [...prev, ...newItems]);
    addLog('INFO', `Added ${files.length} files to queue`, newItems.map(i => i.originalName));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div 
      className="flex flex-col h-screen bg-[#0d1117] text-gray-200 font-sans"
      onPaste={handlePaste}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-pink-500/20">
            <ImageIcon className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Katje Colorizer</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Beta</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Main Content Grid */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* Left Sidebar - Blank as requested */}
        <div className="hidden md:block w-[200px] bg-[#0d1117] border-r border-gray-800">
           {/* Intentional blank space */}
        </div>

        {/* Main Area - Gallery */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0d1117] relative">
          {processed.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
               <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                 <Upload size={48} className="opacity-50" />
               </div>
               <h3 className="text-xl font-medium text-gray-400 mb-2">No Images Processed Yet</h3>
               <p className="max-w-md text-center text-sm">
                 Upload black and white images using the panel on the right. 
                 They will be processed and appear here automatically.
               </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processed.map(item => (
                  <div key={item.id} className="group relative bg-[#161b22] rounded-xl overflow-hidden shadow-xl border border-gray-800 transition-transform hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                      <img 
                        src={item.processedUrl} 
                        alt={item.fileName} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={item.processedUrl}
                          download={`${item.fileName}.png`}
                          className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform"
                          title="Download"
                        >
                          <Download size={20} />
                        </a>
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

        {/* Right Sidebar - Queue & Upload */}
        <aside 
          className="w-80 bg-[#161b22] border-l border-gray-800 flex flex-col shadow-2xl z-10"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-gray-800'); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-gray-800'); }}
          onDrop={(e) => { e.currentTarget.classList.remove('bg-gray-800'); handleDrop(e); }}
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {queue.length === 0 && (
               <div className="text-center py-10 text-gray-600 text-xs italic">
                 Queue is empty
               </div>
             )}
             {queue.map((item) => (
               <div key={item.id} className="flex gap-3 p-3 bg-[#0d1117] rounded-lg border border-gray-800 relative group animate-in slide-in-from-right-2 duration-300">
                 <div className="w-16 h-16 shrink-0 bg-gray-800 rounded-md overflow-hidden">
                   <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                   <p className="text-sm font-medium text-gray-300 truncate">{item.originalName}</p>
                   <div className="flex items-center gap-2 mt-1">
                     {item.status === 'pending' && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Pending</span>}
                     {item.status === 'processing' && <span className="text-xs text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Processing...</span>}
                     {item.status === 'error' && <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={10} /> Error</span>}
                     {item.status === 'completed' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Done</span>}
                   </div>
                 </div>
                 {item.status === 'pending' && (
                    <button 
                      onClick={() => setQueue(q => q.filter(i => i.id !== item.id))}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                 )}
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
      />
    </div>
  );
};

export default App;