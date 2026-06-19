// EMAIL HISTORY STATE
let emailHistory = [];
let activeIndex = null;
// Safe localStorage read
try {
    emailHistory = JSON.parse(localStorage.getItem("emailHistory") || "[]");
} catch (e) {
    emailHistory = [];
}
// Render history on page load
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


    if (!recipientName) {
        alert("Please enter recipient name.");
        return;
    }

    if (!receiptName) {
        alert("Please enter sender name.");
        return;
    }

    if (!prompt) {
        alert("Please enter or speak email topic first.");
        return;
    }


    document.getElementById("output").innerText =
        "Generating email...";


    try {

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

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

            throw new Error(
                "Server error: " + response.status
            );

        }


        const data = await response.json();


        document.getElementById("output").innerText =
            data.email;



        saveToHistory(
            recipientName,
            receiptName,
            prompt,
            tone,
            language,
            data.email,
            data.subject
        );


    }

    catch(error){

        console.log(error);

        document.getElementById("output").innerText =
        "Error generating email. Try again.";

    }

}
// SAVE TO HISTORY
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
// RENDER HISTORY SIDEBAR
function renderHistory() {

    const list = document.getElementById("historyList");


    if (!list) return;


    if (emailHistory.length === 0) {

        list.innerHTML =
        '<p class="no-history" id="noHistory">No emails yet.<br>Generate one to see history!</p>';

        return;
    }


    list.innerHTML = "";


    emailHistory.forEach((entry, index) => {


        const item =
        document.createElement("div");


        item.className =
        "history-item" +
        (index === activeIndex ? " active" : "");



        item.onclick = () =>
        loadFromHistory(index);



        const shortPrompt =
        entry.prompt.length > 28
        ? entry.prompt.substring(0, 28) + "..."
        : entry.prompt;



        const displayTitle =
        shortPrompt.charAt(0).toUpperCase()
        + shortPrompt.slice(1);



        item.innerHTML = `

            <div class="history-title">
            ✉️ ${displayTitle}
            </div>


            <div class="history-meta">
            ${entry.tone} · ${entry.language} · ${entry.date} ${entry.time}
            </div>


            <button class="history-delete"
            onclick="deleteHistoryItem(event, ${index})">
            ✕
            </button>

        `;


        list.appendChild(item);


    });

}
// LOAD EMAIL FROM HISTORY
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
// DELETE SINGLE HISTORY ITEM
function deleteHistoryItem(event, index) {
    event.stopPropagation();
    emailHistory.splice(index, 1);
    try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}
    if (activeIndex === index)     activeIndex = null;
    else if (activeIndex > index)  activeIndex--;
    renderHistory();
}
// CLEAR ALL HISTORY
function clearHistory() {
    if (emailHistory.length === 0) return;
    if (confirm("Clear all email history?")) {
        emailHistory = [];
        activeIndex  = null;
        try { localStorage.setItem("emailHistory", JSON.stringify(emailHistory)); } catch (e) {}
        renderHistory();
    }
}
// CLEAR CURRENT FORM
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
// COPY EMAIL
function copyEmail() {

    const output =
    document.getElementById("output").innerText;


    if (!output) {
        alert("No email to copy!");
        return;
    }


    if (navigator.clipboard) {

        navigator.clipboard.writeText(output)
        .then(() => {

            alert("Email copied to clipboard!");

        })
        .catch(() => {

            alert("Failed to copy. Please copy manually.");

        });

    } 
    else {

        const textarea =
        document.createElement("textarea");


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
    link.href     = URL.createObjectURL(blob);
    link.download = "email.txt";
    link.click();
}
// DOWNLOAD PDF
function downloadPDF() {

    const output =
    document.getElementById("output").innerText;


    if(!output){
        alert("No email to download!");
        return;
    }


    if(!window.jspdf){
        alert("PDF library not loaded.");
        return;
    }


    const { jsPDF } = window.jspdf;


    const doc = new jsPDF();


    const lines =
    doc.splitTextToSize(output,180);


    doc.setFontSize(12);

    doc.text(lines,15,20);


    doc.save("email.pdf");

}

// ================= VOICE INPUT =================

let popupRecognition = null;
let isListening = false;


// Start voice
function startVoice(){

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if(!SpeechRecognition){
        alert("Voice input works only in Google Chrome.");
        return;
    }


    if(isListening){
        closeVoicePopup();
        return;
    }


    const secure =
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";


    if(!secure){
        alert("Voice requires HTTPS connection.");
        return;
    }



    if(!navigator.mediaDevices){
    alert("Microphone is not supported in this browser.");
    return;
}


    navigator.mediaDevices.getUserMedia({audio:true})
    .then(stream=>{

        stream.getTracks().forEach(t=>t.stop());

        isListening=true;

        showVoicePopup();

    })
    .catch(()=>{

        isListening=false;

        alert(
        "Microphone permission denied.\nAllow microphone and try again."
        );

    });

}

// ================= VOICE POPUP =================

function showVoicePopup(){

    const old = document.getElementById("voicePopup");

    if(old) old.remove();


    const popup = document.createElement("div");

    popup.id = "voicePopup";


    popup.style.cssText = `

    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;

    `;


    popup.innerHTML = `

    <div style="
    background:white;
    padding:25px;
    border-radius:15px;
    width:90%;
    max-width:450px;
    ">


    <h2>🎤 Voice Input</h2>


    <p>Speak your email topic</p>


    <div id="voiceStatus"
    style="font-size:40px;text-align:center">
    🎙️
    </div>


    <div id="voiceText"
    style="
    min-height:70px;
    padding:12px;
    border:2px solid #4facfe;
    border-radius:10px;
    ">
    Listening...
    </div>


    <br>


    <button onclick="useVoiceText()">
    ✅ Use
    </button>


    <button onclick="retryVoice()">
    🔄 Retry
    </button>


    <button onclick="closeVoicePopup()">
    ✕ Close
    </button>


    </div>

    `;


    // prevent background scroll
    document.body.style.overflow = "hidden";


    document.body.appendChild(popup);


    startPopupRecognition();

}




// ================= SPEECH RECOGNITION =================


function startPopupRecognition(){


    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


    if(!SpeechRecognition){
        alert("Voice not supported");
        return;
    }


    const lang =
    document.getElementById("language").value;


    const langMap = {

        english:"en-IN",
        hindi:"hi-IN",
        telugu:"te-IN"

    };


    if(popupRecognition){

        try{
            popupRecognition.stop();
        }
        catch(e){}

    }


    popupRecognition = new SpeechRecognition();


    popupRecognition.lang =
    langMap[lang] || "en-IN";


    popupRecognition.continuous = true;

    popupRecognition.interimResults = true;



    popupRecognition.onstart = function(){

        const status =
        document.getElementById("voiceStatus");

        if(status)
        status.innerText="🔴";

    };



    popupRecognition.onresult = function(event){

        let text="";


        for(let i=0;i<event.results.length;i++){

            text +=
            event.results[i][0].transcript+" ";

        }


        const box =
        document.getElementById("voiceText");


        if(box){

            box.innerText =
            text.trim();

        }

    };




    popupRecognition.onerror = function(event){

        const box =
        document.getElementById("voiceText");


        const status =
        document.getElementById("voiceStatus");


        if(status)
        status.innerText="❌";


        if(box){

            box.innerText =
            "Voice error: " + event.error;

        }

    };




    popupRecognition.onend = function(){

        const status =
        document.getElementById("voiceStatus");


        if(status)
        status.innerText="✅";

    };



    try{

        popupRecognition.start();

    }
    catch(e){

        console.log(e);

    }


}




// RETRY VOICE

function retryVoice(){

    const box =
    document.getElementById("voiceText");


    if(box)
    box.innerText="Listening...";


    startPopupRecognition();

}




// USE VOICE TEXT

function useVoiceText(){


    const box =
    document.getElementById("voiceText");


    if(box){


        const text =
        box.innerText.trim();



        if(
            text &&
            text !== "Listening..." &&
            !text.startsWith("Voice error")
        ){

            document.getElementById("prompt").value =
            text;

        }

    }


    closeVoicePopup();

}




// CLOSE POPUP (ONLY ONE)

function closeVoicePopup(){


    if(popupRecognition){

        try{

            popupRecognition.stop();

        }
        catch(e){}


        popupRecognition = null;

    }



    const popup =
    document.getElementById("voicePopup");


    if(popup){

        popup.remove();

    }



    // allow page scrolling again
    document.body.style.overflow = "auto";


    isListening=false;



    const btn =
    document.getElementById("speakBtn");


    if(btn){

        btn.innerText="🎤 Speak";

    }


}

// ================= DARK MODE =================


function toggleMode(){


document.body.classList.toggle("dark-mode");


let btn =
document.getElementById("modeBtn");


if(btn){

btn.innerText =
document.body.classList.contains("dark-mode")
?
"☀️ Light Mode"
:
"🌙 Dark Mode";

}

}




// ================= LANGUAGE CHANGE =================


function changeLanguage(){


let lang =
document.getElementById("language").value;



let title =
document.getElementById("title");

let recipient =
document.getElementById("recipientName");

let sender =
document.getElementById("receiptName");

let prompt =
document.getElementById("prompt");

let generate =
document.getElementById("generateBtn");

let speak =
document.getElementById("speakBtn");

let copy =
document.getElementById("copyBtn");

let clear =
document.getElementById("clearBtn");



if(lang==="hindi"){


title.innerText="AI ईमेल लेखक";

recipient.placeholder="प्राप्तकर्ता का नाम";

sender.placeholder="आपका नाम";

prompt.placeholder="ईमेल विषय बोलें या लिखें";

generate.innerText="ईमेल बनाएं";

speak.innerText="🎤 बोलें";

copy.innerText="📋 कॉपी करें";

clear.innerText="🗑️ साफ करें";


}



else if(lang==="telugu"){


title.innerText="AI ఇమెయిల్ రైటర్";

recipient.placeholder="గ్రహీత పేరు";

sender.placeholder="మీ పేరు";

prompt.placeholder="ఇమెయిల్ విషయం నమోదు చేయండి";

generate.innerText="ఇమెయిల్ రూపొందించు";

speak.innerText="🎤 మాట్లాడు";

copy.innerText="📋 కాపీ చేయి";

clear.innerText="🗑️ క్లియర్";


}



else{


title.innerText="AI Email Writer";

recipient.placeholder="Recipient Name";

sender.placeholder="Your Name";

prompt.placeholder="Enter email topic";

generate.innerText="Generate Email";

speak.innerText="🎤 Speak";

copy.innerText="📋 Copy Email";

clear.innerText="🗑️ Clear";


}


}