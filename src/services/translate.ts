// src/services/translate.ts

// Backend URL'ni .env orqali berib yuboramiz.
// Agar VITE_TRANSLATE_API_URL bo'lmasa, lokal dev uchun localhost ishlatiladi.
const API_BASE_URL =
  import.meta.env.VITE_TRANSLATE_API_URL || 'http://localhost:3001';

export async function translateTextClient(
  text: string,
  sourceLang: 'uz' | 'ru' | 'en',
  targetLang: 'uz' | 'ru' | 'en',
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });

  if (!res.ok) {
    console.error('Translate API error:', await res.text());
    throw new Error('Tarjima API xatosi');
  }

  const data = (await res.json()) as { translated: string };
  return data.translated;
}