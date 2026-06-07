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

    // Safe localStorage write
    try {
        localStorage.setItem("emailHistory", JSON.stringify(emailHistory));
    } catch (e) { /* storage unavailable – history lives in memory only */ }

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

    if (activeIndex === index)       activeIndex = null;
    else if (activeIndex > index)    activeIndex--;

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
// VOICE INPUT  ← FIXED
// =========================

let recognition = null;
let isListening = false;

function startVoice() {

    // ── 1. Check browser support ──────────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice input is only supported in Google Chrome.");
        return;
    }

    // ── 2. If already listening, stop ─────────────────────────────
    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    // ── 3. Check HTTPS / localhost (required for mic access) ──────
    const isSecure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!isSecure) {
        alert("Voice input requires a secure (HTTPS) connection. Please access the site via HTTPS.");
        return;
    }

    // ── 4. Check if getUserMedia is available ─────────────────────
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access. Please use Google Chrome over HTTPS.");
        return;
    }

    const button = document.getElementById("speakBtn");

    // ── 5. Request microphone permission first ─────────────────────
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {

            // Stop the stream immediately – we only needed permission
            stream.getTracks().forEach(track => track.stop());

            // ── 6. Set up SpeechRecognition ───────────────────────
            recognition = new SpeechRecognition();

            const lang = document.getElementById("language").value;
            if      (lang === "hindi")   recognition.lang = "hi-IN";
            else if (lang === "telugu")  recognition.lang = "te-IN";
            else                         recognition.lang = "en-IN";

            recognition.continuous      = false;
            recognition.interimResults  = true;

            recognition.onstart = function () {
                isListening        = true;
                button.innerHTML   = "🔴 Listening...";
            };

            recognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript;
                document.getElementById("prompt").value = transcript;
            };

            recognition.onerror = function (event) {
                isListening      = false;
                button.innerHTML = "🎤 Speak";

                // ── Friendly, accurate error messages ─────────────
                switch (event.error) {
                    case "not-allowed":
                    case "permission-denied":
                        alert("Microphone access was denied.\nPlease allow microphone permission in your browser settings and try again.");
                        break;
                    case "no-speech":
                        alert("No speech detected. Please speak clearly and try again.");
                        break;
                    case "network":
                        // This is the error you were seeing!
                        // Web Speech API needs internet for Google's servers.
                        alert("Voice recognition requires an active internet connection.\nPlease check your connection and try again.");
                        break;
                    case "audio-capture":
                        alert("No microphone found. Please connect a microphone and try again.");
                        break;
                    case "service-not-allowed":
                        alert("Speech recognition is not allowed on this page.\nMake sure the site is accessed over HTTPS.");
                        break;
                    default:
                        alert("Voice recognition error (" + event.error + "). Please try again.");
                }
            };

            recognition.onend = function () {
                isListening      = false;
                button.innerHTML = "🎤 Speak";
            };

            // ── 7. Start recognition ──────────────────────────────
            try {
                recognition.start();
            } catch (err) {
                isListening      = false;
                button.innerHTML = "🎤 Speak";
                console.error("Recognition start error:", err);
                alert("Could not start voice recognition. Please try again.");
            }

        })
        .catch(function (err) {
            // getUserMedia rejected
            button.innerHTML = "🎤 Speak";
            isListening      = false;

            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                alert("Microphone permission denied.\nPlease click the camera/mic icon in your browser address bar and allow microphone access.");
            } else if (err.name === "NotFoundError") {
                alert("No microphone detected. Please connect a microphone and try again.");
            } else if (err.name === "NotReadableError") {
                alert("Microphone is in use by another application. Please close other apps using the mic.");
            } else {
                alert("Could not access microphone: " + err.message);
            }
        });
}

// =========================
// DARK MODE TOGGLE
// =========================

function toggleMode() {
    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("modeBtn");
    btn.innerText = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
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
        title.innerText                    = "AI ईमेल लेखक";
        recipientPlaceholder.placeholder   = "प्राप्तकर्ता का नाम (जैसे मिस्टर शर्मा)";
        receiptPlaceholder.placeholder     = "आपका नाम / प्रेषक का नाम (जैसे जॉन डो)";
        prompt.placeholder                 = "ईमेल विषय दर्ज करें या बोलें";
        generateBtn.innerText              = "ईमेल बनाएं";
        speakBtn.innerText                 = "🎤 बोलें";
        copyBtn.innerText                  = "📋 ईमेल कॉपी करें";
        clearBtn.innerText                 = "🗑️ साफ़ करें";

    } else if (lang === "telugu") {
        title.innerText                    = "AI ఇమెయిల్ రైటర్";
        recipientPlaceholder.placeholder   = "గ్రహీత పేరు (ఉదా. మిస్టర్ శర్మ)";
        receiptPlaceholder.placeholder     = "మీ పేరు / పంపిన వారి పేరు (ఉదా. జాన్ డో)";
        prompt.placeholder                 = "ఇమెయిల్ విషయం నమోదు చేయండి లేదా మాట్లాడండి";
        generateBtn.innerText              = "ఇమెయిల్ రూపొందించు";
        speakBtn.innerText                 = "🎤 మాట్లాడు";
        copyBtn.innerText                  = "📋 ఇమెయిల్ కాపీ చేయి";
        clearBtn.innerText                 = "🗑️ క్లియర్";

    } else {
        title.innerText                    = "AI Email Writer";
        recipientPlaceholder.placeholder   = "Recipient Name (e.g. Mr. Sharma)";
        receiptPlaceholder.placeholder     = "Your Name / Sender Name (e.g. John Doe)";
        prompt.placeholder                 = "Enter or speak email topic";
        generateBtn.innerText              = "Generate Email";
        speakBtn.innerText                 = "🎤 Speak";
        copyBtn.innerText                  = "📋 Copy Email";
        clearBtn.innerText                 = "🗑️ Clear";
    }
}