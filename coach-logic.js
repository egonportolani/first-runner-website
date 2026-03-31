document.addEventListener('DOMContentLoaded', () => {
    const voiceBtn = document.getElementById('voice-btn');
    const terminalContent = document.getElementById('terminal-content');
    const audioWavePath = document.getElementById('audio-wave');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech Recognition not supported in this browser.");
        voiceBtn.innerHTML = '<i data-lucide="mic-off" class="w-3 h-3"></i><span>NO MIC SUPPORT</span>';
        voiceBtn.classList.replace('text-cyan-400', 'text-red-400');
        if (window.lucide) window.lucide.createIcons();
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    let isRecording = false;
    let isSpeaking = false;
    
    const synth = window.speechSynthesis;
    let fallbackVoice = null;
    
    function loadVoices() {
        const voices = synth.getVoices();
        fallbackVoice = voices.find(voice => voice.lang === 'pt-BR' || voice.lang === 'pt_BR') || voices[0];
    }
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    function addTerminalMessage(role, text) {
        const p = document.createElement('p');
        p.className = "text-[10px] md:text-xs tracking-[0.1em] uppercase leading-relaxed font-bold break-words";
        
        if (role === 'USER') {
            p.classList.add('text-white');
            p.innerHTML = `> [RUNNER]: "${text}"`;
        } else {
            p.classList.add('text-cyan-300');
            p.innerHTML = `> [ORACLE]: "${text}"`;
        }
        
        terminalContent.appendChild(p);
        
        const chatScroller = document.getElementById('chat-scroller');
        if (chatScroller) chatScroller.scrollTop = chatScroller.scrollHeight;
    }

    function toggleWaveAnimation(isActive) {
        if (!audioWavePath) return;
        if (isActive) {
            audioWavePath.classList.add('animate-pulse');
            audioWavePath.style.strokeWidth = "3";
            audioWavePath.style.filter = "drop-shadow(0 0 10px #00f3ff)";
        } else {
            audioWavePath.classList.remove('animate-pulse');
            audioWavePath.style.strokeWidth = "1.5";
            audioWavePath.style.filter = "none";
        }
    }

    function speakText(text) {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }
        
        const utterThis = new SpeechSynthesisUtterance(text);
        if (fallbackVoice) utterThis.voice = fallbackVoice;
        
        utterThis.pitch = 0.8;
        utterThis.rate = 1.2;
        
        utterThis.onstart = () => {
             isSpeaking = true;
             toggleWaveAnimation(true);
        };
        
        utterThis.onend = () => {
             isSpeaking = false;
             toggleWaveAnimation(false);
        };
        
        utterThis.onerror = (e) => {
             console.error('SpeechSynthesisUtterance.onerror', e);
             isSpeaking = false;
             toggleWaveAnimation(false);
        };
        
        synth.speak(utterThis);
    }
    
    async function sendMessageToAPI(text) {
        try {
            voiceBtn.innerHTML = '<i data-lucide="loader" class="w-3 h-3 animate-spin"></i><span>PROCESSING</span>';
            voiceBtn.classList.replace('text-cyan-400', 'text-purple-400');
            if (window.lucide) window.lucide.createIcons();
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });
            
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            
            let geminiText = "Erro na matriz neural.";
            try {
                let cleanStr = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanStr);
                if (parsed.texto) geminiText = parsed.texto;
            } catch (e) {
                geminiText = data.text;
            }
            
            addTerminalMessage('ORACLE', geminiText);
            speakText(geminiText);
            
        } catch (error) {
            console.error(error);
            addTerminalMessage('ORACLE', "Falha na conexão com o satélite.");
        } finally {
            resetVoiceBtn();
        }
    }
    
    function resetVoiceBtn() {
        isRecording = false;
        voiceBtn.innerHTML = '<i data-lucide="mic" class="w-3 h-3 group-hover:scale-110 transition-transform"></i><span>VOICE LINK</span>';
        voiceBtn.classList.replace('text-purple-400', 'text-cyan-400');
        voiceBtn.classList.replace('text-red-400', 'text-cyan-400');
        if (window.lucide) window.lucide.createIcons();
    }
    
    recognition.onstart = function() {
        isRecording = true;
        voiceBtn.innerHTML = '<i data-lucide="mic" class="w-3 h-3 animate-pulse text-red-500"></i><span class="text-red-500">LISTENING...</span>';
        if (window.lucide) window.lucide.createIcons();
    };
    
    recognition.onspeechend = function() {
        recognition.stop();
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        addTerminalMessage('USER', transcript);
        sendMessageToAPI(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
        addTerminalMessage('ORACLE', "Erro no microfone local: " + event.error);
        resetVoiceBtn();
    };
    
    voiceBtn.addEventListener('click', () => {
        if (isSpeaking) {
            synth.cancel();
            isSpeaking = false;
            toggleWaveAnimation(false);
            return;
        }
        
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
            // Start the voices loading trick if missing (Chrome bug on first run)
            if(!fallbackVoice) loadVoices(); 
        }
    });

    // Handle "LIVE VISION" generic button
    const visionBtn = document.getElementById('vision-btn');
    if (visionBtn) {
        visionBtn.addEventListener('click', () => {
            // Send default text for vision logic
            addTerminalMessage('USER', '[ENVIOU MAPA LOCAL - SOLICITA ANÁLISE VISUAL]');
            sendMessageToAPI('Estou correndo na Avenida Industrial, me dê sua análise baseada nesse terreno.');
        });
    }
});
