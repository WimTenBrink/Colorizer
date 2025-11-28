import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppSettings } from "../types";

// Helper to convert Blob/File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
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
        } else if (settings.background === 'Transparent') {
          basePrompt += " Remove the existing background completely and replace it with a transparent alpha channel. Ensure the output is a RGBA PNG with transparency.";
        } else if (settings.background !== 'Original') {
          // For scenic backgrounds
          basePrompt += ` Replace the entire background with a high-quality, realistic depiction of a ${settings.background}. Ensure the lighting, shadows, and reflections on the character match this new ${settings.background} environment naturally.`;
        }
      }

      // --- New Features Logic ---

      // Species Transformation
      if (settings.targetSpecies && settings.targetSpecies !== 'Original') {
        basePrompt += ` Transform the character into a ${settings.targetSpecies}. Add characteristic features of a ${settings.targetSpecies} while maintaining the original pose and identity.`;
      }

      // Tech Level Transformation
      if (settings.techLevel && settings.techLevel !== 'Original') {
         switch (settings.techLevel) {
            case 'Primitive':
               basePrompt += " Transform the setting and artifacts to a primitive, stone-age level. Use natural materials like stone, wood, and bone. Characters should wear furs or simple skins.";
               break;
            case 'Ancient':
               basePrompt += " Transform the setting to an Ancient era (like Rome, Greece, or Egypt). Use classical architecture, sandals, tunics, and bronze/iron age technology.";
               break;
            case 'Medieval':
               basePrompt += " Transform the setting to the Medieval period. Use castles, stone masonry, plate or leather armor, swords, and rustic clothing.";
               break;
            case 'Renaissance':
               basePrompt += " Transform the setting to the Renaissance period. Focus on ornate clothing, artistic flourishes, early firearms, and classical revival architecture.";
               break;
            case 'Industrial':
               basePrompt += " Transform the setting to the Early Industrial/Steampunk era. Use steam power, gears, brass, brick factories, and Victorian-style clothing.";
               break;
            case 'Modern':
               basePrompt += " Transform the setting to the Modern day. Use contemporary fashion, smartphones, cars, and modern architecture.";
               break;
            case 'Cyberpunk':
               basePrompt += " Transform the setting to a Cyberpunk Near Future. Use neon lights, high-tech implants, holograms, dirty high-tech aesthetic, and synthetic materials.";
               break;
            case 'Sci-Fi':
               basePrompt += " Transform the setting to a clean Sci-Fi Future. Use spaceships, lasers, smooth white surfaces, advanced robotics, and tight-fitting functional suits.";
               break;
            case 'Far Future':
               basePrompt += " Transform the setting to the Far Future. Use unrecognizable advanced technology, energy beings, organic-tech hybrids, and surreal landscapes.";
               break;
         }
      }

      // Age Transformation
      if (settings.targetAge && settings.targetAge !== 'Original') {
        basePrompt += ` Modify the character's apparent age to be ${settings.targetAge}. Adjust facial features, skin texture, and body proportions to reflect a ${settings.targetAge} individual while keeping the original identity recognizable.`;
      }

      // Clothing Adjustment
      if (settings.clothingAmount === 'more') {
        basePrompt += " Add more layers of clothing. Ensure the character is well-covered and dressed warmly, adding coats, robes, or full outfits where appropriate.";
      } else if (settings.clothingAmount === 'less') {
        basePrompt += " Reduce the amount of clothing to be lighter, such as summer wear, swimwear or lighter fabrics, suitable for a tropical environment. Do not generate explicit pornography, but artistic skin exposure is allowed if it fits the context.";
      }

      // Footwear Adjustment
      if (settings.footwear && settings.footwear !== 'Original') {
        if (settings.footwear === 'Barefoot') {
            basePrompt += " Ensure the character is completely barefoot. Do not draw shoes, socks, or foot coverings.";
        } else if (settings.footwear === 'Anklets') {
            basePrompt += " Ensure the character is barefoot but wearing decorative anklets.";
        } else {
            basePrompt += ` Ensure the character is wearing ${settings.footwear}.`;
        }
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