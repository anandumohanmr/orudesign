/* ============================================
   ORU AI Assistant — chat logic
   Uses Pollinations.ai's free, keyless,
   OpenAI-compatible text endpoint:
   https://text.pollinations.ai/openai
   ============================================ */

(function () {
  "use strict";

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

  // Running conversation sent to the API (system + turns).
  let conversation = [{ role: "system", content: SYSTEM_PROMPT }];

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

  async function fetchAIReply(messages) {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed with status " + response.status);
    }

    const data = await response.json();
    const reply =
      data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
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
    conversation.push({ role: "user", content: text });

    userInput.value = "";
    autoResizeTextarea();
    setSending(true);
    addTypingIndicator();

    try {
      const reply = await fetchAIReply(conversation);
      removeTypingIndicator();
      addMessage("ai", formatForDisplay(reply));
      conversation.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error("ORU AI Assistant error:", err);
      removeTypingIndicator();
      addMessage(
        "ai",
        "⚠️ Sorry, I couldn't reach the AI service right now. Please check your connection and try again in a moment."
      );
    } finally {
      setSending(false);
      userInput.focus();
    }
  }

  function startNewChat() {
    conversation = [{ role: "system", content: SYSTEM_PROMPT }];
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
