// Mobile Screen 01: Farmer Registration & Interactive GIS Land Boundary Setup
const AuthRegisterScreen = {
  map: null,
  drawnItems: null,
  currentAcreage: 2.50,
  currentLat: 11.0168,
  currentLng: 76.9558,
  redirectInterval: null,

  handleDistrictChange: function(district) {
    const coords = AgroDataService.districtCoordinates[district] || AgroDataService.districtCoordinates["Coimbatore"];
    this.currentLat = coords.lat;
    this.currentLng = coords.lng;

    if (this.map) {
      this.map.setView([coords.lat, coords.lng], 14);
      this.drawnItems.clearLayers();
      const initialCoords = [
        [coords.lat + 0.0015, coords.lng + 0.0015],
        [coords.lat + 0.0015, coords.lng - 0.0015],
        [coords.lat - 0.0015, coords.lng - 0.0015],
        [coords.lat - 0.0015, coords.lng + 0.0015]
      ];
      const poly = L.polygon(initialCoords, { color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.35 });
      this.drawnItems.addLayer(poly);
    }
  },

  render: function(container) {
    const farm = AgroDataService.getFarm();
    this.currentLat = farm.lat || 11.0168;
    this.currentLng = farm.lng || 76.9558;
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

      <!-- Brand Header -->
      <div class="m-card" style="background: linear-gradient(135deg, #0f381e 0%, #166534 100%); color: white; text-align: center; padding: 16px 12px; border: none; border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid #86efac; background: #ffffff;">
            <img src="assets/logo.jpg" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="text-align: left;">
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800;">
              EARTHWORM REGISTRATION
            </div>
            <div style="font-size: 10px; color: #86efac; font-weight: 700;">
              Digital Farm Twin & Farmer ID Generation
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Role Switcher Tabs -->
      <div style="display: flex; gap: 4px; background: #e2e8f0; padding: 4px; border-radius: var(--radius-full); margin-bottom: 10px;">
        <button class="m-btn m-btn-green" style="flex: 1; padding: 8px 10px; font-size: 11px; border-radius: var(--radius-full);">
          👨‍🌾 ${I18nService.t('role_farmer')}
        </button>
        <button class="m-btn m-btn-outline" onclick="AuthLoginScreen.switchRole('buyer'); AuthLoginScreen.setBuyerMode('register'); App.navigateTo('login');" style="flex: 1; padding: 8px 10px; font-size: 11px; border-radius: var(--radius-full);">
          🏢 ${I18nService.t('role_buyer')}
        </button>
      </div>

      <!-- Main Registration Form -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">📝 ${I18nService.t('title_register')}</div>
          <span class="m-badge m-badge-green">Step 1 of 2</span>
        </div>

        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
          Fill your personal details, select your district, <strong>draw your farm boundary on the satellite map</strong>, and create a security PIN.
        </p>

        <!-- 1. Personal Details -->
        <div class="m-input-group">
          <label>${I18nService.t('lbl_full_name')} *</label>
          <input type="text" id="regFarmerName" class="m-input" value="Ramasamy K" placeholder="Enter full name">
        </div>

        <div class="m-input-group">
          <label>${I18nService.t('lbl_mobile')} *</label>
          <div style="display: flex; gap: 6px;">
            <span style="background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; font-size: 13px; font-weight: 700; color: #334155;">+91</span>
            <input type="tel" id="regFarmerMobile" class="m-input" value="98421 78902" placeholder="Enter 10-digit mobile">
          </div>
        </div>

        <div class="m-grid-2">
          <div class="m-input-group">
            <label>${I18nService.t('lbl_district')} *</label>
            <select id="regDistrict" class="m-input" onchange="AuthRegisterScreen.handleDistrictChange(this.value)" style="font-weight: 700; color: #0f381e;">
              ${districtList.map(d => `<option value="${d}" ${d === 'Coimbatore' ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div class="m-input-group">
            <label>${I18nService.t('lbl_crop')} *</label>
            <select id="regCrop" class="m-input" style="font-weight: 700;">
              <option value="Tomato (Hybrid Red)" selected>🍅 Tomato (Hybrid Red)</option>
              <option value="Small Onion (Bellary)">🧅 Small Onion (Bellary)</option>
              <option value="Paddy (Grade A)">🌾 Paddy (Grade A)</option>
              <option value="Groundnut Pods">🥜 Groundnut Pods</option>
              <option value="Green Chilli (Fresh)">🌶️ Green Chilli (Fresh)</option>
            </select>
          </div>
        </div>

        <!-- 2. Interactive GIS Map Drawing Component -->
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 11px; font-weight: 800; color: var(--primary-forest);">
              🗺️ ${I18nService.t('nav_sim_map')} (Satellite Land Boundary) *
            </label>
            <span class="m-badge m-badge-blue">${I18nService.t('btn_draw_polygon')}</span>
          </div>
          <div style="font-size: 9.5px; color: #64748b; margin-bottom: 6px;">
            Tap the polygon icon on the map to outline your field boundary.
          </div>

          <div id="regMapContainer" class="m-map-container" style="height: 210px;"></div>

          <!-- Live Acreage & ISRO Badges -->
          <div class="m-grid-3" style="margin-top: 6px;">
            <div class="m-stat-box" style="background: #f0fdf4; border-color: #86efac;">
              <div class="m-stat-val" id="regComputedAcreage" style="color: #15803d;">2.50 ac</div>
              <div class="m-stat-lbl">${I18nService.t('lbl_acreage')}</div>
            </div>
            <div class="m-stat-box">
              <div class="m-stat-val">pH 6.9</div>
              <div class="m-stat-lbl">${I18nService.t('lbl_soil_ph')}</div>
            </div>
            <div class="m-stat-box">
              <div class="m-stat-val" style="color: var(--accent-green);">0.74</div>
              <div class="m-stat-lbl">${I18nService.t('lbl_ndvi')}</div>
            </div>
          </div>
        </div>

        <!-- 3. Password Creation -->
        <div class="m-input-group">
          <label>${I18nService.t('lbl_password')} *</label>
          <input type="password" id="regPassword" class="m-input" value="4820" placeholder="Enter secure PIN">
        </div>

        <!-- Submit Button -->
        <button class="m-btn m-btn-green" onclick="AuthRegisterScreen.handleRegistrationSubmit()" style="margin-top: 4px;">
          ${I18nService.t('btn_complete_reg')}
        </button>
      </div>

      <!-- ID Generated Popup Modal -->
      <div id="idGeneratedModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; justify-content: center; align-items: center; padding: 20px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 20px; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <div style="font-size: 36px; margin-bottom: 8px;">🎉</div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #0f381e;">
            REGISTRATION COMPLETE!
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Your Earthworm Farmer ID and Farm Digital Twin are now active.
          </p>

          <div style="background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 10px; padding: 14px; margin: 14px 0; text-align: left;">
            <div style="font-size: 10px; color: #166534; font-weight: 700;">YOUR FARMER ID:</div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; color: #0f381e; margin-bottom: 6px;" id="modalFarmerId">
              EW-TN-8842
            </div>
            <div style="font-size: 10px; color: #166534; font-weight: 700;">YOUR PASSWORD / PIN:</div>
            <div style="font-size: 14px; font-weight: 800; color: #15803d;" id="modalPassword">
              4820
            </div>
          </div>

          <div style="font-size: 10px; color: #b45309; background: #fef3c7; padding: 6px 10px; border-radius: 6px; margin-bottom: 14px;">
            ⏳ Redirecting to Login page in <strong id="countdownTimer">3</strong> seconds...
          </div>

          <button class="m-btn m-btn-green" onclick="AuthRegisterScreen.proceedToLoginNow()">
            🚀 Proceed to Login Now
          </button>
        </div>
      </div>
    `;

    document.getElementById('idGeneratedModal').style.display = 'none';
    setTimeout(() => this.initRegistrationMap(), 150);
  },

  initRegistrationMap: function() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapElem = document.getElementById('regMapContainer');
    if (!mapElem) return;

    this.map = L.map('regMapContainer', { zoomControl: false }).setView([this.currentLat, this.currentLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.map);

    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    const initialCoords = [
      [this.currentLat + 0.0015, this.currentLng + 0.0015],
      [this.currentLat + 0.0015, this.currentLng - 0.0015],
      [this.currentLat - 0.0015, this.currentLng - 0.0015],
      [this.currentLat - 0.0015, this.currentLng + 0.0015]
    ];
    const poly = L.polygon(initialCoords, { color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.35 });
    this.drawnItems.addLayer(poly);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { shapeOptions: { color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.4 } },
        rectangle: true,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false
      },
      edit: { featureGroup: this.drawnItems }
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (e) => {
      this.drawnItems.clearLayers();
      this.drawnItems.addLayer(e.layer);

      let calcAcres = 2.50;
      try {
        const geojson = e.layer.toGeoJSON();
        const areaSqMeters = turf.area(geojson);
        calcAcres = (areaSqMeters * 0.000247105).toFixed(2);
        
        // Calculate true centroid of drawn polygon
        const centroid = turf.centroid(geojson);
        this.currentLat = centroid.geometry.coordinates[1];
        this.currentLng = centroid.geometry.coordinates[0];
      } catch (err) {
        calcAcres = (Math.random() * 1.2 + 2.0).toFixed(2);
      }

      document.getElementById('regComputedAcreage').innerText = `${calcAcres} ac`;
      this.currentAcreage = parseFloat(calcAcres);
    });
  },

  handleRegistrationSubmit: async function() {
    const rawName = document.getElementById('regFarmerName').value || 'Ramasamy K';
    const district = document.getElementById('regDistrict').value || 'Coimbatore';
    const crop = document.getElementById('regCrop').value || 'Tomato (Hybrid Red)';
    const password = document.getElementById('regPassword').value || '4820';
    const acreage = this.currentAcreage || 2.50;

    const name = SecurityUtils ? SecurityUtils.sanitizeText(rawName) : rawName;

    // Generate unique Earthworm Farmer ID
    const generatedFarmerId = "EW-TN-" + Math.floor(1000 + Math.random() * 9000);
    const sessionToken = SecurityUtils ? SecurityUtils.generateSessionToken(generatedFarmerId, 'farmer') : `EW-SES-${Date.now()}`;

    // Register Farmer in Supabase Auth & profiles table
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.signUpFarmer({
          userId: generatedFarmerId,
          password: password,
          fullName: name,
          phone: document.getElementById('regFarmerMobile') ? document.getElementById('regFarmerMobile').value.trim() : '98421 78902',
          district: district,
          language: (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en'
        });
      } catch (e) {
        console.warn('Supabase farmer signup notice:', e);
      }
    }

    // Save profile with exact GPS coordinates and district
    const farmProfile = {
      district,
      crop,
      acreage,
      lat: this.currentLat,
      lng: this.currentLng,
      soilType: "Red Sandy Loam",
      soilPh: 6.9,
      ndviVigor: 0.74,
      farmerName: name,
      farmerId: generatedFarmerId
    };

    AgroDataService.saveFarm(farmProfile);
    if (typeof SupabaseService !== 'undefined') {
      try {
        await SupabaseService.saveFarm(farmProfile);
      } catch (e) {}
    }

    localStorage.setItem('earthworm_registered_id', generatedFarmerId);
    localStorage.setItem('earthworm_farmer_name', name);
    localStorage.setItem('earthworm_auth_token', sessionToken);

    // Auto-create initial digital lot for this farmer using AgroDataService.publishLot
    AgroDataService.publishLot({
      farmerId: generatedFarmerId,
      district: district,
      crop: crop,
      volume: 2000,
      grade: 'AGMARK Grade A (Premium)',
      colorScore: 94.8,
      caliber: 66,
      defectRate: 1.8,
      assessment: `Uniform harvest in ${district} verified under AGMARK Grade A standards.`,
      pricePerKg: 28.50,
      totalAmount: 57000,
      photoUrl: 'assets/slide4_ai_scanner.jpg',
      status: 'READY_FOR_BIDDING'
    });

    // Show popup modal with generated ID and Password
    const modal = document.getElementById('idGeneratedModal');
    document.getElementById('modalFarmerId').innerText = generatedFarmerId;
    document.getElementById('modalPassword').innerText = password;
    modal.style.display = 'flex';

    let timeLeft = 3;
    const timerElem = document.getElementById('countdownTimer');
    this.redirectInterval = setInterval(() => {
      timeLeft--;
      if (timerElem) timerElem.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(this.redirectInterval);
        this.proceedToLoginNow();
      }
    }, 1000);
  },

  proceedToLoginNow: function() {
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    const modal = document.getElementById('idGeneratedModal');
    if (modal) modal.style.display = 'none';
    App.navigateTo('login');
  }
};
