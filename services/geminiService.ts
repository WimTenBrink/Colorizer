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
        basePrompt = "Convert this image into high-quality black and white line art. Remove all shading, gradients, and colors. Focus on clean, crisp outlines. Use shading, hatching, or shades of grey specifically to represent darker skin tones, while keeping the rest as clean line art. Maintain the original composition but strictly as line art. Do not use a Manga style unless the original is distinctly Manga. Clean up text balloons and visual noise.";
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

      // Species Transformation
      const speciesOpt = PROMPT_CONFIG.species.find(o => o.value === settings.targetSpecies);
      if (speciesOpt && speciesOpt.prompt) {
        basePrompt += " " + speciesOpt.prompt;
      }
      
      // Gender Transformation
      const genderOpt = PROMPT_CONFIG.genders.find(o => o.value === settings.targetGender);
      if (genderOpt && genderOpt.prompt) {
        basePrompt += " " + genderOpt.prompt;
      }

      // Tech Level Transformation
      const techOpt = PROMPT_CONFIG.techLevels.find(o => o.value === settings.techLevel);
      if (techOpt && techOpt.prompt) {
        basePrompt += " " + techOpt.prompt;
      }

      // Age Transformation
      const ageOpt = PROMPT_CONFIG.ageGroups.find(o => o.value === settings.targetAge);
      if (ageOpt && ageOpt.prompt) {
         basePrompt += " " + ageOpt.prompt;
      }

      // Clothing Adjustment
      const clothingOpt = PROMPT_CONFIG.clothing.find(o => o.value === settings.clothingAmount);
      if (clothingOpt && clothingOpt.prompt) {
        basePrompt += " " + clothingOpt.prompt;
      }

      // Footwear Adjustment
      const footwearOpt = PROMPT_CONFIG.footwear.find(o => o.value === settings.footwear);
      if (footwearOpt && footwearOpt.prompt) {
         basePrompt += " " + footwearOpt.prompt;
      }

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

      // Map 8K to 4K as per API limits
      const effectiveResolution = settings.resolution === '8K' ? '4K' : settings.resolution;

      const reqPayload: any = {
        model,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: fullPrompt }
          ]
        },
        config: {
            safetySettings,
            imageConfig: {
                // Only set imageSize if using the Pro model, otherwise it might throw or be ignored
                ...(model.includes('pro') && { imageSize: effectiveResolution })
            }
        }
      };

      logs.push({ type: 'req', title: 'Image Generation Request', data: reqPayload });

      const ai = this.getAi();
      const response: GenerateContentResponse = await ai.models.generateContent(reqPayload);

      logs.push({ type: 'res', title: 'Image Generation Response', data: response });

      let outputUrl: string | null = null;

      // Parse response for image
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            outputUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
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