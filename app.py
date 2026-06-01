from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# =========================
# HOME PAGE
# =========================

@app.route("/")
def home():
    return render_template("index.html")


# =========================
# SMART SUBJECT GENERATOR
# =========================

def generate_subject(prompt, language):

    p = prompt.lower()

    # ── English subjects ──────────────────────────────────────────

    if language == "english":

        # LEAVE / SICK
        if "fever" in p:
            return "Sick Leave Request – Fever"
        elif "sick" in p or "ill" in p or "unwell" in p:
            return "Sick Leave Request"
        elif "leave" in p and "casual" in p:
            return "Casual Leave Request"
        elif "leave" in p and "emergency" in p:
            return "Emergency Leave Request"
        elif "leave" in p and "medical" in p:
            return "Medical Leave Request"
        elif "leave" in p and "personal" in p:
            return "Personal Leave Request"
        elif "half day" in p:
            return "Half Day Leave Request"
        elif "leave" in p:
            return "Leave Request"

        # INTERNSHIP
        elif "internship" in p and "python" in p:
            return "Internship Application – Python Developer"
        elif "internship" in p and "java" in p:
            return "Internship Application – Java Developer"
        elif "internship" in p and "web" in p:
            return "Internship Application – Web Development"
        elif "internship" in p and "data" in p:
            return "Internship Application – Data Science"
        elif "internship" in p and "ml" in p:
            return "Internship Application – Machine Learning"
        elif "internship" in p and "ai" in p:
            return "Internship Application – Artificial Intelligence"
        elif "internship" in p and "design" in p:
            return "Internship Application – UI/UX Design"
        elif "internship" in p:
            return "Internship Application"

        # JOB APPLICATION
        elif "job" in p and "python" in p:
            return "Job Application – Python Developer"
        elif "job" in p and "java" in p:
            return "Job Application – Java Developer"
        elif "job" in p and "web" in p:
            return "Job Application – Web Developer"
        elif "job" in p and "data" in p:
            return "Job Application – Data Analyst"
        elif "job" in p and "manager" in p:
            return "Job Application – Manager Position"
        elif "job" in p or "application" in p:
            return "Job Application"

        # APOLOGY
        elif "apology" in p and "late" in p:
            return "Apology for Late Submission"
        elif "apology" in p and "meeting" in p:
            return "Apology for Missing Meeting"
        elif "apology" in p or "sorry" in p:
            return "Sincere Apology"

        # RESIGNATION
        elif "resignation" in p and "immediate" in p:
            return "Immediate Resignation Notice"
        elif "resignation" in p:
            return "Resignation Letter"

        # THANK YOU
        elif "thank" in p and "interview" in p:
            return "Thank You – Post Interview"
        elif "thank" in p and "internship" in p:
            return "Thank You for the Internship Opportunity"
        elif "thank" in p:
            return "Thank You"

        # MEETING
        elif "meeting" in p and "urgent" in p:
            return "Urgent Meeting Request"
        elif "meeting" in p and "project" in p:
            return "Meeting Request – Project Discussion"
        elif "meeting" in p and "client" in p:
            return "Meeting Request – Client Discussion"
        elif "meeting" in p:
            return "Meeting Request"

        # INVITATION
        elif "invitation" in p or "invite" in p:
            if "wedding" in p:
                return "Wedding Invitation"
            elif "birthday" in p:
                return "Birthday Invitation"
            elif "event" in p:
                return "Event Invitation"
            else:
                return "Invitation"

        # COMPLAINT
        elif "complaint" in p and "service" in p:
            return "Complaint – Poor Service"
        elif "complaint" in p and "product" in p:
            return "Complaint – Product Issue"
        elif "complaint" in p:
            return "Formal Complaint"

        # DEFAULT
        else:
            words = prompt.strip().split()
            short = " ".join(words[:5]).title()
            return f"Regarding: {short}"

    # ── Hindi subjects ─────────────────────────────────────────────

    elif language == "hindi":

        if "fever" in p or "बुखार" in p:
            return "बीमारी के कारण अवकाश अनुरोध – बुखार"
        elif "sick" in p or "ill" in p or "बीमार" in p:
            return "बीमारी के कारण अवकाश अनुरोध"
        elif "leave" in p or "अवकाश" in p:
            return "अवकाश के लिए अनुरोध"
        elif "internship" in p and "python" in p:
            return "इंटर्नशिप आवेदन – पायथन डेवलपर"
        elif "internship" in p:
            return "इंटर्नशिप के लिए आवेदन"
        elif "job" in p or "application" in p:
            return "नौकरी के लिए आवेदन"
        elif "apology" in p or "sorry" in p:
            return "क्षमायाचना पत्र"
        elif "resignation" in p:
            return "इस्तीफा पत्र"
        elif "thank" in p:
            return "धन्यवाद पत्र"
        elif "meeting" in p:
            return "बैठक अनुरोध"
        elif "invitation" in p or "invite" in p:
            return "आमंत्रण पत्र"
        elif "complaint" in p:
            return "शिकायत पत्र"
        else:
            words = prompt.strip().split()
            short = " ".join(words[:5]).title()
            return f"विषय: {short}"

    # ── Telugu subjects ────────────────────────────────────────────

    elif language == "telugu":

        if "fever" in p:
            return "జ్వరం కారణంగా సెలవు అభ్యర్థన"
        elif "sick" in p or "ill" in p:
            return "అనారోగ్యం కారణంగా సెలవు అభ్యర్థన"
        elif "leave" in p:
            return "సెలవు అభ్యర్థన"
        elif "internship" in p and "python" in p:
            return "ఇంటర్న్‌షిప్ దరఖాస్తు – పైథాన్ డెవలపర్"
        elif "internship" in p:
            return "ఇంటర్న్‌షిప్ అభ్యర్థన"
        elif "job" in p or "application" in p:
            return "ఉద్యోగ దరఖాస్తు"
        elif "apology" in p or "sorry" in p:
            return "క్షమాపణ లేఖ"
        elif "resignation" in p:
            return "రాజీనామా లేఖ"
        elif "thank" in p:
            return "ధన్యవాద లేఖ"
        elif "meeting" in p:
            return "సమావేశ అభ్యర్థన"
        elif "invitation" in p or "invite" in p:
            return "ఆహ్వాన లేఖ"
        elif "complaint" in p:
            return "ఫిర్యాదు లేఖ"
        else:
            words = prompt.strip().split()
            short = " ".join(words[:5]).title()
            return f"విషయం: {short}"

    # fallback
    return "Professional Email"


# =========================
# GENERATE EMAIL
# =========================

@app.route("/generate", methods=["POST"])
def generate_email():

    data = request.get_json()
    recipient = data.get("recipient", "").strip()
    receipt_name = data.get("receipt_name", "").strip()  # NEW: Get receipt name
    prompt = data.get("prompt", "").lower()
    tone = data.get("tone", "formal").lower()
    language = data.get("language", "english").lower()
    template = data.get("template", "auto").lower()
    
    if template != "auto":
        prompt = template

    # =========================
    # SMART SUBJECT
    # =========================

    subject = generate_subject(prompt, language)

    # =========================
    # TONE SETTINGS & GREETINGS
    # =========================

    # English
    if tone == "formal":
        if recipient:
            greeting_en = f"Dear {recipient},"
        else:
            greeting_en = "Dear Sir/Madam,"
        closing_en = f"Sincerely,\n{receipt_name if receipt_name else 'Sneha'}"

    elif tone == "casual":
        if recipient:
            greeting_en = f"Hi {recipient},"
        else:
            greeting_en = "Hi,"
        closing_en = f"Best Regards,\n{receipt_name if receipt_name else 'Sneha'}"

    else:
        if recipient:
            greeting_en = f"Respected {recipient},"
        else:
            greeting_en = "Respected Sir/Madam,"
        closing_en = f"Thank You,\n{receipt_name if receipt_name else 'Sneha'}"

    # Hindi
    if tone == "formal":
        if recipient:
            greeting_hi = f"प्रिय {recipient},"
        else:
            greeting_hi = "आदरणीय महोदय/महोदया,"
        closing_hi = f"भवदीय,\n{receipt_name if receipt_name else 'Sneha'}"

    elif tone == "casual":
        if recipient:
            greeting_hi = f"नमस्ते {recipient},"
        else:
            greeting_hi = "नमस्ते,"
        closing_hi = f"शुभकामनाओं सहित,\n{receipt_name if receipt_name else 'Sneha'}"

    else:
        if recipient:
            greeting_hi = f"आदरणीय {recipient},"
        else:
            greeting_hi = "आदरणीय महोदय/महोदया,"
        closing_hi = f"धन्यवाद,\n{receipt_name if receipt_name else 'Sneha'}"

    # Telugu
    if tone == "formal":
        if recipient:
            greeting_te = f"ప్రియమైన {recipient},"
        else:
            greeting_te = "గౌరవనీయులైన సర్/మేడమ్ గారికి,"
        closing_te = f"మీ విధేయుడు/విధేయురాలు,\n{receipt_name if receipt_name else 'Sneha'}"

    elif tone == "casual":
        if recipient:
            greeting_te = f"హలో {recipient},"
        else:
            greeting_te = "హలో,"
        closing_te = f"శుభాకాంక్షలతో,\n{receipt_name if receipt_name else 'Sneha'}"

    else:
        if recipient:
            greeting_te = f"గౌరవనీయులైన {recipient},"
        else:
            greeting_te = "గౌరవనీయులైన సర్/మేడమ్ గారికి,"
        closing_te = f"ధన్యవాదాలు,\n{receipt_name if receipt_name else 'Sneha'}"

    # ==================================================
    # EMAIL BODIES PER LANGUAGE
    # ==================================================

    # ---- LEAVE EMAIL ----
    if "leave" in prompt or "fever" in prompt or "sick" in prompt or "ill" in prompt:

        body_en = f"""{greeting_en}

I hope you are doing well.

I am writing to inform you that I am suffering from fever and not feeling well. Due to my health condition, I am unable to attend today.

The doctor advised me to take proper rest and medication for quick recovery.

Therefore, I kindly request you to grant me leave for one day.

I will complete all pending work once I return.

Thank you for your understanding and support.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मुझे आशा है कि आप ठीक हैं।

मैं आपको सूचित करना चाहता/चाहती हूँ कि मुझे बुखार है और मैं ठीक महसूस नहीं कर रहा/रही हूँ। अपनी स्वास्थ्य स्थिति के कारण, मैं आज उपस्थित होने में असमर्थ हूँ।

डॉक्टर ने मुझे जल्दी ठीक होने के लिए उचित आराम और दवाई लेने की सलाह दी है।

इसलिए, मैं आपसे विनम्रतापूर्वक एक दिन का अवकाश देने का अनुरोध करता/करती हूँ।

वापस आने पर मैं सभी लंबित कार्य पूरा कर लूँगा/लूँगी।

आपकी समझ और सहयोग के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీరు బాగున్నారని ఆశిస్తున్నాను.

నాకు జ్వరంగా ఉంది మరియు ఆరోగ్యంగా అనిపించడం లేదని మీకు తెలియజేయడానికి రాస్తున్నాను. నా ఆరోగ్య పరిస్థితి కారణంగా, నేను ఈ రోజు హాజరు కావడం సాధ్యం కావడం లేదు.

త్వరగా కోలుకోవడానికి సరైన విశ్రాంతి మరియు మందులు తీసుకోవాలని డాక్టర్ సలహా ఇచ్చారు.

అందువల్ల, ఒక రోజు సెలవు మంజూరు చేయమని మిమ్మల్ని వినయంగా కోరుతున్నాను.

నేను తిరిగి వచ్చిన తర్వాత అన్ని పెండింగ్ పని పూర్తి చేస్తాను.

మీ అవగాహన మరియు సహకారానికి ధన్యవాదాలు.

{closing_te}"""

    # ---- INTERNSHIP EMAIL ----
    elif "internship" in prompt:

        body_en = f"""{greeting_en}

I hope you are doing well.

I am writing to express my interest in internship opportunities at your organization.

I am currently pursuing Computer Science Engineering and would like to gain practical experience and improve my technical skills.

I am eager to learn from your experienced team and contribute to the organization.

Kindly consider my request for an internship opportunity.

Thank you for your valuable time and consideration.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मुझे आशा है कि आप ठीक हैं।

मैं आपके संगठन में इंटर्नशिप के अवसरों में अपनी रुचि व्यक्त करने के लिए लिख रहा/रही हूँ।

मैं वर्तमान में कंप्यूटर साइंस इंजीनियरिंग की पढ़ाई कर रहा/रही हूँ और व्यावहारिक अनुभव प्राप्त करना और अपने तकनीकी कौशल में सुधार करना चाहता/चाहती हूँ।

मैं आपकी अनुभवी टीम से सीखने और संगठन में योगदान देने के लिए उत्सुक हूँ।

कृपया इंटर्नशिप के अवसर के लिए मेरे अनुरोध पर विचार करें।

आपके बहुमूल्य समय और विचार के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీరు బాగున్నారని ఆశిస్తున్నాను.

మీ సంస్థలో ఇంటర్న్‌షిప్ అవకాశాలలో నా ఆసక్తిని తెలియజేయడానికి రాస్తున్నాను.

నేను ప్రస్తుతం కంప్యూటర్ సైన్స్ ఇంజినీరింగ్ చదువుతున్నాను మరియు ఆచరణాత్మక అనుభవం పొందాలని మరియు నా సాంకేతిక నైపుణ్యాలను మెరుగుపరచాలని కోరుకుంటున్నాను.

మీ అనుభవజ్ఞులైన జట్టు నుండి నేర్చుకోవడానికి మరియు సంస్థకు సహకరించడానికి నేను ఆసక్తిగా ఉన్నాను.

దయచేసి ఇంటర్న్‌షిప్ అవకాశం కోసం నా అభ్యర్థనను పరిగణించండి.

మీ విలువైన సమయానికి మరియు పరిశీలనకు ధన్యవాదాలు.

{closing_te}"""

    # ---- APOLOGY EMAIL ----
    elif "apology" in prompt or "sorry" in prompt:

        body_en = f"""{greeting_en}

I sincerely apologize for the inconvenience caused due to my mistake.

I understand the impact of the situation and truly regret my actions.

I assure you that I will be more careful and responsible in the future.

Please accept my sincere apology.

Thank you for your patience and understanding.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मैं अपनी गलती के कारण हुई असुविधा के लिए ईमानदारी से माफी माँगता/माँगती हूँ।

मैं स्थिति के प्रभाव को समझता/समझती हूँ और अपने कार्यों पर सच में पछतावा है।

मैं आपको आश्वस्त करता/करती हूँ कि भविष्य में मैं अधिक सावधान और जिम्मेदार रहूँगा/रहूँगी।

कृपया मेरी ईमानदार माफी स्वीकार करें।

आपकी धैर्य और समझ के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

నా తప్పు వల్ల కలిగిన అసౌకర్యానికి నేను నిజాయితీగా క్షమాపణ కోరుతున్నాను.

పరిస్థితి యొక్క ప్రభావాన్ని నేను అర్థం చేసుకుంటున్నాను మరియు నా చర్యలపై నిజంగా విచారిస్తున్నాను.

భవిష్యత్తులో నేను మరింత జాగ్రత్తగా మరియు బాధ్యతగా ఉంటానని మీకు హామీ ఇస్తున్నాను.

దయచేసి నా హృదయపూర్వక క్షమాపణను అంగీకరించండి.

మీ ఓర్పు మరియు అవగాహనకు ధన్యవాదాలు.

{closing_te}"""

    # ---- RESIGNATION EMAIL ----
    elif "resignation" in prompt:

        body_en = f"""{greeting_en}

Please accept this email as my formal resignation from my position.

I am grateful for the opportunities, guidance, and support provided during my time in the organization.

Working here has helped me learn and grow professionally.

Thank you for your encouragement and support throughout my journey.

I wish the organization continued success in the future.

{closing_en}"""

        body_hi = f"""{greeting_hi}

कृपया इस ईमेल को मेरे पद से औपचारिक इस्तीफे के रूप में स्वीकार करें।

संगठन में अपने समय के दौरान प्रदान किए गए अवसरों, मार्गदर्शन और समर्थन के लिए मैं आभारी हूँ।

यहाँ काम करने से मुझे पेशेवर रूप से सीखने और बढ़ने में मदद मिली।

मेरी यात्रा के दौरान आपके प्रोत्साहन और समर्थन के लिए धन्यवाद।

मैं संगठन की भविष्य में निरंतर सफलता की कामना करता/करती हूँ।

{closing_hi}"""

        body_te = f"""{greeting_te}

దయచేసి ఈ ఇమెయిల్‌ని నా పదవి నుండి అధికారిక రాజీనామాగా స్వీకరించండి.

సంస్థలో నా సమయంలో అందించిన అవకాశాలు, మార్గదర్శకత్వం మరియు మద్దతుకు నేను కృతజ్ఞుడిని/కృతజ్ఞురాలిని.

ఇక్కడ పనిచేయడం వల్ల నేను వృత్తిపరంగా నేర్చుకోవడానికి మరియు ఎదగడానికి సహాయపడింది.

నా ప్రయాణంలో మీ ప్రోత్సాహానికి మరియు మద్దతుకు ధన్యవాదాలు.

సంస్థ భవిష్యత్తులో నిరంతర విజయం సాధించాలని కోరుకుంటున్నాను.

{closing_te}"""

    # ---- THANK YOU EMAIL ----
    elif "thank" in prompt:

        body_en = f"""{greeting_en}

I would like to sincerely thank you for your support and guidance.

Your encouragement and assistance mean a lot to me.

I truly appreciate the time and effort you have provided.

Thank you once again for your kindness and continuous support.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मैं आपके समर्थन और मार्गदर्शन के लिए ईमानदारी से धन्यवाद देना चाहता/चाहती हूँ।

आपका प्रोत्साहन और सहायता मेरे लिए बहुत मायने रखती है।

आपके द्वारा दिए गए समय और प्रयास की मैं सच में सराहना करता/करती हूँ।

आपकी दयालुता और निरंतर समर्थन के लिए एक बार फिर धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీ మద్దతు మరియు మార్గదర్శకత్వానికి హృదయపూర్వకంగా ధన్యవాదాలు చెప్పాలని ఉంది.

మీ ప్రోత్సాహం మరియు సహాయం నాకు చాలా విలువైనవి.

మీరు అందించిన సమయం మరియు కృషిని నేను నిజంగా అభినందిస్తున్నాను.

మీ దయ మరియు నిరంతర మద్దతుకు మరోసారి ధన్యవాదాలు.

{closing_te}"""

    # ---- MEETING REQUEST ----
    elif "meeting" in prompt:

        body_en = f"""{greeting_en}

I hope you are doing well.

I would like to request a meeting regarding the discussed topic at your convenient time.

The meeting would help clarify important details and discuss the matter effectively.

Please let me know your availability for the meeting.

Thank you for your consideration.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मुझे आशा है कि आप ठीक हैं।

मैं आपकी सुविधानुसार चर्चित विषय के संबंध में एक बैठक का अनुरोध करना चाहता/चाहती हूँ।

बैठक से महत्वपूर्ण विवरण स्पष्ट करने और मामले पर प्रभावी ढंग से चर्चा करने में मदद मिलेगी।

कृपया बैठक के लिए अपनी उपलब्धता बताएं।

आपके विचार के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీరు బాగున్నారని ఆశిస్తున్నాను.

మీకు అనుకూలమైన సమయంలో చర్చించిన విషయంపై సమావేశం కోసం అభ్యర్థిస్తున్నాను.

సమావేశం ముఖ్యమైన వివరాలను స్పష్టం చేయడానికి మరియు విషయాన్ని సమర్థవంతంగా చర్చించడానికి సహాయపడుతుంది.

దయచేసి సమావేశానికి మీ లభ్యతను తెలియజేయండి.

మీ పరిశీలనకు ధన్యవాదాలు.

{closing_te}"""

    # ---- INVITATION EMAIL ----
    elif "invitation" in prompt or "invite" in prompt:

        body_en = f"""{greeting_en}

I would like to cordially invite you to our upcoming event.

Your presence would make the occasion more special and memorable.

The event will include various activities and meaningful discussions.

I hope you will accept this invitation and join us for the event.

Thank you and looking forward to your presence.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मैं आपको हमारे आगामी कार्यक्रम में सादर आमंत्रित करना चाहता/चाहती हूँ।

आपकी उपस्थिति इस अवसर को और अधिक विशेष और यादगार बना देगी।

कार्यक्रम में विभिन्न गतिविधियाँ और सार्थक चर्चाएँ शामिल होंगी।

मुझे आशा है कि आप इस निमंत्रण को स्वीकार करेंगे और कार्यक्रम में शामिल होंगे।

धन्यवाद और आपकी उपस्थिति की प्रतीक्षा में।

{closing_hi}"""

        body_te = f"""{greeting_te}

మా రాబోయే కార్యక్రమానికి మిమ్మల్ని హృదయపూర్వకంగా ఆహ్వానించాలని ఉంది.

మీ సమక్షం ఈ సందర్భాన్ని మరింత ప్రత్యేకంగా మరియు స్మరణీయంగా చేస్తుంది.

కార్యక్రమంలో వివిధ కార్యకలాపాలు మరియు అర్థవంతమైన చర్చలు ఉంటాయి.

మీరు ఈ ఆహ్వానాన్ని అంగీకరించి కార్యక్రమంలో పాల్గొంటారని ఆశిస్తున్నాను.

ధన్యవాదాలు మరియు మీ సమక్షం కోసం ఎదురుచూస్తున్నాను.

{closing_te}"""

    # ---- COMPLAINT EMAIL ----
    elif "complaint" in prompt:

        body_en = f"""{greeting_en}

I would like to bring to your notice an issue that I recently faced.

The problem caused inconvenience and affected my work.

I kindly request you to look into this matter and resolve it as soon as possible.

I would appreciate your quick response regarding this issue.

Thank you for your attention and support.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मैं आपके संज्ञान में एक समस्या लाना चाहता/चाहती हूँ जिसका मुझे हाल ही में सामना करना पड़ा।

इस समस्या के कारण असुविधा हुई और मेरे काम पर असर पड़ा।

मैं विनम्रतापूर्वक आपसे इस मामले में जाँच करने और जल्द से जल्द इसे हल करने का अनुरोध करता/करती हूँ।

इस मुद्दे पर आपकी त्वरित प्रतिक्रिया की सराहना करूँगा/करूँगी।

आपके ध्यान और समर्थन के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

నేను ఇటీవల ఎదుర్కొన్న సమసస్యను మీ దృష్టికి తీసుకువెళ్లాలని ఉంది.

ఈ సమస్య అసౌకర్యాన్ని కలిగించింది మరియు నా పనిని ప్రభావితం చేసింది.

ఈ విషయంలో పరిశోధించి వీలైనంత త్వరగా పరిష్కరించమని మిమ్మల్ని వినయంగా కోరుతున్నాను.

ఈ సమస్యపై మీ త్వరిత స్పందనను అభినందిస్తాను.

మీ శ్రద్ధ మరియు మద్దతుకు ధన్యవాదాలు.

{closing_te}"""

    # ---- JOB APPLICATION ----
    elif "job" in prompt or "application" in prompt:

        body_en = f"""{greeting_en}

I am writing to apply for the available job opportunity in your organization.

I am interested in contributing my skills and knowledge to your company.

I am eager to learn, grow professionally, and work sincerely for the success of the organization.

Please consider my application for the position.

Thank you for your time and consideration.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मैं आपके संगठन में उपलब्ध नौकरी के अवसर के लिए आवेदन करने के लिए लिख रहा/रही हूँ।

मैं अपने कौशल और ज्ञान से आपकी कंपनी में योगदान देने में रुचि रखता/रखती हूँ।

मैं सीखने, पेशेवर रूप से बढ़ने और संगठन की सफलता के लिए ईमानदारी से काम करने के लिए उत्सुक हूँ।

कृपया पद के लिए मेरे आवेदन पर विचार करें।

आपके समय और विचार के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీ సంస్థలో అందుబాటులో ఉన్న ఉద్యోగ అవకాశం కోసం దరఖాస్తు చేసుకోవడానికి రాస్తున్నాను.

నా నైపుణ్యాలు మరియు జ్ఞానాన్ని మీ కంపెనీకి అందించడంలో నాకు ఆసక్తి ఉంది.

నేర్చుకోవడానికి, వృత్తిపరంగా ఎదగడానికి మరియు సంస్థ విజయం కోసం నిజాయితీగా పని చేయడానికి నేను ఆసక్తిగా ఉన్నాను.

దయచేసి పదవి కోసం నా దరఖాస్తును పరిగణించండి.

మీ సమయానికి మరియు పరిశీలనకు ధన్యవాదాలు.

{closing_te}"""

    # ---- DEFAULT EMAIL ----
    else:

        body_en = f"""{greeting_en}

I hope you are doing well.

I am writing regarding {prompt}.

I would like to discuss this matter and request your support.

Please consider my request and provide the necessary assistance.

Thank you for your time and understanding.

{closing_en}"""

        body_hi = f"""{greeting_hi}

मुझे आशा है कि आप ठीक हैं।

मैं {prompt} के संबंध में लिख रहा/रही हूँ।

मैं इस विषय पर चर्चा करना चाहता/चाहती हूँ और आपका समर्थन चाहता/चाहती हूँ।

कृपया मेरे अनुरोध पर विचार करें और आवश्यक सहायता प्रदान करें।

आपके समय और समझ के लिए धन्यवाद।

{closing_hi}"""

        body_te = f"""{greeting_te}

మీరు బాగున్నారని ఆశిస్తున్నాను.

నేను {prompt} గురించి రాస్తున్నాను.

నేను ఈ విషయాన్ని చర్చించాలని మరియు మీ మద్దతు కోరాలని ఉంది.

దయచేసి నా అభ్యర్థనను పరిగణించి అవసరమైన సహాయాన్ని అందించండి.

మీ సమయానికి మరియు అవగాహనకు ధన్యవాదాలు.

{closing_te}"""

    # =========================
    # SELECT LANGUAGE
    # =========================

    if language == "hindi":
        body = body_hi
    elif language == "telugu":
        body = body_te
    else:
        body = body_en

    email = f"Subject: {subject}\n\n{body}"

    return jsonify({
        "email": email,
        "subject": subject,
        "receipt_name": receipt_name if receipt_name else "Sneha"  # NEW: Return receipt name
    })


# =========================
# RUN FLASK APP
# =========================

if __name__ == "__main__":
    app.run(debug=True)