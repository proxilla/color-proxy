// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// POST /api/respond -> forwards to OpenAI Responses API
app.post("/api/respond", async (req, res) => {
  try {
    const { messages, system, temperature } = req.body;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...(messages ?? [])
        ],
        temperature: temperature ?? 0.7
      })
    });

    // Pass OpenAI’s JSON straight through
    res.status(r.status).send(await r.text());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "proxy_failed" });
  }
});

// Vercel detects an exported Express app.
// Locally, we’ll listen on a port.
if (process.env.VERCEL) {
  export default app;
} else {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local proxy running at http://localhost:${port}`));
}