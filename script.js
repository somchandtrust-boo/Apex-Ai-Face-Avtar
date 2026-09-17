/* =========================================================
   APEX AI ASSISTANT
   INTERNAL MAP + SIREN + FLASHLIGHT
   EXTERNAL TOOLS + MULTILINGUAL VOICE
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

const leftPupil =
    document.querySelector(".eye-left .eye-pupil");

const rightPupil =
    document.querySelector(".eye-right .eye-pupil");


/* =========================================================
   2. EXTERNAL APEX LINKS
   ========================================================= */

const APEX_LINKS = {

    /* INTERNAL - NO LINK */

    map: null,
    siren: null,
    flashlight: null,


    /* EXTERNAL */

    qr:
        "https://somchandtrust-boo.github.io/CBRND-QR/",

    camera:
        "https://somchandtrust-boo.github.io/hd-smart-camera/",

    aiVoice:
        "YOUR_AI_VOICE_ASSISTANT_LINK",

    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html",

    compass:
        "YOUR_COMPASS_LINK",

    home:
        "YOUR_CBRND_HOME_LINK",

    instagram:
        "https://www.instagram.com/",

    facebook:
        "https://www.facebook.com/",

    whatsapp:
        "https://web.whatsapp.com/",

    google:
        "https://www.google.com/",

    youtube:
        "https://www.youtube.com/",

    call:
        "tel:"
};


/* =========================================================
   3. SYSTEM VARIABLES
   ========================================================= */

let recognition = null;
let recognitionSupported = false;
let isListening = false;

let currentLanguage = "en-IN";

let speakingTimer = null;
let blinkTimer = null;

let sirenAudioContext = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenTimer = null;

let flashlightStream = null;
let flashlightTrack = null;
let flashlightOn = false;


/* =========================================================
   4. STATES
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
   5. STATE
   ========================================================= */

function setState(state) {

    if (stateText) {
        stateText.textContent =
            STATES[state]?.[0] || "READY";
    }

    if (stateSubtext) {
        stateSubtext.textContent =
            STATES[state]?.[1] || "APEX AI SYSTEM";
    }

    if (!app) {
        return;
    }

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


/* =========================================================
   6. LANGUAGE
   ========================================================= */

function detectLanguage(text) {

    if (!text) {
        return "en-IN";
    }

    if (/[\u0A80-\u0AFF]/.test(text)) {
        return "gu-IN";
    }

    if (/[\u0900-\u097F]/.test(text)) {
        return "hi-IN";
    }

    return "en-IN";
}


/* =========================================================
   7. SPEAK
   ========================================================= */

function speak(text, language = currentLanguage) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

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

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    if (recognition && isListening) {

        try {
            recognition.stop();
        } catch (error) {
            console.log(error);
        }
    }

    stopSpeakingAnimation();

    stopSiren();

    isListening = false;

    setState("ready");
}


/* =========================================================
   9. SPEAKING ANIMATION
   ========================================================= */

function startSpeakingAnimation() {

    stopSpeakingAnimation();

    speakingTimer = setInterval(
        moveEyesRandomly,
        650
    );
}


function stopSpeakingAnimation() {

    if (speakingTimer) {

        clearInterval(speakingTimer);

        speakingTimer = null;
    }

    resetEyes();
}


function moveEyesRandomly() {

    const x =
        Math.round(Math.random() * 14 - 7);

    const y =
        Math.round(Math.random() * 10 - 5);

    if (leftPupil) {

        leftPupil.style.transform =
            `translate(${x}px,${y}px)`;
    }

    if (rightPupil) {

        rightPupil.style.transform =
            `translate(${x}px,${y}px)`;
    }
}


function resetEyes() {

    if (leftPupil) {
        leftPupil.style.transform =
            "translate(0,0)";
    }

    if (rightPupil) {
        rightPupil.style.transform =
            "translate(0,0)";
    }
}


/* =========================================================
   10. BLINK
   ========================================================= */

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


function scheduleBlink() {

    clearTimeout(blinkTimer);

    blinkTimer = setTimeout(function () {

        blink();

        scheduleBlink();

    }, 3500 + Math.random() * 4000);
}


/* =========================================================
   11. AUTO INTERNAL PANEL SYSTEM
   ========================================================= */

function createInternalPanels() {

    if (document.getElementById("apexInternalLayer")) {
        return;
    }

    const layer =
        document.createElement("div");

    layer.id = "apexInternalLayer";

    layer.innerHTML = `

        <div id="apexMapPanel"
             class="apex-internal-panel">

            <div class="apex-panel-header">

                <div>
                    <div class="apex-panel-title">
                        APEX MAP
                    </div>

                    <div class="apex-panel-subtitle">
                        LIVE GPS LOCATION
                    </div>
                </div>

                <button
                    class="apex-close-btn"
                    data-close="map">
                    ✕
                </button>

            </div>

            <div id="apexMapArea">

                <div class="apex-map-loading">

                    <div class="apex-loader"></div>

                    <div>
                        REQUESTING GPS LOCATION
                    </div>

                </div>

            </div>

            <div class="apex-map-info">

                <div>
                    <span>LATITUDE</span>
                    <strong id="apexLat">--</strong>
                </div>

                <div>
                    <span>LONGITUDE</span>
                    <strong id="apexLng">--</strong>
                </div>

                <div>
                    <span>ACCURACY</span>
                    <strong id="apexAccuracy">--</strong>
                </div>

            </div>

            <button
                id="apexOpenMapBtn"
                class="apex-panel-action">
                OPEN MAP
            </button>

        </div>


        <div id="apexSirenPanel"
             class="apex-internal-panel">

            <div class="apex-panel-header">

                <div>
                    <div class="apex-panel-title">
                        APEX SIREN
                    </div>

                    <div class="apex-panel-subtitle">
                        INTERNAL EMERGENCY SYSTEM
                    </div>
                </div>

                <button
                    class="apex-close-btn"
                    data-close="siren">
                    ✕
                </button>

            </div>

            <div class="apex-siren-core">

                <div
                    id="apexSirenRing"
                    class="apex-siren-ring">

                    <div class="apex-siren-center">
                        SIREN
                    </div>

                </div>

                <div
                    id="apexSirenStatus"
                    class="apex-siren-status">
                    SYSTEM READY
                </div>

            </div>

            <div class="apex-siren-buttons">

                <button
                    id="apexSirenStart"
                    class="apex-panel-action danger">
                    START SIREN
                </button>

                <button
                    id="apexSirenStop"
                    class="apex-panel-action">
                    STOP SIREN
                </button>

            </div>

        </div>


        <div id="apexFlashlightPanel"
             class="apex-internal-panel">

            <div class="apex-panel-header">

                <div>
                    <div class="apex-panel-title">
                        APEX FLASHLIGHT
                    </div>

                    <div class="apex-panel-subtitle">
                        DEVICE TORCH CONTROL
                    </div>
                </div>

                <button
                    class="apex-close-btn"
                    data-close="flashlight">
                    ✕
                </button>

            </div>

            <div class="apex-flash-core">

                <div
                    id="apexFlashIcon"
                    class="apex-flash-icon">
                    🔦
                </div>

                <div
                    id="apexFlashStatus"
                    class="apex-flash-status">
                    FLASHLIGHT OFF
                </div>

            </div>

            <button
                id="apexFlashToggle"
                class="apex-panel-action">
                TURN ON
            </button>

            <div class="apex-flash-note">
                Mobile browser/device support required.
            </div>

        </div>

    `;

    document.body.appendChild(layer);


    /* Close buttons */

    layer.querySelectorAll(
        "[data-close]"
    ).forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                closeInternalPanel(
                    button.dataset.close
                );
            }
        );
    });


    /* Siren buttons */

    const sirenStart =
        document.getElementById(
            "apexSirenStart"
        );

    const sirenStop =
        document.getElementById(
            "apexSirenStop"
        );


    if (sirenStart) {

        sirenStart.addEventListener(
            "click",
            startSiren
        );
    }


    if (sirenStop) {

        sirenStop.addEventListener(
            "click",
            stopSiren
        );
    }


    /* Flashlight */

    const flashButton =
        document.getElementById(
            "apexFlashToggle"
        );

    if (flashButton) {

        flashButton.addEventListener(
            "click",
            toggleInternalFlashlight
        );
    }


    /* Map */

    const openMapButton =
        document.getElementById(
            "apexOpenMapBtn"
        );

    if (openMapButton) {

        openMapButton.addEventListener(
            "click",
            openCurrentLocationInMaps
        );
    }
}


/* =========================================================
   12. INTERNAL PANEL
   ========================================================= */

function closeAllInternalPanels() {

    document.querySelectorAll(
        ".apex-internal-panel"
    ).forEach(function (panel) {

        panel.classList.remove("active");
    });
}


function closeInternalPanel(type) {

    const panel =
        document.getElementById(
            `apex${capitalize(type)}Panel`
        );

    if (panel) {
        panel.classList.remove("active");
    }
}


function openInternalPanel(type) {

    createInternalPanels();

    closeAllInternalPanels();

    const panel =
        document.getElementById(
            `apex${capitalize(type)}Panel`
        );

    if (panel) {

        panel.classList.add("active");

        setTimeout(function () {

            panel.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 50);
    }
}


function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);
}


/* =========================================================
   13. INTERNAL MAP
   ========================================================= */

function openInternalMap() {

    createInternalPanels();

    openInternalPanel("map");

    const mapArea =
        document.getElementById(
            "apexMapArea"
        );

    if (!navigator.geolocation) {

        mapArea.innerHTML = `
            <div class="apex-map-error">
                GPS is not supported by this browser.
            </div>
        `;

        return;
    }


    mapArea.innerHTML = `
        <div class="apex-map-loading">
            <div class="apex-loader"></div>
            <div>GETTING YOUR LOCATION...</div>
        </div>
    `;


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            document.getElementById(
                "apexLat"
            ).textContent =
                lat.toFixed(6);

            document.getElementById(
                "apexLng"
            ).textContent =
                lng.toFixed(6);

            document.getElementById(
                "apexAccuracy"
            ).textContent =
                `${Math.round(accuracy)} m`;


            /*
             * Map visual without external map API.
             * The location is shown using coordinates
             * and a browser-generated map link.
             */

            mapArea.innerHTML = `

                <div class="apex-location-visual">

                    <div class="apex-location-pulse"></div>

                    <div class="apex-location-pin">
                        📍
                    </div>

                    <div class="apex-location-text">
                        <strong>
                            YOUR CURRENT LOCATION
                        </strong>

                        <span>
                            ${lat.toFixed(5)},
                            ${lng.toFixed(5)}
                        </span>
                    </div>

                </div>

            `;

        },

        function (error) {

            let message =
                "Unable to get your location.";

            if (error.code === 1) {
                message =
                    "Location permission was denied.";
            }

            if (error.code === 2) {
                message =
                    "Location is unavailable.";
            }

            if (error.code === 3) {
                message =
                    "Location request timed out.";
            }


            mapArea.innerHTML = `

                <div class="apex-map-error">

                    <div>
                        📍
                    </div>

                    <strong>
                        ${message}
                    </strong>

                    <small>
                        Allow location permission
                        and try again.
                    </small>

                </div>

            `;

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


/* =========================================================
   14. OPEN CURRENT LOCATION
   ========================================================= */

function openCurrentLocationInMaps() {

    if (!navigator.geolocation) {
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            const url =
                `https://www.google.com/maps?q=${lat},${lng}`;


            window.open(
                url,
                "_blank",
                "noopener"
            );
        }
    );
}


/* =========================================================
   15. INTERNAL SIREN
   ========================================================= */

function startSiren() {

    createInternalPanels();

    const status =
        document.getElementById(
            "apexSirenStatus"
        );

    const ring =
        document.getElementById(
            "apexSirenRing"
        );


    if (sirenOscillator) {
        return;
    }


    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            if (status) {
                status.textContent =
                    "AUDIO NOT SUPPORTED";
            }

            return;
        }


        sirenAudioContext =
            new AudioContext();


        sirenOscillator =
            sirenAudioContext.createOscillator();


        sirenGain =
            sirenAudioContext.createGain();


        sirenOscillator.type =
            "sawtooth";


        sirenGain.gain.value =
            0.0001;


        sirenOscillator.connect(
            sirenGain
        );

        sirenGain.connect(
            sirenAudioContext.destination
        );


        sirenOscillator.start();


        let high = false;


        sirenTimer =
            setInterval(function () {

                if (
                    !sirenAudioContext ||
                    !sirenOscillator ||
                    !sirenGain
                ) {
                    return;
                }


                high = !high;


                const frequency =
                    high ? 880 : 520;


                sirenOscillator
                    .frequency
                    .setTargetAtTime(
                        frequency,
                        sirenAudioContext.currentTime,
                        0.04
                    );


                sirenGain
                    .gain
                    .setTargetAtTime(
                        0.16,
                        sirenAudioContext.currentTime,
                        0.02
                    );

            }, 450);


        if (status) {
            status.textContent =
                "SIREN ACTIVE";
        }

        if (ring) {
            ring.classList.add(
                "siren-active"
            );
        }


        speak(
            "Emergency siren activated.",
            "en-IN"
        );


    } catch (error) {

        console.error(
            "Siren error:",
            error
        );

        stopSiren();
    }
}


/* =========================================================
   16. STOP SIREN
   ========================================================= */

function stopSiren() {

    if (sirenTimer) {

        clearInterval(sirenTimer);

        sirenTimer = null;
    }


    if (sirenGain) {

        try {

            sirenGain.gain.setTargetAtTime(
                0.0001,
                sirenAudioContext.currentTime,
                0.03
            );

        } catch (error) {}
    }


    if (sirenOscillator) {

        try {
            sirenOscillator.stop();
        } catch (error) {}
    }


    if (sirenAudioContext) {

        try {
            sirenAudioContext.close();
        } catch (error) {}
    }


    sirenOscillator = null;
    sirenGain = null;
    sirenAudioContext = null;


    const status =
        document.getElementById(
            "apexSirenStatus"
        );

    const ring =
        document.getElementById(
            "apexSirenRing"
        );


    if (status) {
        status.textContent =
            "SYSTEM READY";
    }

    if (ring) {
        ring.classList.remove(
            "siren-active"
        );
    }
}


/* =========================================================
   17. INTERNAL FLASHLIGHT
   ========================================================= */

async function toggleInternalFlashlight() {

    createInternalPanels();

    openInternalPanel(
        "flashlight"
    );


    if (flashlightOn) {

        await turnFlashlightOff();

    } else {

        await turnFlashlightOn();
    }
}


/* =========================================================
   18. FLASHLIGHT ON
   ========================================================= */

async function turnFlashlightOn() {

    const status =
        document.getElementById(
            "apexFlashStatus"
        );

    const button =
        document.getElementById(
            "apexFlashToggle"
        );

    const icon =
        document.getElementById(
            "apexFlashIcon"
        );


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        if (status) {
            status.textContent =
                "FLASHLIGHT NOT SUPPORTED";
        }

        return;
    }


    try {

        flashlightStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },

                audio: false
            });


        const tracks =
            flashlightStream.getVideoTracks();


        if (!tracks.length) {

            throw new Error(
                "No camera track available."
            );
        }


        flashlightTrack =
            tracks[0];


        const capabilities =
            flashlightTrack.getCapabilities
                ? flashlightTrack.getCapabilities()
                : {};


        if (!capabilities.torch) {

            flashlightStream
                .getTracks()
                .forEach(function (track) {
                    track.stop();
                });

            flashlightStream = null;
            flashlightTrack = null;


            if (status) {
                status.textContent =
                    "TORCH NOT AVAILABLE";
            }


            speak(
                "Flashlight is not supported on this device or browser.",
                "en-IN"
            );

            return;
        }


        await flashlightTrack.applyConstraints({

            advanced: [
                {
                    torch: true
                }
            ]
        });


        flashlightOn = true;


        if (status) {
            status.textContent =
                "FLASHLIGHT ON";
        }

        if (button) {
            button.textContent =
                "TURN OFF";
        }

        if (icon) {
            icon.classList.add("active");
        }


        speak(
            "Flashlight turned on.",
            "en-IN"
        );


    } catch (error) {

        console.error(
            "Flashlight error:",
            error
        );


        if (status) {
            status.textContent =
                "PERMISSION / TORCH ERROR";
        }


        speak(
            "I could not turn on the flashlight. Please allow camera permission.",
            "en-IN"
        );
    }
}


/* =========================================================
   19. FLASHLIGHT OFF
   ========================================================= */

async function turnFlashlightOff() {

    try {

        if (flashlightTrack) {

            const capabilities =
                flashlightTrack.getCapabilities
                    ? flashlightTrack.getCapabilities()
                    : {};


            if (capabilities.torch) {

                await flashlightTrack.applyConstraints({

                    advanced: [
                        {
                            torch: false
                        }
                    ]
                });
            }
        }

    } catch (error) {

        console.log(
            "Torch off:",
            error
        );
    }


    if (flashlightStream) {

        flashlightStream
            .getTracks()
            .forEach(function (track) {
                track.stop();
            });
    }


    flashlightStream = null;
    flashlightTrack = null;

    flashlightOn = false;


    const status =
        document.getElementById(
            "apexFlashStatus"
        );

    const button =
        document.getElementById(
            "apexFlashToggle"
        );

    const icon =
        document.getElementById(
            "apexFlashIcon"
        );


    if (status) {
        status.textContent =
            "FLASHLIGHT OFF";
    }

    if (button) {
        button.textContent =
            "TURN ON";
    }

    if (icon) {
        icon.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   20. EXTERNAL TOOL
   ========================================================= */

function openTool(
    url,
    language,
    toolName
) {

    if (!url || url === "#") {

        if (language === "hi-IN") {

            speak(
                `${toolName} का link अभी configure नहीं है।`,
                language
            );

        } else if (language === "gu-IN") {

            speak(
                `${toolName} ની link હજી configure નથી.`,
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


    if (language === "hi-IN") {

        speak(
            `${toolName} खोल रहा हूँ।`,
            language
        );

    } else if (language === "gu-IN") {

        speak(
            `${toolName} ખોલી રહ્યો છું.`,
            language
        );

    } else {

        speak(
            `Opening ${toolName}.`,
            language
        );
    }


    setTimeout(function () {

        if (url.startsWith("tel:")) {

            window.location.href = url;

        } else {

            window.open(
                url,
                "_blank",
                "noopener"
            );
        }

    }, 900);
}


/* =========================================================
   21. SPEECH RECOGNITION
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
    recognition.lang = "en-IN";


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

            processCommand(
                finalText.trim()
            );
        }
    };


    recognition.onerror = function (event) {

        console.log(
            "Speech recognition:",
            event.error
        );

        isListening = false;

        setState("ready");
    };


    recognition.onend = function () {

        isListening = false;

        if (
            !app?.classList.contains(
                "speaking"
            ) &&
            !app?.classList.contains(
                "thinking"
            )
        ) {

            setState("ready");
        }
    };

} else {

    recognitionSupported = false;

    setState("offline");
}


/* =========================================================
   22. START LISTENING
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


    try {

        recognition.lang =
            currentLanguage;

        recognition.start();

    } catch (error) {

        console.log(
            "Recognition start:",
            error
        );
    }
}


/* =========================================================
   23. COMMAND NORMALIZATION
   ========================================================= */

function normalizeCommand(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[!?.,]/g, " ");
}


/* =========================================================
   24. COMMAND ROUTER
   ========================================================= */

function routeCommand(
    text,
    language
) {

    const lower =
        normalizeCommand(text);


    /* ================= STOP ================= */

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


    /* ================= MAP ================= */

    if (
        lower.includes("map") ||
        lower.includes("map kholo") ||
        lower.includes("open map") ||
        lower.includes("मैप") ||
        lower.includes("मैप खोलो") ||
        lower.includes("नक्शा") ||
        lower.includes("નકશો") ||
        lower.includes("મેપ") ||
        lower.includes("મેપ ખોલો")
    ) {

        openInternalMap();

        speak(
            language === "hi-IN"
                ? "मैप खोल रहा हूँ।"
                : language === "gu-IN"
                    ? "મેપ ખોલી રહ્યો છું."
                    : "Opening internal map.",
            language
        );

        return;
    }


    /* ================= SIREN ================= */

    if (
        lower.includes("siren") ||
        lower.includes("sos siren") ||
        lower.includes("siren kholo") ||
        lower.includes("सायरन") ||
        lower.includes("सायरन खोलो") ||
        lower.includes("एसओएस सायरन") ||
        lower.includes("સાયરન") ||
        lower.includes("સાયરન ખોલો")
    ) {

        openInternalPanel("siren");

        speak(
            language === "hi-IN"
                ? "सायरन सिस्टम खोल रहा हूँ।"
                : language === "gu-IN"
                    ? "સાયરન સિસ્ટમ ખોલી રહ્યો છું."
                    : "Opening internal siren.",
            language
        );

        return;
    }


    /* ================= FLASHLIGHT ================= */

    if (
        lower.includes("flashlight") ||
        lower.includes("flash light") ||
        lower.includes("torch") ||
        lower.includes("torch on") ||
        lower.includes("flashlight on") ||
        lower.includes("टॉर्च") ||
        lower.includes("फ्लैशलाइट") ||
        lower.includes("टॉर्च चालू") ||
        lower.includes("ટોર્ચ") ||
        lower.includes("ફ્લેશલાઇટ")
    ) {

        toggleInternalFlashlight();

        return;
    }


    /* ================= QR ================= */

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


    /* ================= CAMERA ================= */

    if (
        lower.includes("camera") ||
        lower.includes("smart camera") ||
        lower.includes("camera kholo") ||
        lower.includes("कैमरा") ||
        lower.includes("कैमरा खोलो") ||
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


    /* ================= AI VOICE ================= */

    if (
        lower.includes("ai voice") ||
        lower.includes("ai voice assistant") ||
        lower.includes("voice assistant") ||
        lower.includes("alexa") ||
        lower.includes("ai assistant") ||
        lower.includes("वॉइस असिस्टेंट") ||
        lower.includes("एआई वॉइस") ||
        lower.includes("વોઇસ આસિસ્ટન્ટ") ||
        lower.includes("એઆઈ વોઇસ")
    ) {

        openTool(
            APEX_LINKS.aiVoice,
            language,
            "AI Voice Assistant"
        );

        return;
    }


    /* ================= INSTAGRAM ================= */

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


    /* ================= FACEBOOK ================= */

    if (
        lower.includes("facebook") ||
        lower.includes("fb") ||
        lower.includes("फेसबुक") ||
        lower.includes("ફેસબુક")
    ) {

        openTool(
            APEX_LINKS.facebook,
            language,
            "Facebook"
        );

        return;
    }


    /* ================= WHATSAPP ================= */

    if (
        lower.includes("whatsapp") ||
        lower.includes("whats app") ||
        lower.includes("व्हाट्सएप") ||
        lower.includes("વોટ્સએપ")
    ) {

        openTool(
            APEX_LINKS.whatsapp,
            language,
            "WhatsApp"
        );

        return;
    }


    /* ================= CALL ================= */

    if (
        lower === "call" ||
        lower.includes("make a call") ||
        lower.includes("call karo") ||
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


    /* ================= GOOGLE ================= */

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


    /* ================= YOUTUBE ================= */

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


    /* ================= LOCATION ================= */

    if (
        lower.includes("live location") ||
        lower.includes("location kholo") ||
        lower.includes("location") ||
        lower.includes("लोकेशन") ||
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


    /* ================= COMPASS ================= */

    if (
        lower.includes("compass") ||
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


    /* ================= CBRND HOME ================= */

    if (
        lower.includes("cbrnd home") ||
        lower.includes("smart home") ||
        lower.includes("cbrnd kholo") ||
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


    /* ================= GREETING ================= */

    if (
        lower.includes("hello") ||
        lower.includes("hi apex") ||
        lower.includes("hey apex") ||
        lower.includes("नमस्ते") ||
        lower.includes("हेलो") ||
        lower.includes("હેલો") ||
        lower.includes("નમસ્તે")
    ) {

        speak(
            language === "hi-IN"
                ? "नमस्ते। मैं APEX हूँ।"
                : language === "gu-IN"
                    ? "નમસ્તે. હું APEX છું."
                    : "Hello. I am APEX.",
            language
        );

        return;
    }


    /* ================= WHO ARE YOU ================= */

    if (
        lower.includes("who are you") ||
        lower.includes("your name") ||
        lower.includes("आप कौन हो") ||
        lower.includes("तुम कौन हो") ||
        lower.includes("તમારું નામ") ||
        lower.includes("તમે કોણ")
    ) {

        speak(
            language === "hi-IN"
                ? "मैं APEX हूँ, आपका AI voice assistant."
                : language === "gu-IN"
                    ? "હું APEX છું, તમારો AI voice assistant."
                    : "I am APEX, your AI voice assistant.",
            language
        );

        return;
    }


    /* ================= TIME ================= */

    if (
        lower.includes("time") ||
        lower.includes("समय") ||
        lower.includes("टाइम") ||
        lower.includes("સમય") ||
        lower.includes("ટાઈમ")
    ) {

        const time =
            new Date().toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );


        speak(
            language === "hi-IN"
                ? `अभी समय ${time} है।`
                : language === "gu-IN"
                    ? `અત્યારે સમય ${time} છે.`
                    : `The current time is ${time}.`,
            language
        );

        return;
    }


    /* ================= DATE ================= */

    if (
        lower.includes("date") ||
        lower.includes("today") ||
        lower.includes("आज") ||
        lower.includes("तारीख") ||
        lower.includes("આજે") ||
        lower.includes("તારીખ")
    ) {

        const date =
            new Date().toLocaleDateString(
                [],
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        speak(
            language === "hi-IN"
                ? `आज की तारीख ${date} है।`
                : language === "gu-IN"
                    ? `આજની તારીખ ${date} છે.`
                    : `Today's date is ${date}.`,
            language
        );

        return;
    }


    /* ================= DEFAULT ================= */

    speak(
        language === "hi-IN"
            ? `मैंने सुना: ${text}`
            : language === "gu-IN"
                ? `મેં સાંભળ્યું: ${text}`
                : `I heard: ${text}`,
        language
    );
}


/* =========================================================
   25. PROCESS COMMAND
   ========================================================= */

function processCommand(text) {

    if (!text || !text.trim()) {
        return;
    }


    const cleanText =
        text.trim();


    currentLanguage =
        detectLanguage(cleanText);


    const lower =
        normalizeCommand(cleanText);


    /* Immediate stop */

    if (
        lower === "stop" ||
        lower.includes("stop apex") ||
        lower.includes("stop voice") ||
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

    }, 300);
}


/* =========================================================
   26. BUTTONS
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
        startListening
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

            }, 600);
        }
    );
}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        function () {

            processCommand(
                commandInput?.value || ""
            );
        }
    );
}


/* =========================================================
   27. ENTER KEY
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
   28. SPACE = LISTEN
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.code !== "Space") {
            return;
        }


        const target =
            event.target;


        const typing =
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            );


        if (typing) {
            return;
        }


        event.preventDefault();

        startListening();
    }
);


/* =========================================================
   29. VISIBILITY
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

            stopSiren();

            setState("ready");
        }
    }
);


/* =========================================================
   30. CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        stopSiren();

        turnFlashlightOff();
    }
);


/* =========================================================
   31. INIT
   ========================================================= */

function initApex() {

    createInternalPanels();

    setState("ready");

    resetEyes();

    scheduleBlink();


    console.log(
        "================================"
    );

    console.log(
        "APEX AI SYSTEM ONLINE"
    );

    console.log(
        "Internal Map: READY"
    );

    console.log(
        "Internal Siren: READY"
    );

    console.log(
        "Internal Flashlight: READY"
    );

    console.log(
        "Voice Recognition:",
        recognitionSupported
            ? "SUPPORTED"
            : "NOT SUPPORTED"
    );

    console.log(
        "================================"
    );
}


initApex();
