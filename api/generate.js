const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Hugging Face API key" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }

  try {
    // Using the Unified Router with the specific provider suffix as shown in your documentation
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ 
        model: "meta-llama/Llama-3.1-8B-Instruct:novita",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Router Error (${response.status}):`, data);
      return res.status(response.status).json(data);
    }

    // Extract the message content (OpenAI format)
    const reply = data.choices[0].message.content || "No response.";

    // Match the frontend's expected format
    res.status(200).json([{ generated_text: reply }]);

  } catch (error) {
    console.error("Backend Error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
