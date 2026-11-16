import { Router, type Request, type Response } from "express";
import OpenAI, { toFile } from "openai";

const router = Router();
const requestWindows = new Map<string, { startedAt: number; count: number }>();
const MAX_REQUESTS_PER_MINUTE = 12;

function allowRequest(req: Request, res: Response) {
  const now = Date.now();
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  const current = requestWindows.get(ip);
  if (!current || now - current.startedAt >= 60_000) {
    requestWindows.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    res.status(429).json({ message: "Please wait before making another AI request." });
    return false;
  }
  current.count += 1;
  return true;
}

function openAIClient() {
  const apiKey = process.env["OPENAI_API_KEY"];
  return apiKey ? new OpenAI({ apiKey }) : null;
}

router.post("/keyboard/translate", async (req, res) => {
  if (!allowRequest(req, res)) return;
  const { text, sourceLanguage, targetLanguage } = req.body as {
    text?: unknown;
    sourceLanguage?: unknown;
    targetLanguage?: unknown;
  };

  if (
    typeof text !== "string" ||
    text.trim().length === 0 ||
    text.length > 5000 ||
    !["si", "en"].includes(String(sourceLanguage)) ||
    !["si", "en"].includes(String(targetLanguage)) ||
    sourceLanguage === targetLanguage
  ) {
    res.status(400).json({ message: "Provide text and two different supported languages." });
    return;
  }

  const client = openAIClient();
  if (!client) {
    res.status(503).json({ message: "Translation is not configured on the server." });
    return;
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5.6-luna",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "Translate naturally and accurately between Sinhala and English. Preserve intent, names, and tone. Return only the translation, with no notes or quotation marks.",
        },
        {
          role: "user",
          content: `Translate from ${sourceLanguage === "si" ? "Sinhala" : "English"} to ${targetLanguage === "si" ? "Sinhala" : "English"}:\n\n${text}`,
        },
      ],
    });
    const translation = response.choices[0]?.message.content?.trim();
    if (!translation) {
      res.status(502).json({ message: "The translation provider returned no text." });
      return;
    }
    res.json({ translation });
  } catch {
    res.status(502).json({ message: "Translation is temporarily unavailable." });
  }
});

router.post("/keyboard/transcribe", async (req, res) => {
  if (!allowRequest(req, res)) return;
  const { audioBase64, audioFormat, language } = req.body as {
    audioBase64?: unknown;
    audioFormat?: unknown;
    language?: unknown;
  };

  if (
    typeof audioBase64 !== "string" ||
    audioBase64.length > 11_200_000 ||
    !/^[A-Za-z0-9+/]*={0,2}$/u.test(audioBase64) ||
    !["m4a", "wav"].includes(String(audioFormat)) ||
    !["auto", "si", "en"].includes(String(language))
  ) {
    res.status(400).json({ message: "Provide a supported audio file and language." });
    return;
  }

  const audio = Buffer.from(audioBase64, "base64");
  if (!audio.length || audio.length > 8 * 1024 * 1024) {
    res.status(413).json({ message: "Audio must be shorter than the upload limit." });
    return;
  }

  const client = openAIClient();
  if (!client) {
    res.status(503).json({ message: "Voice typing is not configured on the server." });
    return;
  }

  try {
    const isWav = audioFormat === "wav";
    const file = await toFile(audio, isWav ? "voice.wav" : "voice.m4a", {
      type: isWav ? "audio/wav" : "audio/mp4",
    });
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
      response_format: "json",
      ...(language === "auto" ? {} : { language }),
      prompt: "Transcribe the spoken Sinhala or English accurately. Preserve names and punctuation.",
    });
    const text = transcription.text?.trim();
    if (!text) {
      res.status(422).json({ message: "No speech was detected." });
      return;
    }
    res.json({ transcription: text });
  } catch {
    res.status(502).json({ message: "Voice transcription is temporarily unavailable." });
  }
});

export default router;
