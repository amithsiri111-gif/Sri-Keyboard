import React, { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "@workspace/sri-key-design-system/components/native/button";
import { Text } from "@workspace/sri-key-design-system/components/native/text";
import { useColors } from "@workspace/sri-key-design-system/hooks/use-colors";
import type { LayoutMode } from "@/lib/sinhala";

type OneHandedMode = "off" | "left" | "right";
type KeyboardHeight = "compact" | "regular" | "tall";
type KeyKind = "letter" | "shift" | "backspace" | "symbols";
type KeyDefinition = {
  id: string;
  label: string;
  insert?: string;
  shifted?: string;
  alt?: string;
  kind?: KeyKind;
  weight?: number;
};

const key = (id: string, insert: string, shifted?: string, alt?: string): KeyDefinition => ({
  id,
  label: insert,
  insert,
  shifted,
  alt,
});

const wijesekaraRows: KeyDefinition[][] = [
  [
    key("q", "ු", "ූ"), key("w", "අ", "උ"), key("e", "ැ", "ෑ"), key("r", "ර", "ඍ"),
    key("t", "එ", "ඔ"), key("y", "හ", "ශ"), key("u", "ම", "ඹ"), key("i", "ස", "ෂ"),
    key("o", "ද", "ධ", "ඳ"), key("p", "ච", "ඡ"),
  ],
  [
    key("a", "්", "ෟ"), key("s", "ි", "ී"), key("d", "ා", "ෘ"), key("f", "ෙ", "ෆ"),
    key("g", "ට", "ඨ"), key("h", "ය", "්‍ය"), key("j", "ව", "ළු"), key("k", "න", "ණ"),
    key("l", "ක", "ඛ"), key(";", "ත", "ථ"),
  ],
  [
    { id: "shift", label: "shift", kind: "shift", weight: 1.3 },
    key("z", "'", '"'), key("x", "ං", "ඃ", "ඞ"), key("c", "ජ", "ඣ", "ඦ"),
    key("v", "ඩ", "ඪ", "ඬ"), key("b", "ඉ", "ඊ"), key("n", "බ", "භ"),
    key("m", "ප", "ඵ"), key(",", "ල", "ළ", "ඏ"), key(".", "ග", "ඝ", "ඟ"),
    key("/", "/", "?"),
    { id: "backspace", label: "delete", kind: "backspace", weight: 1.35 },
  ],
];

function rowsFor(layout: LayoutMode, symbols: boolean): KeyDefinition[][] {
  if (symbols) {
    return [
      "1234567890".split("").map((item) => key(item, item)),
      "@#$%&-+()".split("").map((item) => key(item, item)),
      [
        { id: "symbols", label: "ABC", kind: "symbols", weight: 1.3 },
        ..."!?:;'\".,/".split("").map((item) => key(item, item)),
        { id: "backspace", label: "delete", kind: "backspace", weight: 1.35 },
      ],
    ];
  }
  if (layout === "wijesekara") return wijesekaraRows;
  const row = (letters: string) => letters.split("").map((item) => key(item, item));
  return [
    row("qwertyuiop"),
    row("asdfghjkl"),
    [
      { id: "shift", label: "shift", kind: "shift", weight: 1.3 },
      ...row("zxcvbnm"),
      { id: "backspace", label: "delete", kind: "backspace", weight: 1.35 },
    ],
  ];
}

type Props = {
  layout: LayoutMode;
  height: KeyboardHeight;
  oneHanded: OneHandedMode;
  cursorPosition: number;
  onKey: (value: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onDeleteWord: () => void;
  onEnter: () => void;
  onLanguageSwitch: () => void;
  onCursorMove: (position: number) => void;
  onGlide: (value: string) => void;
};

export function KeyboardPanel({
  layout,
  height,
  oneHanded,
  cursorPosition,
  onKey,
  onSpace,
  onBackspace,
  onDeleteWord,
  onEnter,
  onLanguageSwitch,
  onCursorMove,
  onGlide,
}: Props) {
  const colors = useColors();
  const [shifted, setShifted] = useState(false);
  const [altGr, setAltGr] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [width, setWidth] = useState(0);
  const gesturePath = useRef<string[]>([]);
  const gestureStart = useRef<KeyDefinition | null>(null);
  const [glideLabel, setGlideLabel] = useState("");
  const rows = useMemo(() => rowsFor(layout, symbols), [layout, symbols]);
  const keyHeight = height === "compact" ? 38 : height === "tall" ? 50 : 44;
  const gap = 6;

  const valueFor = (item: KeyDefinition) => {
    if (layout === "wijesekara") {
      if (altGr && item.alt) return item.alt;
      if (shifted && item.shifted) return item.shifted;
      return item.insert ?? item.label;
    }
    if (layout === "english" && shifted) return (item.insert ?? item.label).toUpperCase();
    if (layout === "phonetic" && shifted) return (item.insert ?? item.label).toUpperCase();
    return item.insert ?? item.label;
  };

  const keyAtPoint = (x: number, y: number) => {
    const rowIndex = Math.floor(y / (keyHeight + gap));
    const row = rows[rowIndex];
    if (!row || x < 0 || x > width) return null;
    const totalWeight = row.reduce((total, item) => total + (item.weight ?? 1), 0);
    const unit = (width - gap * (row.length - 1)) / totalWeight;
    let edge = 0;
    for (const item of row) {
      const end = edge + unit * (item.weight ?? 1);
      if (x >= edge && x <= end) return item;
      edge = end + gap;
    }
    return null;
  };

  const gestureHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy)) > 9,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const hit = keyAtPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
          gestureStart.current = hit;
          gesturePath.current = hit?.kind === "letter" ? [valueFor(hit)] : [];
          setGlideLabel(gesturePath.current.join(""));
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const hit = keyAtPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
          if (hit?.kind === "letter") {
            const value = valueFor(hit);
            const path = gesturePath.current;
            if (path[path.length - 1] !== value) {
              path.push(value);
              setGlideLabel(path.join(""));
            }
          }
        },
        onPanResponderRelease: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (gestureStart.current?.kind === "backspace" && gesture.dx < -34) {
            onDeleteWord();
          } else if (gesturePath.current.length > 1) {
            onGlide(gesturePath.current.join(""));
          }
          gesturePath.current = [];
          gestureStart.current = null;
          setGlideLabel("");
        },
        onPanResponderTerminate: () => {
          gesturePath.current = [];
          gestureStart.current = null;
          setGlideLabel("");
        },
      }).panHandlers,
    [rows, width, keyHeight, layout, shifted, altGr, onDeleteWord, onGlide],
  );

  const spaceResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          gesturePath.current = [String(cursorPosition)];
        },
        onPanResponderMove: (_event, gesture) => {
          if (Math.abs(gesture.dx) > 5) {
            onCursorMove(cursorPosition + Math.round(gesture.dx / 10));
          }
        },
        onPanResponderRelease: (_event, gesture) => {
          if (Math.abs(gesture.dx) < 5) onSpace();
          else onCursorMove(cursorPosition + Math.round(gesture.dx / 10));
          gesturePath.current = [];
        },
      }).panHandlers,
    [cursorPosition, onCursorMove, onSpace],
  );

  const renderKey = (item: KeyDefinition, rowIndex: number) => {
    const special = item.kind && item.kind !== "letter";
    const fill = special ? colors.secondary : colors.card;
    const contentColor = colors.foreground;
    const handlePress = () => {
      if (item.kind === "shift") setShifted((value) => !value);
      else if (item.kind === "symbols") setSymbols((value) => !value);
      else if (item.kind === "backspace") onBackspace();
      else {
        onKey(valueFor(item));
        if (shifted && layout !== "wijesekara") setShifted(false);
      }
    };

    return (
      <Pressable
        key={`${rowIndex}-${item.id}`}
        testID={`keyboard-key-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={
          item.kind === "backspace" ? "Backspace; swipe left to delete a word" :
          item.kind === "shift" ? "Shift" : valueFor(item)
        }
        onPress={handlePress}
        style={({ pressed }) => ({
          flex: item.weight ?? 1,
          height: keyHeight,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: colors.radius,
          backgroundColor: fill,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.68 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        {item.kind === "backspace" ? (
          <Feather name="delete" size={18} color={contentColor} />
        ) : item.kind === "shift" ? (
          <Feather name="arrow-up" size={18} color={shifted ? colors.primary : contentColor} />
        ) : item.kind === "symbols" ? (
          <Text variant="caption" weight="bold">{item.label}</Text>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text
              variant={layout === "wijesekara" ? "body" : "key"}
              language={layout === "wijesekara" ? "sinhala" : "latin"}
              weight="medium"
              style={{ color: contentColor, lineHeight: 24 }}
            >
              {layout === "wijesekara" && shifted && item.shifted ? item.shifted : item.label}
            </Text>
            {layout === "wijesekara" && item.shifted ? (
              <Text variant="caption" language="sinhala" style={{ color: colors.mutedForeground, fontSize: 9 }}>
                {item.shifted}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>
    );
  };

  const keyboardWidth = oneHanded === "off" ? "100%" : "80%";
  const alignSelf = oneHanded === "left" ? "flex-start" : oneHanded === "right" ? "flex-end" : "center";

  return (
    <View
      style={{
        width: keyboardWidth,
        alignSelf,
        backgroundColor: colors.muted,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: colors.radius * 2,
        padding: 8,
        gap: 7,
      }}
    >
      <View style={{ minHeight: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text variant="caption" style={{ color: colors.mutedForeground }}>
          {layout === "phonetic" ? "Singlish · swipe to glide" : layout === "wijesekara" ? "Wijesekara · SLS 1134" : "English QWERTY"}
        </Text>
        {glideLabel ? <Text variant="caption" weight="semibold">{glideLabel}</Text> : null}
      </View>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        {...gestureHandlers}
        style={{ gap }}
      >
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={{ flexDirection: "row", gap, width: "100%" }}>
            {row.map((item) => renderKey(item, rowIndex))}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Button
          variant="secondary"
          size="small"
          testID="keyboard-symbols"
          onPress={() => setSymbols((value) => !value)}
          style={{ minWidth: 52, paddingHorizontal: 8, minHeight: 40 }}
        >
          <Text variant="caption" weight="semibold">{symbols ? "ABC" : "?123"}</Text>
        </Button>
        <Button
          variant="secondary"
          size="small"
          testID="keyboard-language-switch"
          onPress={onLanguageSwitch}
          accessibilityLabel="Switch between Sinhala and English"
          style={{ minWidth: 44, paddingHorizontal: 8, minHeight: 40 }}
        >
          <Feather name="globe" size={17} color={colors.foreground} />
        </Button>
        {layout === "wijesekara" ? (
          <Button
            variant={altGr ? "primary" : "secondary"}
            size="small"
            testID="keyboard-altgr"
            onPress={() => setAltGr((value) => !value)}
            style={{ minWidth: 48, paddingHorizontal: 6, minHeight: 40 }}
          >
            <Text variant="caption" weight="semibold">AltGr</Text>
          </Button>
        ) : null}
        <View
          testID="keyboard-spacebar"
          accessibilityRole="button"
          accessibilityLabel="Spacebar; slide to move the cursor"
          {...spaceResponder}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: colors.radius,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="caption" style={{ color: colors.mutedForeground }}>සිංහල / English</Text>
        </View>
        <Button
          variant="secondary"
          size="small"
          testID="keyboard-enter"
          onPress={onEnter}
          style={{ minWidth: 44, paddingHorizontal: 8, minHeight: 40 }}
        >
          <Feather name="corner-down-left" size={17} color={colors.foreground} />
        </Button>
      </View>
    </View>
  );
}
