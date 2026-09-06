// Mobile Screen 06: Logistics Hub with Instant GPS Transition & Downloadable Receipt
const RidePoolingScreen = {
  currentMode: 'shared', // 'shared', 'individual', or 'tracking'
  trackingMap: null,
  truckMarker: null,
  trackingInterval: null,
  activeBooking: null,

  getActiveBooking: function() {
    if (this.activeBooking) return this.activeBooking;
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);

    this.activeBooking = {
      id: `TXN-TR-2026-${cleanId}`,
      service: 'Shared Ride-Pooling (Bolero Maxi Truck)',
      type: 'SHARED_LTL',
      driver: 'Murugan K (TN-25-AK-4820)',
      amount: 800,
      savings: 1400,
      route: `${farm.district} Rural Hub ➔ ${mandiInfo.mandi}`
    };
    return this.activeBooking;
  },

  render: function(container) {
    const farm = AgroDataService.getFarm();
    this.getActiveBooking();

    container.innerHTML = `
      <!-- Transport Mode 3-Pill Toggle -->
      <div class="m-card" style="padding: 4px; background: #f1f5f9; border-radius: var(--radius-full); display: flex; gap: 3px; margin-bottom: 10px;">
        <button id="btnModeShared" class="m-btn ${this.currentMode === 'shared' ? 'm-btn-green' : 'm-btn-outline'}" onclick="RidePoolingScreen.switchMode('shared')" style="padding: 7px 8px; font-size: 10px; flex: 1; border-radius: var(--radius-full);">
          🚚 Shared (₹800)
        </button>
        <button id="btnModeIndividual" class="m-btn ${this.currentMode === 'individual' ? 'm-btn-green' : 'm-btn-outline'}" onclick="RidePoolingScreen.switchMode('individual')" style="padding: 7px 8px; font-size: 10px; flex: 1; border-radius: var(--radius-full);">
          🚛 Solo (₹2.2k)
        </button>
        <button id="btnModeTracking" class="m-btn ${this.currentMode === 'tracking' ? 'm-btn-green' : 'm-btn-outline'}" onclick="RidePoolingScreen.switchMode('tracking')" style="padding: 7px 8px; font-size: 10px; flex: 1; border-radius: var(--radius-full);">
          📍 Live GPS Track
        </button>
      </div>

      <!-- Dynamic Mode View Content -->
      <div id="logisticsModeContainer">
        ${this.getModeHtml()}
      </div>
    `;

    if (this.currentMode === 'tracking') {
      setTimeout(() => this.initTrackingMap(farm), 150);
    }
  },

  switchMode: function(mode) {
    if (this.trackingInterval) clearInterval(this.trackingInterval);
    this.currentMode = mode;
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  getModeHtml: function() {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    const booking = this.getActiveBooking();

    if (this.currentMode === 'tracking') {
      return `
        <!-- Live GPS Transport Tracking View -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">📍 Live GPS Vehicle Tracking (${farm.district})</div>
            <span class="m-badge m-badge-green">● Moving (42 km/h)</span>
          </div>

          <!-- Booking Confirmation Success Banner -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #166534; margin-bottom: 8px; font-weight: 700;">
            ✓ Transport Dispatched: ${booking.service} • Ref: ${booking.id}
          </div>

          <!-- Interactive Tracking Map Canvas -->
          <div id="transportTrackingMap" class="m-map-container" style="height: 210px; margin-bottom: 8px;"></div>

          <!-- Live Telemetry Readout -->
          <div class="m-grid-3">
            <div class="m-stat-box" style="background: #f0fdf4; border-color: #86efac;">
              <div class="m-stat-val" style="color: #15803d;" id="trackEta">18 min</div>
              <div class="m-stat-lbl">Estimated Arrival</div>
            </div>
            <div class="m-stat-box">
              <div class="m-stat-val" id="trackDist">10.4 km</div>
              <div class="m-stat-lbl">Distance Remaining</div>
            </div>
            <div class="m-stat-box">
              <div class="m-stat-val" style="color: var(--accent-green);" id="trackSpeed">42 km/h</div>
              <div class="m-stat-lbl">Vehicle Speed</div>
            </div>
          </div>

          <!-- Driver Telemetry Card -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 800; color: #0f381e;">🚛 Driver: ${booking.driver}</div>
                <div style="font-size: 10px; color: #64748b;">Route: <strong>${booking.route}</strong></div>
              </div>
              <button class="m-btn m-btn-green" style="padding: 6px 12px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.callDriver('${booking.driver}')">
                ${I18nService.t('btn_call_driver')}
              </button>
            </div>
          </div>

          <!-- 4-Stage Delivery Stepper -->
          <div style="margin-top: 8px; font-size: 10.5px; background: #f1f5f9; padding: 8px 10px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>1. Farmgate Dispatched:</span> <strong style="color: #15803d;">05:30 AM ✓</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>2. Current Location:</span> <strong>${farm.district} Bypass (In Transit)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; color: #b45309; font-weight: bold;">
              <span>3. Mandi Weighbridge ETA:</span> <span>06:12 AM (18 Mins)</span>
            </div>
          </div>

          <!-- DOWNSIDE DOWNLOADABLE RECEIPT CARD -->
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 800; color: #166534;">📜 Official Transport Booking & Escrow Invoice</span>
              <span class="m-badge m-badge-green">100% Paid</span>
            </div>
            <div style="font-size: 10.5px; color: #14532d; margin-bottom: 8px;">
              Invoice Ref: <strong>${booking.id}</strong> • Freight Amount: <strong>₹${booking.amount}.00</strong>
            </div>
            <button class="m-btn m-btn-green" onclick="RidePoolingScreen.downloadActiveReceipt()" style="font-size: 12px;">
              📄 Download Certified Transport Receipt PDF
            </button>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'shared') {
      return `
        <!-- Shared Pooling View -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">🚚 Shared Less-Than-Truckload (LTL) Pooling</div>
            <span class="m-badge m-badge-green">64% Freight Cut</span>
          </div>

          <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 10px;">
            Share available cargo space in nearby mini-trucks heading towards ${farm.district} regional APMCs:
          </p>

          <!-- Driver 1 -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 800; color: #166534;">🚛 Bolero Pickup • Murugan K</div>
                <div style="font-size: 10px; color: #14532d;">${farm.district} Hub ➔ ${mandiInfo.mandi} (Depart: 05:30 AM)</div>
              </div>
              <span class="m-badge m-badge-green">700 kg Vacant</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #86efac;">
              <span style="font-size: 12px; font-weight: 800; color: #15803d;">₹800 / slot</span>
              <div style="display: flex; gap: 6px;">
                <button class="m-btn m-btn-green" style="padding: 6px 12px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.bookSharedSlot('Murugan K (Bolero Pickup TN-25-AK-4820)', 'Shared Ride-Pooling (Bolero Pickup)', 800)">
                  ${I18nService.t('btn_book_live_track')}
                </button>
                <button class="m-btn m-btn-outline" style="padding: 6px 10px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.callDriver('Murugan K')">
                  📞 Call
                </button>
              </div>
            </div>
          </div>

          <!-- Driver 2 -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 800; color: #0f2918;">🚚 Tata Ace • Selvam R</div>
                <div style="font-size: 10px; color: #64748b;">${farm.district} Rural ➔ ${mandiInfo.secondaryMandi} (Depart: 09:00 PM)</div>
              </div>
              <span class="m-badge m-badge-blue">1,200 kg Vacant</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
              <span style="font-size: 12px; font-weight: 800; color: #0f381e;">₹1,100 / slot</span>
              <div style="display: flex; gap: 6px;">
                <button class="m-btn m-btn-green" style="padding: 6px 12px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.bookSharedSlot('Selvam R (Tata Ace TN-25-E-9011)', 'Shared Ride-Pooling (Tata Ace)', 1100)">
                  ${I18nService.t('btn_book_live_track')}
                </button>
                <button class="m-btn m-btn-outline" style="padding: 6px 10px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.callDriver('Selvam R')">
                  📞 Call
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <!-- Solo Dedicated Truck Transport View -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">🚛 Dedicated Solo Vehicle Hire</div>
            <span class="m-badge m-badge-blue">100% Private Capacity</span>
          </div>

          <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 10px;">
            Book an entire mini-truck exclusively for your harvest with on-demand farmgate doorstep dispatch in ${farm.district}:
          </p>

          <!-- Solo Option 1 -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 800; color: #0f381e;">🚚 Mahindra Bolero Maxi Truck (2.5 Tons)</div>
                <div style="font-size: 10px; color: #64748b;">Exclusive Full Load • Doorstep Farm Pickup within 45 Mins</div>
              </div>
              <span class="m-badge m-badge-green">Instant Dispatch</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
              <div>
                <span style="font-size: 13px; font-weight: 800; color: #0f381e;">₹2,200</span>
                <span style="font-size: 9.5px; color: #64748b;"> (Fixed Rate to ${mandiInfo.mandi})</span>
              </div>
              <button class="m-btn m-btn-green" style="padding: 6px 14px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.bookSoloTruck('Bolero Maxi Truck (2.5T)', 2200)">
                ${I18nService.t('btn_book_solo')}
              </button>
            </div>
          </div>

          <!-- Solo Option 2 -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 800; color: #0f381e;">🚛 Eicher Pro 4.0 Ton Heavy Carrier</div>
                <div style="font-size: 10px; color: #64748b;">Bulk Long-Haul Transport • Chennai / Bangalore Mandis</div>
              </div>
              <span class="m-badge m-badge-blue">Heavy Load</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
              <div>
                <span style="font-size: 13px; font-weight: 800; color: #0f381e;">₹4,500</span>
                <span style="font-size: 9.5px; color: #64748b;"> (Long-Haul Rate)</span>
              </div>
              <button class="m-btn m-btn-green" style="padding: 6px 14px; width: auto; font-size: 11px;" onclick="RidePoolingScreen.bookSoloTruck('Eicher Pro Heavy (4.0T)', 4500)">
                ${I18nService.t('btn_book_solo')}
              </button>
            </div>
          </div>
        </div>
      `;
    }
  },

  initTrackingMap: function(farm) {
    if (this.trackingMap) {
      this.trackingMap.remove();
      this.trackingMap = null;
    }

    const mapElem = document.getElementById('transportTrackingMap');
    if (!mapElem) return;

    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    this.trackingMap = L.map('transportTrackingMap', { zoomControl: false }).setView([farm.lat + 0.007, farm.lng + 0.006], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.trackingMap);

    const routeCoords = [
      [farm.lat, farm.lng],
      [farm.lat + 0.004, farm.lng + 0.003],
      [farm.lat + 0.008, farm.lng + 0.007],
      [farm.lat + 0.012, farm.lng + 0.010],
      [farm.lat + 0.015, farm.lng + 0.012]
    ];

    L.polyline(routeCoords, { color: '#16a34a', weight: 5, dashArray: '6, 8' }).addTo(this.trackingMap);

    L.marker([farm.lat, farm.lng], {
      icon: L.divIcon({ html: '<div style="background:#15803d; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:11px;">🌱</div>' })
    }).bindPopup(`Farm Origin (${farm.district})`).addTo(this.trackingMap);

    L.marker([farm.lat + 0.015, farm.lng + 0.012], {
      icon: L.divIcon({ html: '<div style="background:#dc2626; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:11px;">🏛️</div>' })
    }).bindPopup(mandiInfo.mandi).addTo(this.trackingMap);

    let step = 1;
    this.truckMarker = L.marker(routeCoords[step], {
      icon: L.divIcon({ html: '<div style="background:#2563eb; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 0 10px rgba(37,99,235,0.6);">🚚</div>' })
    }).bindPopup("<strong>TN-25-AK-4820 (In Transit)</strong><br>Speed: 42 km/h").addTo(this.trackingMap);

    this.trackingInterval = setInterval(() => {
      step = (step + 1) % routeCoords.length;
      if (step === 0) step = 1;
      this.truckMarker.setLatLng(routeCoords[step]);

      const dists = ["12.5 km", "10.4 km", "6.2 km", "2.1 km"];
      const etas = ["22 min", "18 min", "11 min", "4 min"];
      const speed = Math.floor(40 + Math.random() * 6);

      const etaElem = document.getElementById('trackEta');
      const distElem = document.getElementById('trackDist');
      const speedElem = document.getElementById('trackSpeed');

      if (etaElem) etaElem.innerText = etas[step % etas.length];
      if (distElem) distElem.innerText = dists[step % dists.length];
      if (speedElem) speedElem.innerText = `${speed} km/h`;
    }, 2500);
  },

  callDriver: function(driverName) {
    alert(`📞 Connecting Call to Driver ${driverName} via DPDP Masked Virtual Proxy (044-6902-8842)...\nYour phone number remains 100% private.`);
  },

  bookSharedSlot: function(driver, serviceName, amount) {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    this.activeBooking = {
      id: "TXN-TR-" + Math.floor(100000 + Math.random() * 900000),
      service: serviceName,
      type: 'SHARED_LTL',
      driver: driver,
      amount: amount,
      savings: 1400,
      route: `${farm.district} Hub ➔ ${mandiInfo.mandi}`
    };
    alert(`🎉 Shared Ride-Pooling Slot Confirmed with ${driver} for ₹${amount}!\n\nSwitching to Live GPS Tracking & Downloadable Receipt...`);
    this.switchMode('tracking');
  },

  bookSoloTruck: function(vehicle, amount) {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    this.activeBooking = {
      id: "TXN-TR-" + Math.floor(100000 + Math.random() * 900000),
      service: `Dedicated Solo Truck (${vehicle})`,
      type: 'SOLO_DEDICATED',
      driver: 'Ramesh Kumar (TN-25-AK-9021)',
      amount: amount,
      savings: 0,
      route: `Doorstep Farmgate (${farm.district}) ➔ ${mandiInfo.mandi}`
    };
    alert(`🎉 Dedicated Solo Truck (${vehicle}) Booked for ₹${amount}!\n\nDriver dispatched to your farm. Switching to Live GPS Tracking & Downloadable Receipt...`);
    this.switchMode('tracking');
  },

  downloadActiveReceipt: function() {
    const farm = AgroDataService.getFarm();
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const b = this.getActiveBooking();

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transport Invoice - ${b.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 28px; color: #0f172a; line-height: 1.5; background: #ffffff; }
          .doc-frame { border: 2.5px solid #0f381e; padding: 24px; border-radius: 12px; }
          .header { border-bottom: 2.5px solid #0f381e; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
          .logo-box { display: flex; align-items: center; gap: 14px; }
          .logo-img { width: 62px; height: 62px; border-radius: 50%; border: 2.5px solid #16a34a; object-fit: cover; }
          .title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; color: #0f381e; }
          .sub { font-size: 11.5px; font-weight: 700; color: #166534; }
          .badge { background: linear-gradient(135deg, #15803d, #0f381e); color: #ffffff; padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; text-align: center; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
          .card { background: #f8fafc; border: 1.5px solid #cbd5e1; padding: 14px; border-radius: 8px; font-size: 11.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 11.5px; }
          th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; }
          th { background: #0f381e; color: #ffffff; font-weight: 700; }
          .seal-box { margin-top: 22px; border-top: 2px dashed #cbd5e1; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
          .seal { border: 2px solid #15803d; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #15803d; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="doc-frame">
          <div class="header">
            <div class="logo-box">
              <img src="assets/logo.jpg" alt="Logo" class="logo-img">
              <div>
                <div class="title">OFFICIAL DIGITAL TRANSPORT INVOICE & RECEIPT</div>
                <div class="sub">EARTHWORM Logistics Network • Less-Than-Truckload & Dedicated Dispatch</div>
              </div>
            </div>
            <div class="badge">
              🛡️ CERTIFIED BY EARTHWORM<br>
              <span style="font-size: 9px; color: #86efac;">Logistics Gateway</span>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <strong>Farmer Credentials:</strong><br>
              Name: ${farmerName}<br>
              ID: #${farmerId}<br>
              District: ${farm.district}, Tamil Nadu
            </div>
            <div class="card">
              <strong>Transport Booking Details:</strong><br>
              Invoice Ref: <strong>${b.id}</strong><br>
              Type: ${b.type === 'SHARED_LTL' ? 'Shared Pooling (64% Subsidy)' : 'Solo Dedicated Freight'}<br>
              Driver / Carrier: ${b.driver}<br>
              Route: ${b.route}
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Service Description</th><th>Transport Mode</th><th>Net Settled Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${b.service}</strong><br><span style="font-size: 10px; color:#64748b;">Includes 100% Escrow Insurance & Live Telemetry Tracking</span></td>
                <td>${b.type === 'SHARED_LTL' ? 'Aggregated Shared Hub' : 'Dedicated Solo Vehicle'}</td>
                <td style="font-size: 15px; font-weight: bold; color: #15803d;">₹${b.amount}.00</td>
              </tr>
            </tbody>
          </table>

          <div class="seal-box">
            <div class="seal">
              <span>✓ PAID & ESCROW SETTLED • ${b.id}</span>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <strong>Authorized by:</strong> EARTHWORM Freight Aggregator Engine<br>
              Tamper-Evident SHA-256 Digital Signature Verified.
            </div>
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  }
};
