let currentFontSize = 25; // 默认字体大小，用于跟踪变化

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // 将字体大小更改应用到.container 和 .content 内的元素
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });

    document.querySelectorAll('section, section *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // 通过移除内联样式来重置字体大小
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = ''; // 清除内联样式，恢复到CSS默认
    });

    document.querySelectorAll('section, section *').forEach(element => {
        element.style.fontSize = ''; // 清除内联样式，恢复到CSS默认
    });

    currentFontSize = 25;
}

document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // 当前用户
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // 检查两种存储方式中的token

    // 第一步：检查页面加载时是否存在token
    if (!token) {
        alert("您的会话已过期或未登录。请重新登录。");
        window.location.href = "logineng.html"; // 重定向到登录页面
        return; // 停止执行
    }

    // 获取并验证用户数据
    async function getUserData() {
        console.log('Token:', token);  // 输出token以确保其有效
        try {
            const response = await fetch(`/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('错误响应:', errorData);  // 输出错误详细信息
                throw new Error(errorData.message);
            }

            const userData = await response.json();
            console.log('用户数据:', userData);  // 输出用户数据

            // 填充用户对象
            user = userData;
            // 显示用户的名字
            document.getElementById("user-name").innerText = user.name.toUpperCase();
        } catch (error) {
            console.log('获取用户数据错误:', error.message);
            // 第二步：处理无效或过期的token
            if (error.message === 'Forbidden: Invalid or expired token') {
                alert("会话超时。请重新登录！");
                localStorage.removeItem("token"); // 正确地从本地存储中删除token
                sessionStorage.removeItem("token"); // 从会话存储中删除token
                window.location.href = "logineng.html"; // 重定向到登录页面
            } else if (error.message === 'Unauthorized') {
                alert("请先登录！");
                window.location.href = "logineng.html"; // 重定向到登录页面
            } else {
                console.error('意外错误:', error);
            }
        }
    }

    // 登出按钮功能
    document.getElementById("logout-btn").addEventListener("click", function() {
        // 第三步：登出时清除token
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    });

    // 等待用户数据加载完成后再获取银行账户
    await getUserData();

    // 仅在用户数据可用时调用fetchBankAccounts
    if (user && user.user_id) {
        await fetchBankAccounts(user.user_id);
    } else {
        console.log('用户ID不可用。');
    }
});


async function fetchBankAccounts(userId) {
    try {
        const response = await fetch(`/accounts/user/${userId}`);
        if (!response.ok) {
            throw new Error(`错误状态: ${response.status}`); // 如果响应不正常则抛出错误
        }
        const accounts = await response.json();
        displayAccounts(accounts); // 显示银行账户
    } catch (error) {
        console.error('获取银行账户错误:', error);
        alert('未找到银行账户记录数据'); // 如果没有找到银行账户记录，给用户提示
    }
}

// 使用Web语音API讲解银行账户详情
function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("浏览器不支持语音合成。");
    }
}

// 动态宣布账户详情
function announceAccountDetails(accounts) {
    if (ttsEnabled) return;  // 如果启用了TTS，则不宣布账户详情

    narrate("欢迎来到您的账户页面。以下是您的账户详情：");

    accounts.forEach((account, index) => {
        const bankName = account.account_name || "未知银行名称";
        const accountNumber = account.account_number || "未知账户号码";
        const balance = account.balance_have ? `${account.balance_have.toFixed(2)} SGD` : "未知余额";

        const message = `账户 ${index + 1}: 银行名称: ${bankName}。账户号码: ${accountNumber}。余额: ${balance}。`;
        setTimeout(() => narrate(message), index * 4000);
    });

    setTimeout(() => narrate("您想要去转账、查看投资，还是查看交易记录?"), accounts.length * 4000);
}

// 初始化语音识别，并不断监听导航指令
function startListeningForNavigation() {
    if (ttsEnabled) return;  // 如果启用了TTS，则不开始导航监听

    if (!('webkitSpeechRecognition' in window)) {
        console.error("浏览器不支持语音识别。");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // 持续监听语音
    recognition.lang = 'zh-CN';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, ""); // 移除末尾的句号
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (!ttsEnabled && event.error !== 'no-speech') {
            narrate("抱歉，我没有听清楚。请说转账、查看投资，或查看交易记录。");
        }
    };

    // 语音结束时重新开始监听
    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

// 处理用户对导航提示的响应
function handleUserResponse(response) {
    if (ttsEnabled) return; // 如果启用了TTS，则提前退出

    if (response.includes("转账") || response.includes("发送") || response.includes("转账")) {
        window.location.href = "transfer.html";
    } else if (response.includes("投资") || response.includes("投资")) {
        window.location.href = "investmenteng.html";
    } else if (response.includes("交易") || response.includes("查看")) {
        window.location.href = "accountsdetails.html";
    } else {
        narrate("抱歉，我没有听清楚。请说转账、查看投资，或查看交易记录。");
    }
}

// 启用或禁用TTS模式
let ttsEnabled = false;

// 切换TTS模式
function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const statusText = document.getElementById('tts-status');
    const toggleButton = document.getElementById('toggle-tts');
    if (ttsEnabled) {
        statusText.innerHTML = '悬停即可收听： <strong>开启</strong>';
    } else {
        statusText.innerHTML = '悬停即可收听： <strong>关闭</strong>';
    }
}

// 动态显示账户卡片并设置语音讲解和监听
function displayAccounts(accounts) {
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ''; // 清除之前的内容

    accounts.forEach(account => {
        const accountCard = document.createElement('a');
        accountCard.href = `accountsdetails.html?accountId=${account.account_id}`;
        accountCard.className = 'account-card';

        // 为每个账户卡片添加工具提示
        accountCard.setAttribute('class', 'account-card tooltip');
        accountCard.setAttribute('data-position', 'top');
        accountCard.setAttribute('aria-label', 
            `账户名称: ${account.account_name} ,\n` +
            `账户号码: ${account.account_number} ,\n` +
            `当前余额: SGD ${account.balance_have.toFixed(2)}`
        );
        
        accountCard.innerHTML = 
            `<div>
                <h3>${account.account_name}</h3>
                <p>账户号码: ${account.account_number}</p>
            </div>
            <p class="balance"><span class="currency">SGD</span> ${account.balance_have.toFixed(2)}</p>`;
        
        accountsList.appendChild(accountCard);

        // 仅在启用TTS时，鼠标悬停时播放账户详情
        accountCard.onmouseover = function() {
            if (ttsEnabled) {
                const accountDetails = `点击查看 ${account.account_name}，账户号码为 ${account.account_number}，当前余额为 SGD ${account.balance_have.toFixed(2)}。`;
                speakText(accountDetails); // 使用speakText函数讲解账户详情
            }
        };
    });

    // 只有在未启用TTS时，才宣布账户详情并开始导航监听
    if (!ttsEnabled) {
        announceAccountDetails(accounts); 
        startListeningForNavigation();
    }
}

function toggleMode() {
    const body = document.body;
    const button = document.getElementById('mode-toggle');
    const accountSelection = document.getElementById('account-selection');  // Get account selection section

    // Toggle the 'dark-mode' class
    body.classList.toggle('dark-mode');
    accountSelection.classList.toggle('dark-mode');  // Toggle dark mode class for account selection
    
    // Update the button text
    if (body.classList.contains('dark-mode')) {
        button.textContent = '浅色模式';
        localStorage.setItem('mode', 'dark');
    } else {
        button.textContent = '深色模式';
        localStorage.setItem('mode', 'light');
    }
}

// Check the saved mode preference on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('mode') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('mode-toggle').textContent = '浅色模式';
        document.getElementById('account-selection').classList.add('dark-mode');  // Apply dark mode to account selection
    }
});
