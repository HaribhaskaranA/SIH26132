// Mobile Screen 01: GIS Land Registration & Soil Profile
const LandRegistrationScreen = {
  map: null,
  drawnItems: null,

  render: function(container) {
    const farm = AgroDataService.getFarm();

    container.innerHTML = `
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">🗺️ Farm GIS Boundary (டிஜிட்டல் நிலம்)</div>
          <span class="m-badge m-badge-green">ISRO Bhuvan Active</span>
        </div>
        
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          Tap polygon tool on map to draw farm boundary (நில எல்லையை வரையவும்):
        </p>

        <div id="mobileGisMap" class="m-map-container"></div>

        <div class="m-grid-3">
          <div class="m-stat-box">
            <div class="m-stat-val" id="dispAcreage">${farm.acreage} ac</div>
            <div class="m-stat-lbl">Acreage (பரப்பளவு)</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val" id="dispSoilPh">pH ${farm.soilPh}</div>
            <div class="m-stat-lbl">Soil pH (மண் தரம்)</div>
          </div>
          <div class="m-stat-box">
            <div class="m-stat-val" id="dispNdvi" style="color:var(--accent-green);">0.74</div>
            <div class="m-stat-lbl">NDVI Vigor (பசுமை)</div>
          </div>
        </div>

        <div class="m-input-group">
          <label>District / Location (மாவட்டம்)</label>
          <input type="text" id="farmDistrict" class="m-input" value="${farm.district}">
        </div>

        <div class="m-input-group">
          <label>Primary Registered Crop (பயிர்)</label>
          <select id="farmCrop" class="m-input">
            <option value="Tomato (தக்காளி)" selected>Tomato (தக்காளி)</option>
            <option value="Small Onion (சின்ன வெங்காயம்)">Small Onion (சின்ன வெங்காயம்)</option>
            <option value="Paddy (நெல்)">Paddy (நெல்)</option>
            <option value="Groundnut (நிலக்கடலை)">Groundnut (நிலக்கடலை)</option>
          </select>
        </div>

        <button class="m-btn m-btn-green" onclick="LandRegistrationScreen.saveFarmData()">
          💾 Save & Update Digital Twin
        </button>
      </div>
    `;

    setTimeout(() => this.initMap(farm), 150);
  },

  initMap: function(farm) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapElem = document.getElementById('mobileGisMap');
    if (!mapElem) return;

    this.map = L.map('mobileGisMap', { zoomControl: false }).setView([farm.lat, farm.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.map);

    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    // Initial farm polygon
    const initialCoords = [
      [farm.lat + 0.001, farm.lng + 0.001],
      [farm.lat + 0.001, farm.lng - 0.001],
      [farm.lat - 0.001, farm.lng - 0.001],
      [farm.lat - 0.001, farm.lng + 0.001]
    ];
    const poly = L.polygon(initialCoords, { color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.35 });
    this.drawnItems.addLayer(poly);

    // Draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { shapeOptions: { color: '#16a34a' } },
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
      
      const calcAcres = (Math.random() * 1.5 + 2.0).toFixed(2);
      document.getElementById('dispAcreage').innerText = calcAcres + " ac";
      AgroDataService.saveFarm({ acreage: parseFloat(calcAcres) });
    });
  },

  saveFarmData: function() {
    const district = document.getElementById('farmDistrict').value;
    const crop = document.getElementById('farmCrop').value;
    AgroDataService.saveFarm({ district, crop });
    alert("✅ Farm Digital Twin Profile Updated Successfully!");
    App.navigateTo('dashboard');
  }
};
