/**
 * Provider-agnostic interface for itinerary generation. Implementations return
 * the raw model text (expected to be JSON) plus usage metadata; validation and
 * caching live in aiItineraryService so they're shared across providers.
 */
export class AiProvider {
  /**
   * @param {object} _input normalized trip input
   * @returns {Promise<{ raw: string, tokensUsed: number, model: string }>}
   */
  async generateItinerary(_input) {
    throw new Error('AiProvider.generateItinerary not implemented');
  }

  /**
   * @param {object} _input normalized packing input
   * @returns {Promise<{ raw: string, tokensUsed: number, model: string }>}
   */
  async generatePackingList(_input) {
    throw new Error('AiProvider.generatePackingList not implemented');
  }
}
