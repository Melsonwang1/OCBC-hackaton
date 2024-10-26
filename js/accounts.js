if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Restart manually as needed
    recognition.interimResults = false;

    let selectedLanguage = 'zh-CN'; // Default to Chinese
    let isListeningForNavigation = false;

    const narrate = (message, lang) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        utterance.rate = lang === 'zh-CN' ? 0.85 : 1;
        window.speechSynthesis.speak(utterance);
    };

    const announceBankDetails = () => {
        const bankDetails = getBankDetails('myBank');
        if (bankDetails) {
            const message = selectedLanguage === 'en-US'
                ? `Bank name: ${bankDetails.bankName}. Bank number: ${bankDetails.bankNumber}. Branch: ${bankDetails.branch}. Bank Balance: ${bankDetails.haveamt}. Owed amount: ${bankDetails.owedamt}.`
                : `银行名称：${bankDetails.bankName}。银行号码：${bankDetails.bankNumber}。分行：${bankDetails.branch}。银行余额：${bankDetails.haveamt}。欠款：${bankDetails.owedamt}。`;
            
            const navPrompt = selectedLanguage === 'en-US'
                ? 'Would you like to go to the Transfer and Payments page or the Investment page? Say "payments" or "investment" to proceed.'
                : '您想去转账和付款页面还是投资页面？说 "付款" 或 "投资"。';

            narrate(message, selectedLanguage);
            setTimeout(() => {
                narrate(navPrompt, selectedLanguage);
                isListeningForNavigation = true;
                startListening(); // Start listening for navigation commands
            }, 1000);
        } else {
            narrate(selectedLanguage === 'en-US' ? 'Bank details not found.' : '未找到银行信息。', selectedLanguage);
        }
    };

    const getBankDetails = (bankId) => {
        const bankElem = document.getElementById(bankId === 'myBank' ? 'myBankName' : 'savingsBankName');
        const bankNumberElem = document.getElementById(bankId === 'myBank' ? 'myBankNumberDetails' : 'savingsBankNumberDetails');
        const branchElem = document.getElementById(bankId === 'myBank' ? 'myBankBranchDetails' : 'savingsBankBranchDetails');
        const haveAmtElem = document.getElementById('haveamt');
        const owedAmtElem = document.getElementById('owedamt');
        return bankElem && bankNumberElem && branchElem && haveAmtElem && owedAmtElem
            ? {
                bankName: bankElem.textContent,
                bankNumber: bankNumberElem.textContent,
                branch: branchElem.textContent,
                haveamt: haveAmtElem.textContent,
                owedamt: owedAmtElem.textContent,
            }
            : null;
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();
        
        if (!isListeningForNavigation) {
            if (command.includes("english")) {
                selectedLanguage = 'en-US';
                announceBankDetails();
            } else if (command.includes("chinese") || command.includes("中文")) {
                selectedLanguage = 'zh-CN';
                announceBankDetails();
            }
        } else {
            if (command.includes("payments")) {
                window.location.href = '/transfer-payments';
            } else if (command.includes("investment")) {
                window.location.href = '/investment';
            } else {
                narrate(selectedLanguage === 'en-US' ? 'Please repeat your selection.' : '请重试您的选择。', selectedLanguage);
                startListening(); // Restart listening for navigation if invalid command
            }
        }
    };

    const startListening = () => {
        recognition.start();
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log(`Recognized: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onerror = (event) => {
        console.error('Error occurred:', event.error);
        narrate(selectedLanguage === 'en-US' ? 'Error occurred. Please try again.' : '发生错误。请再试一次。', selectedLanguage);
        startListening();
    };

    recognition.onend = () => {
        if (!isListeningForNavigation) {
            startListening(); // Restart for language selection if needed
        }
    };

    // Initial prompt for language selection
    narrate('Please say "English" for English or "Chinese" for Chinese.', 'en-US');
    narrate('请说 "中文" 选择中文', 'zh-CN');
    startListening();

} else {
    narrate('Sorry, your browser does not support the Web Speech API.', 'en-US');
}
