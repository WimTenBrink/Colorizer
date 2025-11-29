
import React from 'react';
import { X, Book, Github, Globe, Cpu, Layers, Palette, Wand2, Terminal, AlertTriangle, ShieldCheck, Download, Save, HardDrive } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MANUAL_MARKDOWN = `# Katje Colorizer Documentation v1.3

## 1. Introduction to Katje Colorizer

Welcome to **Katje Colorizer**, a premier image processing application developed by *Katje B.V. (Knowledge And Technology Joyfully Engaged)*. This tool represents a paradigm shift in how digital artists, archivists, and enthusiasts interact with black-and-white imagery.

By harnessing the dual power of Google's **Gemini** (for vision and understanding) and **Imagen** (for high-fidelity image generation), Katje Colorizer offers an automated pipeline for transforming sketches, line art, and historical photos into vibrant, 4K masterpieces.

Unlike traditional filters that simply overlay sepia tones or generic gradients, Katje Colorizer "re-imagines" the image. It understands materials, lighting context, anatomical nuances, and artistic intent, effectively painting the image pixel-by-pixel as a professional digital artist would.

## 2. Technical Architecture & Setup

### 2.1 The Two-Brain System
The application operates on a unique "Two-Brain" architecture:

- **Brain 1: Gemini (The Analyst)**
  Gemini acts as the eyes of the operation. When you upload an image, Gemini analyzes the visual content. It identifies whether the image is a sketch, a photo, or a comic panel. It determines the subject matter, the mood, and the composition. It also generates intelligent filenames and, in "Describe Mode", writes creative stories about the image.

- **Brain 2: Imagen (The Artist)**
  Imagen is the generative engine. It takes the detailed instructions prepared by Gemini and the user's settings to synthesize the final image. It is capable of rendering textures like skin, fabric, metal, and hair with photo-realistic precision up to 4K resolution.

### 2.2 API Key Requirements
To use Katje Colorizer, you must obtain a Google Cloud API Key with access to the Gemini API. This key is stored securely in your browser's Local Storage and is never transmitted to Katje B.V. servers; it goes directly from your browser to Google.

## 3. Core Features & Capabilities

### 3.1 Photo-Realistic Colorization
The primary function of the app. It takes black-and-white input and generates a fully colored version. The AI uses an "oil paint style" that leans heavily towards photo-realism. It handles complex lighting scenarios, such as subsurface scattering on skin or reflections on metal armor, automatically.

### 3.2 Line Art Conversion
By toggling the "Line Art Mode", the engine reverses its process. It takes colored images (or messy sketches) and distills them into clean, high-contrast black-and-white line art. This is invaluable for comic artists who need to clean up rough pencil scans or for creating coloring book pages.

*Note: When downloading images generated in Line Art Mode, the application will automatically prefix the filename with "lineart." (e.g., \`lineart.cat-sketch.png\`) to help you organize your files.*

### 3.3 Background Replacement
The application allows you to completely swap the environment of your subject. 
- **Transparent:** Removes the background creating an Alpha Channel PNG.
- **Scenic Presets:** Place your character instantly on a Beach, on Mars, in a Castle, or dozens of other locations. The AI handles the composite work, adjusting lighting and shadows to match the new scene.

### 3.4 Character Extraction
Similar to background removal, but places the subject on a pure white background. This is optimized for creating character reference sheets, ensuring the focus remains entirely on the design of the character without environmental distractions.

### 3.5 Describe Mode
Sometimes a picture is worth a thousand words. In Describe Mode, the application generates a Markdown file alongside the image. This file contains a creative story or detailed description of the scene, titled and formatted automatically.

## 4. Advanced Transformations & Options

The application features a comprehensive **Options Dialog** accessible via the "Options" button in the header. This interface is divided into four tabs:

### 4.1 Character Tab
Define the identity and biology of your subject:
- **Species:** Transform humans into fantasy races (Elf, Orc, Tiefling) or sci-fi species (Vulcan, Borg).
- **Gender:** Adjust the physical presentation (Male, Female, Androgynous).
- **Age:** Modify the apparent age from Child to Elderly.
- **Skin Tone:** Specify realistic ethnicities or fantasy colors (Blue, Green, Metallic).
- **Hair Color:** Choose from natural shades or vibrant dyes.

### 4.2 Attire Tab
Control clothing and style:
- **Clothing Amount:** Increase layers for cold weather or modesty, or decrease for summer/swimwear. Includes a "Nude (Implied)" option for artistic anatomy studies.
- **Footwear:** Select specific shoes (Boots, Sandals, Sneakers) or force a barefoot look.

### 4.3 World Tab
Set the stage and context:
- **Background:** Choose from over 30 environments including Nature, Cities, and Historical settings.
- **Time of Day:** Control the lighting atmosphere (Sunrise, Noon, Golden Hour, Midnight).
- **Tech Level:** Shift the entire genre of the image (Primitive, Medieval, Modern, Cyberpunk).

### 4.4 Tools Tab
System-level controls:
- **Resolution:** Set output quality (1K to 8K).
- **Fix Anatomy:** Enable negative prompting to correct AI errors with hands and limbs.
- **Extract Character:** Isolate subject on white.
- **Line Art Mode:** Switch to B&W sketch generation.
- **Describe Mode:** Enable text story generation.

## 5. Workflow & Error Handling

### 5.1 The Queue System
You can drag and drop hundreds of images at once. The application places them in a sequential queue. This prevents your browser from crashing by trying to process everything simultaneously.

### 5.2 Persistence & Storage
The application utilizes your browser's **IndexedDB** to automatically save your queue. If you accidentally refresh the page or close the browser, your pending images and settings are preserved and will reappear instantly when you return.

### 5.3 Throttling & Limits
- **API Throttling:** To comply with standard API quotas, the application limits processing to **60 images per minute**.
- **Concurrency:** The system processes up to **2 images simultaneously** to maximize throughput while respecting limits.
- **Download Queue:** Modern browsers block websites that try to download too many files simultaneously. Katje Colorizer spaces out file saves by 1.5 seconds.

### 5.4 Manual Error Handling
If an image fails to process (e.g., due to a content safety block or server error), it is moved to the "Failed Items" list. The system does **not** auto-retry. You must review the error and click "Retry" manually.

## 6. Legal & Credits

**Copyright & Ownership:** The application interface and logic are developed by **Katje B.V.** (Knowledge And Technology Joyfully Engaged). The source code for this specific web application is released into the **Public Domain**.

**Disclaimer:** This tool generates content using Google's AI models. Users are responsible for the content they generate and must adhere to Google's Generative AI Prohibited Use Policy. Katje B.V. assumes no liability for generated outputs.

View Source on GitHub: https://github.com/WimTenBrink/Colorizer
Website: katje.org & katje.biz
`;

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([MANUAL_MARKDOWN], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Katje_Colorizer_Manual.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
              <p className="text-sm text-gray-400">Katje Colorizer Documentation v1.3</p>
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
              <p className="text-sm text-blue-300 mt-2 p-3 bg-blue-900/20 rounded border border-blue-900/50">
                <strong>Note:</strong> When downloading images generated in Line Art Mode, the application will automatically prefix the filename with <code>lineart.</code> (e.g., <code>lineart.cat-sketch.png</code>) to help you organize your files.
              </p>

              <h3 className="text-xl text-white mt-6">3.3 Background Replacement</h3>
              <p>
                The application allows you to completely swap the environment of your subject. 
              </p>
              <ul className="text-sm mt-2 space-y-2">
                <li><strong>Transparent:</strong> Removes the background creating an Alpha Channel PNG.</li>
                <li><strong>Scenic Presets:</strong> Place your character instantly on a Beach, on Mars, in a Castle, or dozens of other locations. The AI handles the composite work, adjusting lighting and shadows to match the new scene.</li>
              </ul>

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
                4. Advanced Transformations & Options
              </h2>
              <p>
                The application features a comprehensive <strong>Options Dialog</strong> accessible via the "Options" button in the header. This interface is divided into four tabs:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="text-lg font-bold text-white">4.1 Character Tab</h4>
                  <p>Define the identity and biology of your subject:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Species:</strong> Transform humans into fantasy/sci-fi races (Elf, Vulcan, Borg).</li>
                    <li>• <strong>Gender:</strong> Adjust physical presentation (Male, Female, Androgynous).</li>
                    <li>• <strong>Age:</strong> Modify apparent age from Child to Elderly.</li>
                    <li>• <strong>Skin Tone:</strong> Realistic ethnicities or fantasy colors.</li>
                    <li>• <strong>Hair Color:</strong> Natural shades or vibrant dyes.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">4.2 Attire Tab</h4>
                  <p>Control clothing and style:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Clothing Amount:</strong> Layers for weather/modesty, or "Nude (Implied)" for artistic anatomy.</li>
                    <li>• <strong>Footwear:</strong> Specific shoes (Boots, Sneakers) or Barefoot.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="text-lg font-bold text-white">4.3 World Tab</h4>
                  <p>Set the stage and context:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Background:</strong> Over 30 environments (Nature, Cities, History).</li>
                    <li>• <strong>Time of Day:</strong> Lighting atmosphere (Sunrise, Noon, Midnight).</li>
                    <li>• <strong>Tech Level:</strong> Genre shift (Primitive, Medieval, Cyberpunk).</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">4.4 Tools Tab</h4>
                  <p>System-level controls:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Resolution:</strong> 1K to 8K output.</li>
                    <li>• <strong>Fix Anatomy:</strong> Correct AI errors with limbs.</li>
                    <li>• <strong>Extract Character:</strong> Isolate on white.</li>
                    <li>• <strong>Line Art Mode:</strong> B&W sketch generation.</li>
                  </ul>
                </div>
              </div>
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

              <h3 className="text-xl text-white mt-6 flex items-center gap-2"><HardDrive size={20} className="text-blue-400"/> 5.2 Persistence & Storage</h3>
              <p>
                The application utilizes your browser's <strong>IndexedDB</strong> to automatically save your queue. If you accidentally refresh the page or close the browser, your pending images and settings are preserved and will reappear instantly when you return.
              </p>

              <h3 className="text-xl text-white mt-6">5.3 Throttling & Limits</h3>
              <p>
                <strong>API Throttling:</strong> To comply with standard API quotas, the application limits processing to **60 images per minute**.
              </p>
              <p className="mt-2">
                <strong>Concurrency:</strong> The system processes up to **2 images simultaneously** to maximize throughput while respecting limits.
              </p>
              <p className="mt-2">
                <strong>Download Throttling:</strong> Modern browsers consider a website trying to download many files at once as a security threat (spam). To bypass this, Katje Colorizer implements a "Download Queue" that spaces out file saves by 1.5 seconds.
              </p>

              <h3 className="text-xl text-white mt-6">5.4 Manual Error Handling</h3>
              <p>
                If an image fails to process (e.g., due to a content safety block or server error), it is moved to the "Failed Items" list. The system does **not** auto-retry. You must review the error and click "Retry" manually. This ensures a bad batch doesn't result in an infinite loop of API errors.
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
