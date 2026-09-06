// Mobile Screen 02: Problem-Solution Master Home Dashboard (Agri Market Linkage Hub)
const HomeDashboardScreen = {
  map: null,

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    const lang = I18nService.getLanguage();

    container.innerHTML = `
      <!-- Active Farm Identity Header -->
      <div class="m-card" style="background: linear-gradient(135deg, #0f381e 0%, #166534 100%); color: white; padding: 14px; border: none; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #86efac; background: #ffffff;">
              <img src="assets/logo.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #ffffff;">${farmerName}</div>
              <div style="font-size: 10.5px; color: #86efac; font-weight: 700;">
                ID: #${farmerId} • ${farm.district} District
              </div>
            </div>
          </div>
          <button class="m-btn" onclick="App.logout()" style="width: auto; padding: 4px 8px; font-size: 10px; background: rgba(239,68,68,0.85); border: 1px solid #fca5a5; color: white; border-radius: 6px;">
            🚪 ${I18nService.t('btn_logout')}
          </button>
        </div>
      </div>

      <!-- PROMINENT AGRI AI VOICE ADVISOR BANNER -->
      <div class="m-card" style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); color: white; border: 2px solid #34d399; cursor: pointer;" onclick="App.navigateTo('ai_chat')">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #15803d; border: 2px solid #86efac; display: flex; align-items: center; justify-content: center; font-size: 22px;">
              🎙️
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #ffffff;">${I18nService.t('title_ai_chat')}</div>
              <div style="font-size: 10px; color: #a7f3d0;">
                ${I18nService.t('btn_voice_tap')} (${I18nService.getLanguageName()})
              </div>
            </div>
          </div>
          <span class="m-badge m-badge-green" style="font-size: 10px; background: #fde047; color: #064e3b; font-weight: 800;">
            ⚡ ${I18nService.t('btn_ask_ai')}
          </span>
        </div>
      </div>

      <!-- 1. DIGITAL TWIN OF FARM & CROP SELECTION -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">🌱 Farm Digital Twin (${farm.district})</div>
          <button class="m-btn m-btn-green" style="padding:4px 8px; width:auto; font-size:10px;" onclick="App.navigateTo('sim_map')">
            🗺️ ${I18nService.t('nav_sim_map')}
          </button>
        </div>

        <div id="homeMiniMap" class="m-map-container" style="height: 180px;"></div>

        <!-- Interactive Crop Selector -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 8px; margin-top: 8px;">
          <label style="font-size: 11px; font-weight: 800; color: var(--primary-forest); display: block; margin-bottom: 4px;">
            🌾 ${I18nService.t('lbl_crop')}:
          </label>
          <select id="homeCropSelector" class="m-input" onchange="HomeDashboardScreen.handleCropSwitch(this.value)" style="font-weight: 700; background: #ffffff;">
            <option value="Tomato (Hybrid Red)" ${farm.crop.includes('Tomato') ? 'selected' : ''}>🍅 Tomato / தக்காளி (Hybrid Red)</option>
            <option value="Small Onion (Bellary)" ${farm.crop.includes('Onion') ? 'selected' : ''}>🧅 Small Onion / சின்ன வெங்காயம் (Bellary)</option>
            <option value="Wheat (Golden Grain)" ${farm.crop.includes('Wheat') ? 'selected' : ''}>🌾 Wheat / கோதுமை (Golden Grain)</option>
            <option value="Paddy (Grade A)" ${farm.crop.includes('Paddy') ? 'selected' : ''}>🌾 Paddy / நெல் (Grade A Samba)</option>
            <option value="Groundnut Pods" ${farm.crop.includes('Groundnut') ? 'selected' : ''}>🥜 Groundnut / நிலக்கடலை</option>
            <option value="Green Chilli (Fresh)" ${farm.crop.includes('Chilli') ? 'selected' : ''}>🌶️ Green Chilli / பச்சை மிளகாய்</option>
            <option value="Potato (Fresh Local)" ${farm.crop.includes('Potato') ? 'selected' : ''}>🥔 Potato / உருளைக்கிழங்கு</option>
            <option value="Cotton (Kapas)" ${farm.crop.includes('Cotton') ? 'selected' : ''}>⚪ Cotton / பருத்தி (Kapas)</option>
            <option value="Maize (Hybrid Grain)" ${farm.crop.includes('Maize') ? 'selected' : ''}>🌽 Maize / மக்காச்சோளம்</option>
          </select>
        </div>

        <div class="m-grid-3">
          <div class="m-stat-box" style="background:#f0fdf4;">
            <div class="m-stat-val" style="color:#15803d;" id="homeLiveAcreage">${farm.acreage} ac</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_acreage')}</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val">pH ${farm.soilPh}</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_soil_ph')}</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val" style="color:var(--accent-green);">${farm.ndviVigor}</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_ndvi')}</div>
          </div>
        </div>
      </div>

      <!-- 2. DIRECT LOT BOOKING CARD FOR BUYER MARKETPLACE -->
      <div class="m-card" style="border: 2px solid #16a34a; background: #f0fdf4;">
        <div class="m-card-header">
          <div class="m-card-title" style="color: #166534;">📦 ${I18nService.t('btn_publish_lot')}</div>
          <span class="m-badge m-badge-green">Instant Buyer Sync</span>
        </div>

        <p style="font-size: 10.5px; color: #14532d; margin-bottom: 8px;">
          Make your 2,000 kg ${farm.crop} lot immediately visible to Reliance Fresh and corporate buyers under Farmer ID <strong>#${farmerId}</strong>:
        </p>

        <button class="m-btn m-btn-green" id="btnPublishHomeLot" onclick="HomeDashboardScreen.publishCurrentLot()" style="font-size: 11.5px; padding: 10px;">
          🚀 ${I18nService.t('btn_publish_lot')} (Farmer ID: #${farmerId})
        </button>
      </div>

      <!-- 3. LIVE DATA.GOV.IN VARIETY-WISE MANDI PRICE BOARD (100% LOCALIZED) -->
      <div class="m-card" style="border: 2px solid #38bdf8; background: #f0f9ff;">
        <div class="m-card-header">
          <div class="m-card-title" style="color: #0369a1;">🏛️ ${lang === 'ta' ? 'அதிகாரப்பூர்வ அக்மார்க்நெட் தினசரி மண்டி விலை' : lang === 'hi' ? 'दैनिक सरकारी मंडी भाव' : 'Live Mandi Wholesale Board'} (${farm.district})</div>
          ${AgroDataService.isDataLive() ? '<span class="m-badge m-badge-green" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800;">● LIVE DATA</span>' : '<span class="m-badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:700;">⚠️ OFFLINE BENCHMARK</span>'}
        </div>

        <p style="font-size: 10px; color: #0284c7; margin-bottom: 8px;">
          ${AgroDataService.isDataLive() ? (lang === 'ta' ? 'அரசு அக்மார்க்நெட் API நேரடி தினசரி மொத்த விலை பட்டியல்:' : 'Official Data.gov.in Live Agmarknet Rates • Real-time wholesale prices across region:') : (lang === 'ta' ? 'அரசு அக்மார்க்நெட் மாதிரி விலை பட்டியல் (ஆஃப்லைன்):' : 'Official Benchmark Prices (Offline mode):')}
        </p>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 10.5px; max-height: 280px; overflow-y: auto;">
          ${AgroDataService.getLocalizedMandiPrices(lang, farm.district).map(item => `
            <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 6px; padding: 7px 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #0f172a;">${item.icon} ${item.name}</strong>
                <div style="font-size: 9.5px; color: #64748b;">${item.market}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12.5px; font-weight: 800; color: #15803d;">${item.rateKg}</span>
                <div style="font-size: 9px; color: #0284c7;">${item.rateQtl} <span style="color:#16a34a; font-weight:bold;">${item.trend}</span></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. ALL NAVIGATION TILES (ON HOMEPAGE) -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 12px; font-weight: 800; color: var(--primary-forest); margin-bottom: 8px;">
          🧭 Quick Navigator:
        </div>
        <div class="m-grid-3">
          <button class="m-btn m-btn-green" onclick="App.navigateTo('ai_chat')" style="flex-direction:column; padding:10px 4px; text-align:center; background: #15803d;">
            <span style="font-size:22px;">🤖</span>
            <span style="font-size:10px; font-weight:800;">${I18nService.t('nav_ai_chat')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('sim_map')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">🗺️</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_sim_map')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('quality')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">📸</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_quality')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('what_if')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">📊</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_what_if')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('storage')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">❄️</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_storage')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('pooling')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">🚚</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_pooling')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('transactions')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">📜</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_transactions')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('radar')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">⚠️</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('title_radar')}</span>
          </button>
          <button class="m-btn m-btn-outline" onclick="App.navigateTo('grievance')" style="flex-direction:column; padding:10px 4px; text-align:center;">
            <span style="font-size:20px;">⚖️</span>
            <span style="font-size:10px; font-weight:700;">${I18nService.t('nav_disputes')}</span>
          </button>
        </div>
      </div>
    `;

    setTimeout(() => this.initMiniMap(farm), 150);
  },

  initMiniMap: function(farm) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapElem = document.getElementById('homeMiniMap');
    if (!mapElem) return;

    this.map = L.map('homeMiniMap', { zoomControl: false, dragging: true }).setView([farm.lat, farm.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.map);

    const initialCoords = [
      [farm.lat + 0.0015, farm.lng + 0.0015],
      [farm.lat + 0.0015, farm.lng - 0.0015],
      [farm.lat - 0.0015, farm.lng - 0.0015],
      [farm.lat - 0.0015, farm.lng + 0.0015]
    ];
    L.polygon(initialCoords, { color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.45 })
      .bindPopup(`<strong>🌱 Farm Location (${farm.district})</strong><br>Acreage: ${farm.acreage} ac`)
      .addTo(this.map);
  },

  handleCropSwitch: function(newCrop) {
    AgroDataService.saveFarm({ crop: newCrop });
    alert(`🌾 Active Cultivation Crop Updated to: ${newCrop}!\nMarket Net Realization Index recalculated for ${newCrop}.`);
  },

  publishCurrentLot: function() {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';

    const published = AgroDataService.publishLot({
      farmerId: farmerId,
      district: farm.district,
      crop: farm.crop || 'Tomato (Hybrid Red)',
      volume: 2000,
      grade: 'AGMARK Grade A (Premium)',
      colorScore: 94.8,
      caliber: 66,
      defectRate: 1.8,
      assessment: `Uniform harvest grown in ${farm.district} meeting AGMARK Grade A standards.`,
      pricePerKg: 28.50,
      totalAmount: 57000,
      status: 'READY_FOR_BIDDING'
    });

    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const alertMsg = (lang === 'ta')
      ? `🎉 லாட் ${published.lotId} (2,000 kg ${farm.crop}) வெற்றிகரமாக பதிவு செய்யப்பட்டது!\n\n• விவசாயி எண்: #${farmerId} (Zero-PII DPDP Shielded)\n• மாவட்டம்: ${farm.district} மண்டலம்\n• நிலை: கொள்முதல் சந்தையில் நேரலையில் உள்ளது.`
      : `🎉 Success! Lot ${published.lotId} (2,000 kg ${farm.crop}) published to Marketplace!\n\n• Producer: Farmer ID #${farmerId} (Zero-PII DPDP Shielded)\n• Region: ${farm.district} District\n• Status: Active & Live in Marketplace for verified institutional buyers.`;

    alert(alertMsg);

    const btn = document.getElementById('btnPublishHomeLot');
    if (btn) {
      btn.innerHTML = `✓ ${published.lotId} Published to Marketplace`;
      btn.style.background = '#15803d';
    }
  }
};
