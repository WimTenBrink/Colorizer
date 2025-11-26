export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ERROR' | 'GEMINI_REQ' | 'GEMINI_RES' | 'IMAGEN_REQ' | 'IMAGEN_RES';
  title: string;
  details: string | object;
}

export interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalName: string;
}

export interface ProcessedItem {
  id: string;
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  timestamp: number;
}

export interface AppSettings {
  geminiModel: string;
  imagenModel: string;
  customPrompt: string;
  resolution: '1K' | '2K' | '4K'; // Only applies to Pro models
}

export const DEFAULT_SETTINGS: AppSettings = {
  geminiModel: 'gemini-2.5-flash', // For filename generation
  imagenModel: 'gemini-2.5-flash-image', // "Nano Banana"
  customPrompt: '',
  resolution: '1K'
};

export const MODELS = {
  text: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
  ],
  image: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Nano Banana)' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image' },
  ]
};
