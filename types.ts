

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
  errorMessage?: string;
  retryCount?: number;
}

export interface ProcessedItem {
  id: string;
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  timestamp: number;
}

// Configuration Interfaces
export interface PromptOption {
  value: string;
  label: string;
  prompt: string;
}

export interface PromptConfig {
  species: PromptOption[];
  genders: PromptOption[];
  hairColors: PromptOption[];
  skinTones: PromptOption[];
  techLevels: PromptOption[];
  ageGroups: PromptOption[];
  timeOfDay: PromptOption[];
  footwear: PromptOption[];
  backgrounds: PromptOption[];
  clothing: PromptOption[];
}

// Settings Interface - using string to allow dynamic loading from config
export interface AppSettings {
  geminiModel: string;
  imagenModel: string;
  customPrompt: string;
  resolution: '1K' | '2K' | '4K' | '8K';
  
  // Toggles
  background: string;
  revertToLineArt: boolean;
  describeMode: boolean;
  extractCharacter: boolean;
  fixErrors: boolean; 

  // Dropdowns
  clothingAmount: string;
  targetSpecies: string;
  targetGender: string;
  targetHair: string;
  targetSkin: string;
  techLevel: string;
  targetAge: string;
  timeOfDay: string;
  footwear: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  geminiModel: 'gemini-2.5-flash',
  imagenModel: 'gemini-2.5-flash-image',
  customPrompt: '',
  resolution: '4K',
  
  background: 'Original',
  revertToLineArt: false,
  describeMode: false,
  extractCharacter: false,
  fixErrors: true, 

  clothingAmount: 'as-is',
  targetSpecies: 'Original',
  targetGender: 'Original',
  targetHair: 'Original',
  targetSkin: 'Original',
  techLevel: 'Original',
  targetAge: 'Original',
  timeOfDay: 'Original',
  footwear: 'Original'
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