const fetch = require('node-fetch');

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";

const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"; // You can replace this with any other model

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
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
