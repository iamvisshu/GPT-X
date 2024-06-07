const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const API_URL = "https://api-inference.huggingface.co/models/gpt2";
    const API_KEY = process.env.HUGGINGFACE_API_KEY;  // Use environment variable

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const prompt = req.body.prompt;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    res.status(200).json(data);
};
