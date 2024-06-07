async function generateResponse() {
    const prompt = document.getElementById('prompt').value.trim();
    if (prompt !== '') {
        appendMessage('user', prompt);
        try {
            const response = await fetch('/api/generate', {  // Assuming your API endpoint is relative
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
            const generatedText = data[0].generated_text;
            appendMessage('bot', generatedText);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, something went wrong.');
        }
    }
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.innerHTML = `<span>${message}</span>`;
    chatBox.appendChild(messageElement);
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}
