// api/respond.js — Vercel Serverless Function
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, system, temperature, stream } = req.body || {};

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...(messages ?? [])
        ],
        temperature: temperature ?? 0.7,
        stream: stream === true
      })
    });

    const text = await r.text(); // proxy raw JSON through
    res.status(r.status).send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'proxy_failed' });
  }
}
