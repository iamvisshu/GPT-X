const fetch = require('node-fetch');

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";

const MODEL = "mistralai/Mistral-7B-Instruct-v0.2"; // You can replace this with any other model

module.exports = async (req, res) => {
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { prompt } = req.body;

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
                    //'max_length': 1000, // Set the maximum length to 1000
                    'max_new_tokens': 250, // Adjust as needed - (Default: None). Int (0-250)
                    'temperature': 0.7, // Adjust as needed - (Default: 1.0). Float (0.0-100.0)
                    'max_time': 60, // Adjust as needed - (Default: None). Float (0-120.0)
                },
                'options': {
                    'use_cache': true,
                    'wait_for_model': true // Ensure the model waits to return a response until it's ready
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", JSON.stringify(data)); // Debug logging
        console.log("Response length:", JSON.stringify(data).length); // Debug logging
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
