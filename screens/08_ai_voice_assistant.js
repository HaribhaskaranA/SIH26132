// Mobile Screen 08: Dedicated Google Gemini Agri AI Voice & Text Assistant
const AiVoiceAssistantScreen = {
  recognition: null,
  isListening: false,

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const lang = I18nService.getLanguage();
    const langName = I18nService.getLanguageName();
    const speechCode = I18nService.getSpeechLangCode();

    const welcomeMessages = {
      en: `Hello Farmer #${farmerId}! I am EARTHWORM Agri AI, your multilingual voice & market advisor for ${farm.district} region. How can I assist you with ${farm.crop} market rates, logistics, or legal protection today?`,
      ta: `வணக்கம் விவசாயி #${farmerId}! நான் எர்த்வார்ம் வேளாண் AI (${farm.district} மண்டலம்). இன்றைய ${farm.crop} சந்தை விலை, போக்குவரத்து, அல்லது சட்டப் பாதுகாப்பு பற்றி குரல் மூலமாகவோ தட்டச்சு செய்தோ கேளுங்கள்.`,
      hi: `नमस्ते किसान #${farmerId}! मैं अर्थवर्म कृषि AI हूँ (${farm.district} क्षेत्र). आज के ${farm.crop} मंडी भाव, परिवहन या कानूनी सुरक्षा के बारे में बोलकर या लिखकर पूछें।`,
      te: `నమస్కారం రైతు #${farmerId}! నేను ఎర్త్‌వార్మ్ వ్యవసాయ AI (${farm.district} ప్రాంతం). నేటి ${farm.crop} మార్కెట్ ధరలు, రవాణా లేదా చట్టపరమైన సలహాల గురించి మాట్లాడి లేదా టైప్ చేసి అడగండి.`,
      kn: `ನಮಸ್ಕಾರ ರೈತ #${farmerId}! ನಾನು ಅರ್ಥ್‌ವರ್ಮ್ ಕೃಷಿ AI (${farm.district} ಪ್ರದೇಶ). ಇಂದಿನ ${farm.crop} ಮಾರುಕಟ್ಟೆ ದರ, ಸಾರಿಗೆ ಅಥವಾ ಕಾನೂನು ಸಲಹೆಗಳ ಬಗ್ಗೆ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೇಳಿ.`
    };

    const chips = {
      en: [
        "🍅 Today's Tomato APMC rate & demand",
        "🏛️ How to file dispute for delayed payment?",
        "🚚 How to book shared freight to save 64%?",
        "❄️ Cold storage holding math for my crop"
      ],
      ta: [
        "🍅 இன்றைய தக்காளி மண்டி விலை என்ன?",
        "🏛️ பணம் தராத வியாபாரி மீது புகார் செய்வது எப்படி?",
        "🚚 பங்கு வண்டி லாரி புக் செய்வது எப்படி?",
        "❄️ கோல்ட் ஸ்டோரேஜ் கட்டணம் & லாபம் எவ்வளவு?"
      ],
      hi: [
        "🍅 आज टमाटर का थोक मंडी भाव क्या है?",
        "🏛️ भुगतान में देरी पर APMC शिकायत कैसे करें?",
        "🚚 साझा लॉजिस्टिक्स से भाड़ा कैसे बचाएं?",
        "❄️ कोल्ड स्टोरेज में फसल रोकने का गणित क्या है?"
      ],
      te: [
        "🍅 నేటి టమాటా హోల్‌సేల్ మార్కెట్ ధర ఎంత?",
        "🏛️ వ్యాపారి చెల్లింపు ఆలస్యం చేస్తే చట్టపరమైన చర్యలేమిటి?",
        "🚚 తక్కువ ఖర్చుతో రవాణా వాహనం ఎలా బుక్ చేయాలి?",
        "❄️ కోల్డ్ స్టోరేజ్ అద్దె మరియు లాభం ఎంత?"
      ],
      kn: [
        "🍅 ಇಂದಿನ ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ದರ ಎಷ್ಟು?",
        "🏛️ ವ್ಯಾಪಾರಿ ಹಣ ನೀಡದಿದ್ದರೆ APMC ದೂರು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?",
        "🚚 ಹಂಚಿಕೆಯ ಸಾರಿಗೆ ವಾಹನ ಬುಕ್ ಮಾಡುವುದು ಹೇಗೆ?",
        "❄️ ಶೀತಲಗೃಹ ಸಂಗ್ರಹಣಾ ಲಾಭದ ಲೆಕ್ಕಾಚಾರವೇನು?"
      ]
    };

    const currentChips = chips[lang] || chips['en'];
    const currentWelcome = welcomeMessages[lang] || welcomeMessages['en'];

    container.innerHTML = `
      <!-- Brand Hero Header -->
      <div class="m-card" style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); color: white; padding: 14px; border: none; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(6,78,59,0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #34d399; background: #ffffff;">
              <img src="assets/logo.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #ffffff;">🤖 ${I18nService.t('title_ai_chat')}</div>
              <div style="font-size: 10.5px; color: #a7f3d0; font-weight: 700;">
                Google Gemini Agritech Engine • ${langName} (${speechCode})
              </div>
            </div>
          </div>
          <span class="m-badge m-badge-green" style="font-size: 9.5px; font-weight: 800;">● Gemini 3.6 Flash</span>
        </div>
      </div>

      <!-- VOICE INPUT CONTROLLER CARD -->
      <div class="m-card" style="text-align: center; border: 2px solid #86efac; background: #f0fdf4;">
        <div style="font-size: 12px; font-weight: 800; color: #166534; margin-bottom: 6px;">
          🎙️ ${I18nService.t('btn_voice_tap')} (${langName})
        </div>
        <p style="font-size: 10.5px; color: #14532d; margin-bottom: 12px;">
          Tap the big microphone button below and ask your question naturally in <strong>${langName}</strong>:
        </p>

        <!-- Animated Microphone Button -->
        <button id="btnVoiceMic" class="m-btn" onclick="AiVoiceAssistantScreen.toggleVoiceRecognition()" style="width: 78px; height: 78px; border-radius: 50%; margin: 0 auto 10px auto; background: #15803d; color: #ffffff; font-size: 32px; display: flex; align-items: center; justify-content: center; border: 3px solid #86efac; box-shadow: 0 4px 15px rgba(21,128,61,0.3); cursor: pointer; transition: all 0.25s;">
          🎙️
        </button>

        <div id="voiceStatusText" style="font-size: 11.5px; font-weight: 800; color: #15803d; min-height: 18px;">
          ${I18nService.t('btn_voice_tap')}
        </div>

        <div id="liveVoiceTranscript" style="display: none; margin-top: 8px; font-size: 11px; background: #ffffff; border: 1.5px dashed #16a34a; padding: 8px 12px; border-radius: 8px; color: #0f381e; font-style: italic;">
          <!-- Live speech text appears here -->
        </div>
      </div>

      <!-- Dynamic Chat Conversation Stream -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">💬 ${I18nService.t('title_ai_chat')}</div>
          <button class="m-btn m-btn-outline" onclick="AiVoiceAssistantScreen.clearChat()" style="width: auto; padding: 3px 8px; font-size: 9.5px;">
            🗑️ Clear
          </button>
        </div>

        <!-- Quick Query Suggestion Chips -->
        <div style="font-size: 10px; font-weight: 700; color: var(--primary-forest); margin-bottom: 4px;">
          💡 ${I18nService.t('lbl_quick_topics')} (${langName}):
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 10px;">
          ${currentChips.map(c => `
            <button class="m-voice-chip" onclick="AiVoiceAssistantScreen.handleChipClick('${c.replace(/'/g, "\\'")}')" style="white-space: nowrap; font-size: 10px;">
              ${c}
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Chat Stream -->
        <div id="aiVoiceChatStream" class="m-chat-stream" style="max-height: 320px; min-height: 180px;">
          <div class="m-bubble m-bubble-ai">
            ${currentWelcome}
          </div>
        </div>

        <!-- Text Input & Send Row -->
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <input type="text" id="aiVoiceTextInput" class="m-input" placeholder="${I18nService.t('lbl_prompt_placeholder')}" onkeypress="if(event.key==='Enter') AiVoiceAssistantScreen.sendTextMessage()" style="font-size: 12px;">
          <button class="m-btn m-btn-green" style="width: auto; padding: 10px 16px; font-size: 12px;" onclick="AiVoiceAssistantScreen.sendTextMessage()">
            ${I18nService.t('btn_ask_ai')}
          </button>
        </div>
      </div>
    `;
  },

  handleChipClick: function(query) {
    const input = document.getElementById('aiVoiceTextInput');
    if (input) {
      input.value = query;
      this.sendTextMessage();
    }
  },

  sendTextMessage: function() {
    const input = document.getElementById('aiVoiceTextInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    this.submitAiQuery(query);
    input.value = '';
  },

  submitAiQuery: function(queryText) {
    const chatStream = document.getElementById('aiVoiceChatStream');
    if (!chatStream) return;

    // Render User Bubble
    chatStream.innerHTML += `<div class="m-bubble m-bubble-user" style="display: flex; align-items: center; gap: 6px;"><span>🗣️</span><span>${queryText}</span></div>`;
    chatStream.scrollTop = chatStream.scrollHeight;

    const loadingId = 'loadingBubble_' + Date.now();
    const lang = I18nService.getLanguage();
    const loadingTexts = {
      en: "⏳ Google Gemini 3.6 Flash is analyzing and typing full advisory...",
      ta: "⏳ கூகுள் ஜெமினி AI முழுமையான ஆலோசனையைத் தட்டச்சு செய்கிறது...",
      hi: "⏳ गूगल जेमिनी AI पूरी सलाह तैयार कर रहा है...",
      te: "⏳ గూగుల్ జెమిని AI పూర్తి సలహాను రికార్డ్ చేస్తోంది...",
      kn: "⏳ ಗೂಗಲ್ ಜೆಮಿನಿ AI ಸಂಪೂರ್ಣ ಸಲಹೆಯನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ..."
    };

    chatStream.innerHTML += `<div class="m-bubble m-bubble-ai" id="${loadingId}">${loadingTexts[lang] || loadingTexts['en']}</div>`;
    chatStream.scrollTop = chatStream.scrollHeight;

    // Call Gemini API with automatic language adherence
    GeminiService.askGemini(queryText, (response, isLive) => {
      const loadElem = document.getElementById(loadingId);
      if (loadElem) {
        let formatted = response
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        loadElem.innerHTML = `
          <div style="font-size: 10px; color: #166534; font-weight: 800; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>🤖 Gemini Agri AI Response</span>
            <span class="m-badge ${isLive ? 'm-badge-green' : 'm-badge-red'}" style="${!isLive ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;' : ''}">
              ${isLive ? '● Live Gemini AI' : '● AI Unavailable'}
            </span>
          </div>
          <div style="line-height: 1.55;">${formatted}</div>
        `;
        chatStream.scrollTop = chatStream.scrollHeight;
      }
    });
  },

  toggleVoiceRecognition: function() {
    if (this.isListening) {
      this.stopVoiceRecognition();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("⚠️ Voice Speech Recognition is not supported by this browser. You can type your query in the text box below!");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      const speechCode = I18nService.getSpeechLangCode();
      this.recognition.lang = speechCode;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      const micBtn = document.getElementById('btnVoiceMic');
      const statusText = document.getElementById('voiceStatusText');
      const liveTranscript = document.getElementById('liveVoiceTranscript');

      this.recognition.onstart = () => {
        this.isListening = true;
        if (micBtn) {
          micBtn.style.background = '#dc2626';
          micBtn.style.borderColor = '#fca5a5';
          micBtn.style.transform = 'scale(1.1)';
          micBtn.innerText = '🔴';
        }
        if (statusText) {
          statusText.innerText = I18nService.t('btn_voice_listening');
          statusText.style.color = '#dc2626';
        }
        if (liveTranscript) {
          liveTranscript.style.display = 'block';
          liveTranscript.innerText = "Listening to your voice...";
        }
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (liveTranscript && finalTranscript) {
          liveTranscript.innerText = `"${finalTranscript}"`;
        }
        if (event.results[0].isFinal) {
          const spokenText = event.results[0][0].transcript;
          this.stopVoiceRecognition();
          if (spokenText && spokenText.trim().length > 0) {
            this.submitAiQuery(spokenText.trim());
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.stopVoiceRecognition();
      };

      this.recognition.onend = () => {
        this.stopVoiceRecognition();
      };

      this.recognition.start();
    } catch (err) {
      console.error("Voice recognition start error:", err);
      this.stopVoiceRecognition();
    }
  },

  stopVoiceRecognition: function() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
      this.recognition = null;
    }
    const micBtn = document.getElementById('btnVoiceMic');
    const statusText = document.getElementById('voiceStatusText');
    const liveTranscript = document.getElementById('liveVoiceTranscript');

    if (micBtn) {
      micBtn.style.background = '#15803d';
      micBtn.style.borderColor = '#86efac';
      micBtn.style.transform = 'scale(1)';
      micBtn.innerText = '🎙️';
    }
    if (statusText) {
      statusText.innerText = I18nService.t('btn_voice_tap');
      statusText.style.color = '#15803d';
    }
    if (liveTranscript) {
      setTimeout(() => { if (liveTranscript) liveTranscript.style.display = 'none'; }, 2000);
    }
  },

  clearChat: function() {
    const chatStream = document.getElementById('aiVoiceChatStream');
    if (chatStream) {
      const lang = I18nService.getLanguage();
      const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
      const welcomeMessages = {
        en: `Hello Farmer #${farmerId}! I am ready to answer your questions in English.`,
        ta: `வணக்கம் விவசாயி #${farmerId}! நான் தமிழில் பதிலளிக்கத் தயாராக உள்ளேன்.`,
        hi: `नमस्ते किसान #${farmerId}! मैं हिन्दी में उत्तर देने के लिए तैयार हूँ।`,
        te: `నమస్కారం రైతు #${farmerId}! నేను తెలుగులో సమాధానం ఇవ్వడానికి సిద్ధంగా ఉన్నాను.`,
        kn: `ನಮಸ್ಕಾರ ರೈತ #${farmerId}! ನಾನು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.`
      };
      chatStream.innerHTML = `<div class="m-bubble m-bubble-ai">${welcomeMessages[lang] || welcomeMessages['en']}</div>`;
    }
  }
};
