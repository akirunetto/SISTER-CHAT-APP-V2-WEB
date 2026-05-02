const socket = io("https://sister-chat-app-v2-web-production.up.railway.app", {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5
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
        // Hapus padding bawaan dan ubah style bubble khusus untuk location preview
        bubble.className = `overflow-hidden rounded-2xl ${isMine ? 'rounded-tr-sm bg-blue-600 border border-blue-500' : 'rounded-tl-sm bg-white border border-slate-200'} shadow-md flex flex-col w-60 sm:w-64 transform transition hover:shadow-lg`;
        
        const mapUrl = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
        
        bubble.innerHTML = `
            <a href="${mapUrl}" target="_blank" class="block w-full cursor-pointer group relative">
                <!-- Peta Mockup / Preview Area -->
                <div class="h-32 bg-slate-200 w-full relative overflow-hidden flex items-center justify-center">
                    <div class="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 mix-blend-multiply"></div>
                    
                    <!-- Pin Animasi -->
                    <div class="z-10 transform group-hover:-translate-y-2 group-hover:scale-110 transition duration-300 drop-shadow-xl flex flex-col items-center">
                        <span class="text-4xl">📍</span>
                        <div class="w-4 h-1 bg-black/20 rounded-full mt-1 blur-[1px]"></div>
                    </div>
                </div>
                
                <!-- Keterangan Bawah -->
                <div class="p-3 ${isMine ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'} border-t ${isMine ? 'border-blue-500' : 'border-slate-100'}">
                    <div class="font-bold text-sm mb-0.5 flex items-center gap-1.5">
                        <span class="text-emerald-500">🌍</span> Location
                    </div>
                    <div class="text-[11px] opacity-80 truncate">
                        ${data.lat.toFixed(5)}, ${data.lon.toFixed(5)}
                    </div>
                </div>
            </a>
        `;
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
