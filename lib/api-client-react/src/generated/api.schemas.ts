export interface HealthStatus {
  status: string;
}

export interface TranslateKeyboardTextBody {
  text: string;
  sourceLanguage: "si" | "en";
  targetLanguage: "si" | "en";
}

export interface TranslateKeyboardTextResponse {
  translation: string;
}

export interface TranscribeKeyboardAudioBody {
  audioBase64: string;
  audioFormat: "m4a" | "wav";
  language: "auto" | "si" | "en";
}

export interface TranscribeKeyboardAudioResponse {
  transcription: string;
}
