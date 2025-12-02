import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Download, Move } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  isProcessed?: boolean;
  index?: number;
  total?: number;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen, onClose, imageUrl, imageName,
  onNext, onPrev, hasNext, hasPrev,
  isProcessed, index, total
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  if (!isOpen) return null;

  const handleWheel = (e: React.WheelEvent) => {
    // Stop event from bubbling to prevent page scroll
    e.stopPropagation();
    
    // Calculate new scale
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 10);
    
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 10));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.1));
  const handleReset = () => { setScale(1); setPosition({x:0, y:0}); };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div 
        className="relative bg-[#0d1117] border border-gray-700 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center select-none"
        style={{ width: '95vw', height: '95vh' }}
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* Header / Info */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-800 pointer-events-auto max-w-md">
                <h3 className="text-white font-medium truncate" title={imageName}>{imageName}</h3>
                {isProcessed && total && (
                    <p className="text-xs text-gray-400 mt-1">
                        Image {index !== undefined ? index + 1 : 0} of {total}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
                <button 
                    onClick={handleDownload}
                    className="p-2 bg-black/60 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-800 transition-colors"
                    title="Download"
                >
                    <Download size={20} />
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 bg-black/60 hover:bg-red-900/50 text-gray-300 hover:text-white rounded-lg border border-gray-800 transition-colors"
                    title="Close"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Navigation Arrows */}
        {hasPrev && (
            <button 
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
            >
                <ChevronLeft size={32} />
            </button>
        )}
        {hasNext && (
            <button 
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
            >
                <ChevronRight size={32} />
            </button>
        )}

        {/* Viewport / Image */}
        <div 
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-move active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="transition-transform duration-75 ease-out will-change-transform"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
                }}
            >
                <img 
                    ref={imageRef}
                    src={imageUrl} 
                    alt={imageName} 
                    draggable={false}
                    className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl pointer-events-none"
                />
            </div>
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-4 px-6 py-3 bg-black/70 backdrop-blur-md rounded-full border border-gray-700 shadow-xl">
                <button 
                    onClick={handleZoomOut}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
                
                <span className="text-sm font-mono text-gray-300 w-16 text-center select-none">
                    {Math.round(scale * 100)}%
                </span>
                
                <button 
                    onClick={handleZoomIn}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>

                <div className="w-px h-5 bg-gray-600 mx-1"></div>
                
                <button 
                    onClick={handleReset}
                    className="text-gray-400 hover:text-white transition-colors p-1 flex items-center gap-2"
                    title="Reset View"
                >
                    <RotateCcw size={18} />
                    <span className="text-xs font-medium hidden sm:inline">Reset</span>
                </button>
            </div>
        </div>
        
        {/* Drag Hint */}
        {scale > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-50 animate-pulse">
                <div className="flex items-center gap-2 text-xs text-white bg-black/30 px-3 py-1 rounded-full">
                    <Move size={12} /> Drag to pan
                </div>
            </div>
        )}

      </div>
    </div>
  );
};