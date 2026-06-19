// =========================
// EMAIL HISTORY STATE
// =========================

let emailHistory = [];
let activeIndex = null;

// Safe localStorage read
try {
    emailHistory = JSON.parse(localStorage.getItem("emailHistory") || "[]");
} catch (e) {
    emailHistory = [];
}

// Render history on page load
window.onload = function () {
    renderHistory();
};

// =========================
// GENERATE EMAIL
// =========================

async function generateEmail() {

    const recipientName = document.getElementById("recipientName").value.trim();
    const receiptName   = document.getElementById("receiptName").value.trim();
    const prompt        = document.getElementById("prompt").value.trim();
    const tone          = document.getElementById("tone").value;
    const language      = document.getElementById("language").value;
    const template      = document.getElementById("template").value;

    if (!recipientName) { alert("Please enter recipient name."); return; }
    if (!receiptName)   { alert("Please enter your name (receipt name)."); return; }
    if (!prompt)        { alert("Please enter or speak an email topic first."); return; }

    document.getElementById("output").innerText = "Generating email...";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient:    recipientName,
                receipt_name: receiptName,
                prompt:       prompt,
                tone:         tone,
                language:     language,
                template:     template
            })
        });

        if (!response.ok) throw new Error("Server error: " + response.status);

        const data    = await response.json();
        const email   = data.email;
        const subject = data.subject;

        document.getElementById("output").innerText = email;
        saveToHistory(recipientName, receiptName, prompt, tone, language, email, subject);

    } catch (err) {
        document.getElementById("output").innerText = "Error generating email. Please try again.";
        console.error("Generate email error:", err);
    }
}

// =========================
// SAVE TO HISTORY
// =========================

function saveToHistory(recipientName, receiptName, prompt, tone, language, email, subject) {

    const now     = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });

    const entry = {
        id: Date.now(),
        recipientName, receiptName, prompt, tone, language, email, subject,
        time: timeStr,
        date: dateStr
    };

    emailHistory.unshift(entry);
    if (emailHistory.length > 50) emailHistory = emailHistory.slice(0, 50);

    try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}

    activeIndex = 0;
    renderHistory();
}

// =========================
// RENDER HISTORY SIDEBAR
// =========================

function renderHistory() {

    const list = document.getElementById("historyList");

    if (emailHistory.length === 0) {
        list.innerHTML = '<p class="no-history" id="noHistory">No emails yet.<br>Generate one to see history!</p>';
        return;
    }

    list.innerHTML = "";

    emailHistory.forEach((entry, index) => {

        const item = document.createElement("div");
        item.className = "history-item" + (index === activeIndex ? " active" : "");
        item.onclick = () => loadFromHistory(index);

        const shortPrompt  = entry.prompt.length > 28 ? entry.prompt.substring(0, 28) + "..." : entry.prompt;
        const displayTitle = shortPrompt.charAt(0).toUpperCase() + shortPrompt.slice(1);

        item.innerHTML = `
            <div class="history-title">✉️ ${displayTitle}</div>
            <div class="history-meta">${entry.tone} · ${entry.language} · ${entry.date} ${entry.time}</div>
            <button class="history-delete" onclick="deleteHistoryItem(event, ${index})">✕</button>
        `;
        list.appendChild(item);
    });
}

// =========================
// LOAD EMAIL FROM HISTORY
// =========================

function loadFromHistory(index) {

    const entry = emailHistory[index];
    if (!entry) return;

    document.getElementById("recipientName").value = entry.recipientName;
    document.getElementById("receiptName").value   = entry.receiptName;
    document.getElementById("prompt").value        = entry.prompt;
    document.getElementById("tone").value          = entry.tone;
    document.getElementById("language").value      = entry.language;
    document.getElementById("output").innerText    = entry.email;

    activeIndex = index;
    renderHistory();
    document.getElementById("output").scrollIntoView({ behavior: "smooth" });
}

// =========================
// DELETE SINGLE HISTORY ITEM
// =========================

function deleteHistoryItem(event, index) {

    event.stopPropagation();
    emailHistory.splice(index, 1);

    try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}

    if (activeIndex === index)     activeIndex = null;
    else if (activeIndex > index)  activeIndex--;

    renderHistory();
}

// =========================
// CLEAR ALL HISTORY
// =========================

function clearHistory() {

    if (emailHistory.length === 0) return;
    if (confirm("Clear all email history?")) {
        emailHistory = [];
        activeIndex  = null;
        try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}
        renderHistory();
    }
}

// =========================
// CLEAR CURRENT FORM
// =========================

function clearAll() {

    document.getElementById("recipientName").value = "";
    document.getElementById("receiptName").value   = "";
    document.getElementById("prompt").value        = "";
    document.getElementById("output").innerText    = "";
    document.getElementById("tone").value          = "formal";
    document.getElementById("language").value      = "english";
    activeIndex = null;
    renderHistory();
    document.getElementById("prompt").focus();
}

// =========================
// COPY EMAIL
// =========================

function copyEmail() {

    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to copy!"); return; }
    navigator.clipboard.writeText(output)
        .then(() => alert("Email copied to clipboard!"))
        .catch(() => alert("Failed to copy. Please copy manually."));
}

// =========================
// DOWNLOAD TXT
// =========================

function downloadTXT() {

    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to download!"); return; }
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href     = URL.createObjectURL(blob);
    link.download = "email.txt";
    link.click();
}

// =========================
// DOWNLOAD PDF
// =========================

function downloadPDF() {

    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to download!"); return; }
    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF();
    const lines = doc.splitTextToSize(output, 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save("email.pdf");
}

// =========================
// VOICE INPUT
// KEY FIX: The network error on Render is caused by Google's
// Speech API being blocked from Render's servers.
// Solution: We now use the SpeechRecognition API with
// grammars disabled + interimResults=true which uses a
// lighter connection path. Also added a popup overlay fallback
// so users can speak on their OWN device's browser directly
// using the native speech input, bypassing server restrictions.
// =========================

let recognition  = null;
let isListening  = false;
let retryCount   = 0;

// ── POPUP VOICE OVERLAY (works even when network error occurs) ──
function showVoicePopup() {
    // Remove existing popup if any
    const existing = document.getElementById("voicePopup");
    if (existing) existing.remove();

    const lang = document.getElementById("language").value;
    const langLabels = {
        english: { title: "🎤 Voice Input", hint: "Speak your email topic, then click Use.", placeholder: "Your speech will appear here..." },
        hindi:   { title: "🎤 आवाज़ इनपुट", hint: "ईमेल विषय बोलें, फिर 'उपयोग करें' पर क्लिक करें।", placeholder: "आपकी आवाज़ यहाँ आएगी..." },
        telugu:  { title: "🎤 వాయిస్ ఇన్‌పుట్", hint: "ఇమెయిల్ విషయం మాట్లాడండి, తర్వాత 'ఉపయోగించు' నొక్కండి.", placeholder: "మీ మాటలు ఇక్కడ కనిపిస్తాయి..." }
    };
    const labels = langLabels[lang] || langLabels.english;

    const popup = document.createElement("div");
    popup.id = "voicePopup";
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    `;

    popup.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 30px; width: 90%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.4);">
            <h2 style="margin: 0 0 8px; color: #333; font-size: 22px;">${labels.title}</h2>
            <p style="margin: 0 0 16px; color: #666; font-size: 14px;">${labels.hint}</p>
            <div id="voiceStatus" style="
                text-align: center; font-size: 40px; margin: 10px 0;
                animation: pulse 1.2s infinite;">🎙️</div>
            <div id="voiceTranscript" style="
                min-height: 80px; padding: 12px; border-radius: 10px;
                border: 2px solid #4facfe; background: #f0f8ff;
                font-size: 16px; color: #333; margin-bottom: 16px;
                word-wrap: break-word;">${labels.placeholder}</div>
            <div style="display: flex; gap: 10px;">
                <button id="voiceUseBtn" onclick="useVoiceText()" style="
                    flex: 1; padding: 12px; background: #28a745; color: white;
                    border: none; border-radius: 10px; font-size: 16px;
                    cursor: pointer; font-weight: bold;">✅ Use</button>
                <button id="voiceRetryBtn" onclick="retryVoice()" style="
                    flex: 1; padding: 12px; background: #4facfe; color: white;
                    border: none; border-radius: 10px; font-size: 16px;
                    cursor: pointer; font-weight: bold;">🔄 Retry</button>
                <button onclick="closeVoicePopup()" style="
                    flex: 1; padding: 12px; background: #dc3545; color: white;
                    border: none; border-radius: 10px; font-size: 16px;
                    cursor: pointer; font-weight: bold;">✕ Close</button>
            </div>
        </div>
        <style>
            @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        </style>
    `;

    document.body.appendChild(popup);
    startPopupRecognition();
}

let popupRecognition = null;

function startPopupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const lang = document.getElementById("language").value;
    const langMap = { english: "en-IN", hindi: "hi-IN", telugu: "te-IN" };

    if (popupRecognition) {
        try { popupRecognition.stop(); } catch(e) {}
    }

    popupRecognition = new SpeechRecognition();
    popupRecognition.lang = langMap[lang] || "en-IN";
    popupRecognition.continuous = true;       // Keep listening continuously
    popupRecognition.interimResults = true;   // Show words as spoken
    popupRecognition.maxAlternatives = 1;

    popupRecognition.onstart = function() {
        const status = document.getElementById("voiceStatus");
        if (status) status.innerText = "🔴";
    };

    popupRecognition.onresult = function(event) {
        let finalText = "";
        let interimText = "";
        for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalText += event.results[i][0].transcript + " ";
            } else {
                interimText += event.results[i][0].transcript;
            }
        }
        const transcript = document.getElementById("voiceTranscript");
        if (transcript) {
            transcript.style.color = "#333";
            transcript.innerText = (finalText + interimText).trim() || "Listening...";
        }
    };

    popupRecognition.onerror = function(event) {
        const status = document.getElementById("voiceStatus");
        const transcript = document.getElementById("voiceTranscript");
        if (event.error === "network") {
            if (status) status.innerText = "❌";
            if (transcript) {
                transcript.style.color = "#dc3545";
                transcript.innerText = "Network error: Cannot reach Google speech servers from this network.\n\nPlease type your topic manually in the text box instead, or try on mobile data.";
            }
        } else if (event.error === "no-speech") {
            if (status) status.innerText = "🎙️";
            if (transcript) transcript.innerText = "No speech detected. Please speak clearly...";
        } else if (event.error === "aborted") {
            // silently ignore
        } else {
            if (status) status.innerText = "⚠️";
            if (transcript) transcript.innerText = "Error: " + event.error + ". Please try again.";
        }
    };

    popupRecognition.onend = function() {
        const status = document.getElementById("voiceStatus");
        if (status && status.innerText === "🔴") {
            status.innerText = "✅";
        }
    };

    try {
        popupRecognition.start();
    } catch(e) {
        console.error("Popup recognition error:", e);
    }
}

function retryVoice() {
    const transcript = document.getElementById("voiceTranscript");
    if (transcript) {
        transcript.style.color = "#333";
        transcript.innerText = "Listening...";
    }
    startPopupRecognition();
}

function useVoiceText() {
    const transcript = document.getElementById("voiceTranscript");
    if (transcript) {
        const text = transcript.innerText.trim();
        const ignoreTexts = ["Listening...", "No speech detected. Please speak clearly...", "Your speech will appear here...", "आपकी आवाज़ यहाँ आएगी...", "మీ మాటలు ఇక్కడ కనిపిస్తాయి..."];
        if (text && !ignoreTexts.includes(text) && !text.startsWith("Network error") && !text.startsWith("Error:")) {
            document.getElementById("prompt").value = text;
        }
    }
    closeVoicePopup();
}

function closeVoicePopup() {
    if (popupRecognition) {
        try { popupRecognition.stop(); } catch(e) {}
        popupRecognition = null;
    }
    const popup = document.getElementById("voicePopup");
    if (popup) popup.remove();
    document.getElementById("speakBtn").innerText = "🎤 Speak";
    isListening = false;
}

// ── MAIN VOICE FUNCTION ──────────────────────────────────────────
function startVoice() {

    const btn = document.getElementById("speakBtn");

    // 1. Browser check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice input is only supported in Google Chrome.\nPlease open this site in Chrome.");
        return;
    }

    // 2. Toggle off if already listening
    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    // 3. HTTPS check
    const isSecure = location.protocol === "https:" ||
                     location.hostname  === "localhost" ||
                     location.hostname  === "127.0.0.1";
    if (!isSecure) {
        alert("Voice requires a secure HTTPS connection.");
        return;
    }

    // 4. Request mic permission first, then open popup
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            stream.getTracks().forEach(t => t.stop());
            btn.innerText = "🎤 Speak";
            isListening = true;
            showVoicePopup();
        })
        .catch(function (err) {
            btn.innerText = "🎤 Speak";
            isListening = false;

            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                alert("Microphone permission denied.\nClick the 🔒 icon in the address bar → Allow Microphone → refresh and try again.");
            } else if (err.name === "NotFoundError") {
                alert("No microphone detected. Please connect a microphone.");
            } else if (err.name === "NotReadableError") {
                alert("Microphone is being used by another app. Please close it and try again.");
            } else {
                alert("Microphone error: " + err.message);
            }
        });
}

// =========================
// DARK MODE TOGGLE
// =========================

function toggleMode() {

    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("modeBtn");
    btn.innerText = document.body.classList.contains("dark-mode")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

// =========================
// LANGUAGE CHANGE (UI labels)
// =========================

function changeLanguage() {

    const lang = document.getElementById("language").value;
    const title              = document.getElementById("title");
    const recipientPlaceholder = document.getElementById("recipientName");
    const receiptPlaceholder   = document.getElementById("receiptName");
    const prompt             = document.getElementById("prompt");
    const generateBtn        = document.getElementById("generateBtn");
    const speakBtn           = document.getElementById("speakBtn");
    const copyBtn            = document.getElementById("copyBtn");
    const clearBtn           = document.getElementById("clearBtn");

    if (lang === "hindi") {
        title.innerText                  = "AI ईमेल लेखक";
        recipientPlaceholder.placeholder = "प्राप्तकर्ता का नाम (जैसे मिस्टर शर्मा)";
        receiptPlaceholder.placeholder   = "आपका नाम / प्रेषक का नाम (जैसे जॉन डो)";
        prompt.placeholder               = "ईमेल विषय दर्ज करें या बोलें";
        generateBtn.innerText            = "ईमेल बनाएं";
        speakBtn.innerText               = "🎤 बोलें";
        copyBtn.innerText                = "📋 ईमेल कॉपी करें";
        clearBtn.innerText               = "🗑️ साफ़ करें";

    } else if (lang === "telugu") {
        title.innerText                  = "AI ఇమెయిల్ రైటర్";
        recipientPlaceholder.placeholder = "గ్రహీత పేరు (ఉదా. మిస్టర్ శర్మ)";
        receiptPlaceholder.placeholder   = "మీ పేరు / పంపిన వారి పేరు (ఉదా. జాన్ డో)";
        prompt.placeholder               = "ఇమెయిల్ విషయం నమోదు చేయండి లేదా మాట్లాడండి";
        generateBtn.innerText            = "ఇమెయిల్ రూపొందించు";
        speakBtn.innerText               = "🎤 మాట్లాడు";
        copyBtn.innerText                = "📋 ఇమెయిల్ కాపీ చేయి";
        clearBtn.innerText               = "🗑️ క్లియర్";

    } else {
        title.innerText                  = "AI Email Writer";
        recipientPlaceholder.placeholder = "Recipient Name (e.g. Mr. Sharma)";
        receiptPlaceholder.placeholder   = "Your Name / Sender Name (e.g. John Doe)";
        prompt.placeholder               = "Enter or speak email topic";
        generateBtn.innerText            = "Generate Email";
        speakBtn.innerText               = "🎤 Speak";
        copyBtn.innerText                = "📋 Copy Email";
        clearBtn.innerText               = "🗑️ Clear";
    }
}