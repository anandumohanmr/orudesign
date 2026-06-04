// ============================================================================
// CONFIGURATION & INITIALIZATION
// ============================================================================
// WARNING: Storing production API keys in client-side JS exposes them to users.
// Consider channeling this through a secure backend server later.
const GEMINI_API_KEY = "AQ.Ab8RN6KI_cVw0r-JbEhzLbPGpRzQ4z2u5xJoqxtu9TwcrvsKyQ"; 

console.log("JS LOADED");

// DOM Elements
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const newChat = document.getElementById("newChat");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Automatically scrolls the chat window to the bottommost message.
 */
function scrollBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Parses basic Markdown typography format syntax into standard readable HTML.
 */
function formatAIResponse(text) {
    if (!text) return "No response received.";

    let formatted = text;

    // 1. Escape basic HTML elements to prevent accidental layout breaks or XSS
    formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 2. Convert markdown bold (**text**) to HTML strong tags
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. Convert structural line breaks into standard HTML breaks
    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
}

// ============================================================================
// GEMINI API INTEGRATION
// ============================================================================

/**
 * Fetches content dynamically using the native Google Gemini API.
 */
async function getAIResponse(prompt) {
    try {
        // FIXED: Updated endpoint from 'v1beta' to stable 'v1' 
        // FIXED: Updated model path string from 'gemini-1.5-flash' to 'gemini-2.5-flash'
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are ORU AI. You are an expert in Graphic Design, Branding, Social Media Marketing, Logo Design, HTML, CSS, JavaScript, WordPress, and Study Abroad Marketing.\n\nUser Question: ${prompt}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error Structural Payload:", data);
            const localizedError = data?.error?.message || `Status Code ${response.status}`;
            return `API Error: ${localizedError}`;
        }

        console.log("Gemini API Success Log:", data);
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    } catch (error) {
        console.error("Fatal Connection or Network interface failure:", error);
        return "Unable to connect to Gemini AI. Check your internet connection or console logs.";
    }
}

// ============================================================================
// CHAT LOGIC AND EVENT FLOWS
// ============================================================================

/**
 * Triggers the typing bubble layout and transitions elements when processing completes.
 */
async function showTyping(message) {
    const typingHTML = `
    <div class="ai-message" id="typingBox">
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
    `;

    chatMessages.insertAdjacentHTML("beforeend", typingHTML);
    scrollBottom();

    // Query Native Gemini Endpoint
    const aiReply = await getAIResponse(message);
    
    // Clear typing bubble element smoothly from layout
    const typingBox = document.getElementById("typingBox");
    if (typingBox) {
        typingBox.remove();
    }

    // Safely parse raw markdown tokens into human-readable browser layouts
    const formattedReply = formatAIResponse(aiReply);

    const aiHTML = `
    <div class="ai-message">
        <div class="message-avatar">AI</div>
        <div class="message-content">${formattedReply}</div>
    </div>
    `;

    chatMessages.insertAdjacentHTML("beforeend", aiHTML);
    scrollBottom();
}

/**
 * Validates inputs from text area fields and submits strings down the pipeline.
 */
async function sendMessage() {
    if (!userInput) return;
    
    const message = userInput.value.trim();
    if (!message) return; 

    const userHTML = `
    <div class="user-message">
        <div class="message-avatar">U</div>
        <div class="message-content">${message}</div>
    </div>
    `;

    chatMessages.insertAdjacentHTML("beforeend", userHTML);
    userInput.value = "";
    scrollBottom();

    await showTyping(message);
}

// ============================================================================
// EVENT LISTENERS REGISTER
// ============================================================================

// Clear Screen and Display Default Greeting Node
if (newChat && chatMessages) {
    newChat.addEventListener("click", () => {
        chatMessages.innerHTML = `
        <div class="ai-message">
            <div class="message-avatar">AI</div>
            <div class="message-content">
                👋 Hello Anandu!<br><br>
                I'm ORU AI Assistant.<br><br>
                How can I help you today?
            </div>
        </div>
        `;
        scrollBottom();
    });
}

// Watch Action Button Submit Triggers
if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

// Listen for Physical Keyboard Return Submissions
if (userInput) {
    userInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); 
            sendMessage();
        }
    });
}

console.log("ORU AI Loaded Successfully");