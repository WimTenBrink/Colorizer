
import React from 'react';
import { X, Book, Github, Globe, Cpu, Layers, Palette, Wand2, Terminal, AlertTriangle, ShieldCheck, Download, Save, HardDrive, FileText, Repeat, Eye, Settings2, Image as ImageIcon } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MANUAL_MARKDOWN = `# Katje Colorizer Documentation v2.0

## 1. Introduction

Welcome to **Katje Colorizer v2.0**, an advanced AI-powered image processing suite developed by *Katje B.V.*. This tool bridges the gap between rough sketches and high-fidelity digital art by leveraging a unique multi-model architecture.

It is designed for:
*   **Artists:** Colorize sketches, generate variations, and create reference sheets.
*   **Archivists:** Restore and reimagine historical photos.
*   **Forensics:** Analyze image content and generate safety reports.
*   **Enthusiasts:** Transform concepts into 4K reality.

## 2. The Two-Brain Architecture

Katje Colorizer uses two distinct AI models working in tandem:

### Brain 1: Gemini (The Analyst)
Gemini acts as the "eyes". It sees your upload, understands the context, composition, and content.
*   **Naming:** Automatically generates descriptive filenames (e.g., \`cyberpunk-detective.png\`).
*   **Storytelling:** Can write creative stories based on the image in "Describe Mode".
*   **Forensics:** When an image fails to process, Gemini acts as a forensic analyst, generating a detailed report on *why* (e.g., detecting safety violations, landmarks, or text).

### Brain 2: Imagen / Gemini Pro (The Artist)
The generative engine that paints the pixels.
*   **Gemini Models:** Best for *editing* and preserving the exact structure of your source image (Image-to-Image).
*   **Imagen Models:** Best for *re-imagining* the concept with higher fidelity, though it may deviate from the exact line work (Text-to-Image).

## 3. Core Features

### 3.1 Intelligent Queue System
*   **Sequential Processing:** The app processes one image at a time to maximize quality and API throughput.
*   **Priority Logic:** The top item is always processed first. New items are added to the bottom.
*   **Retry Behavior:** If you manually retry a failed item, it is moved to the *bottom* of the queue to prevent blocking other pending jobs.

### 3.2 Iterative Generation
Want 5 variations of the same sketch?
*   **Batching:** Set the **Default Iterations** (in Options > Output) to 5, 10, or even 100.
*   **Resilience:** If one variation fails, the system automatically decrements the counter and retries the next variation immediately, ensuring you get your requested number of images (or as close as possible).

### 3.3 Forensic Failure Reports
If an image fails (e.g., due to safety filters or API errors), the system can automatically generate a **Forensic Report**.
*   This Markdown file includes SafeSearch analysis, label detection, and OCR text extraction.
*   Enable this in **Options > Tools > Generate Reports**.

### 3.4 Advanced Image Viewer
Click any processed image to open the High-Fidelity Viewer.
*   **Pan & Zoom:** Use your mouse wheel to zoom (up to 1000%) and drag to pan around 4K images.
*   **Navigation:** Use arrow keys to browse your gallery without closing the viewer.

## 4. Configuration Guide

The **Options** menu is divided into 5 logical categories:

### 4.1 Subject (The "Who")
Define the biological and physical traits of your character.
*   **Species:** 50+ presets including Elf, Orc, Cyborg, and Star Trek species.
*   **Body Mods:** Add tattoos, scars, vitiligo, or cybernetics.
*   **Eyes & Hair:** Customize specific colors (e.g., "Glowing Blue" eyes).

### 4.2 Gear & Companions (The "What")
*   **Attire:** Control clothing layers. Includes "Implied Nudity" for artistic anatomy studies (using minimal coverage like leaves/pasties).
*   **Held Items:** Equip your character with swords, scrolls, or tech.
*   **Companions:** Add pets like dragons, wolves, or floating robots.

### 4.3 World & Atmosphere (The "Where")
*   **Background:** 30+ environments (Cyberpunk Slums, Mars, Ancient Rome).
*   **Time of Day:** Precise lighting control (e.g., "06:00 Sunrise" vs "18:00 Golden Hour").
*   **Weather:** Rain, Snow, Fog, or Clear skies.

### 4.4 Style & Camera (The "How")
*   **Tech Level:** Shift the genre (Primitive -> Medieval -> Modern -> Sci-Fi).
*   **Camera:** Simulate specific lenses (Fisheye, Macro, Portrait 85mm) and angles (Low Angle, Overhead).
*   **Mood:** Force a specific emotional tone (Angry, Melancholic, Heroic).

### 4.5 Output & Batch
*   **Resolution:** Select output quality (1K to 8K).
*   **Default Iterations:** Set how many times each uploaded file should be processed.

## 5. Settings Management

*   **Import/Export:** You can save your complex prompt configurations to a \`.kct\` file and share them with others or load them later.
*   **As-Is:** All dropdowns include an "As Is / Original" option, instructing the AI to respect the source image's existing details for that category.

## 6. Privacy & Legal

*   **API Key:** Your Google Cloud API Key is stored locally in your browser. It is communicated directly to Google's servers and is never seen by Katje B.V.
*   **Copyright:** The images you generate are subject to Google's Generative AI terms. The source code of this application is Public Domain.

---
*Documentation generated for Katje Colorizer v2.0*
`;

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([MANUAL_MARKDOWN], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Katje_Colorizer_Manual_v2.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] w-[95vw] h-[95vh] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#161b22] border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-600/20">
              <Book size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">User Manual</h2>
              <p className="text-sm text-gray-400">Katje Colorizer Documentation v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors border border-gray-700 hover:border-gray-500"
              title="Download as .md"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <article className="max-w-4xl mx-auto prose prose-invert prose-blue prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white">
            
            {/* Chapter 1: Introduction */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h1 className="text-4xl mb-6 text-white flex items-center gap-3">
                <Globe className="text-blue-500" />
                1. Introduction
              </h1>
              <p className="lead text-xl text-gray-300">
                Welcome to <strong>Katje Colorizer v2.0</strong>. This major update introduces a robust "Two-Brain" AI architecture, forensic reporting tools, and advanced batch processing capabilities.
              </p>
              <p>
                Whether you are refining rough sketches, restoring historical archives, or exploring creative variations, this tool provides professional-grade controls over the generative process.
              </p>
            </div>

            {/* Chapter 2: Architecture */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Cpu className="text-purple-500" />
                2. The Two-Brain Architecture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl text-blue-300 mt-0 flex items-center gap-2"><Terminal size={20}/> Gemini (The Analyst)</h3>
                    <p>Acts as the system's eyes. It analyzes safety, context, and composition.</p>
                    <ul className="text-sm mt-4 space-y-2">
                        <li>• <strong>Naming:</strong> Auto-generates filenames (e.g., <code>elf-warrior.png</code>).</li>
                        <li>• <strong>Forensics:</strong> Generates failure reports if images are blocked.</li>
                        <li>• <strong>Storytelling:</strong> Writes creative descriptions in "Describe Mode".</li>
                    </ul>
                 </div>
                 <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl text-pink-300 mt-0 flex items-center gap-2"><Palette size={20}/> Imagen (The Artist)</h3>
                    <p>The generative engine responsible for pixel-perfect rendering.</p>
                     <ul className="text-sm mt-4 space-y-2">
                        <li>• <strong>Gemini Models:</strong> Best for editing while keeping source structure.</li>
                        <li>• <strong>Imagen Models:</strong> Best for high-fidelity "Re-imagining" (Text-to-Image).</li>
                        <li>• <strong>Resolution:</strong> Supports up to 4K output.</li>
                    </ul>
                 </div>
              </div>
            </div>

            {/* Chapter 3: Features */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Layers className="text-green-500" />
                3. Core Features
              </h2>

              <h3 className="text-xl text-white mt-8 flex items-center gap-2"><Repeat size={20} className="text-teal-400"/> 3.1 Iterative Batching</h3>
              <p>
                You can now generate multiple variations of a single file automatically.
              </p>
              <ul className="pl-4 border-l-2 border-teal-500/30 ml-2 space-y-2">
                 <li><strong>Set Counter:</strong> In <em>Options > Output</em>, set "Default Iterations" to 5.</li>
                 <li><strong>Processing:</strong> The system will generate the image 5 times before moving to the next file.</li>
                 <li><strong>Resilience:</strong> If one generation fails (e.g., safety block), it auto-retries the next one until the counter reaches zero.</li>
              </ul>

              <h3 className="text-xl text-white mt-8 flex items-center gap-2"><FileText size={20} className="text-red-400"/> 3.2 Forensic Reports</h3>
              <p>
                When an image fails to process, you often want to know <em>why</em>. Enable <strong>Generate Reports</strong> in the Options menu.
              </p>
              <p>
                On failure, the system will download a Markdown report containing:
              </p>
              <ul className="list-disc pl-6 text-sm text-gray-400">
                <li>SafeSearch likelihoods (Adult, Violence, Racy).</li>
                <li>Detected labels and objects.</li>
                <li>OCR text extraction.</li>
              </ul>

               <h3 className="text-xl text-white mt-8 flex items-center gap-2"><ImageIcon size={20} className="text-yellow-400"/> 3.3 Advanced Viewer</h3>
               <p>
                 Clicking any processed image opens the new high-fidelity viewer.
               </p>
               <ul className="list-disc pl-6 text-sm text-gray-400">
                 <li><strong>Zoom:</strong> Scroll to zoom up to 1000%.</li>
                 <li><strong>Pan:</strong> Click and drag to inspect details.</li>
                 <li><strong>Navigate:</strong> Use keyboard arrows to browse the gallery.</li>
               </ul>
            </div>

            {/* Chapter 4: Configuration */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Settings2 className="text-blue-400" />
                4. Configuration Guide
              </h2>
              <p>The options menu has been reorganized into 5 specialized tabs:</p>

              <div className="space-y-6 mt-6">
                <div className="border border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-2">Subject Tab</h4>
                    <p className="text-sm">Define the "Who". Species (Elf, Orc, Borg), Body Mods (Tattoos, Scars), Eye Color, Skin Tone.</p>
                </div>
                 <div className="border border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-2">Gear & Companions Tab</h4>
                    <p className="text-sm">Define the "What". Attire (Clothing layers, Implied Nudity), Held Items (Swords, Tech), Companions (Dragons, Pets).</p>
                </div>
                 <div className="border border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-2">World & Atmosphere Tab</h4>
                    <p className="text-sm">Define the "Where". Backgrounds (30+ presets), Time of Day (e.g., 06:00 Sunrise), Weather, Lighting.</p>
                </div>
                 <div className="border border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-2">Style & Camera Tab</h4>
                    <p className="text-sm">Define the "How". Tech Level, Camera Lenses (Fisheye, Macro), Mood, Aspect Ratio.</p>
                </div>
              </div>
            </div>

            {/* Chapter 5: Workflow */}
            <div className="mb-12">
               <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <HardDrive className="text-gray-400" />
                5. Workflow & Storage
              </h2>
              
              <h3 className="text-xl text-white mt-4">Queue Logic</h3>
              <p>
                The queue is strictly <strong>Sequential</strong>. The top item is always processed first. If you add new files, they go to the bottom. If you retry a failed file, it moves to the bottom to unblock the queue.
              </p>

              <h3 className="text-xl text-white mt-4">Config Management</h3>
              <p>
                You can now <strong>Export</strong> your settings to a <code>.kct</code> file. This is useful for saving specific prompts (e.g., "Cyberpunk Settings" vs "Fantasy Settings") and loading them instantly later.
              </p>

              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-8">
                 <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://github.com/WimTenBrink/Colorizer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Github size={20} />
                    View Source on GitHub
                  </a>
                   <span className="text-gray-500 flex items-center gap-2">
                    <Globe size={20} />
                    katje.org & katje.biz
                  </span>
                </div>
              </div>
            </div>

          </article>
        </div>
      </div>
    </div>
  );
};
