const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

module.exports = async (req, res) => {
  if (!process.env.HUGGINGFACE_API_KEY) {
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
    const chatCompletion = await client.chatCompletion({
      model: "google/gemma-2-9b-it",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });

    const reply = chatCompletion.choices?.[0]?.message?.content || "No response.";

    // Match the frontend's expected format
    res.status(200).json([{ generated_text: reply }]);
  } catch (error) {
    console.error("Hugging Face API Error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
