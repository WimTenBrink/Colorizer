

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

export type Species = 'Original' | 'Human' | 'Vulcan' | 'Klingon' | 'Elf' | 'Half-Elf' | 'Gnome' | 'Dwarf' | 'Halfling' | 'Mermaid' | 'Angel' | 'Demon';

export type TechLevel = 'Original' | 'Primitive' | 'Ancient' | 'Medieval' | 'Renaissance' | 'Industrial' | 'Modern' | 'Cyberpunk' | 'Sci-Fi' | 'Far Future';

export type AgeGroup = 'Original' | 'Preteen' | 'Teenager' | 'Young Adult' | 'Adult' | 'Middle-Aged' | 'Elderly';

export type Footwear = 'Original' | 'Barefoot' | 'Sandals' | 'Anklets' | 'Clogs' | 'Sneakers' | 'Boots' | 'Shoes' | 'Leather Wraps';

export type BackgroundType = 
  'Original' | 
  'Transparent' | 
  'Beach' | 
  'Forest' | 
  'Plains' | 
  'Snow' | 
  'Desert' | 
  'Sea' | 
  'Rivers' | 
  'City' | 
  'Village' | 
  'Spaceship' | 
  'Moon' | 
  'Mars' | 
  'Mountains' | 
  'Jungle' | 
  'Castle' | 
  'Library' | 
  'Laboratory';

export interface AppSettings {
  geminiModel: string;
  imagenModel: string;
  customPrompt: string;
  resolution: '1K' | '2K' | '4K' | '8K';
  
  // Toggles
  // removeBackground: boolean; // Removed in favor of background dropdown
  background: BackgroundType;
  revertToLineArt: boolean;
  describeMode: boolean;
  extractCharacter: boolean;
  fixErrors: boolean; 

  // Dropdowns
  clothingAmount: 'as-is' | 'more' | 'less';
  targetSpecies: Species;
  techLevel: TechLevel;
  targetAge: AgeGroup;
  footwear: Footwear;
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
  techLevel: 'Original',
  targetAge: 'Original',
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

export const SPECIES_LIST: Species[] = [
  'Original', 'Human', 'Vulcan', 'Klingon', 'Elf', 'Half-Elf', 'Gnome', 'Dwarf', 'Halfling', 'Mermaid', 'Angel', 'Demon'
];

export const TECH_LEVELS: TechLevel[] = [
  'Original', 
  'Primitive', 
  'Ancient', 
  'Medieval', 
  'Renaissance', 
  'Industrial', 
  'Modern', 
  'Cyberpunk', 
  'Sci-Fi', 
  'Far Future'
];

export const AGE_GROUPS: AgeGroup[] = [
  'Original',
  'Preteen',
  'Teenager',
  'Young Adult',
  'Adult',
  'Middle-Aged',
  'Elderly'
];

export const FOOTWEAR_OPTIONS: Footwear[] = [
  'Original',
  'Barefoot',
  'Sandals',
  'Anklets',
  'Clogs',
  'Sneakers',
  'Boots',
  'Shoes',
  'Leather Wraps'
];

export const BACKGROUND_OPTIONS: BackgroundType[] = [
  'Original', 
  'Transparent', 
  'Beach', 
  'Forest', 
  'Plains', 
  'Snow', 
  'Desert', 
  'Sea', 
  'Rivers', 
  'City', 
  'Village', 
  'Spaceship', 
  'Moon', 
  'Mars', 
  'Mountains', 
  'Jungle', 
  'Castle', 
  'Library', 
  'Laboratory'
];