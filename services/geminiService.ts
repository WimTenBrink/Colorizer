
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppSettings } from "../types";
import { PROMPT_CONFIG } from "../promptOptions";

// Helper to convert Blob/File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (!base64String) {
        reject(new Error("Failed to convert file to base64: result is empty"));
        return;
      }

      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const parts = base64String.split(',');
      const base64Data = parts.length > 1 ? parts[1] : base64String;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export class GeminiService {
  
  private getAi(): GoogleGenAI {
    // Strictly using process.env.API_KEY as per system instructions.
    // We instantiate this on every call to ensure we pick up the key 
    // if it was selected/changed at runtime.
    const apiKey = process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey });
  }

  async generateFilename(base64Image: string, modelId: string): Promise<{ filename: string, logs: any[] }> {
    const logs: any[] = [];
    const model = modelId;
    const prompt = "Analyze this image and provide a very short, descriptive filename (max 5 words) using kebab-case. Do not include extension.";

    const reqPayload = {
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image } },
          { text: prompt }
        ]
      }
    };

    logs.push({ type: 'req', title: 'Filename Generation Request', data: reqPayload });

    try {
      const ai = this.getAi();
      const response: GenerateContentResponse = await ai.models.generateContent(reqPayload);
      
      logs.push({ type: 'res', title: 'Filename Generation Response', data: response });
      
      const text = response.text?.trim() || 'processed-image';
      // Clean up text to ensure it's a valid filename
      const cleanName = text.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
      return { filename: cleanName || 'processed-image', logs };
    } catch (error) {
       logs.push({ type: 'err', title: 'Filename Generation Error', data: error });
       return { filename: 'processed-image', logs };
    }
  }

  async generateStory(base64Image: string, modelId: string): Promise<{ content: string, logs: any[] }> {
    const logs: any[] = [];
    const prompt = "Write a short, engaging story based on this image. Give it a creative title formatted as a Markdown Header (# Title). Format the story in Markdown.";
    
    const reqPayload = {
      model: modelId,
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Image } },
            { text: prompt }
        ]
      }
    };

    logs.push({ type: 'req', title: 'Story Generation Request', data: reqPayload });

    try {
        const ai = this.getAi();
        const response: GenerateContentResponse = await ai.models.generateContent(reqPayload);
        logs.push({ type: 'res', title: 'Story Generation Response', data: response });
        return { content: response.text || '', logs };
    } catch (e: any) {
        logs.push({ type: 'err', title: 'Story Generation Error', data: e });
        return { content: '', logs }; // Return empty string on error so main process doesn't crash completely
    }
  }

  async generateFailureReport(file: File): Promise<{ report: string, logs: any[] }> {
    const logs: any[] = [];
    // Use flash for fast analysis
    const model = 'gemini-2.5-flash'; 
    
    const prompt = `
      Act as an advanced computer vision analysis tool similar to Google Cloud Vision.
      Analyze the provided image and generate a comprehensive forensic report in Markdown format.
      
      The report MUST include the following sections:
      
      # Image Analysis Report
      
      ## 1. Safety Assessment (SafeSearch)
      Provide a human-readable analysis of the safety of this image. 
      Analyze the likelihood (Very Unlikely, Unlikely, Possible, Likely, Very Likely) for the following categories:
      - Adult Content
      - Violence / Gore
      - Racy / Suggestive
      - Medical / Surgery
      - Spoof / Fake
      - Harassment / Hate
      
      ## 2. Label Detection
      List all identified objects, concepts, and themes in the image with high confidence.
      
      ## 3. Object & Logo Detection
      Identify specific objects (bounding box context) and brand logos if present.
      
      ## 4. Landmark Detection
      Identify any famous natural or man-made landmarks.
      
      ## 5. Image Properties
      Describe dominant colors, lighting conditions, and composition.
      
      ## 6. Text Detection (OCR)
      Transcribe any visible text found in the image.
      
      ## 7. Detailed Visual Description
      Provide a neutral, factual description of the entire image content.
    `;

    try {
      const base64Image = await fileToGenerativePart(file);
      const mimeType = file.type;

      const reqPayload: any = {
        model,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
            // Permissive safety settings to ensure the report generation itself isn't blocked
            // if the image is controversial.
            safetySettings: [
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
            ]
        }
      };

      logs.push({ type: 'req', title: 'Failure Analysis Request', data: reqPayload });

      const ai = this.getAi();
      const response: GenerateContentResponse = await ai.models.generateContent(reqPayload);

      logs.push({ type: 'res', title: 'Failure Analysis Response', data: response });
      
      return { 
          report: response.text || "Analysis complete but no text generated.",
          logs 
      };

    } catch (error: any) {
      logs.push({ type: 'err', title: 'Failure Analysis Error', data: { message: error.message, stack: error.stack } });
      return { report: `## Analysis Failed\n\nError generating report: ${error.message}`, logs };
    }
  }

  async colorizeImage(file: File, settings: AppSettings): Promise<{ 
    imageUrl: string | null; 
    filename: string;
    logs: any[];
  }> {
    const logs: any[] = [];
    
    try {
      const base64Image = await fileToGenerativePart(file);
      const mimeType = file.type;

      // 1. Generate Filename
      const nameResult = await this.generateFilename(base64Image, settings.geminiModel);
      logs.push(...nameResult.logs);

      // 2. Generate Image
      const model = settings.imagenModel;
      
      // Construct Prompt based on settings
      let basePrompt = "";
      
      if (settings.revertToLineArt) {
        // Line Art Mode
        basePrompt = "Convert this image into high-quality black and white line art. Remove all shading, gradients, and colors. Focus on clean, crisp outlines. Use shading, hatching, or shades of grey specifically to represent darker skin tones, while keeping the rest as clean line art. Maintain the original composition but strictly as line art. Do not use a Manga style unless the original is distinctly Manga. Clean up text balloons and visual noise. Regarding content: Artistic and natural nudity is acceptable; do not heavily censor or hide it if it fits the artistic context.";
      } else {
        // Photo-realistic Colorization Mode
        basePrompt = "Colorize this image realistically. Use oil paint style. It should almost be a photo. Transform line drawings into photo-realistic images; do not retain outline lines, 'melt' them into realistic edges. If the image already has colors or a background, keep them but enhance them to be photo-realistic. Clean up the image: remove text balloons, text, and visual noise. Put more focus on the main characters. Ensure there are no white borders or whitespace on the sides. Do not use a Manga style unless the original is distinctly Manga. Treat this image as standalone. If the input contains multiple panels (like a comic page), crop/focus on and generate ONLY the largest or most significant panel as a single full image. Regarding content: Artistic and natural nudity is acceptable; do not heavily censor or hide it if it fits the artistic context.";
        
        // Background logic
        if (settings.extractCharacter) {
          basePrompt += " Isolate the main character. Crop the image to focus solely on them. Remove the background completely and replace it with a solid, pure white background (#FFFFFF). Ensure the character is fully visible and not cut off.";
        } else {
          // Dynamic Background
          const bgOption = PROMPT_CONFIG.backgrounds.find(o => o.value === settings.background);
          if (bgOption && bgOption.prompt) {
             basePrompt += " " + bgOption.prompt;
          }
        }
      }

      // --- New Features Logic (Dynamic from Config) ---

      // Helper to append option
      const append = (list: any[], val: string) => {
        const opt = list.find(o => o.value === val);
        if (opt && opt.prompt) basePrompt += " " + opt.prompt;
      };

      append(PROMPT_CONFIG.species, settings.targetSpecies);
      append(PROMPT_CONFIG.genders, settings.targetGender);
      append(PROMPT_CONFIG.ageGroups, settings.targetAge);
      append(PROMPT_CONFIG.skinTones, settings.targetSkin);
      append(PROMPT_CONFIG.hairColors, settings.targetHair);
      append(PROMPT_CONFIG.eyeColors, settings.eyeColor);
      append(PROMPT_CONFIG.bodyMods, settings.bodyMod);
      
      append(PROMPT_CONFIG.clothing, settings.clothingAmount);
      append(PROMPT_CONFIG.footwear, settings.footwear);
      append(PROMPT_CONFIG.items, settings.heldItem);
      append(PROMPT_CONFIG.creatures, settings.creature);

      append(PROMPT_CONFIG.timeOfDay, settings.timeOfDay);
      append(PROMPT_CONFIG.weather, settings.weather);
      append(PROMPT_CONFIG.lighting, settings.lighting);
      
      append(PROMPT_CONFIG.techLevels, settings.techLevel);
      append(PROMPT_CONFIG.moods, settings.mood);
      append(PROMPT_CONFIG.cameraAngles, settings.cameraType);

      // Fix Errors (Conditional)
      if (settings.fixErrors) {
        basePrompt += " Fix any anatomical errors or distortions in the original image, such as missing fingers, extra digits, distorted limbs, or asymmetric faces.";
      }

      const fullPrompt = settings.customPrompt ? `${basePrompt} ${settings.customPrompt}` : basePrompt;

      // Disable safety blocks to allow the model to see the input and generate unrestricted art
      const safetySettings = [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ];

      const ai = this.getAi();
      let outputUrl: string | null = null;

      if (model.includes('imagen')) {
         // --- IMAGEN MODEL PATH (Text-to-Image) ---
         logs.push({ type: 'INFO', title: 'Mode Switch', details: 'Using Imagen Text-to-Image model. Source image visual data is NOT used for generation, only the prompts derived from settings.' });

         const reqPayload: any = {
           model,
           prompt: fullPrompt,
           config: {
             numberOfImages: 1,
             outputMimeType: 'image/png', 
             aspectRatio: settings.aspectRatio || '1:1', // Pass aspect ratio to Imagen
             safetySettings
           }
         };

         logs.push({ type: 'req', title: 'Imagen Generation Request', data: reqPayload });
         
         const response = await ai.models.generateImages(reqPayload);
         logs.push({ type: 'res', title: 'Imagen Generation Response', data: response });

         if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
            outputUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
         }

      } else {
        // --- GEMINI MODEL PATH (Image-to-Image / Editing) ---
        // Map 8K to 4K as per API limits
        const effectiveResolution = settings.resolution === '8K' ? '4K' : settings.resolution;

        // If it's a nano/flash model, we might not support config based aspect ratio, so append it to prompt
        // If it's the Pro Image Preview, we can try using imageConfig if supported, but typically editing implies retaining source ratio
        // unless explicitly changed. Let's append to prompt for safety as API support for aspectRatio in edits varies.
        // HOWEVER, 'gemini-3-pro-image-preview' supports imageConfig with aspectRatio.
        
        const isPro = model.includes('pro');
        const aspectPrompt = !isPro && settings.aspectRatio !== '1:1' ? ` Change the aspect ratio to ${settings.aspectRatio}.` : '';

        const reqPayload: any = {
            model,
            contents: {
            parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: fullPrompt + aspectPrompt }
            ]
            },
            config: {
                safetySettings,
                imageConfig: {
                    // Only set imageSize if using the Pro model
                    ...(isPro && { imageSize: effectiveResolution }),
                    // Only set aspectRatio if using Pro model (Nano doesn't support it in config)
                    ...(isPro && { aspectRatio: settings.aspectRatio }) 
                }
            }
        };

        logs.push({ type: 'req', title: 'Gemini Generation Request', data: reqPayload });
        const response: GenerateContentResponse = await ai.models.generateContent(reqPayload);
        logs.push({ type: 'res', title: 'Gemini Generation Response', data: response });

        // Parse response for image
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                outputUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
            }
        }
      }

      return {
        imageUrl: outputUrl,
        filename: nameResult.filename,
        logs
      };

    } catch (error: any) {
      logs.push({ type: 'err', title: 'Process Error', data: { message: error.message, stack: error.stack } });
      throw { error, logs };
    }
  }
}
