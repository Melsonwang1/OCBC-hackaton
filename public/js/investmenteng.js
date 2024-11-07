document.addEventListener('keydown', function (event) {
    // Ensure we don't interfere with regular typing events
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    // Shortcut for "View Accounts"
    if (event.key === '1') {
        window.location.href = "../html/accountseng.html";
    }
    
    // Shortcut for "Transfer Money"
    if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    }

    // Shortcut for "Investments"
    if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    }

    // Shortcut for "Chinese Translation"
    if(event.key == 'c'){
        window.location.href = "../html/accountschi.html";
    }

    // Shortcut for "Log Out"
    if (event.key === 'l') {
        window.location.href = 'logineng.html';
    }

});

document.addEventListener('DOMContentLoaded', async () => {
    let token = localStorage.getItem("token");

    // User Id = 1
    try {
        // Fetch user data (zb)
        const userResponse = await fetch(`/user/1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.message || "Failed to fetch user data");
        }

        const user = await userResponse.json();
        document.getElementById("user-name").innerText = user.account.name.toUpperCase();
    }
    catch (error) {
        console.error('Error fetching account data:', error);
    }
});

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    let isRecognitionRunning = false;

    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();

        if (command.includes("accounts")) {
            narrate("Navigating to View Accounts page.");
            window.location.href = "accounts.html";
        } else if (command.includes("transfer")) {
            narrate("Navigating to Transfer and Payments page.");
            window.location.href = "transfer.html";
        } else if (command.includes("investment")) {
            narrate("You are on the Investment page.");
        } else {
            narrate("Command not recognized on this page.");
        }
    };

    const startListening = () => {
        if (!isRecognitionRunning) {
            recognition.start();
            isRecognitionRunning = true;
        }
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log(`Recognized: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        startListening();
    };

    recognition.onerror = (event) => {
        console.error('Error occurred:', event.error);
        narrate('Error occurred. Please try again.');
        isRecognitionRunning = false;
        startListening();
    };

    // Initial welcome message
    narrate('Welcome to the Investment page. Here are your current investments. Say "Accounts" to view accounts, "Transfer" for transfers, or "Investment" for this page.');
    startListening();

} else {
    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };
    narrate('Sorry, your browser does not support the Web Speech API.');
}
