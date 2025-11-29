import React, { useState, useEffect } from 'react';
import { QueueItem } from '../types';
import { X, Trash2, RotateCcw, CheckSquare, Square } from 'lucide-react';

interface QueueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: QueueItem[];
  onDelete: (ids: string[]) => void;
  onRetry?: (ids: string[]) => void;
}

export const QueueManagementModal: React.FC<QueueManagementModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onDelete,
  onRetry
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when opened
  useEffect(() => {
    if (isOpen) setSelectedIds(new Set());
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${selectedIds.size} items?`)) {
      onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] w-[95vw] h-[95vh] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <span className="text-sm text-gray-500 bg-gray-900 px-2 py-1 rounded-md">{items.length} items</span>
          </div>
          
          <div className="flex items-center gap-3">
             {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-right-4">
                   <span className="text-sm text-gray-400 mr-2">{selectedIds.size} selected</span>
                   
                   {onRetry && (
                     <button
                       onClick={handleRetry}
                       className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                     >
                       <RotateCcw size={16} /> Retry Selected
                     </button>
                   )}
                   
                   <button
                     onClick={handleDelete}
                     className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50 hover:border-red-500 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Trash2 size={16} /> Delete Selected
                   </button>
                </div>
             )}
             
             <button 
               onClick={onClose}
               className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors"
             >
               <X size={16} /> Close
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2 bg-[#161b22] border-b border-gray-800 flex items-center gap-2">
            <button 
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              {selectedIds.size === items.length && items.length > 0 ? <CheckSquare size={16} className="text-blue-400"/> : <Square size={16}/>}
              Select All
            </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent bg-[#0d1117]">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                    <p>No items found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {items.map(item => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                            <div 
                                key={item.id}
                                onClick={() => toggleSelection(item.id)}
                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-800 hover:border-gray-600'}`}
                            >
                                <img src={item.previewUrl} alt={item.originalName} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="absolute top-2 left-2">
                                         {isSelected ? <CheckSquare className="text-blue-400 bg-black/50 rounded" size={20} /> : <Square className="text-white/70" size={20} />}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                    <p className="text-xs text-white truncate">{item.originalName}</p>
                                    {item.errorMessage && (
                                        <p className="text-[10px] text-red-400 truncate">{item.errorMessage}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};