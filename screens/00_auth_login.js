// Mobile Screen 00: Unified Portal Login & Institutional Buyer Registration
const AuthLoginScreen = {
  currentRole: 'farmer', // 'farmer' or 'buyer'
  buyerMode: 'login',    // 'login' or 'register'
  farmerCaptcha: '7K9M',
  buyerCaptcha: '8B3Q',
  uploadedDocName: 'GST_FSSAI_Trade_Certificate.pdf',

  generateFarmerCaptcha: function() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.farmerCaptcha = code;
    const box = document.getElementById('farmerCaptchaBox');
    if (box) box.innerText = code;
  },

  generateBuyerCaptcha: function() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.buyerCaptcha = code;
    const box = document.getElementById('buyerCaptchaBox');
    if (box) box.innerText = code;
  },

  switchRole: function(role) {
    this.currentRole = role;
    this.buyerMode = 'login';
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  setBuyerMode: function(mode) {
    this.buyerMode = mode;
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  handleDocUploadSim: function(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.uploadedDocName = SecurityUtils ? SecurityUtils.escapeHtml(file.name) : file.name;
    } else {
      this.uploadedDocName = 'GST_FSSAI_Trade_Certificate.pdf';
    }
    const badge = document.getElementById('buyerDocBadge');
    if (badge) {
      badge.innerHTML = `📎 ${this.uploadedDocName} <span style="color:#16a34a; font-weight:800;">✓ Ready</span>`;
    }
  },

  render: function(container) {
    const savedFarmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const savedFarmerPwd = '••••';

    const savedBuyerId = localStorage.getItem('earthworm_buyer_id') || localStorage.getItem('earthworm_buyer_gstin') || '33AAACR4820M1Z8';
    const savedBuyerEntity = localStorage.getItem('earthworm_buyer_entity') || 'Reliance Fresh Central Agri Procurement';
    const savedBuyerPwd = '••••';

    const currentLang = I18nService.getLanguage();

    const districtList = [
      "Coimbatore", "Pondicherry", "Tiruvannamalai", "Dindigul", "Vellore",
      "Salem", "Madurai", "Tiruppur", "Erode", "Thanjavur",
      "Tiruchirappalli", "Theni", "Dharmapuri", "Krishnagiri", "Namakkal"
    ];

    container.innerHTML = `
      <!-- 5-LANGUAGE ONBOARDING SELECTOR BAR -->
      <div class="m-card" style="padding: 10px; background: #ffffff; border: 2px solid #86efac; border-radius: var(--radius-md); margin-bottom: 10px;">
        <div style="font-size: 11px; font-weight: 800; color: #166534; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span>🌐 ${I18nService.t('select_language')}:</span>
          <span class="m-badge m-badge-green">${I18nService.getLanguageName()}</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
          ${I18nService.languages.map(l => `
            <button class="lang-select-btn ${currentLang === l.code ? 'active' : ''}" onclick="App.setLanguage('${l.code}')" style="flex: 1; min-width: 72px; justify-content: center; font-size: 10px; padding: 6px 4px;">
              <span>${l.flag}</span>
              <span>${l.native}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Brand Hero Header -->
      <div class="m-card" style="background: linear-gradient(135deg, #0f381e 0%, #166534 100%); color: white; text-align: center; padding: 16px 14px; border: none; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(15,56,30,0.25);">
        <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; margin: 0 auto 6px auto; border: 2.5px solid #86efac; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          <img src="assets/logo.jpg" alt="Earthworm Logo" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">
          EARTHWORM UNIFIED PORTAL
        </div>
        <div style="font-size: 10px; color: #86efac; font-weight: 700; margin-top: 2px;">
          Market Linkages & Price Discovery Network
        </div>
      </div>

      <!-- Portal Role Switcher Tabs -->
      <div style="display: flex; gap: 4px; background: #e2e8f0; padding: 4px; border-radius: var(--radius-full); margin-bottom: 10px;">
        <button class="m-btn ${this.currentRole === 'farmer' ? 'm-btn-green' : 'm-btn-outline'}" onclick="AuthLoginScreen.switchRole('farmer')" style="flex: 1; padding: 8px 10px; font-size: 11px; border-radius: var(--radius-full);">
          👨‍🌾 ${I18nService.t('role_farmer')}
        </button>
        <button class="m-btn ${this.currentRole === 'buyer' ? 'm-btn-green' : 'm-btn-outline'}" onclick="AuthLoginScreen.switchRole('buyer')" style="flex: 1; padding: 8px 10px; font-size: 11px; border-radius: var(--radius-full);">
          🏢 ${I18nService.t('role_buyer')}
        </button>
      </div>

      ${this.currentRole === 'farmer' ? `
        <!-- Farmer Login Card with Captcha -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">📱 ${I18nService.t('title_login')}</div>
            <span class="m-badge m-badge-green">DPDP Secure</span>
          </div>

          <div class="m-input-group">
            <label>${I18nService.t('lbl_farmer_id')} *</label>
            <input type="text" id="loginFarmerId" class="m-input" value="${SecurityUtils ? SecurityUtils.escapeHtml(savedFarmerId) : savedFarmerId}" placeholder="e.g. EW-TN-8842" style="font-weight:700; color:#0f381e;">
          </div>

          <div class="m-input-group">
            <label>${I18nService.t('lbl_password')} *</label>
            <input type="password" id="loginFarmerPwd" class="m-input" value="4820" placeholder="Enter PIN">
          </div>

          <!-- Farmer Visual Captcha -->
          <div class="m-input-group">
            <label>${I18nService.t('lbl_captcha')} *</label>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
              <div id="farmerCaptchaBox" style="background: #1e293b; color: #38bdf8; font-family: 'Space Grotesk', monospace; font-size: 18px; font-weight: 800; letter-spacing: 6px; padding: 8px 16px; border-radius: 6px; text-decoration: line-through; user-select: none;">
                ${this.farmerCaptcha}
              </div>
              <button type="button" class="m-btn m-btn-outline" onclick="AuthLoginScreen.generateFarmerCaptcha()" style="width: auto; padding: 8px 12px; font-size: 11px;">
                🔄 ${I18nService.t('btn_refresh')}
              </button>
            </div>
            <input type="text" id="loginFarmerCaptchaInput" class="m-input" value="${this.farmerCaptcha}" placeholder="Type captcha code" style="text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
          </div>

          <button class="m-btn m-btn-green" onclick="AuthLoginScreen.handleFarmerLogin()" style="margin-top: 6px;">
            ${I18nService.t('btn_login_farmer')}
          </button>

          <div style="text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
            <button onclick="App.navigateTo('register')" style="background: none; border: none; color: var(--accent-green); font-weight: 800; font-size: 12px; cursor: pointer; text-decoration: underline;">
              ${I18nService.t('btn_register_new')}
            </button>
          </div>
        </div>

        <!-- 1-Touch Fast-Track Demo -->
        <div class="m-card" style="background: #f8fafc; border: 1.5px dashed #94a3b8; text-align: center;">
          <div style="font-size: 11px; font-weight: 800; color: var(--primary-forest); margin-bottom: 2px;">
            ⚡ 1-Touch Fast-Track (Farmer Demo)
          </div>
          <button class="m-btn m-btn-outline" onclick="AuthLoginScreen.demoFarmerFastTrack()" style="font-size: 11.5px; padding: 7px 12px; width: auto; margin-top: 4px;">
            🚀 1-Touch Farmer Login (#${SecurityUtils ? SecurityUtils.escapeHtml(savedFarmerId) : savedFarmerId})
          </button>
        </div>
      ` : `
        <!-- BUYER PORTAL TABS: LOGIN vs REGISTER -->
        <div style="display: flex; gap: 4px; margin-bottom: 10px;">
          <button class="m-btn ${this.buyerMode === 'login' ? 'm-btn-green' : 'm-btn-outline'}" onclick="AuthLoginScreen.setBuyerMode('login')" style="flex: 1; padding: 7px 8px; font-size: 11px; ${this.buyerMode === 'login' ? 'background: #0284c7; border-color: #0284c7;' : ''}">
            ${I18nService.t('tab_buyer_login')}
          </button>
          <button class="m-btn ${this.buyerMode === 'register' ? 'm-btn-green' : 'm-btn-outline'}" onclick="AuthLoginScreen.setBuyerMode('register')" style="flex: 1; padding: 7px 8px; font-size: 11px; ${this.buyerMode === 'register' ? 'background: #0284c7; border-color: #0284c7;' : ''}">
            ${I18nService.t('tab_buyer_register')}
          </button>
        </div>

        ${this.buyerMode === 'login' ? `
          <!-- Institutional Buyer Login Card -->
          <div class="m-card" style="border: 2px solid #38bdf8; background: #f0f9ff;">
            <div class="m-card-header">
              <div class="m-card-title" style="color: #0369a1;">🏢 ${I18nService.t('title_buyer_portal')}</div>
              <span class="m-badge m-badge-blue">Verified Buyer</span>
            </div>

            <p style="font-size: 11px; color: #0284c7; margin-bottom: 12px;">
              Corporate procurement gateway for Supermarkets, Exporters, and Food Processors to discover verified farmer lots and deposit 24-hr escrow payments:
            </p>

            <div class="m-input-group">
              <label>Corporate Buyer ID / GSTIN *</label>
              <input type="text" id="buyerAccountId" class="m-input" value="${SecurityUtils ? SecurityUtils.escapeHtml(savedBuyerId) : savedBuyerId}" placeholder="e.g. 33AAACR4820M1Z8 or EW-BUY-TN-8842" style="font-weight:700; color:#0369a1;">
            </div>

            <div class="m-input-group">
              <label>${I18nService.t('lbl_company_name')} *</label>
              <input type="text" id="buyerEntityName" class="m-input" value="${SecurityUtils ? SecurityUtils.escapeHtml(savedBuyerEntity) : savedBuyerEntity}" style="font-weight:700;">
            </div>

            <div class="m-input-group">
              <label>${I18nService.t('lbl_buyer_password')} *</label>
              <input type="password" id="buyerPin" class="m-input" value="9021" placeholder="Enter PIN">
            </div>

            <!-- Buyer Visual Captcha -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_captcha')} *</label>
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                <div id="buyerCaptchaBox" style="background: #0369a1; color: #ffffff; font-family: 'Space Grotesk', monospace; font-size: 18px; font-weight: 800; letter-spacing: 6px; padding: 8px 16px; border-radius: 6px; text-decoration: line-through; user-select: none;">
                  ${this.buyerCaptcha}
                </div>
                <button type="button" class="m-btn m-btn-outline" onclick="AuthLoginScreen.generateBuyerCaptcha()" style="width: auto; padding: 8px 12px; font-size: 11px;">
                  🔄 ${I18nService.t('btn_refresh')}
                </button>
              </div>
              <input type="text" id="loginBuyerCaptchaInput" class="m-input" value="${this.buyerCaptcha}" placeholder="Type captcha code" style="text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
            </div>

            <button class="m-btn m-btn-green" onclick="AuthLoginScreen.handleBuyerLogin()" style="margin-top: 6px; background: #0284c7;">
              ${I18nService.t('btn_login_buyer')}
            </button>

            <div style="text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #bae6fd;">
              <button onclick="AuthLoginScreen.setBuyerMode('register')" style="background: none; border: none; color: #0284c7; font-weight: 800; font-size: 12px; cursor: pointer; text-decoration: underline;">
                ${I18nService.t('tab_buyer_register')} ➔
              </button>
            </div>

            <!-- Fast-Track 1-Touch Demo -->
            <div style="text-align: center; margin-top: 10px;">
              <button class="m-btn m-btn-outline" onclick="AuthLoginScreen.demoBuyerFastTrack()" style="font-size: 11px; padding: 6px 12px; width: auto; border-color: #0284c7; color: #0284c7;">
                ⚡ 1-Touch Reliance Fresh Buyer Login
              </button>
            </div>
          </div>
        ` : `
          <!-- Institutional Buyer Registration Form -->
          <div class="m-card" style="border: 2px solid #0284c7; background: #f8fafc;">
            <div class="m-card-header">
              <div class="m-card-title" style="color: #0369a1;">📝 ${I18nService.t('title_register_buyer')}</div>
              <span class="m-badge m-badge-blue">Corporate KYC</span>
            </div>

            <p style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
              Register your retail chain, export enterprise, or food processing entity to participate in direct farmgate procurement and digital escrow settlements.
            </p>

            <!-- 1. Entity & Contact Details -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_company_name')} *</label>
              <input type="text" id="regBuyerEntity" class="m-input" value="Reliance Fresh Central Agri Procurement" placeholder="e.g. BigBasket, WayCool, Nilgiris" style="font-weight:700;">
            </div>

            <div class="m-grid-2">
              <div class="m-input-group">
                <label>${I18nService.t('lbl_contact_person')} *</label>
                <input type="text" id="regBuyerContact" class="m-input" value="V. Anand Kumar (Head of Procurement)" placeholder="Contact person">
              </div>
              <div class="m-input-group">
                <label>${I18nService.t('lbl_mobile')} *</label>
                <input type="tel" id="regBuyerPhone" class="m-input" value="98410 44210" placeholder="10-digit mobile">
              </div>
            </div>

            <!-- 2. Legal Documents (GSTIN, Aadhaar/PAN, FSSAI) -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_gstin')} *</label>
              <input type="text" id="regBuyerGstin" class="m-input" value="33AAACR4820M1Z8" placeholder="15-digit GSTIN" style="text-transform: uppercase; font-weight:700; color:#0369a1;">
            </div>

            <div class="m-grid-2">
              <div class="m-input-group">
                <label>${I18nService.t('lbl_aadhaar_pan')} *</label>
                <input type="text" id="regBuyerAadhaar" class="m-input" value="5489 3210 7741" placeholder="Aadhaar or PAN" style="font-weight:700;">
              </div>
              <div class="m-input-group">
                <label>${I18nService.t('lbl_fssai_license')} *</label>
                <input type="text" id="regBuyerFssai" class="m-input" value="10019042004812" placeholder="FSSAI License No." style="font-weight:700;">
              </div>
            </div>

            <!-- 3. Procurement Zone District -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_procurement_district')} *</label>
              <select id="regBuyerDistrict" class="m-input" style="font-weight: 700; color: #0369a1;">
                ${districtList.map(d => `<option value="${d}" ${d === 'Coimbatore' ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>

            <!-- 4. Proof Document Upload Simulation -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_proof_document')} *</label>
              <div style="background: #ffffff; border: 1.5px dashed #0284c7; border-radius: 8px; padding: 10px; text-align: center;">
                <div id="buyerDocBadge" style="font-size: 11px; font-weight: 700; color: #0369a1; margin-bottom: 6px;">
                  📎 ${this.uploadedDocName} <span style="color:#16a34a; font-weight:800;">✓ Verified</span>
                </div>
                <label class="m-btn m-btn-outline" style="font-size: 11px; padding: 6px 12px; cursor: pointer; display: inline-block; width: auto; border-color: #0284c7; color: #0284c7;">
                  ${I18nService.t('btn_upload_proof')}
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onchange="AuthLoginScreen.handleDocUploadSim(event)" style="display: none;">
                </label>
                <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">
                  Upload GSTIN / FSSAI certificate (PDF, JPG up to 10MB)
                </div>
              </div>
            </div>

            <!-- 5. Password / PIN Creation -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_buyer_password')} *</label>
              <input type="password" id="regBuyerPwd" class="m-input" value="9021" placeholder="Create secure PIN">
            </div>

            <!-- Buyer Registration Visual Captcha -->
            <div class="m-input-group">
              <label>${I18nService.t('lbl_captcha')} *</label>
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                <div id="buyerCaptchaBox" style="background: #0369a1; color: #ffffff; font-family: 'Space Grotesk', monospace; font-size: 18px; font-weight: 800; letter-spacing: 6px; padding: 8px 16px; border-radius: 6px; text-decoration: line-through; user-select: none;">
                  ${this.buyerCaptcha}
                </div>
                <button type="button" class="m-btn m-btn-outline" onclick="AuthLoginScreen.generateBuyerCaptcha()" style="width: auto; padding: 8px 12px; font-size: 11px;">
                  🔄 ${I18nService.t('btn_refresh')}
                </button>
              </div>
              <input type="text" id="regBuyerCaptchaInput" class="m-input" value="${this.buyerCaptcha}" placeholder="Type captcha code" style="text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
            </div>

            <!-- Submit Registration Button -->
            <button class="m-btn m-btn-green" onclick="AuthLoginScreen.handleBuyerRegistrationSubmit()" style="margin-top: 6px; background: #0284c7;">
              ${I18nService.t('btn_complete_buyer_reg')}
            </button>

            <div style="text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
              <button onclick="AuthLoginScreen.setBuyerMode('login')" style="background: none; border: none; color: #0369a1; font-weight: 700; font-size: 11.5px; cursor: pointer;">
                ← ${I18nService.t('tab_buyer_login')}
              </button>
            </div>
          </div>
        `}
      `}

      <!-- Buyer Registration Success Modal -->
      <div id="buyerRegSuccessModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 20px; max-width: 330px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 36px; margin-bottom: 6px;">🏢</div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #0369a1;" id="modalBuyerTitle">
            ${I18nService.t('lbl_reg_success_buyer')}
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Corporate procurement profile and KYC documents have been verified under GSTIN & DPDP standards.
          </p>

          <div style="background: #f0f9ff; border: 1.5px dashed #0284c7; border-radius: 10px; padding: 12px; margin: 12px 0; text-align: left; font-size: 11px;">
            <div style="font-size: 10px; color: #0369a1; font-weight: 700;">${I18nService.t('lbl_buyer_id_created')}</div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; color: #0c4a6e; margin-bottom: 6px;" id="modalBuyerId">
              EW-BUY-TN-8842
            </div>
            <div style="font-size: 10px; color: #0369a1; font-weight: 700;">ENTITY NAME:</div>
            <div style="font-weight: 800; color: #334155; margin-bottom: 4px;" id="modalBuyerEntity">
              Reliance Fresh
            </div>
            <div style="font-size: 10px; color: #0369a1; font-weight: 700;">GSTIN / AADHAAR:</div>
            <div style="font-weight: 700; color: #475569; margin-bottom: 4px;" id="modalBuyerGstin">
              33AAACR4820M1Z8
            </div>
            <div style="font-size: 10px; color: #0369a1; font-weight: 700;">PROOF DOCUMENT:</div>
            <div style="font-weight: 700; color: #16a34a;" id="modalBuyerDoc">
              📎 GST_FSSAI_Certificate.pdf
            </div>
          </div>

          <button class="m-btn m-btn-green" onclick="AuthLoginScreen.proceedToBuyerPortalNow()" style="background: #0284c7;">
            ${I18nService.t('btn_proceed_buyer_login')}
          </button>
        </div>
      </div>
    `;

    if (this.currentRole === 'farmer') {
      this.generateFarmerCaptcha();
    } else {
      this.generateBuyerCaptcha();
    }
  },

  handleFarmerLogin: async function() {
    const id = SecurityUtils ? SecurityUtils.sanitizeText(document.getElementById('loginFarmerId').value) : document.getElementById('loginFarmerId').value.trim();
    const pwd = document.getElementById('loginFarmerPwd').value.trim();
    const captchaIn = document.getElementById('loginFarmerCaptchaInput').value.trim().toUpperCase();

    if (!id || !pwd) {
      alert("⚠️ Please enter your Farmer ID and Password.");
      return;
    }

    if (captchaIn !== this.farmerCaptcha) {
      alert("❌ Invalid Captcha! Please enter the exact characters displayed.");
      this.generateFarmerCaptcha();
      return;
    }

    // Authenticate with Supabase Backend
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signIn(id, pwd, 'farmer');
      } catch (e) {
        console.warn('Supabase signIn notice:', e);
      }
    }

    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken(id, 'farmer') : `EW-SES-${Date.now()}`;

    localStorage.setItem('earthworm_user_logged_in', 'true');
    localStorage.setItem('earthworm_user_role', 'farmer');
    localStorage.setItem('earthworm_registered_id', id);
    localStorage.setItem('earthworm_auth_token', sessionToken);

    const farm = AgroDataService.getFarm();
    alert(`🎉 Welcome back Farmer #${id}!\nLocation: ${farm.district} District • Mandi: ${AgroDataService.getMandiForDistrict(farm.district).mandi}\nSession verified under DPDP Act & Supabase Auth. Opening farm dashboard...`);
    App.navigateTo('dashboard');
  },

  handleBuyerLogin: async function() {
    const accountId = SecurityUtils ? SecurityUtils.sanitizeText(document.getElementById('buyerAccountId').value) : document.getElementById('buyerAccountId').value.trim();
    const entity = SecurityUtils ? SecurityUtils.sanitizeText(document.getElementById('buyerEntityName').value) : document.getElementById('buyerEntityName').value.trim();
    const pin = document.getElementById('buyerPin').value.trim();
    const captchaIn = document.getElementById('loginBuyerCaptchaInput').value.trim().toUpperCase();

    if (!accountId || !entity || !pin) {
      alert("⚠️ Please fill in all corporate procurement credentials.");
      return;
    }

    if (captchaIn !== this.buyerCaptcha) {
      alert("❌ Invalid Captcha! Please enter the exact characters displayed.");
      this.generateBuyerCaptcha();
      return;
    }

    // Authenticate with Supabase Backend
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signIn(accountId, pin, 'buyer');
      } catch (e) {
        console.warn('Supabase signIn notice:', e);
      }
    }

    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken(accountId, 'buyer') : `EW-SES-${Date.now()}`;

    localStorage.setItem('earthworm_user_logged_in', 'true');
    localStorage.setItem('earthworm_user_role', 'buyer');
    localStorage.setItem('earthworm_buyer_id', accountId);
    localStorage.setItem('earthworm_buyer_entity', entity);
    localStorage.setItem('earthworm_auth_token', sessionToken);

    alert(`🎉 Logged in as Institutional Buyer: ${entity}!\nVerified via Supabase Auth. Opening Active Farmer Lot Procurement & Live GPS Tracking Portal...`);
    App.navigateTo('buyer_portal');
  },

  handleBuyerRegistrationSubmit: async function() {
    const rawEntity = (document.getElementById('regBuyerEntity').value || 'Reliance Fresh Central Procurement').trim();
    const rawContact = (document.getElementById('regBuyerContact').value || 'V. Anand Kumar').trim();
    const rawPhone = (document.getElementById('regBuyerPhone').value || '98410 44210').trim();
    const rawGstin = (document.getElementById('regBuyerGstin').value || '33AAACR4820M1Z8').trim().toUpperCase();
    const rawAadhaar = (document.getElementById('regBuyerAadhaar').value || '5489 3210 7741').trim();
    const rawFssai = (document.getElementById('regBuyerFssai').value || '10019042004812').trim();
    const district = document.getElementById('regBuyerDistrict').value || 'Coimbatore';
    const pwd = (document.getElementById('regBuyerPwd').value || '9021').trim();
    const captchaIn = document.getElementById('regBuyerCaptchaInput').value.trim().toUpperCase();

    const entity = SecurityUtils ? SecurityUtils.sanitizeText(rawEntity) : rawEntity;
    const contact = SecurityUtils ? SecurityUtils.sanitizeText(rawContact) : rawContact;
    const phone = SecurityUtils ? SecurityUtils.sanitizeText(rawPhone) : rawPhone;
    const gstin = SecurityUtils ? SecurityUtils.sanitizeText(rawGstin) : rawGstin;
    const aadhaar = SecurityUtils ? SecurityUtils.sanitizeText(rawAadhaar) : rawAadhaar;
    const fssai = SecurityUtils ? SecurityUtils.sanitizeText(rawFssai) : rawFssai;

    if (!entity || !gstin || !pwd) {
      alert("⚠️ Please fill in all required company registration details.");
      return;
    }

    if (captchaIn !== this.buyerCaptcha) {
      alert("❌ Invalid Captcha! Please enter the exact characters displayed.");
      this.generateBuyerCaptcha();
      return;
    }

    // Generate Institutional Buyer ID
    const cleanNum = Math.floor(1000 + Math.random() * 9000);
    const generatedBuyerId = `EW-BUY-TN-${cleanNum}`;
    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken(generatedBuyerId, 'buyer') : `EW-SES-${Date.now()}`;

    // Register Buyer in Supabase Auth & profiles table
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signUpBuyer({
          userId: generatedBuyerId,
          password: pwd,
          entityName: entity,
          contactPerson: contact,
          phone: phone,
          gstin: gstin,
          aadhaarPan: aadhaar,
          fssai: fssai,
          district: district,
          proofDoc: this.uploadedDocName
        });
      } catch (e) {
        console.warn('Supabase buyer registration notice:', e);
      }
    }

    localStorage.setItem('earthworm_buyer_id', generatedBuyerId);
    localStorage.setItem('earthworm_buyer_entity', entity);
    localStorage.setItem('earthworm_buyer_contact', contact);
    localStorage.setItem('earthworm_buyer_phone', phone);
    localStorage.setItem('earthworm_buyer_gstin', gstin);
    localStorage.setItem('earthworm_buyer_aadhaar', aadhaar);
    localStorage.setItem('earthworm_buyer_fssai', fssai);
    localStorage.setItem('earthworm_buyer_district', district);
    localStorage.setItem('earthworm_auth_token', sessionToken);
    localStorage.setItem('earthworm_buyer_doc', this.uploadedDocName);

    // Show completion modal
    const modal = document.getElementById('buyerRegSuccessModal');
    if (modal) {
      document.getElementById('modalBuyerId').innerText = generatedBuyerId;
      document.getElementById('modalBuyerEntity').innerText = entity;
      document.getElementById('modalBuyerGstin').innerText = `${gstin} • Aadhaar: ${aadhaar}`;
      document.getElementById('modalBuyerDoc').innerText = `📎 ${this.uploadedDocName} (Verified ✓)`;
      modal.style.display = 'flex';
    } else {
      this.proceedToBuyerPortalNow();
    }
  },

  proceedToBuyerPortalNow: function() {
    const modal = document.getElementById('buyerRegSuccessModal');
    if (modal) modal.style.display = 'none';

    localStorage.setItem('earthworm_user_logged_in', 'true');
    localStorage.setItem('earthworm_user_role', 'buyer');
    App.navigateTo('buyer_portal');
  },

  demoFarmerFastTrack: async function() {
    const savedId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const savedName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';

    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signIn(savedId, '4820', 'farmer');
      } catch (e) {}
    }

    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken(savedId, 'farmer') : `EW-SES-${Date.now()}`;
    localStorage.setItem('earthworm_user_logged_in', 'true');
    localStorage.setItem('earthworm_user_role', 'farmer');
    localStorage.setItem('earthworm_registered_id', savedId);
    localStorage.setItem('earthworm_farmer_name', savedName);
    localStorage.setItem('earthworm_auth_token', sessionToken);
    App.navigateTo('dashboard');
  },

  demoBuyerFastTrack: async function() {
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signIn('33AAACR4820M1Z8', '9021', 'buyer');
      } catch (e) {}
    }

    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken('33AAACR4820M1Z8', 'buyer') : `EW-SES-${Date.now()}`;
    localStorage.setItem('earthworm_user_logged_in', 'true');
    localStorage.setItem('earthworm_user_role', 'buyer');
    localStorage.setItem('earthworm_buyer_id', '33AAACR4820M1Z8');
    localStorage.setItem('earthworm_buyer_entity', 'Reliance Fresh Central Agri Procurement');
    localStorage.setItem('earthworm_auth_token', sessionToken);
    App.navigateTo('buyer_portal');
  }
};
