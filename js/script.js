async function generateResponse() {
    const prompt = document.getElementById('prompt').value.trim();
    if (prompt !== '') {
        appendMessage('user', prompt);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
			console.log("script res length:", JSON.stringify(data).length); // debug loggings
            const generatedText = data[0].generated_text;
            appendMessage('bot', generatedText); // No need to trim here
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, something went wrong.');
        }
    }
}

function appendMessage(sender, message) {
    console.log("Message:", message); // debug logging
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    messageElement.appendChild(messageSpan);
    chatBox.appendChild(messageElement);
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

