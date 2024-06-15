async function generateResponse() {
    const prompt = document.getElementById('prompt').value.trim();
    if (prompt !== '') {
        appendMessage('user', prompt);
        document.getElementById('prompt').value = ''; // Clear the text area after sending the prompt
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
            console.log("Script Response:", JSON.stringify(data)); // debug loggings
            console.log("Script Response length:", JSON.stringify(data).length); // debug loggings
            const generatedText = formatResponse(data[0].generated_text, prompt);
            appendMessage('bot', generatedText);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, something went wrong.');
        }
    }
}

function formatResponse(text, prompt) {
    // Remove the prompt and any leading new lines from the beginning of the text
    let trimmedText = text.startsWith(prompt) ? text.slice(prompt.length).trimStart() : text.trimStart();

    // Simple replacements for bold and italic
    let formattedText = trimmedText
        .replace(/_([^_]+)_/g, '<i>$1</i>') // Italics with _text_
        .replace(/\*([^*]+)\*/g, '<b>$1</b>') // Bold with *text*
        .replace(/\n/g, '<br>'); // New lines to <br>
    return formattedText;
}

function appendMessage(sender, message) {
    console.log("Message:", message); // debug logging
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    const messageSpan = document.createElement('span');
    messageSpan.innerHTML = message; // Used innerHTML to allow formatting
    messageElement.appendChild(messageSpan);
    chatBox.appendChild(messageElement);
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}
