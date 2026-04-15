import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * translateText – Groq API orqali matnni tarjima qiladi.
 * HTTPS callable funksiyasi: frontend httpsCallable bilan chaqiradi.
 *
 * Kirish (data):
 *  { text: string, sourceLang: 'uz' | 'ru' | 'en', targetLang: 'uz' | 'ru' | 'en' }
 *
 * Chiqish:
 *  { translated: string }
 */
export const translateText = functions.https.onCall(
  async (request, context) => {
    // YANGI: ma'lumotni request.data dan olamiz
    const {
      text,
      sourceLang = 'uz',
      targetLang = 'ru',
    } = (request.data || {}) as {
      text?: string;
      sourceLang?: string;
      targetLang?: string;
    };

    if (!text || typeof text !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '"text" maydonini to‘g‘ri yuboring',
      );
    }

    // YANGI: functions.config() ni "any" orqali chaqiramiz (TS uchun)
    const functionsAny = functions as any;
    const apiKey = functionsAny.config().groq?.key as
      | string
      | undefined;

    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Groq API kaliti sozlanmagan: functions.config().groq.key',
      );
    }

    const prompt = `Quyidagi matnni ${sourceLang} tilidan ${targetLang} tiliga PROFESSIONAL tarzda tarjima qil. Faqat tarjima matnini qaytar, qo‘shimcha izoh yozma.\n\n"${text}"`;

    // Node 18+ da global fetch mavjud
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      },
    );

    if (!response.ok) {
      const txt = await response.text();
      console.error('Groq error:', txt);
      throw new functions.https.HttpsError(
        'internal',
        'Groq API bilan bog‘lanishda xatolik yuz berdi.',
      );
    }

    const dataJson = await response.json();
    const translated: string =
      dataJson.choices?.[0]?.message?.content?.trim() ?? '';

    return { translated };
  },
);