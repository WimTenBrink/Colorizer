import React, { useState } from 'react';
import { LogEntry } from '../types';
import { X, Copy, Trash2, ChevronDown, ChevronRight, Terminal } from 'lucide-react';

interface ConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClear: () => void;
}

const LogItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = typeof entry.details === 'string' 
      ? entry.details 
      : JSON.stringify(entry.details, null, 2);
    navigator.clipboard.writeText(text);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'ERROR': return 'bg-red-900 text-red-200 border-red-700';
      case 'GEMINI_REQ': return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'GEMINI_RES': return 'bg-green-900 text-green-200 border-green-700';
      case 'IMAGEN_REQ': return 'bg-purple-900 text-purple-200 border-purple-700';
      case 'IMAGEN_RES': return 'bg-teal-900 text-teal-200 border-teal-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="border-b border-gray-800 last:border-0">
      <div 
        className="flex items-center p-3 hover:bg-gray-900 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="mr-2 text-gray-500">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="text-xs font-mono text-gray-500 mr-3 w-20 shrink-0">{entry.timestamp}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeColor(entry.type)} mr-3 w-24 text-center shrink-0`}>
          {entry.type}
        </span>
        <span className="text-sm text-gray-300 truncate flex-grow font-medium">{entry.title}</span>
        <button 
          onClick={copyToClipboard}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          title="Copy Details"
        >
          <Copy size={14} />
        </button>
      </div>
      
      {expanded && (
        <div className="bg-gray-950 p-4 overflow-x-auto border-t border-gray-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
            {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const Console: React.FC<ConsoleProps> = ({ isOpen, onClose, logs, onClear }) => {
  const [filter, setFilter] = useState<'ALL' | 'REQ' | 'RES' | 'ERROR'>('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'ERROR') return log.type === 'ERROR';
    if (filter === 'REQ') return log.type.includes('REQ');
    if (filter === 'RES') return log.type.includes('RES');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-[#0f1115] w-[90vw] h-[90vh] rounded-xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Terminal size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">System Console</h2>
            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-full">{logs.length} entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
            >
              <Trash2 size={14} />
              Clear Logs
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-6 py-3 bg-[#161b22] border-b border-gray-800">
          {['ALL', 'REQ', 'RES', 'ERROR'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                filter === f 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {f === 'ALL' ? 'All Logs' : f === 'REQ' ? 'Requests' : f === 'RES' ? 'Responses' : 'Errors'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <Terminal size={48} className="opacity-20" />
              <p>No logs to display</p>
            </div>
          ) : (
            filteredLogs.map(log => <LogItem key={log.id} entry={log} />)
          )}
        </div>
      </div>
    </div>
  );
};
