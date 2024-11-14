let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

function resetFields() {
    document.getElementById("user-id").value = "";
    document.getElementById("pin").value = "";
    currentField = 'user-id';

    // Reset voice recognition state
    awaitingForgotPassword = false; 
    awaitingRememberMeConfirmation = false; 
    awaitingLoginConfirmation = false;

    speakBack("Login failed. Please enter your User ID again, letter by letter.");
}


document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById("login-button").addEventListener("click", async function(e) {
        e.preventDefault();
        const message = document.getElementById("message");
        let nric = document.getElementById("user-id").value;
        let password = document.getElementById("pin").value;
        const rememberMe = document.getElementById("remember-me").checked;

        if (!nric || !password) {
            message.innerHTML = "Please input all fields!";
            return;
        } else {
            await login(nric, password, rememberMe);
        }
    });

    async function login(nric, password, rememberMe) {
        try {
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nric, password, rememberMe }),
            });
    
            if (response.status === 404) {
                resetFields(); // Clears fields and prompts re-entry
                return;
            }
            if (response.status === 401) {
                
                resetFields(); // Clears fields and prompts re-entry
                return;
            }
            
            if (!response.ok) {
                throw new Error('Error logging in');
            }
    
            const data = await response.json();
            const token = data.token;
    
            // Store token based on rememberMe preference
            if (rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }
    
            
            window.location.href = "accountschi.html";
        } catch (error) {
            
            resetFields();
        }
    }
    

    
    
});

// Check if SpeechRecognition is supported in this browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("此浏览器不支持语音识别。");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let awaitingForgotPassword = true; // Start with forgot password prompt
    let awaitingRememberMeConfirmation = false; // Tracks remember-me prompt
    let awaitingLoginConfirmation = false; // Tracks login confirmation

    // Start with forgot password prompt
    speakBack("欢迎来到 OCBC 银行。您当前在登录页面。您想要登录吗？请说“是”或“不是”。", "zh-CN");

    // Start voice recognition
    startVoiceRecognition();

    function startVoiceRecognition() {
        recognition.start();
        console.log("开始语音识别...");
    }

    recognition.onstart = () => {
        hasMicPermission = true;
        console.log("已授予麦克风权限，正在监听...");
    };

    recognition.onresult = (event) => {
        processRecognitionResult(event);
    };

    recognition.onend = () => {
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        // Capture the spoken word and trim it
        let spokenWord = event.results[0][0].transcript.trim();
    
        // Remove any Chinese full stop (。) but keep other Chinese characters
        spokenWord = spokenWord.replace(/。/g, '');
    
        console.log("识别的词（原始）：", spokenWord);
    
        // Handle forgot password confirmation
        if (awaitingForgotPassword) {
            if (spokenWord === "是") {
                speakBack("您现在在用户 ID 字段。请说“切换到密码”以输入密码，或“完成”以结束。请输入字母。", "zh-CN");
                currentField = 'user-id';
            } else if (spokenWord === "不是") {
                window.location.href = "startpagchi.html";
            } else {
                speakBack("请说“是”或“不是”。", "zh-CN");
                return;
            }
            awaitingForgotPassword = false;
            return;
        }
    
        // Process special characters and letter/numbers
        const specialCharacterMap = {
            "左括号": "[", "右括号": "]", "左括号": "(", "右括号": ")", 
            "下划线": "_", "破折号": "-", "星号": "*", "星号": "*", "星号": "*"
        };
        if (specialCharacterMap[spokenWord]) {
            processSpokenCharacter(specialCharacterMap[spokenWord], spokenWord);
            return;
        }
    
        // Handle remember me confirmation
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "是") {
                document.getElementById("remember-me").checked = true;
                speakBack("已选择“记住我”选项。您准备好登录了吗？请说“是”或“不是”。", "zh-CN");
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "不是") {
                document.getElementById("remember-me").checked = false;
                speakBack("未选择“记住我”选项。您准备好登录了吗？请说“是”或“不是”。", "zh-CN");
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else {
                speakBack("请说“是”或“不是”。", "zh-CN");
                return;
            }
        }
    
        // Handle login confirmation
        if (awaitingLoginConfirmation) {
            if (spokenWord === "是") {
                document.querySelector(".login-btn").click();
                awaitingLoginConfirmation = true;
            } else if (spokenWord === "不是") {
                speakBack("好的，如果您需要帮助，请告诉我。", "zh-CN");
                awaitingLoginConfirmation = false;
            } else {
                speakBack("请说“是”或“不是”。", "zh-CN");
            }
            return;
        }
    
        // Switch between fields based on spoken words
        if (spokenWord.includes("切换到密码") || spokenWord.includes("密码") || spokenWord.includes("pin")) {
            currentField = 'pin';
            speakBack("已切换到密码字段。", "zh-CN");
            return;
        } else if (spokenWord.includes("切换到用户名") || spokenWord.includes("用户名") || spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("已切换到用户名字段。", "zh-CN");
            return;
        }
    
        // Handle character deletion
        if (spokenWord.includes("返回") || spokenWord.includes("删除") || spokenWord.includes("移除") || spokenWord.includes("清除")) {
            deleteLastCharacter();
            return;
        }
    
        // Handle the "done" keyword
        if (spokenWord === "完成") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
    
            // Validation check: If fields are empty, reset and prompt again
            if (!userId || !password) {
                resetFields();
                speakBack("字段不完整。请从用户 ID 开始重新输入字母。", "zh-CN");
                return;
            }
    
            // If both fields are filled, proceed to Remember Me confirmation
            speakBack(`用户 ID：${userId}。密码：${password}。是否记住您的信息？请说“是”或“不是”。`, "zh-CN");
            awaitingRememberMeConfirmation = true;
            return;
        }
    
        // Map common letters, numbers, and symbols
        const spokenToCharMap = {
           "hey": "A", "ay": "A", "a": "A","诶":"A", "bee": "B", "b": "B","be":"B","逼":"B", "see": "C", "sea": "C", "c": "C","C":"C", 
            "dee": "D", "d": "D","的":"D", "ee": "E", "e": "E","一":"E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M","im":"M","an":"N","anne":"N","and":"N","嗯":"N", "en": "N", "n": "N", "oh": "O", "o": "O","哦":"O", 
            "pee": "P","屁":"P", "p": "P", "queue": "Q", "q": "Q","kill":"Q","二":"R", "are": "R", "r": "R", "ess": "S", "s": "S", 
            "tee": "T", "tea": "T", "t": "T", "you": "U", "u": "U","we":"V", "vee": "V", "v": "V", 
            "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z","the":"Z",
            "zero": "0", "one": "1", "two": "2","兔":"2","tree":"3", "three": "3","for":"4", "four": "4", "five": "5", "six": "6", 
            "seven": "7", "eight": "8", "nine": "9", "dollar": "$", "dollar sign": "$", "hash": "#", 
            "hashtag": "#","hash tag":"#", "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%","per cent": "%", 
            "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "=","一锅":"=","equals":"=",
        
            // Numbers with Chinese translations
            "zero": "0", "一": "1", "one": "1", "二": "2", "two": "2", "三": "3", "tree": "3", "three": "3", 
            "四": "4", "for": "4", "four": "4", "五": "5", "five": "5", "六": "6", "six": "6", 
            "七": "7", "seven": "7", "八": "8", "eight": "8", "九": "9", "nine": "9", 
        
            // Special characters with Chinese translations
            "dollar": "$", "dollar sign": "$", "美元": "$", "hash": "#", "hashtag": "#", "hash tag": "#", "井号": "#", 
            "exclamation": "!", "exclamation mark": "!", "感叹号": "!", "at": "@", "艾特": "@", "percent": "%", "per cent": "%", "百分号": "%", 
            "caret": "^", "carrot": "^", "插入符号": "^", "ampersand": "&", "和号": "&", "plus": "+", "加号": "+", 
            "equal": "=", "equals": "=", "等号": "=", "left bracket": "[", "right bracket": "]", 
            "left parenthesis": "(", "right parenthesis": ")", "左括号": "(", "右括号": ")", 
            "left curly bracket": "{", "right curly bracket": "}", "左大括号": "{", "右大括号": "}", 
            "colon": ":", "冒号": ":", "semicolon": ";", "分号": ";", 
            "quote": "\"", "double quote": "\"", "双引号": "\"", "single quote": "'", "单引号": "'", 
            "comma": ",", "逗号": ",", "period": ".", "句号": ".", 
            "slash": "/", "斜杠": "/", "backslash": "\\", "反斜杠": "\\", 
            "pipe": "|", "竖线": "|", "less than": "<", "小于号": "<", 
            "greater than": ">", "大于号": ">", "question mark": "?", "问号": "?", 
            "tilde": "~", "波浪号": "~", "grave": "`", "重音符": "`" 
        };
    
        const character = spokenToCharMap[spokenWord];
        if (character) {
            processSpokenCharacter(character, spokenWord);
        } else {
            speakBack(`错误：无法识别的输入“${spokenWord}”`, "zh-CN");
        }
    }
    

    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            if (currentField === 'user-id') {
                if (/^[a-zA-Z0-9]$/.test(character)) {
                    inputField.value += character;
                    speakBack(`添加了 ${charName}`, "zh-CN");
                } else {
                    speakBack("错误：用户 ID 只能包含字母和数字。", "zh-CN");
                }
            } else if (currentField === 'pin') {
                inputField.value += character;
                speakBack(`添加了 ${charName}`, "zh-CN");
            }
        } else {
            speakBack("错误：字段未找到。", "zh-CN");
        }
    }
    

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        if (inputField && inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            speakBack("已删除最后一个字符", "zh-CN");
        } else {
            speakBack("字段为空，无法删除。", "zh-CN");
        }
    }

    function speakBack(message, lang = "zh-CN") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }
}
