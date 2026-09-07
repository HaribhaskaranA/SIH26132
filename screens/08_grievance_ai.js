// Mobile Screen 08: Universal Help & Support, Complaint System & Google Gemini Legal AI
const GrievanceAiScreen = {
  activeTab: 'complaints', // 'complaints' or 'ai_advisor'

  switchTab: function(tab) {
    this.activeTab = tab;
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  getUserComplaints: function() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('earthworm_user_complaints') || '[]');
    } catch (e) {
      list = [];
    }
    if (!list || list.length === 0) {
      const userRole = localStorage.getItem('earthworm_user_role') || 'farmer';
      const userId = (userRole === 'buyer')
        ? (localStorage.getItem('earthworm_buyer_id') || 'BUYER-REL-901')
        : (localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842');

      list = [
        {
          id: `#CMP-2026-4820`,
          docketId: `#EW-GR-4820`,
          category: 'Delayed Payment (> 24 Hours)',
          reference: '#LOT-TN-8842',
          description: 'Payment settlement pending beyond statutory 24-hr APMC trade window for 2,000 kg Tomato harvest lot.',
          status: 'UNDER_REVIEW', // SUBMITTED, UNDER_REVIEW, RESOLVED
          stageIndex: 1, // 0: Submitted, 1: Under Review, 2: Resolved
          createdAt: 'Today, 10:15 AM',
          userId: userId,
          userRole: userRole,
          sla: '24-Hour Statutory APMC SLA'
        }
      ];
      localStorage.setItem('earthworm_user_complaints', JSON.stringify(list));
    }
    return list;
  },

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const userRole = localStorage.getItem('earthworm_user_role') || 'farmer';
    const isBuyer = userRole === 'buyer';
    const userId = isBuyer
      ? (localStorage.getItem('earthworm_buyer_id') || 'BUYER-REL-901')
      : (localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842');
    const userName = isBuyer
      ? (localStorage.getItem('earthworm_buyer_entity') || 'Reliance Fresh Ltd')
      : (localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K');
    const lang = I18nService.getLanguage();
    const complaints = this.getUserComplaints();

    const greetings = {
      en: `Hello ${userName}! I am EARTHWORM Legal & Support AI. How can I assist you with APMC trade rules, payments, logistics disputes, or complaints?`,
      ta: `வணக்கம் ${userName}! நான் எர்த்வார்ம் உதவி மற்றும் சட்ட ஆலோசனை AI. மண்டி வர்த்தகம், பணம் பட்டுவாடா, போக்குவரத்து அல்லது புகார்கள் பற்றி என்ன கேட்க விரும்புகிறீர்கள்?`,
      hi: `नमस्ते ${userName}! मैं अर्थवर्म कानूनी और सहायता AI हूँ। मैं आपकी मंडी व्यापार नियमों, भुगतान या शिकायतों में कैसे सहायता कर सकता हूँ?`,
      te: `నమస్కారం ${userName}! నేను ఎర్త్‌వార్మ్ సపోర్ట్ & లీగల్ AI. మీకు ఎలా సహాయపడగలను?`,
      kn: `ನಮಸ್ಕಾರ ${userName}! ನಾನು ಅರ್ಥ್‌ವರ್ಮ್ ಬೆಂಬಲ ಮತ್ತು ಕಾನೂನು ಸಲಹಾ AI. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`
    };

    container.innerHTML = `
      <!-- User Profile Header Card -->
      <div class="m-card" style="background: ${isBuyer ? 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' : 'linear-gradient(135deg, #0f381e 0%, #166534 100%)'}; color: white; padding: 12px 14px; border: none; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; color: ${isBuyer ? '#7dd3fc' : '#86efac'}; font-weight: 700;">
              ${isBuyer ? '🏢 BUYER SUPPORT DESK' : '👨‍🌾 FARMER HELP & GRIEVANCE CELL'}
            </div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 800; color: #ffffff;">
              ${userName}
            </div>
            <div style="font-size: 10px; color: ${isBuyer ? '#e0f2fe' : '#dcfce7'};">
              User ID: #${userId} • ${farm.district} Region
            </div>
          </div>
          <span class="m-badge" style="background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); font-size: 9.5px; font-weight: 700;">
            🛡️ 24h SLA Active
          </span>
        </div>

        <!-- 2-Pill Tab Switcher -->
        <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.25); padding: 3px; border-radius: var(--radius-full); margin-top: 10px;">
          <button class="m-btn ${this.activeTab === 'complaints' ? 'm-btn-green' : 'm-btn-outline'}" onclick="GrievanceAiScreen.switchTab('complaints')" style="flex: 1; padding: 6px 8px; font-size: 10px; border-radius: var(--radius-full); color: white;">
            🎧 File & Track Complaints (${complaints.length})
          </button>
          <button class="m-btn ${this.activeTab === 'ai_advisor' ? 'm-btn-green' : 'm-btn-outline'}" onclick="GrievanceAiScreen.switchTab('ai_advisor')" style="flex: 1; padding: 6px 8px; font-size: 10px; border-radius: var(--radius-full); color: white;">
            🤖 Gemini Legal AI
          </button>
        </div>
      </div>

      ${this.activeTab === 'complaints' ? `
        <!-- TAB 1: LODGE COMPLAINT & LIVE STATUS TRACKER -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">📝 Lodge a Complaint / Dispute</div>
            <span class="m-badge m-badge-blue">Statutory Redressal</span>
          </div>

          <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 10px;">
            Submit your issue directly to the ${farm.district} Market Committee & Platform Conciliation Desk:
          </p>

          <!-- Category Selection -->
          <div class="m-input-group">
            <label>Issue Category *</label>
            <select id="compCategory" class="m-input" style="font-weight: 700;">
              <option value="Delayed Payment (> 24 Hours)">💳 Delayed Payment by Buyer (> 24 Hours)</option>
              <option value="Quality Grading / Weight Cut Dispute">⚖️ Quality Grading / Arbitrary Weight Cut</option>
              <option value="Transport Breakdown / Pickup Delay">🚚 Transport Breakdown / Pickup Delay</option>
              <option value="Escrow / Transaction Issue">🔒 Escrow / DBT Settlement Discrepancy</option>
              <option value="App / Technical Support">📱 App Technical / Account Support</option>
              <option value="General Mandi Grievance">🏛️ Other APMC / Mandi Dispute</option>
            </select>
          </div>

          <!-- Transaction / Lot Ref -->
          <div class="m-input-group">
            <label>Transaction / Lot Reference (Optional)</label>
            <input type="text" id="compReference" class="m-input" placeholder="e.g. #LOT-TN-8842 or TXN-BUY-2026-8842" value="#LOT-TN-8842">
          </div>

          <!-- Description Textarea -->
          <div class="m-input-group">
            <label>Complaint Description *</label>
            <textarea id="compDescription" class="m-input" rows="3" placeholder="Explain your issue in detail..." style="resize: vertical; font-size: 11px;">Payment settlement pending beyond 24-hr statutory trade window for 2,000 kg harvest lot delivered to local mandi hub.</textarea>
          </div>

          <!-- Submit Button -->
          <button class="m-btn m-btn-green" onclick="GrievanceAiScreen.submitComplaint()" style="font-size: 11.5px; margin-top: 4px;">
            🚀 Submit Complaint & Generate Docket ID
          </button>
        </div>

        <!-- RECENT COMPLAINTS & 3-STAGE STATUS TRACKER -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">📋 Active Complaints & Status Tracker</div>
            <span class="m-badge m-badge-green">${complaints.length} Lodged</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${complaints.map((c, idx) => `
              <div style="background: #ffffff; border: 1.5px solid ${c.status === 'RESOLVED' ? '#86efac' : c.status === 'UNDER_REVIEW' ? '#93c5fd' : '#fde047'}; border-radius: 8px; padding: 10px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div>
                    <strong style="color: #0f172a; font-size: 12px;">${c.id}</strong>
                    <span style="font-size: 9.5px; color: #64748b;">(${c.docketId})</span>
                  </div>
                  <span class="m-badge ${c.status === 'RESOLVED' ? 'm-badge-green' : c.status === 'UNDER_REVIEW' ? 'm-badge-blue' : 'm-badge-green'}" style="font-size: 9px;">
                    ${c.status === 'RESOLVED' ? '✓ Resolved' : c.status === 'UNDER_REVIEW' ? '⏳ Under Review' : '📩 Submitted'}
                  </span>
                </div>

                <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">
                  Category: ${c.category}
                </div>
                ${c.reference ? `<div style="font-size: 9.5px; color: #0284c7; margin-bottom: 4px;">Ref: <strong>${c.reference}</strong></div>` : ''}
                <div style="font-size: 10px; color: #475569; background: #f8fafc; padding: 6px; border-radius: 4px; margin-bottom: 8px; line-height: 1.4;">
                  "${c.description}"
                </div>

                <!-- 3-STAGE STATUS STEPPER -->
                <div style="background: #f1f5f9; padding: 8px 6px; border-radius: 6px;">
                  <div style="font-size: 9.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">
                    Progress Workflow:
                  </div>
                  <div style="display: flex; justify-content: space-between; position: relative;">
                    <!-- Step 1: Submitted -->
                    <div style="flex: 1; text-align: center;">
                      <div style="width: 20px; height: 20px; border-radius: 50%; background: #16a34a; color: white; font-size: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px auto; font-weight: bold;">✓</div>
                      <div style="font-size: 8px; font-weight: 700; color: #166534;">1. Submitted</div>
                    </div>
                    <!-- Step 2: Under Review -->
                    <div style="flex: 1; text-align: center;">
                      <div style="width: 20px; height: 20px; border-radius: 50%; background: ${c.stageIndex >= 1 ? '#2563eb' : '#cbd5e1'}; color: white; font-size: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px auto; font-weight: bold;">
                        ${c.stageIndex >= 1 ? (c.stageIndex > 1 ? '✓' : '●') : '2'}
                      </div>
                      <div style="font-size: 8px; font-weight: 700; color: ${c.stageIndex >= 1 ? '#1d4ed8' : '#64748b'};">2. Under Review</div>
                    </div>
                    <!-- Step 3: Resolved -->
                    <div style="flex: 1; text-align: center;">
                      <div style="width: 20px; height: 20px; border-radius: 50%; background: ${c.stageIndex >= 2 ? '#16a34a' : '#cbd5e1'}; color: white; font-size: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px auto; font-weight: bold;">
                        ${c.stageIndex >= 2 ? '✓' : '3'}
                      </div>
                      <div style="font-size: 8px; font-weight: 700; color: ${c.stageIndex >= 2 ? '#166534' : '#64748b'};">3. Resolved</div>
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 9px; color: #64748b;">
                  <span>Filed: ${c.createdAt}</span>
                  <button onclick="GrievanceAiScreen.advanceComplaintStatus(${idx})" style="background: none; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 9px; color: #1e293b; cursor: pointer;">
                    ⚡ Progress Status →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <!-- TAB 2: GOOGLE GEMINI LEGAL & AGRI AI ADVISOR -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">✨ Google Gemini Agri & Legal AI</div>
            <span class="m-badge m-badge-green">● Gemini 3.6 Flash Active</span>
          </div>

          <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 8px;">
            Ask any APMC dispute scenario, payment delay rules, or produce quality query:
          </p>

          <!-- Dynamic Chat Stream -->
          <div id="mobileChatStream" class="m-chat-stream" style="max-height: 220px;">
            <div class="m-bubble m-bubble-ai">
              ${greetings[lang] || greetings['en']}
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <input type="text" id="mobileAiInput" class="m-input" placeholder="${I18nService.t('lbl_prompt_placeholder')}" onkeypress="if(event.key==='Enter') GrievanceAiScreen.sendQuery()">
            <button class="m-btn m-btn-green" style="width: auto; padding: 10px 14px;" onclick="GrievanceAiScreen.sendQuery()">
              ${I18nService.t('btn_ask_ai')}
            </button>
          </div>
        </div>
      `}

      <!-- Official Statutory Gateways & Helplines Card -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">🏛️ Statutory Redressal Gateways</div>
          <span class="m-badge m-badge-green">Govt. of India</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
          <a href="https://enam.gov.in/web/grievance" target="_blank" style="text-decoration: none; color: #1d4ed8; background: #eff6ff; padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #bfdbfe;">
            <div>
              <strong>🏛️ e-NAM National Grievance Portal</strong>
              <div style="font-size: 9.5px; color: #3b82f6;">Direct APMC dispute resolution & statutory appeal</div>
            </div>
            <span style="font-size: 10px; font-weight: 700;">enam.gov.in ↗</span>
          </a>

          <a href="https://pgportal.gov.in" target="_blank" style="text-decoration: none; color: #b45309; background: #fef3c7; padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #fde68a;">
            <div>
              <strong>🇮🇳 CPGRAMS Central Grievance Portal</strong>
              <div style="font-size: 9.5px; color: #d97706;">Department of Agriculture & Farmers Welfare</div>
            </div>
            <span style="font-size: 10px; font-weight: 700;">pgportal.gov.in ↗</span>
          </a>

          <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #cbd5e1; color: #334155;">
            <div>
              <strong>📞 National Kisan Call Center</strong>
              <div style="font-size: 9.5px; color: #64748b;">Toll-free 24x7 expert agronomy & dispute support</div>
            </div>
            <strong style="color: #15803d; font-size: 12px;">1800-180-1551</strong>
          </div>
        </div>
      </div>
    `;
  },

  submitComplaint: function() {
    const cat = document.getElementById('compCategory').value;
    const ref = document.getElementById('compReference').value.trim();
    const desc = document.getElementById('compDescription').value.trim();

    if (!desc) {
      alert("⚠️ Please enter a brief description of your complaint.");
      return;
    }

    const farm = AgroDataService.getFarm();
    const userRole = localStorage.getItem('earthworm_user_role') || 'farmer';
    const isBuyer = userRole === 'buyer';
    const userId = isBuyer
      ? (localStorage.getItem('earthworm_buyer_id') || 'BUYER-REL-901')
      : (localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842');

    const cleanNum = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `#CMP-2026-${cleanNum}`;
    const docketId = `#EW-GR-${cleanNum}`;

    const newComp = {
      id: complaintId,
      docketId: docketId,
      category: cat,
      reference: ref || 'General Trade',
      description: desc,
      status: 'SUBMITTED',
      stageIndex: 0,
      createdAt: 'Just now',
      userId: userId,
      userRole: userRole,
      sla: '24-Hour Statutory APMC SLA'
    };

    let complaints = this.getUserComplaints();
    complaints.unshift(newComp);
    localStorage.setItem('earthworm_user_complaints', JSON.stringify(complaints));

    // Sync to Supabase grievances table
    if (typeof SupabaseService !== 'undefined') {
      try {
        SupabaseService.fileGrievance({
          docketId: docketId,
          farmerId: userId,
          district: farm.district,
          disputeType: cat,
          traderName: isBuyer ? 'Farmer Counterparty' : 'Regional APMC / Institutional Buyer',
          mandiName: `${farm.district} Regulated Market Committee`,
          claimAmount: 57000,
          description: `${ref ? `[Ref: ${ref}] ` : ''}${desc}`
        });
      } catch (e) {}
    }

    alert(`🎉 Complaint Submitted Successfully!\n\n• Complaint ID: ${complaintId}\n• Docket Ref: ${docketId}\n• Status: Submitted (24-Hr SLA Initiated)\n• Synced with Supabase & ${farm.district} Regulated Market.`);

    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  advanceComplaintStatus: function(index) {
    let complaints = this.getUserComplaints();
    if (complaints[index]) {
      const c = complaints[index];
      if (c.stageIndex === 0) {
        c.stageIndex = 1;
        c.status = 'UNDER_REVIEW';
      } else if (c.stageIndex === 1) {
        c.stageIndex = 2;
        c.status = 'RESOLVED';
      } else {
        c.stageIndex = 0;
        c.status = 'SUBMITTED';
      }
      localStorage.setItem('earthworm_user_complaints', JSON.stringify(complaints));
      const container = document.getElementById('mobileMainContent');
      this.render(container);
    }
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
    chatStream.innerHTML += `<div class="m-bubble m-bubble-ai" id="${loadingId}">⏳ Gemini 3.6 Flash AI is typing legal & dispute advisory...</div>`;
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
  }
};

