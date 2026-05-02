const socket = io("https://sister-chat-app-v2-web.up.railway.app", {
    // ⚠️ GANTI 'sister-chat-app-v2-web.up.railway.app' dengan Public Domain dari Railway-mu
    transports: ['websocket', 'polling'] // Memastikan koneksi tidak diblokir oleh beberapa jenis proxy
});

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
    const span = document.createElement('span');
    span.textContent = emoji;
    span.className = 'cursor-pointer text-2xl hover:scale-125 transition-transform text-center select-none';
    span.onclick = () => {
        messageInput.value += emoji;
        emojiPicker.classList.add('hidden');
        messageInput.focus();
    };
    emojiPicker.appendChild(span);
});

// Join Chat
const joinChat = () => {
    const nickname = nicknameInput.value.trim();
    if (nickname) {
        myNickname = nickname;
        socket.emit('join', nickname);

        loginModal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            loginModal.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            chatContainer.classList.add('flex');
            myNicknameDisplay.textContent = myNickname;

            setTimeout(() => messageInput.focus(), 100);
        }, 300);
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
        locationBtn.classList.add('opacity-50', 'cursor-not-allowed');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                socket.emit('locationShare', {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                locationBtn.disabled = false;
                locationBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            },
            (error) => {
                alert("Unable to retrieve your location.");
                console.error(error);
                locationBtn.disabled = false;
                locationBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Helper: Scroll to bottom
const scrollToBottom = () => {
    chatBox.scrollTop = chatBox.scrollHeight;
};

// Helper: Create Message Bubble
const appendMessage = (data, isMine) => {
    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`;

    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = `max-w-[75%] sm:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`;

    const metaInfo = document.createElement('span');
    metaInfo.className = 'text-[11px] text-slate-500 mb-1 px-1 font-medium';
    metaInfo.textContent = `${data.nickname} • ${data.timestamp}`;

    const bubble = document.createElement('div');

    // Style logic
    if (isMine) {
        bubble.className = 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm break-words w-full text-sm sm:text-base';
    } else {
        bubble.className = 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm break-words w-full text-sm sm:text-base';
    }

    if (data.type === 'location') {
        const link = document.createElement('a');
        link.href = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
        link.target = '_blank';
        link.className = `flex items-center gap-2 hover:underline ${isMine ? 'text-white' : 'text-blue-600 font-semibold'}`;
        link.innerHTML = `<span class="text-lg">📍</span> Shared a location`;
        bubble.appendChild(link);
    } else {
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
    wrapper.className = 'flex justify-center w-full my-3 animate-fade-in';

    const bubble = document.createElement('div');
    bubble.className = 'bg-slate-200 text-slate-600 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-inner tracking-wide';
    bubble.textContent = msg;

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

// Add custom animation styles dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);
