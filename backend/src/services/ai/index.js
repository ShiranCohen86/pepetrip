import { config } from '../../config/env.js';
import { GeminiProvider } from './GeminiProvider.js';

let provider = null;

/** Lazily construct the configured AI provider (so the app boots without an AI key). */
export function getAiProvider() {
  if (provider) return provider;
  switch (config.AI_PROVIDER) {
    case 'gemini':
    default:
      provider = new GeminiProvider();
  }
  return provider;
}

/** Inject a provider (used by tests to avoid real API calls). */
export function setAiProvider(p) {
  provider = p;
}
