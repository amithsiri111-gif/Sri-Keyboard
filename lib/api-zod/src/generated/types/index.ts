import * as zod from "zod";

export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

export const TranslateKeyboardTextBody = zod.object({
  text: zod.string().min(1).max(5000),
  sourceLanguage: zod.enum(["si", "en"]),
  targetLanguage: zod.enum(["si", "en"]),
});

export const TranslateKeyboardTextResponse = zod.object({
  translation: zod.string(),
});

export const TranscribeKeyboardAudioBody = zod.object({
  audioBase64: zod.string().min(1).max(11200000),
  audioFormat: zod.enum(["m4a", "wav"]),
  language: zod.enum(["auto", "si", "en"]),
});

export const TranscribeKeyboardAudioResponse = zod.object({
  transcription: zod.string(),
});
