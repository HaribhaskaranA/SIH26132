// Mobile Screen 01: Interactive Farm Simulation Map (Replaces generic GIS tab)
const FarmSimMapScreen = {
  map: null,
  truckMarker: null,

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);

    container.innerHTML = `
      <!-- Simulation Map Card -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">🗺️ ${I18nService.t('title_sim_map')} (${farm.district})</div>
          <span class="m-badge m-badge-green">${I18nService.t('badge_live_telemetry')}</span>
        </div>

        <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 8px;">
          ${I18nService.t('lbl_sim_desc')} ${mandiInfo.mandi}:
        </p>

        <!-- Simulation Map Canvas -->
        <div id="simMapCanvas" class="m-map-container" style="height: 240px; margin-bottom: 8px;"></div>

        <!-- Simulation Telemetry Metrics -->
        <div class="m-grid-3">
          <div class="m-stat-box" style="background:#f0fdf4; border-color:#86efac;">
            <div class="m-stat-val" style="color:#15803d;">28%</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_soil_moisture')}</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val">22 min</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_transit_to_mandi')}</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val" style="color:var(--accent-green);">${farm.ndviVigor || 0.74}</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_ndvi_vigor')}</div>
          </div>
        </div>

        <!-- Simulation Controls -->
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
          <button class="m-btn m-btn-green" onclick="FarmSimMapScreen.runGeminiDiagnostics()" id="btnGeminiDiag">
            ${I18nService.t('btn_run_satellite_diag')}
          </button>
          <button class="m-btn m-btn-outline" onclick="FarmSimMapScreen.simulateTransitRoute()">
            ${I18nService.t('btn_sim_transit')}
          </button>
          <div class="m-grid-2" style="margin-bottom: 0;">
            <button class="m-btn m-btn-outline" style="font-size: 11px;" onclick="FarmSimMapScreen.toggleSoilLayer()">
              ${I18nService.t('btn_soil_layer')}
            </button>
            <button class="m-btn m-btn-outline" style="font-size: 11px;" onclick="FarmSimMapScreen.showSupermarketHubs()">
              ${I18nService.t('btn_supermarket_hubs')}
            </button>
          </div>
        </div>

        <!-- Dynamic Gemini Diagnostics Box -->
        <div id="geminiDiagBox" style="display:none; margin-top:10px; background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px; font-size:11px; line-height:1.5;">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;

    setTimeout(() => this.initSimMap(farm), 150);
  },

  initSimMap: function(farm) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapElem = document.getElementById('simMapCanvas');
    if (!mapElem) return;

    this.map = L.map('simMapCanvas', { zoomControl: false }).setView([farm.lat, farm.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.map);

    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);

    // Farm boundary
    const initialCoords = [
      [farm.lat + 0.0015, farm.lng + 0.0015],
      [farm.lat + 0.0015, farm.lng - 0.0015],
      [farm.lat - 0.0015, farm.lng - 0.0015],
      [farm.lat - 0.0015, farm.lng + 0.0015]
    ];
    L.polygon(initialCoords, { color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.45 })
      .bindPopup(`<strong>🌱 Farm Boundary (${farm.district})</strong><br>Acreage: ${farm.acreage} Acres<br>Crop: ${farm.crop}<br>Soil: ${farm.soilType}`)
      .addTo(this.map);

    // Regional APMC Mandi Marker
    L.marker([farm.lat + 0.015, farm.lng + 0.012], {
      icon: L.divIcon({ className: 'custom-pin', html: '<div style="background:#dc2626; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white;">🏛️</div>' })
    }).bindPopup(`<strong>📍 ${mandiInfo.mandi}</strong><br>Distance: 14 km<br>Yard Occupancy: 82%`).addTo(this.map);

    // Reliance Fresh Procurement Hub Marker
    L.marker([farm.lat + 0.008, farm.lng - 0.015], {
      icon: L.divIcon({ className: 'custom-pin', html: '<div style="background:#2563eb; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white;">🛒</div>' })
    }).bindPopup(`<strong>🛒 Reliance Fresh Institutional Sourcing Hub</strong><br>District: ${farm.district}<br>Guaranteed Farmgate: ₹28.50/kg`).addTo(this.map);
  },

  simulateTransitRoute: function() {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    alert(`🚚 Simulating Mini-Truck Logistics Transit from Farm to ${mandiInfo.mandi} (14 km)...\nEstimated transit time: 22 Minutes (Freight Cost: ₹1.30/kg).`);
    if (this.map) {
      const latlngs = [
        [farm.lat, farm.lng],
        [farm.lat + 0.005, farm.lng + 0.004],
        [farm.lat + 0.010, farm.lng + 0.008],
        [farm.lat + 0.015, farm.lng + 0.012]
      ];
      L.polyline(latlngs, { color: '#16a34a', weight: 4, dashArray: '6, 8' }).addTo(this.map);
    }
  },

  toggleSoilLayer: function() {
    const farm = AgroDataService.getFarm();
    alert(`🌱 ISRO Bhuvan Soil Telemetry Layer (${farm.district}):\n• Soil Type: ${farm.soilType}\n• Subsurface Moisture: 28% (Optimal)\n• pH Index: ${farm.soilPh} (Neutral Optimal)`);
  },

  showSupermarketHubs: function() {
    const farm = AgroDataService.getFarm();
    alert(`🏬 Institutional Direct Sourcing Hubs in ${farm.district}:\n1. Reliance Fresh Hub (8.5 km)\n2. Annapoorna Processing (12 km)\n3. Supermarket Procurement Depot (15 km)`);
  },

  runGeminiDiagnostics: function() {
    const farm = AgroDataService.getFarm();
    const btn = document.getElementById('btnGeminiDiag');
    const box = document.getElementById('geminiDiagBox');

    btn.innerText = "⏳ Ingesting ISRO Bhuvan & Sentinel-2 Telemetry...";
    btn.disabled = true;
    box.style.display = 'block';
    box.innerHTML = "<span style='color:#64748b;'>Querying Google Gemini 3.6 Flash for canopy health, soil pH bio-availability, and yield estimation...</span>";

    GeminiService.analyzeFarmFootageAndTelemetry(farm, (result, isLive) => {
      btn.innerText = I18nService.t('btn_run_satellite_diag');
      btn.disabled = false;

      let formatted = result.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const badge = isLive ? "● Gemini 3.6 Flash Live" : "● Neural Telemetry Engine";
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:#166534;">🌱 Satellite & Soil Diagnostics (${farm.district})</strong>
          <span class="m-badge m-badge-green">${badge}</span>
        </div>
        <div>${formatted}</div>
      `;
    });
  }
};
