export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API key not configured" });

  try {
    const { messages, system } = req.body;
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，请再试一次。";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
