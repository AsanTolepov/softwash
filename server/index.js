// server/index.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL =
  process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

app.get('/', (req, res) => {
  res.send('SoftWash translate server ishlayapti');
});

app.post('/api/translate', async (req, res) => {
  const { text, sourceLang = 'uz', targetLang = 'ru' } = req.body || {};

  if (!text || typeof text !== 'string') {
    return res
      .status(400)
      .json({ error: '"text" maydoni string bo‘lishi shart' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error:
        'Server sozlanmagan: GROQ_API_KEY environment o‘zgaruvchisi yo‘q',
    });
  }

  // PROMPTNI ANCHA QAT’IY QILAMIZ
  const prompt = `
You are a translation engine.

Translate the following text from ${sourceLang} to ${targetLang}.

Return ONLY the translated text.
Do NOT add quotes.
Do NOT add comments, explanations, examples, or any additional text.
Just return the translated word or phrase.

Text:
${text}
`.trim();

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.0,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq error:', errText);
      return res
        .status(500)
        .json({ error: 'Groq API error', details: errText });
    }

    const data = await response.json();
    let translated =
      data.choices?.[0]?.message?.content || '';

    // 1) Oldingi satrlardan faqat BIRINCHI qatorni olamiz
    translated = translated.split('\n')[0].trim();

    // 2) Bosh va oxiridagi qo'shtirnoq va shunga o‘xshash belgilarni olib tashlaymiz
    translated = translated.replace(
      /^["'«»„“”]+|["'«»„“”]+$/g,
      '',
    );

    // 3) Juda uzun gap bo'lib ketsa, faqat birinchi nuqtagacha yoki 120 belgigacha kesamiz
    if (translated.length > 120) {
      const dotIndex = translated.indexOf('.');
      if (dotIndex > 0 && dotIndex < 120) {
        translated = translated.slice(0, dotIndex).trim();
      } else {
        translated = translated.slice(0, 120).trim();
      }
    }

    res.json({ translated: translated.trim() });
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: 'Server ichki xatosi' });
  }
});

app.listen(PORT, () => {
  console.log(`SoftWash translate server port ${PORT} da ishlayapti`);
});