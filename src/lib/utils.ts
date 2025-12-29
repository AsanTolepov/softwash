// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UZS (so'm) ko'rinishida formatlash
export function formatCurrencyUZS(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

/**
 * Lotin (uz/eng) matnni ruscha/uzbekcha kirill harflarga yaqinlashtirib
 * transliteratsiya qiladi.
 *
 * E'tibor: 100% to'g'ri bo'lishi kafolatlanmaydi,
 * lekin ism‑familiyalar uchun odatda yetarli.
 */
function applyCaseFromPair(source: string, target: string): string {
  const a = source[0] ?? "";
  const b = source[1] ?? "";
  const isAllUpper = a === a.toUpperCase() && b === b.toUpperCase();
  const isFirstUpper = a === a.toUpperCase();

  if (isAllUpper) return target.toUpperCase();
  if (isFirstUpper) return target[0]?.toUpperCase() + target.slice(1);
  return target;
}

const pairMap: Record<string, string> = {
  // Uzbek lotin -> kirill
  "sh": "ш",
  "ch": "ч",
  "ng": "нг",
  "yo": "ё",
  "yu": "ю",
  "ya": "я",
  "ts": "ц",

  // o' / o` / o‘ / oʼ -> ў
  "o'": "ў",
  "o`": "ў",
  "oʼ": "ў",
  "o‘": "ў",

  // g' / g` / g‘ / gʼ -> ғ
  "g'": "ғ",
  "g`": "ғ",
  "gʼ": "ғ",
  "g‘": "ғ",
};

const singleMap: Record<string, string> = {
  a: "а",
  b: "б",
  c: "к", // "ц" ham bo'lishi mumkin, lekin ism‑familiyalar uchun odatda "к"
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "ҳ",
  i: "и",
  j: "ж",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "қ",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "х",
  y: "й",
  z: "з",
};

/**
 * Masalan:
 *  "Sherzod Anderson" -> "Шерзод Андерсон"
 *  "Nasiba Tolepova"  -> "Насиба Толепова"
 */
export function transliterateToRussian(input: string): string {
  let result = "";
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    // Avval juft harflarni (sh, ch, o', g' va hokazo) tekshiramiz
    if (next) {
      const pair = ch + next;
      const lowerPair = pair.toLowerCase();

      const mappedPair = pairMap[lowerPair];
      if (mappedPair) {
        result += applyCaseFromPair(pair, mappedPair);
        i += 2;
        continue;
      }
    }

    // Keyin bitta harflar
    const lower = ch.toLowerCase();
    const mappedSingle = singleMap[lower];

    if (mappedSingle) {
      const isUpper = ch === ch.toUpperCase();
      result += isUpper ? mappedSingle.toUpperCase() : mappedSingle;
      i += 1;
      continue;
    }

    // Lotin bo'lmagan (bo'sh joy, chiziqcha, allaqanday belgilar) – o'zini yozamiz
    result += ch;
    i += 1;
  }

  return result;
}