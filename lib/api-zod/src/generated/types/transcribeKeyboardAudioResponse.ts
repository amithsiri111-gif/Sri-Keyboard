export interface TranscribeKeyboardAudioBody {
  audioBase64: string;
  audioFormat: "m4a" | "wav";
  language: "auto" | "si" | "en";
}
