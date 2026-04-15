// src/services/translate.ts
import type { Language } from '@/lib/i18n';

const DEFAULT_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://softwash-translate.onrender.com';

// Agar .env da VITE_TRANSLATE_API_URL bo'lsa, shuni ishlatamiz
const BASE_URL =
  import.meta.env.VITE_TRANSLATE_API_URL ?? DEFAULT_BASE_URL;

const TRANSLATE_URL = `${BASE_URL}/api/translate`;

/**
 * Frontend uchun tarjima funksiyasi.
 * Render'dagi Node serverga POST /api/translate qilib so'rov yuboradi.
 */
export async function translateTextClient(
  text: string,
  sourceLang: Language,
  targetLang: Language,
): Promise<string> {
  const trimmed = text.trim();

  // Bo'sh matn yoki bir xil til bo'lsa, API'ga bormaymiz
  if (!trimmed || sourceLang === targetLang) {
    return trimmed;
  }

  try {
    const res = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        sourceLang,
        targetLang,
      }),
    });

    if (!res.ok) {
      console.error(
        '[translateTextClient] HTTP error',
        res.status,
        await res.text(),
      );
      throw new Error('Translate request failed');
    }

    const data = await res.json();
    const translated =
      typeof data.translated === 'string'
        ? data.translated.trim()
        : '';

    // Agar server bo'sh qaytarsa, original matnni qaytaramiz
    return translated || trimmed;
  } catch (err) {
    console.error('[translateTextClient] error', err);
    // Xato bo'lsa ham ilova ishlashda davom etishi uchun original matnni qaytaramiz
    return trimmed;
  }
}