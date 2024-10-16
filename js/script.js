document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', function() {
        sideMenu.classList.toggle('active');
        // Toggle active class for nav links too
        navLinks.classList.toggle('active');
    });

    // Close side menu when clicking outside of it
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (!sideMenu.contains(target) && !menuToggle.contains(target)) {
            sideMenu.classList.remove('active');
            // Remove active class from nav links when clicking outside
            navLinks.classList.remove('active');
        }
    });
});

async function generateResponse() {
    const prompt = document.getElementById('prompt').value.trim();
    if (prompt !== '') {
        appendMessage('user', prompt);
        document.getElementById('prompt').value = ''; // Clear the text area after sending the prompt

        showTypingAnimation(); // Show typing animation before making API call

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
            hideTypingAnimation(); // Hide typing animation upon receiving response

            const generatedText = formatResponse(data[0].generated_text, prompt);
            appendMessage('bot', generatedText);
        } catch (error) {
            console.error('Error:', error);
            hideTypingAnimation(); // Hide typing animation on error
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


function showTypingAnimation() {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot', 'typing');
    typingIndicator.innerHTML = 'Typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingAnimation() {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = chatBox.querySelector('.chat-message.bot.typing');
    if (typingIndicator) {
        chatBox.removeChild(typingIndicator);
    }
}