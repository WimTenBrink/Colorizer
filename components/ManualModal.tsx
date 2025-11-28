import React from 'react';
import { X, Book, Github, Globe, Cpu, Layers, Palette, Wand2, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] w-[95vw] h-[95vh] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#161b22] border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-600/20">
              <Book size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">User Manual</h2>
              <p className="text-sm text-gray-400">Katje Colorizer Documentation v1.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <article className="max-w-4xl mx-auto prose prose-invert prose-blue prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white">
            
            {/* Chapter 1: Introduction */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h1 className="text-4xl mb-6 text-white flex items-center gap-3">
                <Globe className="text-blue-500" />
                1. Introduction to Katje Colorizer
              </h1>
              <p className="lead text-xl text-gray-300">
                Welcome to <strong>Katje Colorizer</strong>, a premier image processing application developed by <em>Katje B.V. (Knowledge And Technology Joyfully Engaged)</em>. This tool represents a paradigm shift in how digital artists, archivists, and enthusiasts interact with black-and-white imagery.
              </p>
              <p>
                By harnessing the dual power of Google's <strong>Gemini</strong> (for vision and understanding) and <strong>Imagen</strong> (for high-fidelity image generation), Katje Colorizer offers an automated pipeline for transforming sketches, line art, and historical photos into vibrant, 4K masterpieces.
              </p>
              <p>
                Unlike traditional filters that simply overlay sepia tones or generic gradients, Katje Colorizer "re-imagines" the image. It understands materials, lighting context, anatomical nuances, and artistic intent, effectively painting the image pixel-by-pixel as a professional digital artist would.
              </p>
            </div>

            {/* Chapter 2: System Architecture */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Cpu className="text-purple-500" />
                2. Technical Architecture & Setup
              </h2>
              
              <h3 className="text-xl text-white mt-8 mb-4">2.1 The Two-Brain System</h3>
              <p>
                The application operates on a unique "Two-Brain" architecture:
              </p>
              <ul className="list-none space-y-4 pl-0">
                <li className="flex gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                  <div className="mt-1"><Terminal className="text-blue-400" /></div>
                  <div>
                    <strong className="text-white block text-lg">Brain 1: Gemini (The Analyst)</strong>
                    Gemini acts as the eyes of the operation. When you upload an image, Gemini analyzes the visual content. It identifies whether the image is a sketch, a photo, or a comic panel. It determines the subject matter, the mood, and the composition. It also generates intelligent filenames and, in "Describe Mode", writes creative stories about the image.
                  </div>
                </li>
                <li className="flex gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                  <div className="mt-1"><Palette className="text-pink-400" /></div>
                  <div>
                    <strong className="text-white block text-lg">Brain 2: Imagen (The Artist)</strong>
                    Imagen is the generative engine. It takes the detailed instructions prepared by Gemini and the user's settings to synthesize the final image. It is capable of rendering textures like skin, fabric, metal, and hair with photo-realistic precision up to 4K resolution.
                  </div>
                </li>
              </ul>

              <h3 className="text-xl text-white mt-8 mb-4">2.2 API Key Requirements</h3>
              <div className="bg-blue-900/10 border-l-4 border-blue-500 p-6 my-6">
                <h4 className="text-lg font-bold text-blue-300 mt-0">Why is an API Key required?</h4>
                <p className="text-sm text-blue-200/80">
                  This application does not process images on your local computer. High-fidelity AI generation requires massive computational power—specifically, Tensor Processing Units (TPUs) hosted in Google's cloud data centers.
                </p>
                <p className="text-sm text-blue-200/80 mt-2">
                  The API Key is your digital passport that grants this application permission to send data to those servers and receive the generated images back.
                </p>
              </div>
              <p>
                To use Katje Colorizer, you must obtain a Google Cloud API Key with access to the Gemini API. This key is stored securely in your browser's Local Storage and is never transmitted to Katje B.V. servers; it goes directly from your browser to Google.
              </p>
            </div>

            {/* Chapter 3: Core Features */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Layers className="text-green-500" />
                3. Core Features & Capabilities
              </h2>

              <h3 className="text-xl text-white mt-6">3.1 Photo-Realistic Colorization</h3>
              <p>
                The primary function of the app. It takes black-and-white input and generates a fully colored version. The AI uses an "oil paint style" that leans heavily towards photo-realism. It handles complex lighting scenarios, such as subsurface scattering on skin or reflections on metal armor, automatically.
              </p>

              <h3 className="text-xl text-white mt-6">3.2 Line Art Conversion</h3>
              <p>
                By toggling the "Line Art Mode", the engine reverses its process. It takes colored images (or messy sketches) and distills them into clean, high-contrast black-and-white line art. This is invaluable for comic artists who need to clean up rough pencil scans or for creating coloring book pages.
              </p>

              <h3 className="text-xl text-white mt-6">3.3 Intelligent Background Removal</h3>
              <p>
                The "Remove BG" option doesn't just cut pixels; it regenerates the image with an Alpha Channel. This means the subject is seamlessly extracted, with transparency preserved for hair strands and semi-transparent materials.
              </p>

              <h3 className="text-xl text-white mt-6">3.4 Character Extraction</h3>
              <p>
                Similar to background removal, but places the subject on a pure white background. This is optimized for creating character reference sheets, ensuring the focus remains entirely on the design of the character without environmental distractions.
              </p>

              <h3 className="text-xl text-white mt-6">3.5 Describe Mode</h3>
              <p>
                Sometimes a picture is worth a thousand words. In Describe Mode, the application generates a Markdown file alongside the image. This file contains a creative story or detailed description of the scene, titled and formatted automatically.
              </p>
            </div>

            {/* Chapter 4: Transformations */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <Wand2 className="text-yellow-500" />
                4. Advanced Transformations
              </h2>
              <p>
                Katje Colorizer allows you to fundamentally alter the reality of the image through semantic transformations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="text-lg font-bold text-white">4.1 Species Mutation</h4>
                  <p>
                    Transform a human subject into various fantasy or sci-fi races. Options include:
                  </p>
                  <ul className="text-sm grid grid-cols-2 gap-2">
                    <li>• Vulcan / Klingon</li>
                    <li>• Elf / Half-Elf</li>
                    <li>• Dwarf / Gnome</li>
                    <li>• Angel / Demon</li>
                    <li>• Mermaid</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">The AI preserves the pose and gender but alters ear shape, skin tone, and facial structure.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">4.2 Temporal Shift (Tech Level)</h4>
                  <p>
                    Transport your subject through time. Changing the Tech Level alters the clothing, background artifacts, and general aesthetic:
                  </p>
                  <ul className="text-sm">
                    <li>• <strong>Primitive/Ancient:</strong> Furs, stone tools, bronze age tunics.</li>
                    <li>• <strong>Medieval/Renaissance:</strong> Plate armor, castles, ornate silks.</li>
                    <li>• <strong>Modern/Industrial:</strong> Suits, factories, smartphones.</li>
                    <li>• <strong>Cyberpunk/Far Future:</strong> Neons, implants, energy beings.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="text-lg font-bold text-white">4.3 Age Modification</h4>
                  <p>
                    Alter the apparent age of the subject. The AI will adjust facial features, skin texture, and body proportions to match the selected life stage:
                  </p>
                  <ul className="text-sm">
                    <li>• <strong>Child / Preteen</strong></li>
                    <li>• <strong>Teenager</strong></li>
                    <li>• <strong>Young Adult / Adult</strong></li>
                    <li>• <strong>Middle-Aged / Elderly</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">4.4 Footwear & Clothing</h4>
                  <p>
                     Control the attire of your subject with granular precision:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li><strong>Clothing:</strong> Increase layers (coats/robes) or decrease them (swimwear/summer).</li>
                    <li><strong>Footwear:</strong> Select specific footwear styles including Sandals, Boots, Sneakers, Clogs, or Leather Wraps. You can also enforce a "Barefoot" look.</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl text-white mt-8">4.5 Anatomy Fixer</h3>
              <p>
                Generative AI sometimes struggles with extremities. The "Fix Anatomy" toggle injects specific negative prompts and guidance instructions to prioritize the correct rendering of hands, fingers (5 per hand!), and limb symmetry.
              </p>
            </div>

            {/* Chapter 5: Workflow Management */}
            <div className="mb-12 border-b border-gray-800 pb-8">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <AlertTriangle className="text-orange-500" />
                5. Workflow & Error Handling
              </h2>

              <h3 className="text-xl text-white mt-6">5.1 The Queue System</h3>
              <p>
                You can drag and drop hundreds of images at once. The application places them in a sequential queue. This prevents your browser from crashing by trying to process everything simultaneously.
              </p>

              <h3 className="text-xl text-white mt-6">5.2 Browser Throttling</h3>
              <p>
                <strong>Important Note on Downloads:</strong> Modern browsers consider a website trying to download 50 files at once as a security threat (spam). To bypass this, Katje Colorizer implements a "Download Queue" that spaces out file saves by 1.5 seconds. If you see downloads happening slowly after a batch job, this is intentional to ensure every file arrives safely.
              </p>

              <h3 className="text-xl text-white mt-6">5.3 Auto-Retry Logic</h3>
              <p>
                Cloud AI services can occasionally timeout or return a "server busy" 503 error. You can configure the application to automatically retry failed images 1, 3, 5, or infinite times. This allows you to leave a batch running overnight with confidence that temporary glitches won't ruin the batch.
              </p>
            </div>

             {/* Chapter 6: Legal */}
             <div className="mb-12">
              <h2 className="text-3xl mb-6 text-white flex items-center gap-3">
                <ShieldCheck className="text-gray-400" />
                6. Legal & Credits
              </h2>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <p className="font-bold text-white mb-2">Copyright & Ownership</p>
                <p>
                  The application interface and logic are developed by <strong>Katje B.V.</strong> (Knowledge And Technology Joyfully Engaged).
                </p>
                <p className="mt-4">
                  However, the source code for this specific web application is released into the <strong>Public Domain</strong>. You are free to modify, distribute, and use it commercially without restriction.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-700">
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
              
              <p className="text-xs text-gray-500 mt-8">
                <em>Disclaimer: This tool generates content using Google's AI models. Users are responsible for the content they generate and must adhere to Google's Generative AI Prohibited Use Policy. Katje B.V. assumes no liability for generated outputs.</em>
              </p>
            </div>

          </article>
        </div>
      </div>
    </div>
  );
};