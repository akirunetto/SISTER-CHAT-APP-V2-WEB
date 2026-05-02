const socket = io("https://sister-chat-app-v2-web-production.up.railway.app", {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    autoConnect: false // Do not connect to server until nickname is provided
});

// Theme, Dark Mode & CRT Logic
const themePink = document.getElementById('theme-pink');
const themeGreen = document.getElementById('theme-green');
const themeBlue = document.getElementById('theme-blue');
const toggleDark = document.getElementById('toggle-dark');
const toggleCrt = document.getElementById('toggle-crt');

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chat_theme', theme);
};

const applyDarkMode = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        toggleDark.innerHTML = '☀️ <span class="hidden sm:inline">Light Mode</span>';
    } else {
        document.documentElement.classList.remove('dark');
        toggleDark.innerHTML = '🌙 <span class="hidden sm:inline">Dark Mode</span>';
    }
    localStorage.setItem('chat_dark', isDark);
};

const applyCrt = (isCrt) => {
    if (isCrt) {
        document.body.classList.add('crt-active');
    } else {
        document.body.classList.remove('crt-active');
    }
    localStorage.setItem('chat_crt', isCrt);
};

// Load preferences on startup
const savedTheme = localStorage.getItem('chat_theme') || 'pink';
const savedDark = localStorage.getItem('chat_dark') === 'true';
const savedCrt = localStorage.getItem('chat_crt') === 'true';
applyTheme(savedTheme);
applyDarkMode(savedDark);
applyCrt(savedCrt);

themePink.onclick = () => applyTheme('pink');
themeGreen.onclick = () => applyTheme('green');
themeBlue.onclick = () => applyTheme('blue');
toggleDark.onclick = () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyDarkMode(!isDark);
};
toggleCrt.onclick = () => {
    const isCrt = document.body.classList.contains('crt-active');
    applyCrt(!isCrt);
};

// UI Elements
const loginModal = document.getElementById('login-modal');
const nicknameInput = document.getElementById('nickname-input');
const joinBtn = document.getElementById('join-btn');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const locationBtn = document.getElementById('location-btn');
const myNicknameDisplay = document.getElementById('my-nickname-display');
const usersList = document.getElementById('users-list');
const statusSelect = document.getElementById('status-select');
const typingIndicator = document.getElementById('typing-indicator');

let myNickname = '';
let typingTimer;
let activeTypers = new Set();

const emojis = ['😀', '😂', '😍', '😭', '👍', '🙏', '🔥', '🎉', '🤔', '😎'];

// Initialize Emoji Picker
emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.className = 'win-btn w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl';
    btn.onclick = () => {
        messageInput.value += emoji;
        emojiPicker.classList.add('hidden');
        messageInput.focus();
    };
    emojiPicker.appendChild(btn);
});

// Join Chat
const joinChat = () => {
    const nickname = nicknameInput.value.trim();
    const loginError = document.getElementById('login-error');
    
    if (nickname) {
        myNickname = nickname;
        loginError.classList.add('hidden');
        
        socket.connect(); // Connect only after nickname is provided
        socket.emit('join', nickname);

        loginModal.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        chatContainer.classList.add('flex');
        myNicknameDisplay.textContent = myNickname;

        setTimeout(() => messageInput.focus(), 100);
    } else {
        loginError.classList.remove('hidden');
        nicknameInput.focus();
    }
};

joinBtn.addEventListener('click', joinChat);
nicknameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

// Presence Toggle
statusSelect.addEventListener('change', (e) => {
    socket.emit('changeStatus', e.target.value);
});

// Typing Logic
messageInput.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1500);
});

// Toggle Emoji Picker
emojiBtn.addEventListener('click', () => {
    emojiPicker.classList.toggle('hidden');
});

// Hide Emoji Picker when clicking outside
document.addEventListener('click', (e) => {
    if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.add('hidden');
    }
});

// Send Message
const sendMessage = () => {
    const msg = messageInput.value.trim();
    if (msg) {
        socket.emit('chatMessage', msg);
        messageInput.value = '';
        socket.emit('stopTyping');
        clearTimeout(typingTimer);
    }
};

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
        emojiPicker.classList.add('hidden');
    }
});

// Share Location
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        locationBtn.disabled = true;
        locationBtn.textContent = '...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                socket.emit('locationShare', {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                locationBtn.disabled = false;
                locationBtn.textContent = '📍';
            },
            (error) => {
                alert("Unable to retrieve location.");
                console.error(error);
                locationBtn.disabled = false;
                locationBtn.textContent = '📍';
            }
        );
    } else {
        alert("Geolocation is not supported.");
    }
});

// Helper: Scroll to bottom
const scrollToBottom = () => {
    chatBox.scrollTop = chatBox.scrollHeight;
};

let lastDateStr = '';

// Helper: Create Message Bubble (Retro Blocky Style)
const appendMessage = (data, isMine) => {
    // Parsing ISO String using Jakarta timezone
    const msgDate = new Date(data.timestamp);
    let wibDate = '';
    let wibTime = data.timestamp; // Fallback to raw string if old format

    // Check if timestamp is a valid parsable Date (ISO string)
    if (!isNaN(msgDate.getTime())) {
        const dateOpts = { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOpts = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        
        wibDate = msgDate.toLocaleDateString('id-ID', dateOpts);
        wibTime = msgDate.toLocaleTimeString('en-GB', timeOpts).replace(/\./g, ':');

        // Date Separator UI
        if (wibDate !== lastDateStr) {
            lastDateStr = wibDate;
            const dateWrapper = document.createElement('div');
            dateWrapper.className = 'flex justify-center w-full my-4';
            dateWrapper.innerHTML = `<div class="bg-[var(--titlebar-color)] text-[var(--titletext-color)] px-4 py-1 text-sm sm:text-base font-bold border-2 border-[var(--win-border-darker)] shadow-[2px_2px_0px_rgba(0,0,0,1)]">${wibDate}</div>`;
            chatBox.appendChild(dateWrapper);
        }
    } else {
        // If it's the old format (just HH.MM.SS), format it nicely with colons if needed
        if (typeof wibTime === 'string') {
            wibTime = wibTime.replace(/\./g, ':');
        }
    }

    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-2`;

    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = `max-w-[85%] sm:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`;

    const metaInfo = document.createElement('span');
    metaInfo.className = 'text-[14px] sm:text-[16px] text-[var(--win-text)] opacity-70 mb-1 px-1';
    
    // Strict WIB time format
    metaInfo.textContent = `${data.nickname} [${wibTime}]`;

    const bubble = document.createElement('div');

    if (data.type === 'location') {
        const mapUrl = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
        bubble.className = `border-2 border-black break-words ${isMine ? 'bg-theme-bubbleMine text-[var(--win-text)]' : 'bg-theme-bubbleOther text-[var(--win-text)]'}`;
        bubble.style.boxShadow = '3px 3px 0px rgba(0,0,0,1)';
        
        bubble.innerHTML = `
            <a href="${mapUrl}" target="_blank" class="block w-48 sm:w-64 cursor-pointer hover:bg-gray-200 transition-colors text-black bg-white">
                <div class="h-20 sm:h-24 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/pixels.png')] bg-gray-300 border-b-2 border-black">
                    <span class="text-3xl sm:text-4xl hover:scale-125 transition-transform">📍</span>
                </div>
                <div class="p-2">
                    <div class="font-bold underline mb-1 text-sm sm:text-base">MAP.EXE</div>
                    <div class="text-xs sm:text-sm">LAT: ${data.lat.toFixed(4)}</div>
                    <div class="text-xs sm:text-sm">LON: ${data.lon.toFixed(4)}</div>
                </div>
            </a>
        `;
    } else {
        bubble.className = `border-2 border-black px-3 py-1 break-words w-full text-lg sm:text-xl ${isMine ? 'bg-theme-bubbleMine text-[var(--win-text)]' : 'bg-theme-bubbleOther text-[var(--win-text)]'}`;
        bubble.style.boxShadow = '3px 3px 0px rgba(0,0,0,1)';
        bubble.textContent = data.message;
    }

    bubbleContainer.appendChild(metaInfo);
    bubbleContainer.appendChild(bubble);
    wrapper.appendChild(bubbleContainer);
    
    chatBox.appendChild(wrapper);
    scrollToBottom();
};

const updateTypingIndicator = () => {
    if (activeTypers.size === 0) {
        typingIndicator.textContent = '';
    } else {
        const typersArray = Array.from(activeTypers);
        if (typersArray.length === 1) {
            typingIndicator.textContent = `${typersArray[0]} is typing...`;
        } else {
            typingIndicator.textContent = `${typersArray.join(', ')} are typing...`;
        }
    }
};

// Socket Listeners
socket.on('systemMessage', (msg) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-center w-full my-3';
    
    const bubble = document.createElement('div');
    bubble.className = 'bg-[var(--win-surface)] border-2 border-[var(--win-border-darker)] text-[var(--win-text)] text-[14px] sm:text-[16px] px-3 py-1';
    bubble.textContent = `*** ${msg} ***`;
    
    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);
    scrollToBottom();
});

socket.on('chatMessage', (data) => {
    const isMine = data.nickname === myNickname;
    appendMessage(data, isMine);
});

socket.on('locationShare', (data) => {
    const isMine = data.nickname === myNickname;
    appendMessage(data, isMine);
});

socket.on('chatHistory', (history) => {
    chatBox.innerHTML = '';
    lastDateStr = ''; // Reset date tracker before loading history
    history.forEach(data => {
        const isMine = data.nickname === myNickname;
        appendMessage(data, isMine);
    });
});

socket.on('updateUserList', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        let icon = '🟢';
        if (user.status === 'Busy') icon = '🔴';
        if (user.status === 'Idle') icon = '🌙';

        const uDiv = document.createElement('div');
        uDiv.className = 'flex items-center gap-2 mb-1';
        uDiv.innerHTML = `<span class="text-xs sm:text-sm">${icon}</span> <span class="truncate">${user.nickname}</span>`;
        usersList.appendChild(uDiv);
    });
});

socket.on('typing', (nickname) => {
    if (nickname !== myNickname) {
        activeTypers.add(nickname);
        updateTypingIndicator();
    }
});

socket.on('stopTyping', (nickname) => {
    activeTypers.delete(nickname);
    updateTypingIndicator();
});
