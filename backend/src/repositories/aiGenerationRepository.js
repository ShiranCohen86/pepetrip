import { AiGeneration } from '../models/AiGeneration.js';

export const aiGenerationRepository = {
  create: (data) => AiGeneration.create(data),
  findByInputHash: (inputHash, model) =>
    AiGeneration.findOne({ inputHash, ...(model ? { model } : {}) }).sort({ createdAt: -1 }),
};
