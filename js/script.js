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

        //this code is to simulate the response.
        /*try {
            hideTypingAnimation(); // Simulate end of "thinking"

            //Simulated fake response for testing
            const fakeResponse =
              "Here's a simple Java method to reverse a string:\n\n" +
              "```java\n" +
              "public static String reverse(String input) {\n" +
              "    return new StringBuilder(input).reverse().toString();\n" +
              "}\n" +
              "```\n\n" +
              "Let me know if you'd like this explained line-by-line.";

            const generatedText = formatResponse(fakeResponse, prompt);
            appendMessage('bot', generatedText);
        } catch (error) {
            console.error('Error:', error);
            hideTypingAnimation(); // Hide typing animation on error
            appendMessage('bot', 'Sorry, something went wrong.');
        }*/
    }
}

function formatResponse(text, prompt) {
    const trimmed = text.startsWith(prompt)
        ? text.slice(prompt.length).trimStart()
        : text.trimStart();

    return marked.parse(trimmed); // 👈 handles real markdown from Mistral
}


function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');

    // 🧠 Set emoji or avatar depending on sender
    avatar.innerHTML = sender === 'user' ? '👤' : '🤖';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = message; // Use innerHTML for formatted text/code

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
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