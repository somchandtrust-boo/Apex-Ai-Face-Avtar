/* =========================================================
   APEX AI ASSISTANT
   MULTILINGUAL VOICE + TOOL LINK SYSTEM
   English + Hindi + Gujarati
   ========================================================= */

"use strict";

/* =========================================================
   1. ELEMENTS
   ========================================================= */

const app = document.querySelector(".apex-app");

const stateText = document.getElementById("stateText");
const stateSubtext = document.getElementById("stateSubtext");

const listenBtn = document.getElementById("listenBtn");
const activateBtn = document.getElementById("activateBtn");
const thinkBtn = document.getElementById("thinkBtn");

const commandInput = document.getElementById("commandInput");
const sendBtn = document.getElementById("sendBtn");

const leftEye = document.querySelector(".eye-left");
const rightEye = document.querySelector(".eye-right");

const leftPupil = document.querySelector(
    ".eye-left .eye-pupil"
);

const rightPupil = document.querySelector(
    ".eye-right .eye-pupil"
);


/* =========================================================
   2. APEX LINKS
   ========================================================= */

const APEX_LINKS = {

    /* CBRND TOOLS */

    map: "YOUR_MAP_LINK",

    siren: "YOUR_SIREN_LINK",

    qr:
        "https://somchandtrust-boo.github.io/CBRND-QR/",

    camera:
        "https://somchandtrust-boo.github.io/hd-smart-camera/",

    aiVoice:
        "https://aivoice.wecon.group/",

    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html",

    compass:
        "https://somchandtrust-boo.github.io/My-Compass/",

    home:
        "YOUR_CBRND_HOME_LINK",

    flashlight:
        "YOUR_FLASHLIGHT_LINK",


    /* SOCIAL */

    instagram:
        "https://www.instagram.com/",

    facebook:
        "https://www.facebook.com/",

    whatsapp:
        "https://web.whatsapp.com/",


    /* INTERNET */

    google:
        "https://www.google.com/",

    youtube:
        "https://www.youtube.com/",


    /* PHONE */

    call:
        "tel:"
};


/* =========================================================
   3. STATES
   ========================================================= */

const STATES = {

    ready: [
        "READY",
        "APEX AI SYSTEM"
    ],

    listening: [
        "LISTENING",
        "APEX IS LISTENING"
    ],

    thinking: [
        "THINKING",
        "PROCESSING REQUEST"
    ],

    speaking: [
        "SPEAKING",
        "APEX RESPONSE"
    ],

    offline: [
        "OFFLINE",
        "VOICE SYSTEM UNAVAILABLE"
    ]
};


/* =========================================================
   4. VARIABLES
   ========================================================= */

let recognition = null;

let recognitionSupported = false;

let isListening = false;

let currentLanguage = "en-IN";

let speakingTimer = null;

let blinkTimer = null;

let eyeTimer = null;


/* =========================================================
   5. STATE SYSTEM
   ========================================================= */

function setState(state) {

    if (!stateText || !stateSubtext) {
        return;
    }

    const data = STATES[state] || STATES.ready;

    stateText.textContent = data[0];

    stateSubtext.textContent = data[1];

    if (app) {

        app.classList.remove(
            "listening",
            "thinking",
            "speaking"
        );

        if (state === "listening") {
            app.classList.add("listening");
        }

        if (state === "thinking") {
            app.classList.add("thinking");
        }

        if (state === "speaking") {
            app.classList.add("speaking");
        }
    }
}


/* =========================================================
   6. LANGUAGE DETECTION
   ========================================================= */

function detectLanguage(text) {

    if (!text) {
        return "en-IN";
    }

    /* Gujarati */

    if (/[\u0A80-\u0AFF]/.test(text)) {
        return "gu-IN";
    }

    /* Hindi */

    if (/[\u0900-\u097F]/.test(text)) {
        return "hi-IN";
    }

    /* English */

    return "en-IN";
}


/* =========================================================
   7. TEXT TO SPEECH
   ========================================================= */

function speak(text, language = currentLanguage) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    stopSpeakingAnimation();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = language;

    utterance.rate = 0.92;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = function () {

        setState("speaking");

        startSpeakingAnimation();
    };

    utterance.onend = function () {

        stopSpeakingAnimation();

        setState("ready");
    };

    utterance.onerror = function () {

        stopSpeakingAnimation();

        setState("ready");
    };

    window.speechSynthesis.speak(utterance);
}


/* =========================================================
   8. STOP APEX
   ========================================================= */

function stopApex() {

    /* Stop speech */

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    /* Stop recognition */

    if (recognition && isListening) {

        try {
            recognition.stop();
        } catch (error) {
            console.log("Recognition stop:", error);
        }
    }

    isListening = false;

    stopSpeakingAnimation();

    stopThinkingAnimation();

    setState("ready");

    if (commandInput) {
        commandInput.value = "";
    }
}


/* =========================================================
   9. SPEAKING ANIMATION
   ========================================================= */

function startSpeakingAnimation() {

    stopSpeakingAnimation();

    speakingTimer = setInterval(function () {

        moveEyesRandomly();

    }, 650);
}


function stopSpeakingAnimation() {

    if (speakingTimer) {

        clearInterval(speakingTimer);

        speakingTimer = null;
    }

    resetEyes();
}


/* =========================================================
   10. THINKING ANIMATION
   ========================================================= */

function stopThinkingAnimation() {

    if (app) {
        app.classList.remove("thinking");
    }
}


/* =========================================================
   11. EYE MOVEMENT
   ========================================================= */

function moveEyesRandomly() {

    const x =
        Math.round((Math.random() * 14) - 7);

    const y =
        Math.round((Math.random() * 10) - 5);

    if (leftPupil) {

        leftPupil.style.transform =
            `translate(${x}px, ${y}px)`;
    }

    if (rightPupil) {

        rightPupil.style.transform =
            `translate(${x}px, ${y}px)`;
    }
}


function resetEyes() {

    if (leftPupil) {
        leftPupil.style.transform =
            "translate(0, 0)";
    }

    if (rightPupil) {
        rightPupil.style.transform =
            "translate(0, 0)";
    }
}


/* =========================================================
   12. MOUSE EYE TRACKING
   ========================================================= */

document.addEventListener("mousemove", function (event) {

    if (!leftEye || !rightEye) {
        return;
    }

    const screenX =
        window.innerWidth / 2;

    const screenY =
        window.innerHeight / 2;

    let dx =
        (event.clientX - screenX) /
        screenX;

    let dy =
        (event.clientY - screenY) /
        screenY;

    dx = Math.max(-1, Math.min(1, dx));

    dy = Math.max(-1, Math.min(1, dy));

    const moveX = dx * 7;

    const moveY = dy * 5;

    if (leftPupil) {

        leftPupil.style.transform =
            `translate(${moveX}px, ${moveY}px)`;
    }

    if (rightPupil) {

        rightPupil.style.transform =
            `translate(${moveX}px, ${moveY}px)`;
    }
});


/* =========================================================
   13. BLINK SYSTEM
   ========================================================= */

function scheduleBlink() {

    clearTimeout(blinkTimer);

    blinkTimer = setTimeout(function () {

        blink();

        scheduleBlink();

    }, 3500 + Math.random() * 4000);
}


function blink() {

    if (!leftEye || !rightEye) {
        return;
    }

    leftEye.classList.add("blink");

    rightEye.classList.add("blink");

    setTimeout(function () {

        leftEye.classList.remove("blink");

        rightEye.classList.remove("blink");

    }, 150);
}


/* =========================================================
   14. SPEECH RECOGNITION
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognitionSupported = true;

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.lang = currentLanguage;


    recognition.onstart = function () {

        isListening = true;

        setState("listening");
    };


    recognition.onresult = function (event) {

        let finalText = "";

        let interimText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {

                finalText += transcript;

            } else {

                interimText += transcript;
            }
        }


        if (commandInput) {

            commandInput.value =
                finalText || interimText;
        }


        if (finalText.trim()) {

            processCommand(finalText.trim());
        }
    };


    recognition.onerror = function (event) {

        console.log(
            "APEX Speech Error:",
            event.error
        );

        isListening = false;

        setState("ready");
    };


    recognition.onend = function () {

        isListening = false;

        if (
            !app.classList.contains("speaking") &&
            !app.classList.contains("thinking")
        ) {

            setState("ready");
        }
    };

} else {

    recognitionSupported = false;

    setState("offline");
}


/* =========================================================
   15. START LISTENING
   ========================================================= */

function startListening() {

    if (!recognitionSupported) {

        speak(
            "Voice recognition is not supported in this browser.",
            "en-IN"
        );

        return;
    }


    if (isListening) {

        try {
            recognition.stop();
        } catch (error) {}

        return;
    }


    window.speechSynthesis.cancel();

    currentLanguage =
        detectLanguage(
            commandInput?.value || ""
        );

    recognition.lang =
        currentLanguage;


    try {

        recognition.start();

    } catch (error) {

        console.log(
            "Recognition start:",
            error
        );
    }
}


/* =========================================================
   16. OPEN TOOL
   ========================================================= */

function openTool(
    url,
    language,
    toolName
) {

    if (!url || url === "#") {

        if (language === "hi-IN") {

            speak(
                `${toolName} ka link abhi configure nahi hai.`,
                language
            );

        } else if (language === "gu-IN") {

            speak(
                `${toolName} ની લિંક હજી configure નથી.`,
                language
            );

        } else {

            speak(
                `${toolName} link is not configured yet.`,
                language
            );
        }

        return;
    }


    let message;


    if (language === "hi-IN") {

        message =
            `${toolName} खोल रहा हूँ।`;

    } else if (language === "gu-IN") {

        message =
            `${toolName} ખોલી રહ્યો છું.`;

    } else {

        message =
            `Opening ${toolName}.`;
    }


    speak(message, language);


    setTimeout(function () {

        try {

            if (url.startsWith("tel:")) {

                window.location.href = url;

            } else {

                window.open(
                    url,
                    "_blank",
                    "noopener"
                );
            }

        } catch (error) {

            console.error(
                "Tool opening error:",
                error
            );
        }

    }, 900);
}


/* =========================================================
   17. COMMAND NORMALIZATION
   ========================================================= */

function normalizeCommand(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[!?.,]/g, " ");
}


/* =========================================================
   18. COMMAND ROUTER
   ========================================================= */

function routeCommand(text, language) {

    const lower =
        normalizeCommand(text);


    /* =====================================================
       STOP
       ===================================================== */

    if (
        lower === "stop" ||
        lower.includes("stop apex") ||
        lower.includes("stop voice") ||
        lower.includes("रुक जाओ") ||
        lower.includes("बंद करो") ||
        lower.includes("आवाज बंद") ||
        lower.includes("બંધ") ||
        lower.includes("બંધ કરો") ||
        lower.includes("અવાજ બંધ")
    ) {

        stopApex();

        return;
    }


    /* =====================================================
       GREETING
       ===================================================== */

    if (
        lower.includes("hello") ||
        lower.includes("hi apex") ||
        lower.includes("hey apex") ||
        lower.includes("नमस्ते") ||
        lower.includes("हेलो") ||
        lower.includes("હેલો") ||
        lower.includes("નમસ્તે")
    ) {

        if (language === "hi-IN") {

            speak(
                "नमस्ते। मैं APEX हूँ। मैं आपकी सहायता के लिए तैयार हूँ।",
                language
            );

        } else if (language === "gu-IN") {

            speak(
                "નમસ્તે. હું APEX છું. હું તમારી મદદ માટે તૈયાર છું.",
                language
            );

        } else {

            speak(
                "Hello. I am APEX. I am ready to assist you.",
                language
            );
        }

        return;
    }


    /* =====================================================
       WHO ARE YOU
       ===================================================== */

    if (
        lower.includes("who are you") ||
        lower.includes("your name") ||
        lower.includes("आप कौन हो") ||
        lower.includes("तुम कौन हो") ||
        lower.includes("તમારું નામ") ||
        lower.includes("તમે કોણ")
    ) {

        if (language === "hi-IN") {

            speak(
                "मैं APEX हूँ, आपका AI voice assistant.",
                language
            );

        } else if (language === "gu-IN") {

            speak(
                "હું APEX છું, તમારો AI voice assistant.",
                language
            );

        } else {

            speak(
                "I am APEX, your AI voice assistant.",
                language
            );
        }

        return;
    }


    /* =====================================================
       TIME
       ===================================================== */

    if (
        lower.includes("time") ||
        lower.includes("समय") ||
        lower.includes("टाइम") ||
        lower.includes("સમય") ||
        lower.includes("ટાઈમ")
    ) {

        const now = new Date();

        const time =
            now.toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );


        if (language === "hi-IN") {

            speak(
                `अभी समय ${time} है।`,
                language
            );

        } else if (language === "gu-IN") {

            speak(
                `અત્યારે સમય ${time} છે.`,
                language
            );

        } else {

            speak(
                `The current time is ${time}.`,
                language
            );
        }

        return;
    }


    /* =====================================================
       DATE
       ===================================================== */

    if (
        lower.includes("date") ||
        lower.includes("today") ||
        lower.includes("आज") ||
        lower.includes("तारीख") ||
        lower.includes("આજે") ||
        lower.includes("તારીખ")
    ) {

        const now = new Date();

        const date =
            now.toLocaleDateString(
                [],
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        if (language === "hi-IN") {

            speak(
                `आज की तारीख ${date} है।`,
                language
            );

        } else if (language === "gu-IN") {

            speak(
                `આજની તારીખ ${date} છે.`,
                language
            );

        } else {

            speak(
                `Today's date is ${date}.`,
                language
            );
        }

        return;
    }


    /* =====================================================
       MAP
       ===================================================== */

    if (
        lower.includes("map") ||
        lower.includes("open map") ||
        lower.includes("map kholo") ||
        lower.includes("मैप") ||
        lower.includes("मैप खोलो") ||
        lower.includes("नक्शा") ||
        lower.includes("નકશો") ||
        lower.includes("મેપ")
    ) {

        openTool(
            APEX_LINKS.map,
            language,
            "Map"
        );

        return;
    }


    /* =====================================================
       SIREN
       ===================================================== */

    if (
        lower.includes("siren") ||
        lower.includes("sos") ||
        lower.includes("siren kholo") ||
        lower.includes("सायरन") ||
        lower.includes("सायरन खोलो") ||
        lower.includes("एसओएस") ||
        lower.includes("સાયરન") ||
        lower.includes("SOS")
    ) {

        openTool(
            APEX_LINKS.siren,
            language,
            "Siren"
        );

        return;
    }


    /* =====================================================
       QR GENERATOR
       ===================================================== */

    if (
        lower.includes("qr") ||
        lower.includes("qr generator") ||
        lower.includes("qr kholo") ||
        lower.includes("क्यूआर") ||
        lower.includes("क्यूआर खोलो") ||
        lower.includes("ક્યૂઆર") ||
        lower.includes("ક્યૂઆર ખોલો")
    ) {

        openTool(
            APEX_LINKS.qr,
            language,
            "QR Generator"
        );

        return;
    }


    /* =====================================================
       SMART CAMERA
       ===================================================== */

    if (
        lower.includes("camera") ||
        lower.includes("smart camera") ||
        lower.includes("camera kholo") ||
        lower.includes("कैमरा") ||
        lower.includes("कैमरा खोलो") ||
        lower.includes("कैमरा खोल") ||
        lower.includes("કેમેરા") ||
        lower.includes("કેમેરા ખોલો")
    ) {

        openTool(
            APEX_LINKS.camera,
            language,
            "Smart Camera"
        );

        return;
    }


    /* =====================================================
       AI VOICE ASSISTANT
       ===================================================== */

    if (
        lower.includes("ai voice") ||
        lower.includes("ai voice assistant") ||
        lower.includes("voice assistant") ||
        lower.includes("alexa") ||
        lower.includes("ai assistant") ||
        lower.includes("एआई वॉइस") ||
        lower.includes("वॉइस असिस्टेंट") ||
        lower.includes("એઆઈ વોઇસ") ||
        lower.includes("વોઇસ આસિસ્ટન્ટ")
    ) {

        openTool(
            APEX_LINKS.aiVoice,
            language,
            "AI Voice Assistant"
        );

        return;
    }


    /* =====================================================
       INSTAGRAM
       ===================================================== */

    if (
        lower.includes("instagram") ||
        lower.includes("insta") ||
        lower.includes("इंस्टाग्राम") ||
        lower.includes("इंस्टा") ||
        lower.includes("ઇન્સ્ટાગ્રામ")
    ) {

        openTool(
            APEX_LINKS.instagram,
            language,
            "Instagram"
        );

        return;
    }


    /* =====================================================
       FACEBOOK
       ===================================================== */

    if (
        lower.includes("facebook") ||
        lower.includes("fb") ||
        lower.includes("फेसबुक") ||
        lower.includes("फेसबुक खोलो") ||
        lower.includes("ફેસબુક")
    ) {

        openTool(
            APEX_LINKS.facebook,
            language,
            "Facebook"
        );

        return;
    }


    /* =====================================================
       WHATSAPP
       ===================================================== */

    if (
        lower.includes("whatsapp") ||
        lower.includes("whats app") ||
        lower.includes("व्हाट्सएप") ||
        lower.includes("व्हाट्सएप खोलो") ||
        lower.includes("વોટ્સએપ") ||
        lower.includes("વોટ્સએપ ખોલો")
    ) {

        openTool(
            APEX_LINKS.whatsapp,
            language,
            "WhatsApp"
        );

        return;
    }


    /* =====================================================
       FLASHLIGHT
       ===================================================== */

    if (
        lower.includes("flashlight") ||
        lower.includes("flash light") ||
        lower.includes("torch") ||
        lower.includes("टॉर्च") ||
        lower.includes("फ्लैशलाइट") ||
        lower.includes("ફ્લેશલાઇટ") ||
        lower.includes("ટોર્ચ")
    ) {

        openTool(
            APEX_LINKS.flashlight,
            language,
            "Flashlight"
        );

        return;
    }


    /* =====================================================
       CALL
       ===================================================== */

    if (
        lower === "call" ||
        lower.includes("make a call") ||
        lower.includes("call kholo") ||
        lower.includes("फोन करो") ||
        lower.includes("कॉल करो") ||
        lower.includes("कॉल") ||
        lower.includes("ફોન કરો") ||
        lower.includes("કૉલ કરો") ||
        lower.includes("કોલ")
    ) {

        openTool(
            APEX_LINKS.call,
            language,
            "Call"
        );

        return;
    }


    /* =====================================================
       GOOGLE
       ===================================================== */

    if (
        lower.includes("google") ||
        lower.includes("google kholo") ||
        lower.includes("गूगल") ||
        lower.includes("गूगल खोलो") ||
        lower.includes("ગૂગલ") ||
        lower.includes("ગૂગલ ખોલો")
    ) {

        openTool(
            APEX_LINKS.google,
            language,
            "Google"
        );

        return;
    }


    /* =====================================================
       YOUTUBE
       ===================================================== */

    if (
        lower.includes("youtube") ||
        lower.includes("youtube kholo") ||
        lower.includes("यूट्यूब") ||
        lower.includes("यूट्यूब खोलो") ||
        lower.includes("યુટ્યુબ") ||
        lower.includes("યુટ્યુબ ખોલો")
    ) {

        openTool(
            APEX_LINKS.youtube,
            language,
            "YouTube"
        );

        return;
    }


    /* =====================================================
       LIVE LOCATION
       ===================================================== */

    if (
        lower.includes("location") ||
        lower.includes("live location") ||
        lower.includes("location kholo") ||
        lower.includes("लोकेशन") ||
        lower.includes("लोकेशन खोलो") ||
        lower.includes("लाइव लोकेशन") ||
        lower.includes("લોકેશન") ||
        lower.includes("લાઇવ લોકેશન")
    ) {

        openTool(
            APEX_LINKS.location,
            language,
            "Live Location"
        );

        return;
    }


    /* =====================================================
       COMPASS
       ===================================================== */

    if (
        lower.includes("compass") ||
        lower.includes("compass kholo") ||
        lower.includes("कम्पास") ||
        lower.includes("कंपास") ||
        lower.includes("कम्पास खोलो") ||
        lower.includes("કંપાસ") ||
        lower.includes("કમ્પાસ") ||
        lower.includes("કમ્પાસ ખોલો")
    ) {

        openTool(
            APEX_LINKS.compass,
            language,
            "Compass"
        );

        return;
    }


    /* =====================================================
       CBRND HOME
       ===================================================== */

    if (
        lower.includes("cbrnd home") ||
        lower.includes("smart home") ||
        lower.includes("cbrnd kholo") ||
        lower.includes("सीबीआरएनडी होम") ||
        lower.includes("स्मार्ट होम") ||
        lower.includes("સીબીઆરએનડી હોમ") ||
        lower.includes("સ્માર્ટ હોમ")
    ) {

        openTool(
            APEX_LINKS.home,
            language,
            "CBRND Home"
        );

        return;
    }


    /* =====================================================
       ACTIVATE
       ===================================================== */

    if (
        lower.includes("activate") ||
        lower.includes("activate apex") ||
        lower.includes("एक्टिवेट") ||
        lower.includes("एपेक्स एक्टिवेट") ||
        lower.includes("એક્ટિવેટ") ||
        lower.includes("એપેક્સ એક્ટિવેટ")
    ) {

        if (language === "hi-IN") {

            speak(
                "APEX सिस्टम एक्टिवेट हो गया है।",
                language
            );

        } else if (language === "gu-IN") {

            speak(
                "APEX સિસ્ટમ એક્ટિવેટ થઈ ગઈ છે.",
                language
            );

        } else {

            speak(
                "APEX system is activated and ready.",
                language
            );
        }

        return;
    }


    /* =====================================================
       DEFAULT RESPONSE
       ===================================================== */

    if (language === "hi-IN") {

        speak(
            `मैंने सुना: ${text}`,
            language
        );

    } else if (language === "gu-IN") {

        speak(
            `મેં સાંભળ્યું: ${text}`,
            language
        );

    } else {

        speak(
            `I heard: ${text}`,
            language
        );
    }
}


/* =========================================================
   19. PROCESS COMMAND
   ========================================================= */

function processCommand(text) {

    if (!text || !text.trim()) {
        return;
    }

    const cleanText =
        text.trim();

    currentLanguage =
        detectLanguage(cleanText);


    /* STOP must happen immediately */

    const lower =
        normalizeCommand(cleanText);

    if (
        lower === "stop" ||
        lower.includes("stop apex") ||
        lower.includes("रुक जाओ") ||
        lower.includes("बंद करो") ||
        lower.includes("બંધ કરો")
    ) {

        stopApex();

        return;
    }


    setState("thinking");


    setTimeout(function () {

        routeCommand(
            cleanText,
            currentLanguage
        );

    }, 350);
}


/* =========================================================
   20. BUTTON EVENTS
   ========================================================= */

if (activateBtn) {

    activateBtn.addEventListener(
        "click",
        function () {

            speak(
                "APEX system is activated and ready.",
                "en-IN"
            );
        }
    );
}


if (listenBtn) {

    listenBtn.addEventListener(
        "click",
        function () {

            startListening();
        }
    );
}


if (thinkBtn) {

    thinkBtn.addEventListener(
        "click",
        function () {

            setState("thinking");

            setTimeout(function () {

                speak(
                    "I am processing your request.",
                    "en-IN"
                );

            }, 700);
        }
    );
}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        function () {

            if (!commandInput) {
                return;
            }

            processCommand(
                commandInput.value
            );
        }
    );
}


/* =========================================================
   21. ENTER KEY
   ========================================================= */

if (commandInput) {

    commandInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                processCommand(
                    commandInput.value
                );
            }
        }
    );
}


/* =========================================================
   22. SPACE = VOICE
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.code !== "Space") {
            return;
        }

        const target =
            event.target;

        const isTyping =
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            );


        if (isTyping) {
            return;
        }


        event.preventDefault();

        startListening();
    }
);


/* =========================================================
   23. VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.hidden) {

            try {

                if (
                    recognition &&
                    isListening
                ) {
                    recognition.stop();
                }

            } catch (error) {}

            if ("speechSynthesis" in window) {

                window.speechSynthesis.cancel();
            }

            stopSpeakingAnimation();

            setState("ready");
        }
    }
);


/* =========================================================
   24. INITIALIZATION
   ========================================================= */

function initApex() {

    setState("ready");

    resetEyes();

    scheduleBlink();

    console.log(
        "APEX AI SYSTEM INITIALIZED"
    );

    console.log(
        "Voice Recognition:",
        recognitionSupported
            ? "SUPPORTED"
            : "NOT SUPPORTED"
    );

    console.log(
        "APEX Links:",
        APEX_LINKS
    );
}


initApex();
