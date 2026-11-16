import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { File } from "expo-file-system";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import {
  useTranscribeKeyboardAudio,
  useTranslateKeyboardText,
} from "@workspace/api-client-react";
import {
  Badge,
  Button,
  Card,
  Text,
  Textarea,
  Toggle,
} from "@workspace/sri-key-design-system/components/native/button";
import { useColors } from "@workspace/sri-key-design-system/hooks/use-colors";
import { NativeThemeProvider } from "@workspace/sri-key-design-system/lib/native-theme";
import { nativeTheme } from "@workspace/sri-key-design-system/lib/native-theme";
import {
  currentWordStart,
  getAutocorrection,
  getPreviousWord,
  getSuggestions,
  transliterateSinglish,
  type LayoutMode,
} from "@/lib/sinhala";
import { KeyboardPanel } from "@/components/KeyboardPanel";

type ThemeMode = "light" | "dark" | "custom";
type KeyboardHeight = "compact" | "regular" | "tall";
type OneHandedMode = "off" | "left" | "right";
type AppSettings = {
  theme: ThemeMode;
  accent: string;
  height: KeyboardHeight;
  oneHanded: OneHandedMode;
  haptics: boolean;
  sound: boolean;
  autoCorrect: boolean;
  layout: LayoutMode;
};
type Sheet = "emoji" | "stickers" | "clipboard" | "translate" | "settings" | null;
type EmojiCategory = "Smileys" | "Nature" | "Food" | "Travel" | "Symbols";
type Draft = { start: number; raw: string; display: string };
type Language = "si" | "en";

const SETTINGS_KEY = "sri-key-settings-v1";
const CLIPBOARD_KEY = "sri-key-clipboard-v1";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  accent: nativeTheme.light.chart3,
  height: "regular",
  oneHanded: "off",
  haptics: true,
  sound: false,
  autoCorrect: true,
  layout: "phonetic",
};

const EMOJI_SETS: Record<EmojiCategory, string[]> = {
  Smileys: ["😀", "😊", "😂", "🥰", "😍", "🤔", "🙌", "👏", "✨", "🙏", "🤝", "💛"],
  Nature: ["🌺", "🌸", "🌿", "🌴", "🌞", "🌈", "🌊", "🌼", "🍃", "🪷", "🌙", "⭐"],
  Food: ["🍉", "🥥", "🍍", "🍵", "☕", "🍰", "🥭", "🍋", "🍲", "🍪", "🥭", "🍚"],
  Travel: ["🚗", "✈️", "🚲", "🏝️", "🏠", "🛺", "🚌", "🚆", "🗺️", "⛵", "🏞️", "🌍"],
  Symbols: ["❤️", "💛", "💚", "💙", "💜", "✅", "🎉", "💯", "🔔", "📌", "💡", "💬"],
};

const LOCAL_STICKERS = [
  { symbol: "🌺", title: "Ayubowan" },
  { symbol: "🙏", title: "Thank you" },
  { symbol: "✨", title: "Nice one" },
  { symbol: "🌴", title: "Island mood" },
  { symbol: "💛", title: "Good vibes" },
  { symbol: "🎉", title: "Celebrate" },
  { symbol: "😊", title: "You got this" },
  { symbol: "🌞", title: "Good morning" },
];

function RootScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(SETTINGS_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setSettingsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (settingsLoaded) void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => undefined);
  }, [settings, settingsLoaded]);

  const scheme = settings.theme === "dark" ? "dark" : "light";
  return (
    <NativeThemeProvider
      scheme={scheme}
      accent={settings.theme === "custom" ? settings.accent : undefined}
    >
      <KeyboardExperience settings={settings} setSettings={setSettings} />
    </NativeThemeProvider>
  );
}

function KeyboardExperience({
  settings,
  setSettings,
}: {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const editorRef = useRef<TextInput>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const keySound = useAudioPlayer(require("../assets/sounds/key-tap.wav"));
  const translateMutation = useTranslateKeyboardText();
  const transcribeMutation = useTranscribeKeyboardAudio();

  const [text, setText] = useState("");
  const [cursor, setCursor] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [emojiCategory, setEmojiCategory] = useState<EmojiCategory>("Smileys");
  const [clipboardItems, setClipboardItems] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [micNeedsSettings, setMicNeedsSettings] = useState(false);
  const [translationSource, setTranslationSource] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<Language>("si");
  const [translationError, setTranslationError] = useState("");

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(CLIPBOARD_KEY)
      .then((stored) => {
        if (active && stored) setClipboardItems(JSON.parse(stored) as string[]);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const currentWord = draft?.display ?? text.slice(currentWordStart(text, cursor), cursor);
  const previousWord = getPreviousWord(text, cursor);
  const suggestions = useMemo(
    () => getSuggestions(settings.layout, draft?.raw ?? "", currentWord, previousWord),
    [settings.layout, draft?.raw, currentWord, previousWord],
  );

  const updateSettings = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const feedback = () => {
    if (settings.haptics && Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    if (settings.sound) {
      void keySound.seekTo(0).then(() => keySound.play()).catch(() => undefined);
    }
  };

  const commitText = (next: string, nextCursor: number, nextDraft: Draft | null = null) => {
    setText(next);
    setCursor(nextCursor);
    setSelection({ start: nextCursor, end: nextCursor });
    setDraft(nextDraft);
  };

  const insertAtCursor = (value: string) => {
    const start = cursor;
    const next = text.slice(0, start) + value + text.slice(start);
    commitText(next, start + value.length);
  };

  const insertSinglishKey = (letter: string) => {
    const start = draft?.start ?? cursor;
    const oldEnd = draft ? draft.start + draft.display.length : cursor;
    const raw = (draft?.raw ?? "") + letter;
    const display = transliterateSinglish(raw);
    const next = text.slice(0, start) + display + text.slice(oldEnd);
    commitText(next, start + display.length, { start, raw, display });
  };

  const handleKey = (value: string) => {
    feedback();
    if (settings.layout === "phonetic" && /^[A-Za-z]$/u.test(value)) {
      insertSinglishKey(value);
    } else {
      insertAtCursor(value);
    }
  };

  const acceptSuggestion = (value: string) => {
    feedback();
    const start = draft?.start ?? currentWordStart(text, cursor);
    const end = draft ? draft.start + draft.display.length : cursor;
    const next = text.slice(0, start) + value + text.slice(end);
    commitText(next, start + value.length);
  };

  const handleSpace = () => {
    feedback();
    if (draft) {
      const correction = settings.autoCorrect ? getAutocorrection("phonetic", draft.raw) : null;
      const replacement = correction ?? draft.display;
      const next = text.slice(0, draft.start) + replacement + " " + text.slice(draft.start + draft.display.length);
      commitText(next, draft.start + replacement.length + 1);
      return;
    }
    if (settings.layout === "english" && settings.autoCorrect) {
      const start = currentWordStart(text, cursor);
      const raw = text.slice(start, cursor);
      const correction = getAutocorrection("english", raw);
      if (correction) {
        const next = text.slice(0, start) + correction + " " + text.slice(cursor);
        commitText(next, start + correction.length + 1);
        return;
      }
    }
    insertAtCursor(" ");
  };

  const handleBackspace = () => {
    feedback();
    if (draft && cursor === draft.start + draft.display.length) {
      const raw = draft.raw.slice(0, -1);
      if (!raw) {
        commitText(
          text.slice(0, draft.start) + text.slice(draft.start + draft.display.length),
          draft.start,
        );
      } else {
        const display = transliterateSinglish(raw);
        const next = text.slice(0, draft.start) + display + text.slice(draft.start + draft.display.length);
        commitText(next, draft.start + display.length, { start: draft.start, raw, display });
      }
      return;
    }
    if (cursor <= 0) return;
    const next = text.slice(0, cursor - 1) + text.slice(cursor);
    commitText(next, cursor - 1);
  };

  const deleteWord = () => {
    feedback();
    let start = cursor;
    while (start > 0 && /\s/u.test(text[start - 1] ?? "")) start -= 1;
    while (start > 0 && !/\s/u.test(text[start - 1] ?? "")) start -= 1;
    commitText(text.slice(0, start) + text.slice(cursor), start);
  };

  const moveCursor = (position: number) => {
    const next = Math.max(0, Math.min(text.length, position));
    setCursor(next);
    setSelection({ start: next, end: next });
    if (draft && next !== draft.start + draft.display.length) setDraft(null);
  };

  const onGlide = (path: string) => {
    feedback();
    if (settings.layout === "phonetic") {
      const matches = getSuggestions("phonetic", path, "", "");
      insertAtCursor(matches[0] ?? transliterateSinglish(path));
    } else {
      insertAtCursor(path);
    }
  };

  const switchLanguage = () => {
    setDraft(null);
    updateSettings("layout", settings.layout === "english" ? "phonetic" : "english");
  };

  const saveClipboard = async (value: string) => {
    const clean = value.trim();
    if (!clean) {
      setStatusMessage("Type something before copying it.");
      return;
    }
    try {
      await Clipboard.setStringAsync(clean);
      const next = [clean, ...clipboardItems.filter((item) => item !== clean)].slice(0, 12);
      setClipboardItems(next);
      await AsyncStorage.setItem(CLIPBOARD_KEY, JSON.stringify(next));
      setStatusMessage("Copied to the Sri Key clipboard.");
    } catch {
      setStatusMessage("Clipboard access is unavailable right now.");
    }
  };

  const pasteFromDevice = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value) {
        setStatusMessage("The device clipboard is empty.");
        return;
      }
      insertAtCursor(value);
      const next = [value, ...clipboardItems.filter((item) => item !== value)].slice(0, 12);
      setClipboardItems(next);
      await AsyncStorage.setItem(CLIPBOARD_KEY, JSON.stringify(next));
      setStatusMessage("Pasted from the device clipboard.");
    } catch {
      setStatusMessage("Clipboard access is unavailable right now.");
    }
  };

  const removeClipboardItem = async (value: string) => {
    const next = clipboardItems.filter((item) => item !== value);
    setClipboardItems(next);
    await AsyncStorage.setItem(CLIPBOARD_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const openTranslation = () => {
    setTranslationSource(text);
    setTranslationResult("");
    setTranslationError("");
    setSourceLanguage(settings.layout === "english" ? "en" : "si");
    setSheet("translate");
  };

  const translateText = async () => {
    if (!translationSource.trim()) {
      setTranslationError("Type or select text to translate first.");
      return;
    }
    setTranslationError("");
    try {
      const result = await translateMutation.mutateAsync({
        data: {
          text: translationSource.trim(),
          sourceLanguage,
          targetLanguage: sourceLanguage === "si" ? "en" : "si",
        },
      });
      setTranslationResult(result.translation);
    } catch {
      setTranslationError("Translation failed. Check your connection and try again.");
    }
  };

  const startOrStopRecording = async () => {
    if (Platform.OS === "web") {
      setStatusMessage("Voice input is available in Expo Go on an iOS or Android device.");
      return;
    }
    if (!recording) {
      try {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setMicNeedsSettings(!permission.canAskAgain);
          setStatusMessage(
            permission.canAskAgain
              ? "Microphone permission is needed for voice typing."
              : "Microphone access is blocked. Open device settings to enable it.",
          );
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecording(true);
        setStatusMessage("Listening… tap the microphone again to finish.");
      } catch {
        setStatusMessage("Could not start recording. Check microphone access and try again.");
      }
      return;
    }

    try {
      await recorder.stop();
      setRecording(false);
      const uri = recorder.uri;
      if (!uri) throw new Error("No recording file was created.");
      const audioFile = new File(uri);
      try {
        const audioBase64 = await audioFile.base64();
        const result = await transcribeMutation.mutateAsync({
          data: { audioBase64, audioFormat: "m4a", language: "auto" },
        });
        insertAtCursor(result.transcription);
        setStatusMessage("Transcription inserted.");
      } finally {
        audioFile.delete();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
      }
    } catch {
      setRecording(false);
      setStatusMessage("Transcription failed. Check your connection and try again.");
    }
  };

  const currentScheme = settings.theme === "dark" ? "dark" : "light";
  const webTopInset = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const webBottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const swatches = [
    nativeTheme.light.chart1,
    nativeTheme.light.chart2,
    nativeTheme.light.chart3,
    nativeTheme.light.chart4,
    nativeTheme.light.chart5,
    nativeTheme.dark.primary,
  ];

  const insertStickerOrEmoji = (value: string) => {
    insertAtCursor(value);
    setSheet(null);
  };

  const layoutOptions: Array<{ id: LayoutMode; label: string }> = [
    { id: "phonetic", label: "Singlish" },
    { id: "wijesekara", label: "Wijesekara" },
    { id: "english", label: "English" },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: webTopInset,
        paddingBottom: webBottomInset,
      }}
    >
      <View style={{ flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 14, paddingTop: 8, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("../assets/images/icon.png")}
            style={{ width: 40, height: 40, borderRadius: 13 }}
            accessibilityLabel="Sri Key icon"
          />
          <View style={{ flex: 1 }}>
            <Text variant="title" weight="bold">Sri Key</Text>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>Sinhala typing, made easy</Text>
          </View>
          <Badge tone="muted">IN-APP</Badge>
          <Button
            variant="ghost"
            size="icon"
            testID="open-settings"
            accessibilityLabel="Keyboard settings"
            onPress={() => setSheet("settings")}
          >
            <Feather name="sliders" size={19} color={colors.foreground} />
          </Button>
        </View>

        <Card style={{ padding: 14, gap: 8, flexGrow: 1, minHeight: 132 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text variant="subtitle" weight="semibold" style={{ flex: 1 }}>Try your keyboard</Text>
            <Button
              variant="ghost"
              size="icon"
              testID="copy-text"
              accessibilityLabel="Copy text"
              onPress={() => void saveClipboard(text)}
            >
              <Feather name="copy" size={17} color={colors.foreground} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              testID="clear-text"
              accessibilityLabel="Clear text"
              onPress={() => commitText("", 0)}
            >
              <Feather name="x" size={19} color={colors.foreground} />
            </Button>
          </View>
          <Textarea
            ref={editorRef}
            testID="keyboard-editor"
            value={text}
            onChangeText={(value) => {
              setText(value);
              setCursor(value.length);
              setSelection({ start: value.length, end: value.length });
              setDraft(null);
            }}
            onSelectionChange={(event) => {
              const next = event.nativeEvent.selection;
              setCursor(next.end);
              setSelection(next);
              if (draft && next.end !== draft.start + draft.display.length) setDraft(null);
            }}
            selection={selection}
            showSoftInputOnFocus={false}
            contextMenuHidden={false}
            placeholder="Type in Singlish, Sinhala, or English…"
            placeholderTextColor={colors.mutedForeground}
            style={{ flex: 1, minHeight: 72, borderWidth: 0, padding: 0, backgroundColor: "transparent" }}
          />
        </Card>

        <View style={{ flexDirection: "row", gap: 6 }}>
          {[
            { id: "emoji" as const, label: "Emoji", icon: "smile" as const },
            { id: "stickers" as const, label: "Stickers", icon: "image" as const },
            { id: "clipboard" as const, label: "Clipboard", icon: "clipboard" as const },
            { id: "translate" as const, label: "Translate", icon: "globe" as const },
          ].map((item) => (
            <Pressable
              key={item.id}
              testID={`toolbar-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => item.id === "translate" ? openTranslation() : setSheet(item.id)}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 50,
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                borderRadius: colors.radius,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <Feather name={item.icon} size={17} color={colors.primary} />
              <Text variant="caption" weight="medium" style={{ color: colors.foreground }}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable
            testID="toolbar-voice"
            accessibilityRole="button"
            accessibilityLabel={recording ? "Stop voice recording" : "Voice typing"}
            onPress={() => void startOrStopRecording()}
            style={({ pressed }) => ({
              width: 52,
              minHeight: 50,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              borderRadius: colors.radius,
              backgroundColor: recording ? colors.destructive : colors.primary,
              opacity: pressed ? 0.78 : 1,
            })}
          >
            <Feather name={recording ? "square" : "mic"} size={17} color={recording ? colors.destructiveForeground : colors.primaryForeground} />
            <Text variant="caption" weight="semibold" style={{ color: recording ? colors.destructiveForeground : colors.primaryForeground }}>
              {recording ? "Stop" : "Voice"}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {layoutOptions.map((option) => {
            const active = settings.layout === option.id;
            return (
              <Button
                key={option.id}
                variant={active ? "primary" : "outline"}
                size="small"
                testID={`layout-${option.id}`}
                onPress={() => {
                  setDraft(null);
                  updateSettings("layout", option.id);
                }}
                style={{ flex: 1, paddingHorizontal: 6 }}
              >
                <Text variant="caption" weight="semibold" style={{ color: active ? colors.primaryForeground : colors.foreground }}>
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", minHeight: 38, gap: 8 }}>
          <Text variant="caption" style={{ color: colors.mutedForeground, flex: 1 }}>Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion}-${index}`}
              testID={`suggestion-${index}`}
              accessibilityRole="button"
              onPress={() => acceptSuggestion(suggestion)}
              style={({ pressed }) => ({
                minWidth: 60,
                paddingHorizontal: 10,
                paddingVertical: 7,
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: index === 0 ? colors.accent : colors.card,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text variant="caption" language={settings.layout === "english" ? "latin" : "sinhala"} weight="medium">
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>

        <KeyboardPanel
          layout={settings.layout}
          height={settings.height}
          oneHanded={settings.oneHanded}
          cursorPosition={cursor}
          onKey={handleKey}
          onSpace={handleSpace}
          onBackspace={handleBackspace}
          onDeleteWord={deleteWord}
          onEnter={() => insertAtCursor("\n")}
          onLanguageSwitch={switchLanguage}
          onCursorMove={moveCursor}
          onGlide={onGlide}
        />

        {statusMessage ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Text variant="caption" style={{ color: colors.mutedForeground, flex: 1 }}>{statusMessage}</Text>
            {micNeedsSettings ? (
              <Button variant="outline" size="small" onPress={() => void Linking.openSettings()}>
                <Text variant="caption" weight="semibold">Open settings</Text>
              </Button>
            ) : null}
          </View>
        ) : null}
      </View>

      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: `${colors.foreground}66` }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close panel"
            onPress={() => setSheet(null)}
            style={{ flex: 1 }}
          />
          <View
            style={{
              maxHeight: "82%",
              backgroundColor: colors.background,
              borderTopLeftRadius: colors.radius * 3,
              borderTopRightRadius: colors.radius * 3,
              borderTopWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: Math.max(insets.bottom, 18),
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text variant="subtitle" weight="bold" style={{ flex: 1 }}>
                {sheet === "emoji" ? "Emoji" :
                  sheet === "stickers" ? "Local stickers" :
                  sheet === "clipboard" ? "Clipboard" :
                  sheet === "translate" ? "Instant translation" : "Keyboard settings"}
              </Text>
              <Button
                variant="ghost"
                size="icon"
                accessibilityLabel="Close"
                onPress={() => setSheet(null)}
              >
                <Feather name="x" size={20} color={colors.foreground} />
              </Button>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {sheet === "emoji" ? (
                <View style={{ gap: 14, paddingBottom: 12 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                    {(Object.keys(EMOJI_SETS) as EmojiCategory[]).map((category) => (
                      <Button
                        key={category}
                        variant={emojiCategory === category ? "primary" : "outline"}
                        size="small"
                        onPress={() => setEmojiCategory(category)}
                      >
                        <Text variant="caption" weight="semibold" style={{ color: emojiCategory === category ? colors.primaryForeground : colors.foreground }}>
                          {category}
                        </Text>
                      </Button>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {EMOJI_SETS[emojiCategory].map((emoji, index) => (
                      <Pressable
                        key={`${emoji}-${index}`}
                        testID={`emoji-${index}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Insert ${emoji}`}
                        onPress={() => insertStickerOrEmoji(emoji)}
                        style={({ pressed }) => ({
                          width: "22%",
                          minHeight: 58,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: colors.radius,
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                          opacity: pressed ? 0.65 : 1,
                        })}
                      >
                        <Text style={{ fontSize: 29 }}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {sheet === "stickers" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 12 }}>
                  <View style={{ width: "100%" }}>
                    <Badge tone="muted">OFFLINE PACK</Badge>
                    <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: 8 }}>
                      A small local set; no online GIF search is connected.
                    </Text>
                  </View>
                  {LOCAL_STICKERS.map((sticker) => (
                    <Pressable
                      key={sticker.title}
                      testID={`sticker-${sticker.title.toLowerCase().replaceAll(" ", "-")}`}
                      accessibilityRole="button"
                      onPress={() => insertStickerOrEmoji(sticker.symbol)}
                      style={({ pressed }) => ({
                        width: "47%",
                        minHeight: 92,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        borderRadius: colors.radius * 2,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 32 }}>{sticker.symbol}</Text>
                      <Text variant="caption" weight="medium">{sticker.title}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {sheet === "clipboard" ? (
                <View style={{ gap: 10, paddingBottom: 12 }}>
                  <Button variant="outline" onPress={() => void pasteFromDevice()}>
                    <Feather name="clipboard" size={16} color={colors.foreground} />
                    <Text variant="body" weight="medium">Paste from device</Text>
                  </Button>
                  {clipboardItems.length ? clipboardItems.map((item, index) => (
                    <Card key={`${index}-${item.slice(0, 12)}`} style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 10 }}>
                      <Pressable
                        testID={`clipboard-item-${index}`}
                        accessibilityRole="button"
                        onPress={() => {
                          insertAtCursor(item);
                          setSheet(null);
                        }}
                        style={{ flex: 1 }}
                      >
                        <Text numberOfLines={2} style={{ color: colors.foreground }}>{item}</Text>
                      </Pressable>
                      <Button
                        variant="ghost"
                        size="icon"
                        accessibilityLabel="Remove clipboard item"
                        onPress={() => void removeClipboardItem(item)}
                      >
                        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                      </Button>
                    </Card>
                  )) : (
                    <View style={{ paddingVertical: 28, alignItems: "center", gap: 8 }}>
                      <Feather name="clipboard" size={24} color={colors.mutedForeground} />
                      <Text variant="body" weight="medium">Your clipboard is empty</Text>
                      <Text variant="caption" style={{ color: colors.mutedForeground }}>Copy text from the editor to save it here.</Text>
                    </View>
                  )}
                </View>
              ) : null}

              {sheet === "translate" ? (
                <View style={{ gap: 12, paddingBottom: 12 }}>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    Text is sent to OpenAI only when you tap Translate. Usage may be billed to your OpenAI account.
                  </Text>
                  <Textarea
                    testID="translation-source"
                    value={translationSource}
                    onChangeText={setTranslationSource}
                    maxLength={5000}
                    placeholder="Enter text to translate"
                    style={{ minHeight: 96 }}
                  />
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Badge tone="muted">{sourceLanguage === "si" ? "Sinhala" : "English"}</Badge>
                    <Feather name="arrow-right" size={17} color={colors.mutedForeground} />
                    <Badge tone="muted">{sourceLanguage === "si" ? "English" : "Sinhala"}</Badge>
                    <View style={{ flex: 1 }} />
                    <Button
                      variant="outline"
                      size="small"
                      testID="translation-swap"
                      onPress={() => {
                        setSourceLanguage((value) => value === "si" ? "en" : "si");
                        setTranslationResult("");
                      }}
                    >
                      <Feather name="repeat" size={15} color={colors.foreground} />
                      <Text variant="caption" weight="semibold">Swap</Text>
                    </Button>
                  </View>
                  <Button
                    testID="translate-submit"
                    onPress={() => void translateText()}
                    disabled={translateMutation.isPending}
                  >
                    {translateMutation.isPending ? <ActivityIndicator color={colors.primaryForeground} /> : <Feather name="globe" size={17} color={colors.primaryForeground} />}
                    <Text weight="semibold" style={{ color: colors.primaryForeground }}>
                      {translateMutation.isPending ? "Translating…" : "Translate"}
                    </Text>
                  </Button>
                  {translationError ? <Text variant="caption" style={{ color: colors.destructive }}>{translationError}</Text> : null}
                  {translationResult ? (
                    <Card style={{ gap: 10 }}>
                      <Text variant="caption" weight="semibold" style={{ color: colors.mutedForeground }}>RESULT</Text>
                      <Text language={sourceLanguage === "si" ? "latin" : "sinhala"} style={{ fontSize: 17, lineHeight: 26 }}>
                        {translationResult}
                      </Text>
                      <Button
                        variant="secondary"
                        testID="insert-translation"
                        onPress={() => {
                          insertAtCursor(translationResult);
                          setSheet(null);
                        }}
                      >
                        <Feather name="corner-down-left" size={16} color={colors.foreground} />
                        <Text weight="semibold">Insert into text</Text>
                      </Button>
                    </Card>
                  ) : null}
                </View>
              ) : null}

              {sheet === "settings" ? (
                <View style={{ gap: 14, paddingBottom: 16 }}>
                  <View style={{ gap: 8 }}>
                    <Text variant="caption" weight="semibold" style={{ color: colors.mutedForeground }}>APPEARANCE</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["light", "dark", "custom"] as ThemeMode[]).map((theme) => (
                        <Button
                          key={theme}
                          variant={settings.theme === theme ? "primary" : "outline"}
                          size="small"
                          testID={`theme-${theme}`}
                          onPress={() => updateSettings("theme", theme)}
                          style={{ flex: 1 }}
                        >
                          <Text variant="caption" weight="semibold" style={{ color: settings.theme === theme ? colors.primaryForeground : colors.foreground }}>
                            {theme === "custom" ? "Custom" : theme === "dark" ? "Dark" : "Light"}
                          </Text>
                        </Button>
                      ))}
                    </View>
                    {settings.theme === "custom" ? (
                      <>
                        <View style={{ flexDirection: "row", gap: 9, marginTop: 4 }}>
                          {swatches.map((swatch) => (
                            <Pressable
                              key={swatch}
                              testID={`accent-${swatch.slice(1)}`}
                              accessibilityRole="button"
                              accessibilityLabel={`Set accent ${swatch}`}
                              onPress={() => updateSettings("accent", swatch)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                backgroundColor: swatch,
                                borderWidth: settings.accent.toLowerCase() === swatch.toLowerCase() ? 3 : 1,
                                borderColor: colors.foreground,
                              }}
                            />
                          ))}
                        </View>
                        <Textarea
                          testID="custom-accent-input"
                          value={settings.accent}
                          onChangeText={(value) => updateSettings("accent", value)}
                          maxLength={7}
                          autoCapitalize="none"
                          placeholder="Custom accent, e.g. #C6512F"
                          style={{ minHeight: 42, paddingVertical: 9 }}
                        />
                        {!/^#[0-9a-fA-F]{6}$/u.test(settings.accent) ? (
                          <Text variant="caption" style={{ color: colors.destructive }}>Use a six-digit hex color.</Text>
                        ) : null}
                      </>
                    ) : null}
                  </View>

                  <View style={{ gap: 8 }}>
                    <Text variant="caption" weight="semibold" style={{ color: colors.mutedForeground }}>KEYBOARD HEIGHT</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["compact", "regular", "tall"] as KeyboardHeight[]).map((height) => (
                        <Button
                          key={height}
                          variant={settings.height === height ? "primary" : "outline"}
                          size="small"
                          testID={`height-${height}`}
                          onPress={() => updateSettings("height", height)}
                          style={{ flex: 1 }}
                        >
                          <Text variant="caption" weight="semibold" style={{ color: settings.height === height ? colors.primaryForeground : colors.foreground }}>
                            {height === "regular" ? "Default" : height === "compact" ? "Short" : "Tall"}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    <Text variant="caption" weight="semibold" style={{ color: colors.mutedForeground }}>ONE-HANDED MODE</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["off", "left", "right"] as OneHandedMode[]).map((mode) => (
                        <Button
                          key={mode}
                          variant={settings.oneHanded === mode ? "primary" : "outline"}
                          size="small"
                          testID={`one-handed-${mode}`}
                          onPress={() => updateSettings("oneHanded", mode)}
                          style={{ flex: 1 }}
                        >
                          <Text variant="caption" weight="semibold" style={{ color: settings.oneHanded === mode ? colors.primaryForeground : colors.foreground }}>
                            {mode === "off" ? "Off" : mode === "left" ? "Left" : "Right"}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  </View>

                  <Toggle
                    label="Auto-correction"
                    value={settings.autoCorrect}
                    onValueChange={(value) => updateSettings("autoCorrect", value)}
                    testID="toggle-autocorrect"
                  />
                  <Toggle
                    label="Haptic feedback"
                    value={settings.haptics}
                    onValueChange={(value) => updateSettings("haptics", value)}
                    testID="toggle-haptics"
                  />
                  <Toggle
                    label="Key sound"
                    value={settings.sound}
                    onValueChange={(value) => updateSettings("sound", value)}
                    testID="toggle-sound"
                  />
                  <Text variant="caption" style={{ color: colors.mutedForeground, lineHeight: 18 }}>
                    Voice and Translate send only the requested audio or text to OpenAI. Sri Key does not save those requests.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return <RootScreen />;
}
