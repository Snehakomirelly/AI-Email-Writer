// EMAIL HISTORY STATE
let emailHistory = [];
let activeIndex = null;

try {
    emailHistory = JSON.parse(localStorage.getItem("emailHistory") || "[]");
} catch (e) {
    emailHistory = [];
}

window.addEventListener("load", function () {
    renderHistory();
});

// GENERATE EMAIL
async function generateEmail() {
    const recipientName = document.getElementById("recipientName").value.trim();
    const receiptName = document.getElementById("receiptName").value.trim();
    const prompt = document.getElementById("prompt").value.trim();
    const tone = document.getElementById("tone").value;
    const language = document.getElementById("language").value;
    const template = document.getElementById("template").value;

    if (!recipientName) { alert("Please enter recipient name."); return; }
    if (!receiptName) { alert("Please enter sender name."); return; }
    if (!prompt) { alert("Please enter or speak email topic first."); return; }

    document.getElementById("output").innerText = "Generating email...";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recipient: recipientName,
                receipt_name: receiptName,
                prompt: prompt,
                tone: tone,
                language: language,
                template: template
            })
        });

        if (!response.ok) throw new Error("Server error: " + response.status);

        const data = await response.json();
        document.getElementById("output").innerText = data.email;
        saveToHistory(recipientName, receiptName, prompt, tone, language, data.email, data.subject);

    } catch (error) {
        console.log(error);
        document.getElementById("output").innerText = "Error generating email. Try again.";
    }
}

// SAVE TO HISTORY
function saveToHistory(recipientName, receiptName, prompt, tone, language, email, subject) {
    const now = new Date();
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

// RENDER HISTORY SIDEBAR
function renderHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;

    if (emailHistory.length === 0) {
        list.innerHTML = '<p class="no-history" id="noHistory">No emails yet.<br>Generate one to see history!</p>';
        return;
    }

    list.innerHTML = "";

    emailHistory.forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = "history-item" + (index === activeIndex ? " active" : "");
        item.onclick = () => loadFromHistory(index);

        const shortPrompt = entry.prompt.length > 28 ? entry.prompt.substring(0, 28) + "..." : entry.prompt;
        const displayTitle = shortPrompt.charAt(0).toUpperCase() + shortPrompt.slice(1);

        item.innerHTML = `
            <div class="history-title">✉️ ${displayTitle}</div>
            <div class="history-meta">${entry.tone} · ${entry.language} · ${entry.date} ${entry.time}</div>
            <button class="history-delete" onclick="deleteHistoryItem(event, ${index})">✕</button>
        `;
        list.appendChild(item);
    });
}

// LOAD EMAIL FROM HISTORY
function loadFromHistory(index) {
    const entry = emailHistory[index];
    if (!entry) return;

    document.getElementById("recipientName").value = entry.recipientName;
    document.getElementById("receiptName").value = entry.receiptName;
    document.getElementById("prompt").value = entry.prompt;
    document.getElementById("tone").value = entry.tone;
    document.getElementById("language").value = entry.language;
    document.getElementById("output").innerText = entry.email;

    activeIndex = index;
    renderHistory();
    document.getElementById("output").scrollIntoView({ behavior: "smooth" });
}

// DELETE SINGLE HISTORY ITEM
function deleteHistoryItem(event, index) {
    event.stopPropagation();
    emailHistory.splice(index, 1);
    try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}
    if (activeIndex === index) activeIndex = null;
    else if (activeIndex > index) activeIndex--;
    renderHistory();
}

// CLEAR ALL HISTORY
function clearHistory() {
    if (emailHistory.length === 0) return;
    if (confirm("Clear all email history?")) {
        emailHistory = [];
        activeIndex = null;
        try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}
        renderHistory();
    }
}

// CLEAR CURRENT FORM
function clearAll() {
    document.getElementById("recipientName").value = "";
    document.getElementById("receiptName").value = "";
    document.getElementById("prompt").value = "";
    document.getElementById("output").innerText = "";
    document.getElementById("tone").value = "formal";
    document.getElementById("language").value = "english";
    activeIndex = null;
    renderHistory();
    document.getElementById("prompt").focus();
}

// COPY EMAIL
function copyEmail() {
    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to copy!"); return; }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(output)
            .then(() => alert("Email copied to clipboard!"))
            .catch(() => alert("Failed to copy. Please copy manually."));
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = output;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        alert("Email copied to clipboard!");
    }
}

// DOWNLOAD TXT
function downloadTXT() {
    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to download!"); return; }
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "email.txt";
    link.click();
}

// DOWNLOAD PDF
function downloadPDF() {
    const output = document.getElementById("output").innerText;
    if (!output) { alert("No email to download!"); return; }
    if (!window.jspdf) { alert("PDF library not loaded."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(output, 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save("email.pdf");
}

// ================= VOICE INPUT =================
// FIX: Use MediaRecorder to record audio in browser,
// send WAV to Flask /voice route which calls Google STT
// from the server side — bypasses Render network block.

let isListening = false;
let mediaRecorder = null;
let audioChunks = [];

function startVoice() {
    if (isListening) {
        closeVoicePopup();
        return;
    }

    const secure = location.protocol === "https:" ||
                   location.hostname === "localhost" ||
                   location.hostname === "127.0.0.1";

    if (!secure) {
        alert("Voice requires HTTPS connection.");
        return;
    }

    if (!navigator.mediaDevices) {
        alert("Microphone not supported in this browser.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            isListening = true;
            showVoicePopup(stream);
        })
        .catch(function() {
            isListening = false;
            alert("Microphone permission denied.\nAllow microphone and try again.");
        });
}

// SHOW VOICE POPUP
function showVoicePopup(stream) {
    const old = document.getElementById("voicePopup");
    if (old) old.remove();

    const lang = document.getElementById("language").value;
    const hints = {
        english: "Speak your email topic in English",
        hindi: "ईमेल विषय हिंदी में बोलें",
        telugu: "తెలుగులో ఇమెయిల్ విషయం మాట్లాడండి"
    };

    const popup = document.createElement("div");
    popup.id = "voicePopup";
    popup.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:9999;";

    popup.innerHTML = `
        <div style="background:white;padding:28px;border-radius:16px;width:90%;max-width:440px;box-shadow:0 10px 40px rgba(0,0,0,.3);">
            <h2 style="margin:0 0 6px;font-size:22px;">🎤 Voice Input</h2>
            <p style="margin:0 0 16px;color:#666;font-size:14px;">${hints[lang] || hints.english}</p>
            <div id="voiceStatus" style="font-size:42px;text-align:center;margin:8px 0;">🔴</div>
            <div id="voiceTimer" style="text-align:center;color:#e00;font-weight:bold;margin-bottom:8px;">Recording: 0s</div>
            <div id="voiceText" style="min-height:70px;padding:12px;border:2px solid #4facfe;border-radius:10px;font-size:15px;color:#333;word-wrap:break-word;">
                Recording... Speak now!
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button onclick="stopAndSend()" style="flex:1;padding:11px;background:#28a745;color:white;border:none;border-radius:10px;font-size:15px;cursor:pointer;font-weight:bold;">⏹ Stop & Use</button>
                <button onclick="closeVoicePopup()" style="flex:1;padding:11px;background:#dc3545;color:white;border:none;border-radius:10px;font-size:15px;cursor:pointer;font-weight:bold;">✕ Close</button>
            </div>
            <p style="margin:10px 0 0;font-size:12px;color:#999;text-align:center;">Click "Stop & Use" when done speaking</p>
        </div>
    `;

    document.body.style.overflow = "hidden";
    document.body.appendChild(popup);

    // Start recording
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.start(100);

    // Timer
    let seconds = 0;
    window._voiceTimer = setInterval(function() {
        seconds++;
        const timerEl = document.getElementById("voiceTimer");
        if (timerEl) timerEl.innerText = "Recording: " + seconds + "s";

        // Auto stop at 15 seconds
        if (seconds >= 15) {
            stopAndSend();
        }
    }, 1000);
}

// STOP RECORDING AND SEND TO FLASK
function stopAndSend() {
    clearInterval(window._voiceTimer);

    const statusEl = document.getElementById("voiceStatus");
    const textEl = document.getElementById("voiceText");

    if (statusEl) statusEl.innerText = "⏳";
    if (textEl) textEl.innerText = "Processing your speech...";

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        if (textEl) textEl.innerText = "No audio recorded. Please try again.";
        return;
    }

    mediaRecorder.onstop = function() {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = function() {
            const base64 = reader.result.split(",")[1];
            const lang = document.getElementById("language").value;

            fetch("/voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64, language: lang, mime: "audio/webm" })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success && data.text) {
                    document.getElementById("prompt").value = data.text;
                    if (textEl) textEl.innerText = "✅ " + data.text;
                    if (statusEl) statusEl.innerText = "✅";
                    setTimeout(closeVoicePopup, 1000);
                } else {
                    if (statusEl) statusEl.innerText = "❌";
                    if (textEl) textEl.innerText = "Could not understand. Please try again.\n\nError: " + (data.error || "unknown");
                }
            })
            .catch(function(err) {
                if (statusEl) statusEl.innerText = "❌";
                if (textEl) textEl.innerText = "Server error. Please try again.";
                console.log(err);
            });
        };

        reader.readAsDataURL(blob);
    };

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(function(t) { t.stop(); });
}

// CLOSE POPUP
function closeVoicePopup() {
    clearInterval(window._voiceTimer);

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try { mediaRecorder.stop(); } catch(e) {}
    }
    if (mediaRecorder && mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(function(t) { t.stop(); });
    }

    mediaRecorder = null;
    audioChunks = [];
    isListening = false;

    const popup = document.getElementById("voicePopup");
    if (popup) popup.remove();

    document.body.style.overflow = "auto";

    const btn = document.getElementById("speakBtn");
    if (btn) btn.innerText = "🎤 Speak";
}

// DARK MODE
function toggleMode() {
    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("modeBtn");
    if (btn) {
        btn.innerText = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

// LANGUAGE CHANGE
function changeLanguage() {
    const lang = document.getElementById("language").value;

    const title = document.getElementById("title");
    const recipient = document.getElementById("recipientName");
    const sender = document.getElementById("receiptName");
    const prompt = document.getElementById("prompt");
    const generate = document.getElementById("generateBtn");
    const speak = document.getElementById("speakBtn");
    const copy = document.getElementById("copyBtn");
    const clear = document.getElementById("clearBtn");

    if (lang === "hindi") {
        title.innerText = "AI ईमेल लेखक";
        recipient.placeholder = "प्राप्तकर्ता का नाम";
        sender.placeholder = "आपका नाम";
        prompt.placeholder = "ईमेल विषय बोलें या लिखें";
        generate.innerText = "ईमेल बनाएं";
        speak.innerText = "🎤 बोलें";
        copy.innerText = "📋 कॉपी करें";
        clear.innerText = "🗑️ साफ करें";
    } else if (lang === "telugu") {
        title.innerText = "AI ఇమెయిల్ రైటర్";
        recipient.placeholder = "గ్రహీత పేరు";
        sender.placeholder = "మీ పేరు";
        prompt.placeholder = "ఇమెయిల్ విషయం నమోదు చేయండి";
        generate.innerText = "ఇమెయిల్ రూపొందించు";
        speak.innerText = "🎤 మాట్లాడు";
        copy.innerText = "📋 కాపీ చేయి";
        clear.innerText = "🗑️ క్లియర్";
    } else {
        title.innerText = "AI Email Writer";
        recipient.placeholder = "Recipient Name";
        sender.placeholder = "Your Name";
        prompt.placeholder = "Enter email topic";
        generate.innerText = "Generate Email";
        speak.innerText = "🎤 Speak";
        copy.innerText = "📋 Copy Email";
        clear.innerText = "🗑️ Clear";
    }
}