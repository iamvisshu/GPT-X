const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";
const MODEL = "tiiuae/falcon-7b-instruct";
//const MODEL = "mistralai/Mistral-7B-Instruct-v0.3"; // You can change this as needed

app.use(cors());
app.use(express.json());

// ✅ Health check endpoint for Render to monitor the service
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Main chat endpoint
app.post('/api/generate', async (req, res) => {
  const API_KEY = process.env.HUGGINGFACE_API_KEY;
  const { prompt } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing Hugging Face API key" });
  }

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          max_time: 60
        },
        options: {
          use_cache: true,
          wait_for_model: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face API Error:", errText);
      throw new Error(`Hugging Face API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log("Response data:", JSON.stringify(data));

    if (!Array.isArray(data) || !data[0]?.generated_text) {
      return res.status(500).json({ error: "Unexpected response format from Hugging Face." });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({error: error.message || "Something went wrong. Please try again later."});
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
