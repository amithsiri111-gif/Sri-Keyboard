export type LayoutMode = "phonetic" | "wijesekara" | "english";

type Vowel = { key: string; independent: string; sign: string };
type Token =
  | { kind: "vowel"; independent: string; sign: string }
  | { kind: "consonant"; value: string }
  | { kind: "literal"; value: string };

const vowels: Vowel[] = [
  { key: "aa", independent: "ආ", sign: "ා" },
  { key: "ii", independent: "ඊ", sign: "ී" },
  { key: "uu", independent: "ඌ", sign: "ූ" },
  { key: "ee", independent: "ඒ", sign: "ේ" },
  { key: "oo", independent: "ඕ", sign: "ෝ" },
  { key: "ai", independent: "ඓ", sign: "ෛ" },
  { key: "au", independent: "ඖ", sign: "ෞ" },
  { key: "a", independent: "අ", sign: "" },
  { key: "i", independent: "ඉ", sign: "ි" },
  { key: "u", independent: "උ", sign: "ු" },
  { key: "e", independent: "එ", sign: "ෙ" },
  { key: "o", independent: "ඔ", sign: "ො" },
];

const consonants: Array<[string, string]> = [
  ["chh", "ඡ"], ["sh", "ශ"], ["Sh", "ෂ"], ["kh", "ඛ"], ["gh", "ඝ"],
  ["ng", "ඟ"], ["ny", "ඤ"], ["jh", "ඣ"], ["th", "ත"], ["dh", "ධ"],
  ["bh", "භ"], ["ph", "ඵ"], ["ch", "ච"], ["T", "ට"], ["D", "ඩ"],
  ["N", "ණ"], ["L", "ළ"], ["k", "ක"], ["g", "ග"], ["c", "ච"],
  ["j", "ජ"], ["t", "ත"], ["d", "ද"], ["n", "න"], ["p", "ප"],
  ["b", "බ"], ["m", "ම"], ["y", "ය"], ["r", "ර"], ["l", "ල"],
  ["v", "ව"], ["w", "ව"], ["s", "ස"], ["h", "හ"], ["f", "ෆ"],
];

const tokensByLength = [
  ...vowels.map((item) => ({ key: item.key, token: { kind: "vowel" as const, independent: item.independent, sign: item.sign } })),
  ...consonants.map(([key, value]) => ({ key, token: { kind: "consonant" as const, value } })),
].sort((a, b) => b.key.length - a.key.length);

export function transliterateSinglish(input: string) {
  const source = input.trim();
  const parsed: Token[] = [];

  for (let index = 0; index < source.length;) {
    const match = tokensByLength.find(({ key }) => source.slice(index, index + key.length).toLowerCase() === key.toLowerCase());
    if (!match) {
      const char = source[index];
      if (char) parsed.push({ kind: "literal", value: char });
      index += 1;
      continue;
    }
    parsed.push(match.token);
    index += match.key.length;
  }

  let result = "";
  let pendingConsonant = false;
  for (const token of parsed) {
    if (token.kind === "consonant") {
      if (pendingConsonant) result += "්";
      result += token.value;
      pendingConsonant = true;
    } else if (token.kind === "vowel") {
      if (pendingConsonant) {
        result += token.sign;
        pendingConsonant = false;
      } else {
        result += token.independent;
      }
    } else {
      result += token.value;
      pendingConsonant = false;
    }
  }

  return result;
}

export const SINHALA_WORDS = [
  ["mama", "මම"], ["api", "අපි"], ["oyaa", "ඔයා"], ["oba", "ඔබ"],
  ["kohomada", "කොහොමද"], ["hondai", "හොඳයි"], ["hari", "හරි"],
  ["sinhala", "සිංහල"], ["suba", "සුබ"], ["udē", "උදේ"],
  ["stuthi", "ස්තුතියි"], ["istuti", "ස්තුතියි"], ["bohoma", "බොහොම"],
  ["mage", "මගේ"], ["gedara", "ගෙදර"], ["ada", "අද"], ["heta", "හෙට"],
  ["karanna", "කරන්න"], ["karanawa", "කරනවා"], ["oyata", "ඔයාට"],
  ["lassanai", "ලස්සනයි"], ["me", "මේ"], ["eka", "එක"],
  ["monawada", "මොනවාද"], ["dan", "දැන්"], ["yanna", "යන්න"],
  ["enawa", "එනවා"], ["kanna", "කන්න"], ["watura", "වතුර"],
  ["podi", "පොඩි"], ["loku", "ලොකු"], ["saha", "සහ"],
  ["wenawa", "වෙනවා"], ["nisa", "නිසා"], ["passe", "පස්සේ"],
  ["kiyanna", "කියන්න"], ["balanna", "බලන්න"], ["ganna", "ගන්න"],
] as const;

const sinhalaCorrections: Record<string, string> = {
  kohomda: "කොහොමද",
  honady: "හොඳයි",
  stuti: "ස්තුතියි",
  mmaa: "මම",
  mge: "මගේ",
};

const englishWords = [
  "hello", "thanks", "thank", "you", "the", "and", "for", "with", "good",
  "morning", "today", "tomorrow", "please", "how", "are", "doing", "love",
  "great", "message", "friend", "home", "work", "yes", "no",
];

const englishCorrections: Record<string, string> = {
  teh: "the",
  adn: "and",
  thsi: "this",
  recieve: "receive",
  hte: "the",
};

const nextSinhalaWords: Record<string, string[]> = {
  "මම": ["අද", "ඔයාට", "ගෙදර"],
  "ඔයා": ["කොහොමද", "ට", "ගේ"],
  "අපි": ["යමු", "අද", "කරමු"],
  "සුබ": ["උදෑසනක්", "දවසක්", "පැතුම්"],
  "හොඳයි": ["ස්තුතියි", "අද", "එහෙනම්"],
};

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = row[j] ?? 0;
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return row[right.length] ?? 0;
}

export function getSuggestions(
  mode: LayoutMode,
  draft: string,
  currentWord: string,
  previousWord: string,
) {
  if (mode === "phonetic" && draft) {
    const query = draft.toLowerCase();
    const exactCorrection = sinhalaCorrections[query];
    const matching = SINHALA_WORDS.filter(([latin]) => latin.startsWith(query));
    const close = query.length >= 4
      ? SINHALA_WORDS.filter(([latin]) => editDistance(latin, query) <= 1)
      : [];
    const options = [
      ...(exactCorrection ? [exactCorrection] : []),
      ...matching.map(([, sinhala]) => sinhala),
      ...close.map(([, sinhala]) => sinhala),
      transliterateSinglish(draft),
    ];
    return [...new Set(options.filter(Boolean))].slice(0, 3);
  }

  if (mode === "english" && currentWord) {
    const query = currentWord.toLowerCase();
    const correction = englishCorrections[query];
    const options = [
      ...(correction ? [correction] : []),
      ...englishWords.filter((word) => word.startsWith(query)),
      currentWord,
    ];
    return [...new Set(options)].slice(0, 3);
  }

  if (currentWord) {
    return [currentWord, ...(nextSinhalaWords[currentWord] ?? [])].slice(0, 3);
  }

  return mode === "english" ? ["the", "you", "and"] : ["අද", "මම", "හරි"];
}

export function getAutocorrection(mode: LayoutMode, rawWord: string) {
  if (mode === "phonetic") return sinhalaCorrections[rawWord.toLowerCase()] ?? null;
  if (mode === "english") return englishCorrections[rawWord.toLowerCase()] ?? null;
  return null;
}

export function currentWordStart(text: string, cursor: number) {
  let start = Math.min(cursor, text.length);
  while (start > 0 && !/\s/u.test(text[start - 1] ?? "")) start -= 1;
  return start;
}

export function getPreviousWord(text: string, cursor: number) {
  const prefix = text.slice(0, currentWordStart(text, cursor)).trim();
  return prefix.split(/\s+/u).filter(Boolean).at(-1) ?? "";
}
