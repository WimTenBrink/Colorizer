

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
  iterations: number; // Number of times to process this item
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
  eyeColors: PromptOption[]; // New
  bodyMods: PromptOption[]; // New
  techLevels: PromptOption[];
  ageGroups: PromptOption[];
  timeOfDay: PromptOption[];
  footwear: PromptOption[];
  backgrounds: PromptOption[];
  clothing: PromptOption[];
  items: PromptOption[]; // New
  creatures: PromptOption[]; // New
  weather: PromptOption[]; // New
  lighting: PromptOption[]; // New
  moods: PromptOption[]; // New
  cameraAngles: PromptOption[]; // New
  aspectRatios: PromptOption[]; // New
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
  generateReports: boolean;
  defaultIterations: number; // New setting

  // Subject
  targetSpecies: string;
  targetGender: string;
  targetAge: string;
  targetSkin: string;
  targetHair: string;
  eyeColor: string; // New
  bodyMod: string; // New
  
  // Attire & Gear
  clothingAmount: string;
  footwear: string;
  heldItem: string; // New
  creature: string; // New

  // World & Atmosphere
  timeOfDay: string;
  weather: string; // New
  lighting: string; // New
  
  // Style & Camera
  techLevel: string;
  mood: string; // New
  cameraType: string; // New
  aspectRatio: string; // New
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
  generateReports: false,
  defaultIterations: 1,

  targetSpecies: 'Original',
  targetGender: 'Original',
  targetAge: 'Original',
  targetSkin: 'Original',
  targetHair: 'Original',
  eyeColor: 'Original',
  bodyMod: 'Original',

  clothingAmount: 'as-is',
  footwear: 'Original',
  heldItem: 'Original',
  creature: 'Original',

  timeOfDay: 'Original',
  weather: 'Original',
  lighting: 'Original',

  techLevel: 'Original',
  mood: 'Original',
  cameraType: 'Original',
  aspectRatio: '1:1',
};

export const MODELS = {
  text: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
  ],
  image: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image (Nano Banana)' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image' },
    { id: 'imagen-3.0-generate-002', name: 'Imagen 3 (Text-to-Image)' },
    { id: 'imagen-4.0-generate-001', name: 'Imagen 4 (Text-to-Image)' },
  ]
};