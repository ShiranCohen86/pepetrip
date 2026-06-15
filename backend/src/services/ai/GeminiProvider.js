import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';
import { serviceUnavailable } from '../../errors/AppError.js';
import { AiProvider } from './AiProvider.js';
import { buildPrompt, itineraryResponseSchema } from './prompt.js';
import { buildPackingPrompt, packingResponseSchema } from './packingPrompt.js';

export class GeminiProvider extends AiProvider {
  constructor() {
    super();
    if (!config.GEMINI_API_KEY) {
      throw serviceUnavailable('AI is not configured (missing GEMINI_API_KEY)');
    }
    this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    this.model = config.GEMINI_MODEL;
  }

  async generateItinerary(input) {
    const { system, user } = buildPrompt(input);
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: user,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseSchema: itineraryResponseSchema,
        temperature: 0.85,
        maxOutputTokens: 8192,
      },
    });
    return {
      raw: response.text ?? '',
      tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
      model: this.model,
    };
  }

  async generatePackingList(input) {
    const { system, user } = buildPackingPrompt(input);
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: user,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseSchema: packingResponseSchema,
        temperature: 0.6,
        maxOutputTokens: 4096,
      },
    });
    return {
      raw: response.text ?? '',
      tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
      model: this.model,
    };
  }
}
