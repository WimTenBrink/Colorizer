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
  private ai: GoogleGenAI;

  constructor() {
    // Strictly using process.env.API_KEY as per system instructions
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
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
      const response: GenerateContentResponse = await this.ai.models.generateContent(reqPayload);
      
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

  async colorizeImage(file: File, settings: AppSettings): Promise<{ 
    imageUrl: string | null; 
    filename: string;
    logs: any[];
  }> {
    const logs: any[] = [];
    
    try {
      const base64Image = await fileToGenerativePart(file);
      const mimeType = file.type;

      // 1. Generate Filename (Parallelizable, but sequential for better logging flow)
      const nameResult = await this.generateFilename(base64Image, settings.geminiModel);
      logs.push(...nameResult.logs);

      // 2. Generate Image
      const model = settings.imagenModel;
      const basePrompt = "Colorize this image realistically. Use oil paint. Add a proper background. It should almost be a photo.";
      const fullPrompt = settings.customPrompt ? `${basePrompt} ${settings.customPrompt}` : basePrompt;

      const reqPayload: any = {
        model,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: fullPrompt }
          ]
        },
        config: {
            imageConfig: {
                // Only set imageSize if using the Pro model, otherwise it might throw or be ignored
                ...(model.includes('pro') && { imageSize: settings.resolution })
            }
        }
      };

      logs.push({ type: 'req', title: 'Image Colorization Request', data: reqPayload });

      const response: GenerateContentResponse = await this.ai.models.generateContent(reqPayload);

      logs.push({ type: 'res', title: 'Image Colorization Response', data: response });

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
