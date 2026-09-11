/* ============================================
   ORU AI Assistant — chat logic
   Uses Google's Gemini API free tier
   (Pollinations' text API now requires a paid
   key/"Pollen" balance for every request, so it
   no longer works without signing up either —
   Gemini's free tier is the more reliable option
   as of Sept 2026).

   SETUP — do this before the chatbot will work:
   1. Go to https://aistudio.google.com/apikey and
      sign in with any Google account (free, no
      card needed) to generate an API key.
   2. Paste that key below as GEMINI_API_KEY.
   3. IMPORTANT: this key will be visible to anyone
      who views your page source. In Google Cloud
      Console, open the key's settings and add an
      "HTTP referrer" restriction limited to your
      domain (e.g. https://orudesign.in/*) so it
      can't be used from anywhere else. For a
      production site it's even safer to route this
      call through a small serverless function
      (Cloudflare Worker / Vercel function) that
      holds the key server-side instead.
   ============================================ */

(function () {
  "use strict";

  const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // <-- paste your free key here
  const GEMINI_MODEL = "gemini-2.0-flash";
  const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    GEMINI_MODEL +
    ":generateContent";

  const chatMessages = document.getElementById("chatMessages");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChat");
  const chatHistoryList = document.getElementById("chatHistory");

  const SYSTEM_PROMPT =
    "You are ORU AI Assistant, the helpful in-house assistant for Oru Design, " +
    "a creative studio for branding, motion graphics, UI/UX design and AI-powered tools. " +
    "You help with content writing, graphic design ideas, marketing & branding, business support, " +
    "coding & development, AI prompts & automation, research & analysis, productivity & planning, " +
    "education, and general knowledge. Keep answers clear, friendly, and reasonably concise.";

  // Running conversation sent to the API. Gemini format: role is "user" or "model".
  let conversation = [];

  const WELCOME_HTML = `
    👋 Hello!
    <br><br>
    I'm ORU AI Assistant.
    <br><br>
    Ask me anything about:
    <br><br>
    • Content Writing<br>
    • Graphic Design Ideas<br>
    • Marketing & Branding<br>
    • Business Support<br>
    • Coding & Development<br>
    • AI Prompts & Automation<br>
    • Research & Analysis<br>
    • Productivity & Planning<br>
    • Education & Learning<br>
    • General Knowledge Questions<br>
  `;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Turn plain text into simple chat-friendly HTML (line breaks preserved, safe from injection).
  function formatForDisplay(str) {
    return escapeHtml(str).replace(/\n/g, "<br>");
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addMessage(role, html) {
    const wrapper = document.createElement("div");
    wrapper.className = role === "user" ? "user-message" : "ai-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "U" : "AI";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = html;

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);
    chatMessages.appendChild(wrapper);
    scrollToBottom();

    return content; // return content node so callers can update it (e.g. typing -> real reply)
  }

  function addTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-message";
    wrapper.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "AI";

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";

    wrapper.appendChild(avatar);
    wrapper.appendChild(typing);
    chatMessages.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  function autoResizeTextarea() {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
  }

  function setSending(isSending) {
    sendBtn.disabled = isSending;
    sendBtn.textContent = isSending ? "..." : "Send";
    userInput.disabled = isSending;
  }

  async function fetchAIReply(history) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error(
        "Missing Gemini API key — add your free key from https://aistudio.google.com/apikey at the top of ai-assistant.js"
      );
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: history,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(function () {
        return "";
      });
      throw new Error(
        "API request failed with status " + response.status + " " + errBody
      );
    }

    const data = await response.json();
    const reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
        ? data.candidates[0].content.parts[0].text
        : null;

    if (!reply) {
      throw new Error("No content in API response");
    }

    return reply;
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage("user", formatForDisplay(text));
    conversation.push({ role: "user", parts: [{ text: text }] });

    userInput.value = "";
    autoResizeTextarea();
    setSending(true);
    addTypingIndicator();

    try {
      const reply = await fetchAIReply(conversation);
      removeTypingIndicator();
      addMessage("ai", formatForDisplay(reply));
      conversation.push({ role: "model", parts: [{ text: reply }] });
    } catch (err) {
      console.error("ORU AI Assistant error:", err);
      removeTypingIndicator();
      const isKeyError = /API key/i.test(err.message || "");
      addMessage(
        "ai",
        isKeyError
          ? "⚠️ No Gemini API key is set up yet. Add a free key from aistudio.google.com/apikey to ai-assistant.js to turn this chatbot on."
          : "⚠️ Sorry, I couldn't reach the AI service right now. Please check your connection and try again in a moment."
      );
    } finally {
      setSending(false);
      userInput.focus();
    }
  }

  function startNewChat() {
    conversation = [];
    chatMessages.innerHTML = "";
    addMessage("ai", WELCOME_HTML);
    userInput.value = "";
    autoResizeTextarea();
    userInput.focus();
  }

  // --- Event wiring ---

  sendBtn.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  userInput.addEventListener("input", autoResizeTextarea);

  newChatBtn.addEventListener("click", startNewChat);

  // Clicking a history item just loads it as a fresh chat placeholder for now
  // (no persistence layer yet) so the UI doesn't feel dead.
  if (chatHistoryList) {
    chatHistoryList.addEventListener("click", function (e) {
      const li = e.target.closest("li");
      if (!li) return;
      startNewChat();
      addMessage(
        "ai",
        "This is a placeholder for the saved chat: <strong>" +
          escapeHtml(li.textContent.trim()) +
          "</strong>. Chat history isn't persisted yet — this button is ready for that feature."
      );
    });
  }

  autoResizeTextarea();
})();
