let currentFontSize = 25; // 默认字体大小，仅用于跟踪更改

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // 将字体大小更改应用到.container 和 .content 内的元素
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // 通过移除内联样式重置字体大小
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = ''; // 清除内联样式以恢复为CSS默认样式
    });

    currentFontSize = 25;
}

function resetFields() {
    document.getElementById("user-id").value = "";
    document.getElementById("pin").value = "";
    currentField = 'user-id';

    // 重置语音识别状态
    awaitingForgotPassword = false;
    awaitingRememberMeConfirmation = false;
    awaitingLoginConfirmation = false;

    speakBack("登录失败。请重新输入您的用户ID，逐个字母输入。");
}

document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById("login-button").addEventListener("click", async function(e) {
        e.preventDefault();
        const message = document.getElementById("message");
        let nric = document.getElementById("user-id").value;
        let password = document.getElementById("pin").value;
        const rememberMe = document.getElementById("remember-me").checked;

        if (!nric || !password) {
            message.innerHTML = "请输入所有字段！";
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
                resetFields(); // 清空字段并提示重新输入
                return;
            }
            if (response.status === 401) {
                resetFields(); // 清空字段并提示重新输入
                return;
            }
            
            if (!response.ok) {
                throw new Error('登录错误');
            }
    
            const data = await response.json();
            const token = data.token;
    
            // 根据rememberMe的偏好存储token
            if (rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }
    
            window.location.href = "accountseng.html";
        } catch (error) {
            resetFields();
        }
    }
});


// 检查浏览器是否支持SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("此浏览器不支持语音识别。");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'zh-CN'; // 修改为中文
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let awaitingForgotPassword = true; // 默认开始时是忘记密码提示
    let awaitingRememberMeConfirmation = false; // 追踪“记住我”提示
    let awaitingLoginConfirmation = false; // 追踪登录确认提示

    // 开始时为忘记密码提示
    speakBack("欢迎来到OCBC银行。您当前在登录页面。您想要登录吗？请说‘是’或‘否’。");

    // 开始语音识别
    startVoiceRecognition();

    function startVoiceRecognition() {
        recognition.start();
        console.log("开始语音识别...");
    }

    recognition.onstart = () => {
        hasMicPermission = true;
        console.log("麦克风权限已授权，正在监听...");
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
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("识别到的单词（原始）:", spokenWord);
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("清理后的识别单词:", spokenWord);

        // 处理忘记密码确认
        if (awaitingForgotPassword) {
            if (spokenWord === "yes") {
                speakBack("您当前在用户ID字段。说‘切换到密码’以进入密码字段，或者在完成后说‘完成’。请逐个字母输入。");
                currentField = 'user-id';
            } else if (spokenWord === "no") {
                window.location.href = "startpageeng.html";
            } else {
                speakBack("请说‘是’或‘否’。");
                return;
            }
            awaitingForgotPassword = false;
            return;
        }

        // 处理特殊字符和字母/数字
        const specialCharacterMap = {
            "left bracket": "[", "right bracket": "]", "left parenthesis": "(", "right parenthesis": ")",
            "underscore": "_", "under score": "_", "dash": "-", "star": "*", "asterisk": "*", "estrus": "*"
        };
        if (specialCharacterMap[spokenWord]) {
            processSpokenCharacter(specialCharacterMap[spokenWord], spokenWord);
            return;
        }

        // 处理“记住我”确认
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "yes") {
                document.getElementById("remember-me").checked = true;
                speakBack("‘记住我’选项已选中。您准备好登录了吗？请说‘是’或‘否’。");
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "no") {
                document.getElementById("remember-me").checked = false;
                speakBack("‘记住我’选项已禁用。您准备好登录了吗？请说‘是’或‘否’。");
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else {
                speakBack("请说‘是’或‘否’。");
                return;
            }
        }

        // 处理登录确认
        if (awaitingLoginConfirmation) {
            if (spokenWord === "yes") {
                document.querySelector(".login-btn").click();
                awaitingLoginConfirmation = true;
            } else if (spokenWord === "no") {
                speakBack("好的，如果您需要进一步帮助，请告诉我。");
                awaitingLoginConfirmation = false;
            } else {
                speakBack("请说‘是’或‘否’。");
            }
            return;
        }

        // 切换字段的指令
        if (spokenWord.includes("change to password") || spokenWord.includes("password") || spokenWord.includes("pin")) {
            currentField = 'pin';
            speakBack("切换到密码字段。");
            return;
        } else if (spokenWord.includes("change to username") || spokenWord.includes("user name") || spokenWord.includes("username") || spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("切换到用户名字段。");
            return;
        }

        // 处理删除字符
        if (spokenWord.includes("back") || spokenWord.includes("delete") || spokenWord.includes("remove") || spokenWord.includes("erase")) {
            deleteLastCharacter();
            return;
        }

        // 处理“完成”指令
        if (spokenWord === "done") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;

            // 验证检查：如果字段为空，则重置并提示重新开始
            if (!userId || !password) {
                resetFields();
                speakBack("字段不完整。请从头开始，逐个字母输入您的用户ID。");
                return;
            }

            // 如果两个字段都已填充，则进行“记住我”确认
            speakBack(`用户ID: ${userId}. 密码: ${password}. 您希望我记住您吗？请说‘是’或‘否’。`);
            awaitingRememberMeConfirmation = true;
            return;
        }

        // 字母、数字和符号映射
        const spokenToCharMap = {
            "hey": "A", "ay": "A", "a": "A","诶":"A", "bee": "B", "b": "B","be":"B", "see": "C", "sea": "C", "c": "C", 
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
        };

        const character = spokenToCharMap[spokenWord];
        if (character) {
            processSpokenCharacter(character, spokenWord);
        } else {
            speakBack(`错误: 无法识别输入 "${spokenWord}"`);
        }
    }
    

    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            // 检查当前字段是否为'user-id'，并限制输入为字母和数字
            if (currentField === 'user-id') {
                if (/^[a-zA-Z0-9]$/.test(character)) {  // 只允许字母和数字
                    inputField.value += character;
                    speakBack(`已添加 ${charName}`);
                } else {
                    speakBack("错误：用户ID只能包含字母和数字。");
                }
            } else if (currentField === 'pin') {
                // 对PIN允许任何字符
                inputField.value += character;
                speakBack(`已添加 ${charName}`);
            }
        } else {
            speakBack("错误：未找到字段。");
        }
    }
    

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        if (inputField && inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            speakBack("已删除最后一个字符");
        } else {
            speakBack("字段为空，无法删除字符");
        }
    }
}

// 语音反馈
function speakBack(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "zh-CN";
    window.speechSynthesis.speak(speech);
}

function toggleMode() {
    const body = document.body;
    const button = document.getElementById('mode-toggle');

    // Toggle the 'dark-mode' class
    body.classList.toggle('dark-mode');
    
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
        document.getElementById('mode-toggle').textContent = 'Switch to Light Mode';
        document.getElementById('account-selection').classList.add('dark-mode');  // Apply dark mode to account selection
    }
});