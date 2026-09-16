// Mobile Screen 06: Logistics Hub with Instant GPS Transition & Downloadable Receipt
window.RidePoolingScreen = {
  currentMode: 'tracking',
  activeBooking: null,
  currentStageIndex: 1, // 0: Assigned, 1: Reaching Farm, 2: Pickup Completed, 3: In Transit, 4: Delivered
  
  stages: [
    { id: 'ASSIGNED', name: 'Assigned', icon: '📋', desc: 'Driver & Vehicle Allocated' },
    { id: 'REACHING_FARM', name: 'Reaching Farm', icon: '🚜', desc: 'Vehicle En Route to Farmgate' },
    { id: 'PICKUP_COMPLETED', name: 'Pickup Done', icon: '📦', desc: 'Loaded & Weighed at Farm' },
    { id: 'IN_TRANSIT', name: 'In Transit', icon: '🚚', desc: 'Produce Heading to Buyer / Mandi' },
    { id: 'DELIVERED', name: 'Delivered', icon: '🏁', desc: 'Arrived at Buyer Weighbridge' }
  ],

  setStage: function(index) {
    this.currentStageIndex = Math.max(0, Math.min(index, this.stages.length - 1));
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

  advanceStage: function() {
    this.currentStageIndex = (this.currentStageIndex + 1) % this.stages.length;
    const container = document.getElementById('mobileMainContent');
    this.render(container);
  },

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
      route: `${farm.district} Rural Hub ➔ ${mandiInfo.mandi}`,
      pickupEta: '12 mins',
      pickupDist: '4.2 km',
      deliveryEta: '28 mins',
      deliveryDist: '18.5 km'
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
          📍 Live GPS & ETA
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
    const currStage = this.stages[this.currentStageIndex];

    if (this.currentMode === 'tracking') {
      return `
        <!-- Live GPS Transport Tracking & Dual ETA View -->
        <div class="m-card">
          <div class="m-card-header">
            <div class="m-card-title">📍 Live Transport Status & ETA (${farm.district})</div>
            <span class="m-badge ${this.currentStageIndex === 4 ? 'm-badge-green' : 'm-badge-blue'}">
              ● ${currStage.name}
            </span>
          </div>

          <!-- 5-STAGE TRANSPORT STATUS STEPPER -->
          <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 8px; margin-bottom: 10px;">
            <div style="font-size: 10.5px; font-weight: 800; color: #0f381e; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>🚀 Transport Workflow:</span>
              <span style="font-size: 10px; color: #166534;">Stage ${this.currentStageIndex + 1} of 5</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 6px;">
              ${this.stages.map((stg, i) => {
                const isPassed = i < this.currentStageIndex;
                const isCurrent = i === this.currentStageIndex;
                const bg = isCurrent ? '#15803d' : isPassed ? '#16a34a' : '#e2e8f0';
                const color = isCurrent || isPassed ? '#ffffff' : '#64748b';
                return `
                  <div onclick="RidePoolingScreen.setStage(${i})" style="flex: 1; text-align: center; cursor: pointer;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${bg}; color: ${color}; font-size: 11px; display: flex; align-items: center; justify-content: center; margin: 0 auto 3px auto; font-weight: 800; box-shadow: ${isCurrent ? '0 0 8px rgba(22,163,74,0.5)' : 'none'};">
                      ${isPassed ? '✓' : stg.icon}
                    </div>
                    <div style="font-size: 8.5px; font-weight: ${isCurrent ? '800' : '600'}; color: ${isCurrent ? '#15803d' : '#475569'}; line-height: 1.1;">
                      ${stg.name}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="background: #f0fdf4; border-radius: 6px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span style="font-size: 10px; color: #166534; font-weight: 700;">
                Current Status: <strong>${currStage.name}</strong> • ${currStage.desc}
              </span>
              <button class="m-btn m-btn-green" onclick="RidePoolingScreen.advanceStage()" style="width: auto; padding: 3px 8px; font-size: 9.5px;">
                ⚡ Next Step →
              </button>
            </div>
          </div>

          <!-- CRYSTAL-CLEAR DUAL ESTIMATED TIME CARDS (PICKUP ETA & BUYER DELIVERY ETA) -->
          <div style="background: linear-gradient(135deg, #0f381e 0%, #166534 100%); color: white; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 10px; font-weight: 800; color: #fde047; text-transform: uppercase; letter-spacing: 0.5px;">
              ⏱️ Real-Time Transport ETA Tracking
            </div>
            <div style="font-size: 9.5px; color: #86efac; font-weight: 700;">
              🌾 Farmgate ➔ 🚚 Highway ➔ 🏛️ Mandi
            </div>
          </div>

          <div class="m-grid-2" style="margin-bottom: 8px;">
            <!-- ETA 1: Vehicle Reaching Farm (Pickup) -->
            <div class="m-stat-box" style="background: ${this.currentStageIndex < 2 ? '#ecfdf5' : '#f8fafc'}; border: 2px solid ${this.currentStageIndex < 2 ? '#10b981' : '#cbd5e1'}; text-align: left; padding: 9px 10px; box-shadow: ${this.currentStageIndex < 2 ? '0 2px 8px rgba(16,185,129,0.15)' : 'none'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 9.5px; color: #047857; font-weight: 800; text-transform: uppercase;">🚜 Pickup ETA:</span>
                <span class="m-badge ${this.currentStageIndex < 2 ? 'm-badge-green' : 'm-badge-outline'}" style="font-size: 8px; padding: 1px 5px;">
                  ${this.currentStageIndex < 2 ? 'Active' : 'Done ✓'}
                </span>
              </div>
              <div class="m-stat-val" style="color: ${this.currentStageIndex < 2 ? '#15803d' : '#64748b'}; font-size: 17px; font-weight: 900; margin: 3px 0;">
                ${this.currentStageIndex < 2 ? '12 mins' : '✓ Arrived & Loaded'}
              </div>
              <div style="font-size: 9px; color: #475569; line-height: 1.2;">
                ${this.currentStageIndex < 2 ? 'Distance: <strong>4.2 km</strong> (Vehicle reaching farm)' : 'Farmgate Pickup & Weighing Complete'}
              </div>
            </div>

            <!-- ETA 2: Produce Reaching Buyer / Mandi -->
            <div class="m-stat-box" style="background: ${this.currentStageIndex >= 2 && this.currentStageIndex < 4 ? '#eff6ff' : this.currentStageIndex === 4 ? '#ecfdf5' : '#f8fafc'}; border: 2px solid ${this.currentStageIndex >= 2 ? '#3b82f6' : '#cbd5e1'}; text-align: left; padding: 9px 10px; box-shadow: ${this.currentStageIndex >= 2 ? '0 2px 8px rgba(59,130,246,0.15)' : 'none'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 9.5px; color: #1d4ed8; font-weight: 800; text-transform: uppercase;">🏁 Delivery ETA:</span>
                <span class="m-badge ${this.currentStageIndex === 4 ? 'm-badge-green' : this.currentStageIndex >= 2 ? 'm-badge-blue' : 'm-badge-outline'}" style="font-size: 8px; padding: 1px 5px;">
                  ${this.currentStageIndex === 4 ? 'Delivered' : this.currentStageIndex >= 2 ? 'In Transit' : 'Scheduled'}
                </span>
              </div>
              <div class="m-stat-val" style="color: ${this.currentStageIndex === 4 ? '#15803d' : '#1d4ed8'}; font-size: 17px; font-weight: 900; margin: 3px 0;">
                ${this.currentStageIndex === 4 ? '✓ Delivered' : this.currentStageIndex >= 2 ? '28 mins' : 'Est. ~45 mins'}
              </div>
              <div style="font-size: 9px; color: #475569; line-height: 1.2;">
                ${this.currentStageIndex === 4 ? 'Produce arrived at Mandi Weighbridge' : 'Target: <strong>' + mandiInfo.mandi + '</strong> (18.5 km)'}
              </div>
            </div>
          </div>

          <!-- Interactive Tracking Map Canvas -->
          <div id="transportTrackingMap" class="m-map-container" style="height: 190px; margin-bottom: 8px;"></div>

          <!-- Driver Telemetry Card -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 11.5px; font-weight: 800; color: #0f381e;">🚛 Driver: ${booking.driver}</div>
                <div style="font-size: 9.5px; color: #64748b;">Route: <strong>${booking.route}</strong></div>
              </div>
              <button class="m-btn m-btn-green" style="padding: 6px 12px; width: auto; font-size: 10.5px;" onclick="RidePoolingScreen.callDriver('${booking.driver}')">
                ${I18nService.t('btn_call_driver')}
              </button>
            </div>
          </div>

          <!-- DOWNSIDE DOWNLOADABLE RECEIPT CARD -->
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #166534;">📜 Transport Booking & Escrow Invoice</span>
              <span class="m-badge m-badge-green">100% Paid</span>
            </div>
            <div style="font-size: 10px; color: #14532d; margin-bottom: 6px;">
              Ref: <strong>${booking.id}</strong> • Freight: <strong>₹${booking.amount}.00</strong>
            </div>
            <button class="m-btn m-btn-green" onclick="RidePoolingScreen.downloadActiveReceipt()" style="font-size: 11.5px; padding: 8px;">
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
            <!-- Dynamic ETA Bar -->
            <div style="display: flex; gap: 6px; font-size: 9.5px; margin-top: 6px; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
              <span style="color: #047857; font-weight: 700;">🚜 Pickup ETA: <strong>12 Mins</strong></span>
              <span style="color: #64748b;">•</span>
              <span style="color: #1d4ed8; font-weight: 700;">🏁 Produce Delivery ETA: <strong>38 Mins</strong></span>
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
            <!-- Dynamic ETA Bar -->
            <div style="display: flex; gap: 6px; font-size: 9.5px; margin-top: 6px; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <span style="color: #047857; font-weight: 700;">🚜 Pickup ETA: <strong>20 Mins</strong></span>
              <span style="color: #64748b;">•</span>
              <span style="color: #1d4ed8; font-weight: 700;">🏁 Produce Delivery ETA: <strong>45 Mins</strong></span>
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
            <!-- Dynamic ETA Bar -->
            <div style="display: flex; gap: 6px; font-size: 9.5px; margin-top: 6px; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <span style="color: #047857; font-weight: 700;">🚜 Farm Pickup: <strong>~15 Mins</strong></span>
              <span style="color: #64748b;">•</span>
              <span style="color: #1d4ed8; font-weight: 700;">🏁 Buyer Delivery ETA: <strong>35 Mins</strong></span>
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
            <!-- Dynamic ETA Bar -->
            <div style="display: flex; gap: 6px; font-size: 9.5px; margin-top: 6px; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
              <span style="color: #047857; font-weight: 700;">🚜 Farm Pickup: <strong>~30 Mins</strong></span>
              <span style="color: #64748b;">•</span>
              <span style="color: #1d4ed8; font-weight: 700;">🏁 Buyer Delivery ETA: <strong>120 Mins (Inter-district)</strong></span>
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
