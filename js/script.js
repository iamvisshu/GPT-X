document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    const promptArea = document.getElementById('prompt');

    // --- Sidebar Logic ---
    if (menuToggle && sideMenu) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sideMenu.classList.add('active');
        });
    }

    if (closeMenu && sideMenu) {
        closeMenu.addEventListener('click', function () {
            sideMenu.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (event) {
        if (sideMenu && sideMenu.classList.contains('active')) {
            if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                sideMenu.classList.remove('active');
            }
        }
    });

    // --- Input Handling ---
    if (promptArea) {
        // Enter to Send, Shift+Enter for New Line
        promptArea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateResponse();
            }
        });

        // Auto-resize Textarea as user types
        promptArea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});

/**
 * Main function to generate AI response
 */
async function generateResponse() {
    const promptInput = document.getElementById('prompt');
    if (!promptInput) return;

    const prompt = promptInput.value.trim();

    if (prompt !== '') {
        // Clear welcome screen on first interaction
        const welcome = document.querySelector('.welcome-screen');
        if (welcome) welcome.remove();

        appendMessage('user', prompt);

        // Reset input state
        promptInput.value = '';
        promptInput.style.height = 'auto';

        showTypingAnimation();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const data = await response.json();
            hideTypingAnimation();

            const generatedText = formatResponse(data[0].generated_text, prompt);
            appendMessage('bot', generatedText);

        } catch (error) {
            console.error('Chat Error:', error);
            hideTypingAnimation();
            appendMessage('bot', '🤖 Sorry, something went wrong. Let\'s try that again.');
        }
    }
}

/**
 * Strips prompt from response if model repeats it (common in some LLMs)
 */
function formatResponse(text, prompt) {
    const trimmed = text.startsWith(prompt)
        ? text.slice(prompt.length).trimStart()
        : text.trimStart();

    // Convert Markdown to HTML using marked.js
    return marked.parse(trimmed);
}

/**
 * Appends a message bubble to the chat history
 */
function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    if (sender === 'bot') {
        messageContent.innerHTML = message;
        // Apply syntax highlighting to code blocks
        processCodeBlocks(messageContent);
    } else {
        messageContent.textContent = message;
    }

    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);

    // Smooth scroll to the latest message
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Detects code blocks and adds "Copy" buttons + syntax highlighting
 */
function processCodeBlocks(container) {
    const blocks = container.querySelectorAll('pre');
    blocks.forEach((block) => {
        const codeElement = block.querySelector('code');
        if (!codeElement) return;

        // Extract language from class (e.g., 'language-javascript')
        const language = (codeElement.className.match(/language-(\w+)/) || [, 'code'])[1];

        // Wrap for custom styling
        const wrapper = document.createElement('div');
        wrapper.classList.add('code-block-container');

        const header = document.createElement('div');
        header.classList.add('code-header');
        header.innerHTML = `
            <span>${language}</span>
            <button class="copy-btn" onclick="copyCode(this)">
                <i class="far fa-copy"></i> Copy
            </button>
        `;

        block.parentNode.insertBefore(wrapper, block);
        wrapper.appendChild(header);
        wrapper.appendChild(block);

        // Apply Highlight.js colors
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(codeElement);
        }
    });
}

/**
 * Clipboard functionality for code blocks
 */
function copyCode(button) {
    const container = button.closest('.code-block-container');
    const code = container.querySelector('code').innerText;

    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-check"></i> Copied!`;
        button.style.color = '#4ade80'; // Success green

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

/**
 * Animated bot typing state
 */
function showTypingAnimation() {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot');
    typingIndicator.id = 'typing-indicator';

    typingIndicator.innerHTML = `
        <div class="message-content typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;

    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Removes typing animation
 */
function hideTypingAnimation() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}