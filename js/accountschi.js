if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // Set language to Chinese for character recognition
    recognition.continuous = false;
    recognition.interimResults = false;

    let selectedLanguage = 'zh-CN'; // 默认语言为中文
    let isListeningForNavigation = false;
    let isRecognitionRunning = false;

    const narrate = (message, lang) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    };

    const announcePageAndBankDetails = () => {
        narrate(`您现在在账户页面。以下是两个账户的详细信息。`, selectedLanguage);

        // 获取“我的账户”详情
        const myBankDetails = getBankDetails('myBank');
        if (myBankDetails) {
            const myBankMessage = `银行名称: ${myBankDetails.bankName}。银行编号: ${myBankDetails.bankNumber}。分行: ${myBankDetails.branch}。账户余额: ${myBankDetails.haveamt}。欠款金额: ${myBankDetails.owedamt}。最近的交易来自: ${myBankDetails.person}。电话: ${myBankDetails.phonenum}。金额: ${myBankDetails.amt}。日期: ${myBankDetails.date}。`;
            narrate(myBankMessage, selectedLanguage);
        } else {
            narrate('未找到我的账户详情。', selectedLanguage);
        }

        // 获取“我的储蓄账户”详情
        const savingsBankDetails = getBankDetails('savingsBank');
        if (savingsBankDetails) {
            const savingsBankMessage = `银行名称: ${savingsBankDetails.bankName}。银行编号: ${savingsBankDetails.bankNumber}。分行: ${savingsBankDetails.branch}。账户余额: ${savingsBankDetails.haveamt}。欠款金额: ${savingsBankDetails.owedamt}。最近的交易来自: ${savingsBankDetails.person}。电话: ${savingsBankDetails.phonenum}。金额: ${savingsBankDetails.amt}。日期: ${savingsBankDetails.date}。`;
            setTimeout(() => narrate(savingsBankMessage, selectedLanguage), 5000); // 添加延迟以避免重叠
        } else {
            narrate('未找到我的储蓄账户详情。', selectedLanguage);
        }

        // 结束后提示导航
        const navPrompt = '您想去转账和支付页面还是投资页面？请说“支付”或“投资”来继续。';
        setTimeout(() => {
            narrate(navPrompt, selectedLanguage);
            isListeningForNavigation = true;
            startListening();
        }, 10000); // 调整延迟以适应账户详情播报
    };

    const getBankDetails = (bankId) => {
        const bankElem = document.getElementById(bankId === 'myBank' ? 'myBankName' : 'savingsBankName');
        const bankNumberElem = document.getElementById(bankId === 'myBank' ? 'myBankNumberDetails' : 'savingsBankNumberDetails');
        const branchElem = document.getElementById(bankId === 'myBank' ? 'myBankBranchDetails' : 'savingsBankBranchDetails');
        const haveAmtElem = document.getElementById(bankId === 'myBank' ? 'haveamt' : 'savingshaveamt');
        const owedAmtElem = document.getElementById(bankId === 'myBank' ? 'owedamt' : 'savingsOwedamt');
        const personElem = document.getElementById(bankId === 'myBank' ? 'person' : 'savingsTransactionsperson');
        const phonenumElem = document.getElementById(bankId === 'myBank' ? 'phonenum' : 'savingsTransactionsphonenum');
        const amtElem = document.getElementById(bankId === 'myBank' ? 'amt' : 'savingsTransactionsamt');
        const dateElem = document.getElementById(bankId === 'myBank' ? 'date' : 'savingsTransactionsdate');

        return bankElem && bankNumberElem && branchElem && haveAmtElem && owedAmtElem && personElem && phonenumElem && amtElem && dateElem
            ? {
                bankName: bankElem.textContent,
                bankNumber: bankNumberElem.textContent,
                branch: branchElem.textContent,
                haveamt: haveAmtElem.textContent,
                owedamt: owedAmtElem.textContent,
                person: personElem.textContent,
                phonenum: phonenumElem.textContent,
                amt: amtElem.textContent,
                date: dateElem.textContent
            }
            : null;
    };

    const handleCommand = (spokenText) => {
        if (isListeningForNavigation) {
            // Detect "支付" or "投资" in Chinese characters
            if (spokenText.includes("支付")) {
                window.location.href = '../html/transfer.html';
            } else if (spokenText.includes("投资")) {
                window.location.href = '../html/investment.html';
            } else {
                narrate('请重复您的选择。', selectedLanguage);
                startListening();
            }
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
        console.log(`识别结果: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        if (isListeningForNavigation) {
            startListening();
        }
    };

    recognition.onerror = (event) => {
        console.error('发生错误:', event.error);
        narrate('发生错误，请重试。', selectedLanguage);
        isRecognitionRunning = false;
        startListening();
    };

    // 页面加载时调用函数来宣布页面和账户详细信息
    announcePageAndBankDetails();

} else {
    narrate('抱歉，您的浏览器不支持 Web Speech API。', 'zh-CN');
}
