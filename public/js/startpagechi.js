let currentFontSize = 30; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });

    document.querySelectorAll('footer, footer *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    document.querySelectorAll('footer, footer *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Function to provide audio feedback to the user
function speakBack(text, lang = 'zh-CN') {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Speech synthesis is not supported in this browser.");
    }
}

if (SpeechRecognition) {
    let isRedirecting = false; // Prevents multiple redirects
    // Initial recognition instance to detect preferred language
    const languageRecognition = new SpeechRecognition();
    languageRecognition.lang = 'zh-CN';
    languageRecognition.interimResults = false;
    languageRecognition.maxAlternatives = 1;

    // Recognition instance to confirm login readiness
    const loginConfirmationRecognition = new SpeechRecognition();
    loginConfirmationRecognition.lang = 'zh-CN';
    loginConfirmationRecognition.interimResults = false;
    loginConfirmationRecognition.maxAlternatives = 1;

    // Prompt user for preferred language in Chinese
    speakBack("您想要登录吗？如果想登录，请说 '是'。如果不想登录，可以说 ‘不是’ 稍后说 '是'。", 'zh-CN');

    // Start listening after a delay to let prompt finish
    setTimeout(() => {
        languageRecognition.start();
    }, 3000);

    languageRecognition.onresult = (event) => {
        const spokenResponse = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Detected language response:", spokenResponse); // Log the recognized text

        if (!isRedirecting) {
            if (spokenResponse === "是" || spokenResponse === "是。" || spokenResponse === "是的。" || spokenResponse === "是的") {
                isRedirecting = true;
                speakBack("正在重定向到登录页面。", 'zh-CN');
                window.location.href = "loginchi.html";
            } else if (spokenResponse === "不是。" || spokenResponse === "不是") {
                speakBack("好的，如果您想登录，请稍后说 '是'", 'zh-CN');
                // Do not set isRedirecting to true so it keeps listening
            }
        }
    };

    languageRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Speech recognition error:", event.error);
            alert("There was an error with voice recognition. Please try again.");
        }
    };

    languageRecognition.onend = () => {
        if (!isRedirecting) {
            languageRecognition.start(); // Restart only if no redirect was triggered
        }
    };

    // Prompt user to confirm login readiness
    function askLoginReady() {
        speakBack("Are you ready to log in? Say 'yes' to proceed.", 'en-US');
        loginConfirmationRecognition.start();
    }

    loginConfirmationRecognition.onresult = (event) => {
        const confirmationResponse = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Detected login readiness response:", confirmationResponse); // Log the recognized text

        if (confirmationResponse === "yes") {
            window.location.href = "logineng.html";
        }
    };

    loginConfirmationRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Login confirmation recognition error:", event.error);
        }
    };

    loginConfirmationRecognition.onend = () => {
        // Only restart login confirmation if the page hasn’t redirected
        if (!isRedirecting) {
            loginConfirmationRecognition.start();
        }
    };
} else {
    alert("Speech recognition is not supported in this browser.");
}
