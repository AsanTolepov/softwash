// server/index.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: '*', // hozircha hamma domainlardan ruxsat; xohlasa keyin cheklaysiz
  }),
);

app.use(express.json());

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Agar hohlasangiz, model nomini ham env'dan olish mumkin
const GROQ_MODEL =
  process.env.GROQ_MODEL || 'llama-3.1-8b-instant'; // YANGI MODEL

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

  const prompt = `Quyidagi matnni ${sourceLang} tilidan ${targetLang} tiliga PROFESSIONAL tarzda tarjima qil. Faqat tarjima matnini qaytar, qo‘shimcha izoh yozma.\n\n"${text}"`;

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
          model: GROQ_MODEL, // ESKI 'llama3-8b-8192' o'rniga shu
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
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
    const translated =
      data.choices?.[0]?.message?.content?.trim() || '';

    res.json({ translated });
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: 'Server ichki xatosi' });
  }
});

app.listen(PORT, () => {
  console.log(`SoftWash translate server port ${PORT} da ishlayapti`);
});