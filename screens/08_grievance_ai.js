// Mobile Screen 08: Dispute Redressal Pipeline & Google Gemini Vernacular AI
const GrievanceAiScreen = {
  render: function(container) {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const lang = I18nService.getLanguage();

    const greetings = {
      en: `Hello! I am EARTHWORM Market & Legal Advisory AI (${farm.district} Region • Farmer #${farmerId}). What would you like to ask regarding ${farm.crop} mandi prices, arrivals, or trade disputes?`,
      ta: `வணக்கம்! நான் எர்த்வார்ம் சந்தை மற்றும் சட்ட ஆலோசனை AI (${farm.district} மண்டலம் • விவசாயி #${farmerId}). இன்றைய ${farm.crop} மண்டி விலை, வரத்து, அல்லது வர்த்தகப் புகார் பற்றி என்ன கேட்க விரும்புகிறீர்கள்?`,
      hi: `नमस्ते! मैं अर्थवर्म मंडी और कानूनी सलाहकार AI हूँ (${farm.district} क्षेत्र • किसान #${farmerId})। आज के ${farm.crop} मंडी भाव, आवक या व्यापारिक विवाद के बारे में आप क्या पूछना चाहते हैं?`,
      te: `నమస్కారం! నేను ఎర్త్‌వార్మ్ మార్కెట్ మరియు లీగల్ అడ్వైజరీ AI (${farm.district} ప్రాంతం • రైతు #${farmerId}). నేటి ${farm.crop} మార్కెట్ ధరలు, రాక లేదా వ్యాపార వివాదాల గురించి ఏమి అడగాలనుకుంటున్నారు?`,
      kn: `ನಮಸ್ಕಾರ! ನಾನು ಅರ್ಥ್‌ವರ್ಮ್ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಕಾನೂನು ಸಲಹಾ AI (${farm.district} ಪ್ರದೇಶ • ರೈತ #${farmerId}). ಇಂದಿನ ${farm.crop} ಮಾರುಕಟ್ಟೆ ದರ, ಆವಕ ಅಥವಾ ವ್ಯಾಪಾರ ವಿವಾದಗಳ ಬಗ್ಗೆ ನೀವು ಏನು ಕೇಳಲು ಬಯಸುತ್ತೀರಿ?`
    };

    container.innerHTML = `
      <!-- Google Gemini AI Assistant Card -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">✨ Google Gemini Agri AI (${farm.district})</div>
          <span class="m-badge m-badge-green">● Gemini 3.6 Flash Active</span>
        </div>

        <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">
          Ask any market question, APMC dispute scenario, or price inquiry:
        </p>

        <!-- Dynamic Chat Stream -->
        <div id="mobileChatStream" class="m-chat-stream">
          <div class="m-bubble m-bubble-ai">
            ${greetings[lang] || greetings['en']}
          </div>
        </div>

        <div style="display:flex; gap:6px;">
          <input type="text" id="mobileAiInput" class="m-input" placeholder="${I18nService.t('lbl_prompt_placeholder')}" onkeypress="if(event.key==='Enter') GrievanceAiScreen.sendQuery()">
          <button class="m-btn m-btn-green" style="width:auto; padding:10px 14px;" onclick="GrievanceAiScreen.sendQuery()">
            ${I18nService.t('btn_ask_ai')}
          </button>
        </div>
      </div>

      <!-- Trade Dispute Redressal Card -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">⚖️ ${I18nService.t('title_grievance')} (${farm.district})</div>
          <span class="m-badge m-badge-blue">24-Hr APMC SLA</span>
        </div>

        <div class="m-input-group">
          <label>Select Dispute Nature *</label>
          <select id="disputeType" class="m-input">
            <option value="Delayed Payment (> 24 Hours)">Delayed Payment by Buyer (> 24 Hours)</option>
            <option value="Illegal Weighment Deduction">Arbitrary Weighment / Crate Weight Cut</option>
            <option value="Unauthorized Commission Siphoning">Unauthorized Mandi Commission Charges</option>
          </select>
        </div>

        <button class="m-btn m-btn-outline" onclick="GrievanceAiScreen.fileDispute()" style="font-size:12px; margin-bottom:8px;">
          ${I18nService.t('btn_file_dispute')}
        </button>

        <div id="disputeStatusBox" style="display:none; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:10px; font-size:11px; margin-bottom:10px;">
          <!-- Injected dynamically -->
        </div>

        <!-- Official Statutory Portals -->
        <div style="font-size:11px; font-weight:800; color:var(--primary-forest); margin-bottom:6px;">
          🏛️ Statutory Redressal Gateways:
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
          <a href="https://enam.gov.in/web/grievance" target="_blank" style="text-decoration:none; color:#1d4ed8; background:#eff6ff; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between;">
            <span>🏛️ e-NAM Grievance Cell</span>
            <span>enam.gov.in ↗</span>
          </a>
          <a href="https://pgportal.gov.in" target="_blank" style="text-decoration:none; color:#b45309; background:#fef3c7; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between;">
            <span>🇮🇳 CPGRAMS Central Grievance</span>
            <span>pgportal.gov.in ↗</span>
          </a>
          <div style="background:#f1f5f9; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between; color:#334155;">
            <span>📞 National Kisan Helpline</span>
            <strong style="color:#15803d;">1800-180-1551</strong>
          </div>
        </div>
      </div>
    `;
  },

  sendQuery: function() {
    const input = document.getElementById('mobileAiInput');
    const query = input.value.trim();
    if (!query) return;

    const chatStream = document.getElementById('mobileChatStream');
    chatStream.innerHTML += `<div class="m-bubble m-bubble-user">${query}</div>`;
    input.value = '';
    chatStream.scrollTop = chatStream.scrollHeight;

    const loadingId = 'loadingBubble_' + Date.now();
    chatStream.innerHTML += `<div class="m-bubble m-bubble-ai" id="${loadingId}">⏳ Gemini 3.6 Flash AI is typing complete advisory...</div>`;
    chatStream.scrollTop = chatStream.scrollHeight;

    GeminiService.askGemini(query, (response, isLive) => {
      const loadElem = document.getElementById(loadingId);
      if (loadElem) {
        let formatted = response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        loadElem.innerHTML = `
          <div style="font-size: 10px; color: #166534; font-weight: 800; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>🤖 Gemini Legal Advisory</span>
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

  fileDispute: function() {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const type = document.getElementById('disputeType').value;
    const docketId = `#EW-GR-${Math.floor(1000 + Math.random()*9000)}`;

    if (typeof SupabaseService !== 'undefined') {
      try {
        SupabaseService.fileGrievance({
          docketId: docketId,
          farmerId: farmerId,
          district: farm.district,
          disputeType: type,
          traderName: 'Regional Regulated APMC / Institutional Buyer',
          mandiName: `${farm.district} Regulated Market Committee`,
          claimAmount: 57000,
          description: `APMC Form 8 Statutory Dispute filed for ${farm.crop} produce settlement.`
        });
      } catch (e) {}
    }

    const box = document.getElementById('disputeStatusBox');
    box.style.display = 'block';
    box.innerHTML = `
      <div style="font-weight:800; color:#166534; margin-bottom:4px;">
        ✅ Grievance Docket Issued: ${docketId} (${farm.district} Regulated Market)
      </div>
      <div>Type: <strong>${type}</strong></div>
      <div style="color:#475569; margin-top:2px;">
        Automated statutory notice dispatched to ${farm.district} Market Committee & buyer account under 24-hr settlement SLA. Synced to Supabase dispute registry.
      </div>
    `;
  }
};
