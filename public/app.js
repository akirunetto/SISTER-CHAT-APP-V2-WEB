const socket = io("https://sister-chat-app-v2-web-production.up.railway.app", {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5
});

// Theme & Dark Mode Logic
const themePink = document.getElementById('theme-pink');
const themeGreen = document.getElementById('theme-green');
const themeBlue = document.getElementById('theme-blue');
const toggleDark = document.getElementById('toggle-dark');

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chat_theme', theme);
};

const applyDarkMode = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        toggleDark.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        toggleDark.textContent = '🌙';
    }
    localStorage.setItem('chat_dark', isDark);
};

// Load preferences on startup
const savedTheme = localStorage.getItem('chat_theme') || 'pink';
const savedDark = localStorage.getItem('chat_dark') === 'true';
applyTheme(savedTheme);
applyDarkMode(savedDark);

themePink.onclick = () => applyTheme('pink');
themeGreen.onclick = () => applyTheme('green');
themeBlue.onclick = () => applyTheme('blue');
toggleDark.onclick = () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyDarkMode(!isDark);
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

let myNickname = '';

const emojis = ['😀', '😂', '😍', '😭', '👍', '🙏', '🔥', '🎉', '🤔', '😎'];

// Initialize Emoji Picker
emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.className = 'win-btn w-8 h-8 flex items-center justify-center text-xl';
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
    if (nickname) {
        myNickname = nickname;
        socket.emit('join', nickname);

        loginModal.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        chatContainer.classList.add('flex');
        myNicknameDisplay.textContent = myNickname;

        setTimeout(() => messageInput.focus(), 100);
    } else {
        alert("Please enter a nickname.");
    }
};

joinBtn.addEventListener('click', joinChat);
nicknameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
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

// Helper: Create Message Bubble (Retro Blocky Style)
const appendMessage = (data, isMine) => {
    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-2`;

    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = `max-w-[85%] sm:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`;

    const metaInfo = document.createElement('span');
    metaInfo.className = 'text-[16px] text-[var(--win-text)] opacity-70 mb-1 px-1';
    metaInfo.textContent = `${data.nickname} [${data.timestamp}]`;

    const bubble = document.createElement('div');

    if (data.type === 'location') {
        const mapUrl = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
        bubble.className = `border-2 border-black break-words ${isMine ? 'bg-theme-bubbleMine text-[var(--win-text)]' : 'bg-theme-bubbleOther text-[var(--win-text)]'}`;
        bubble.style.boxShadow = '3px 3px 0px rgba(0,0,0,1)';
        
        bubble.innerHTML = `
            <a href="${mapUrl}" target="_blank" class="block w-48 sm:w-64 cursor-pointer hover:bg-gray-200 transition-colors text-black bg-white">
                <div class="h-24 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/pixels.png')] bg-gray-300 border-b-2 border-black">
                    <span class="text-4xl hover:scale-125 transition-transform">📍</span>
                </div>
                <div class="p-2">
                    <div class="font-bold underline mb-1">MAP.EXE</div>
                    <div class="text-base">LAT: ${data.lat.toFixed(4)}</div>
                    <div class="text-base">LON: ${data.lon.toFixed(4)}</div>
                </div>
            </a>
        `;
    } else {
        bubble.className = `border-2 border-black px-3 py-1 break-words w-full text-xl ${isMine ? 'bg-theme-bubbleMine text-[var(--win-text)]' : 'bg-theme-bubbleOther text-[var(--win-text)]'}`;
        bubble.style.boxShadow = '3px 3px 0px rgba(0,0,0,1)';
        bubble.textContent = data.message;
    }

    bubbleContainer.appendChild(metaInfo);
    bubbleContainer.appendChild(bubble);
    wrapper.appendChild(bubbleContainer);
    
    chatBox.appendChild(wrapper);
    scrollToBottom();
};

// Socket Listeners
socket.on('systemMessage', (msg) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex justify-center w-full my-3';
    
    const bubble = document.createElement('div');
    bubble.className = 'bg-[var(--win-surface)] border-2 border-[var(--win-border-darker)] text-[var(--win-text)] text-[16px] px-3 py-1';
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
