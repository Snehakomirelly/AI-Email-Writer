// =========================
// EMAIL HISTORY STATE
// =========================

let emailHistory = JSON.parse(localStorage.getItem("emailHistory") || "[]");
let activeIndex = null;

// Render history on page load
window.onload = function () {
    renderHistory();
};

// =========================
// GENERATE EMAIL
// =========================

async function generateEmail() {

    const recipientName = document.getElementById("recipientName").value.trim();
    const receiptName = document.getElementById("receiptName").value.trim();
    const prompt = document.getElementById("prompt").value.trim();
    const tone = document.getElementById("tone").value;
    const language = document.getElementById("language").value;
    const template = document.getElementById("template").value;

    if (!recipientName) {
        alert("Please enter recipient name.");
        return;
    }

    if (!receiptName) {
        alert("Please enter your name (receipt name).");
        return;
    }

    if (!prompt) {
        alert("Please enter or speak an email topic first.");
        return;
    }

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

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();
        const email = data.email;
        const subject = data.subject;

        document.getElementById("output").innerText = email;

        // Save to history
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

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });

    const entry = {
        id: Date.now(),
        recipientName: recipientName,
        receiptName: receiptName,
        prompt: prompt,
        tone: tone,
        language: language,
        email: email,
        subject: subject,
        time: timeStr,
        date: dateStr
    };

    // Add to top of list (newest first)
    emailHistory.unshift(entry);

    // Keep max 50 entries
    if (emailHistory.length > 50) {
        emailHistory = emailHistory.slice(0, 50);
    }

    // Persist to localStorage
    localStorage.setItem("emailHistory", JSON.stringify(emailHistory));

    // Re-render sidebar
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

        // Truncate prompt for display
        const shortPrompt = entry.prompt.length > 28
            ? entry.prompt.substring(0, 28) + "..."
            : entry.prompt;

        // Capitalize first letter
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
    document.getElementById("receiptName").value = entry.receiptName;
    document.getElementById("prompt").value = entry.prompt;
    document.getElementById("tone").value = entry.tone;
    document.getElementById("language").value = entry.language;
    document.getElementById("output").innerText = entry.email;

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
    localStorage.setItem("emailHistory", JSON.stringify(emailHistory));

    if (activeIndex === index) {
        activeIndex = null;
    } else if (activeIndex > index) {
        activeIndex--;
    }

    renderHistory();
}

// =========================
// CLEAR ALL HISTORY
// =========================

function clearHistory() {

    if (emailHistory.length === 0) return;

    if (confirm("Clear all email history?")) {
        emailHistory = [];
        activeIndex = null;
        localStorage.setItem("emailHistory", JSON.stringify(emailHistory));
        renderHistory();
    }
}

// =========================
// CLEAR CURRENT FORM
// =========================

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

// =========================
// COPY EMAIL
// =========================

function copyEmail() {

    const output = document.getElementById("output").innerText;

    if (!output) {
        alert("No email to copy!");
        return;
    }

    navigator.clipboard.writeText(output).then(() => {
        alert("Email copied to clipboard!");
    }).catch(() => {
        alert("Failed to copy. Please copy manually.");
    });
}

// =========================
// DOWNLOAD TXT
// =========================

function downloadTXT() {

    const output = document.getElementById("output").innerText;

    if (!output) {
        alert("No email to download!");
        return;
    }

    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "email.txt";
    link.click();
}

// =========================
// DOWNLOAD PDF
// =========================

function downloadPDF() {

    const output = document.getElementById("output").innerText;

    if (!output) {
        alert("No email to download!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(output, 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save("email.pdf");
}

// =========================
// VOICE INPUT — FULLY FIXED ✅
// =========================

// =========================
// VOICE INPUT - FIXED VERSION
// =========================

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported.\nPlease use Google Chrome.");
        return;
    }


    const recognition = new SpeechRecognition();


    // Language selection
    const selectedLang = document.getElementById("language").value;

    const langMap = {
        "english": "en-US",
        "hindi": "hi-IN",
        "telugu": "te-IN"
    };


    recognition.lang = langMap[selectedLang] || "en-US";

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;



    recognition.onstart = function(){

        document.getElementById("speakBtn").innerHTML =
        "🔴 Listening...";

    };



    recognition.onresult = function(event){

        let text =
        event.results[0][0].transcript;


        document.getElementById("prompt").value = text;


        document.getElementById("speakBtn").innerHTML =
        "🎤 Speak";

    };



    recognition.onerror = function(event){

        console.log("Voice Error:", event.error);


        document.getElementById("speakBtn").innerHTML =
        "🎤 Speak";


        if(event.error === "not-allowed"){

            alert(
            "Microphone permission denied.\n\nAllow microphone access and try again."
            );

        }


        else if(event.error === "no-speech"){

            alert(
            "No speech detected.\nPlease speak clearly."
            );

        }


        else if(event.error === "audio-capture"){

            alert(
            "No microphone found."
            );

        }


        else if(event.error === "network"){

            alert(
            "Voice recognition service unavailable.\n\nTry:\n1. Refresh page\n2. Use Chrome\n3. Allow microphone permission"
            );

        }


        else{

            alert(
            "Voice recognition failed.\nTry again."
            );

        }

    };



    recognition.onend = function(){

        document.getElementById("speakBtn").innerHTML =
        "🎤 Speak";

    };



    // Check microphone permission first

    navigator.mediaDevices
    .getUserMedia({audio:true})

    .then(function(){

        try{

            recognition.start();

        }

        catch(error){

            console.log(error);

        }

    })


    .catch(function(){

        alert(
        "Please allow microphone permission in browser settings."
        );

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
    const title = document.getElementById("title");
    const recipientPlaceholder = document.getElementById("recipientName");
    const receiptPlaceholder = document.getElementById("receiptName");
    const prompt = document.getElementById("prompt");
    const generateBtn = document.getElementById("generateBtn");
    const speakBtn = document.getElementById("speakBtn");
    const copyBtn = document.getElementById("copyBtn");
    const clearBtn = document.getElementById("clearBtn");

    if (lang === "hindi") {
        title.innerText = "AI ईमेल लेखक";
        recipientPlaceholder.placeholder = "प्राप्तकर्ता का नाम (जैसे मिस्टर शर्मा)";
        receiptPlaceholder.placeholder = "आपका नाम / प्रेषक का नाम (जैसे जॉन डो)";
        prompt.placeholder = "ईमेल विषय दर्ज करें या बोलें";
        generateBtn.innerText = "ईमेल बनाएं";
        speakBtn.innerText = "🎤 बोलें";
        copyBtn.innerText = "📋 ईमेल कॉपी करें";
        clearBtn.innerText = "🗑️ साफ़ करें";

    } else if (lang === "telugu") {
        title.innerText = "AI ఇమెయిల్ రైటర్";
        recipientPlaceholder.placeholder = "గ్రహీత పేరు (ఉదా. మిస్టర్ శర్మ)";
        receiptPlaceholder.placeholder = "మీ పేరు / పంపిన వారి పేరు (ఉదా. జాన్ డో)";
        prompt.placeholder = "ఇమెయిల్ విషయం నమోదు చేయండి లేదా మాట్లాడండి";
        generateBtn.innerText = "ఇమెయిల్ రూపొందించు";
        speakBtn.innerText = "🎤 మాట్లాడు";
        copyBtn.innerText = "📋 ఇమెయిల్ కాపీ చేయి";
        clearBtn.innerText = "🗑️ క్లియర్";

    } else {
        title.innerText = "AI Email Writer";
        recipientPlaceholder.placeholder = "Recipient Name (e.g. Mr. Sharma)";
        receiptPlaceholder.placeholder = "Your Name / Sender Name (e.g. John Doe)";
        prompt.placeholder = "Enter or speak email topic";
        generateBtn.innerText = "Generate Email";
        speakBtn.innerText = "🎤 Speak";
        copyBtn.innerText = "📋 Copy Email";
        clearBtn.innerText = "🗑️ Clear";
    }
}