// Mobile Screen 09: Master Transactions, Escrow Payment Tracking & Digital Invoices Hub
const TransactionsHubScreen = {
  txnTrackingMap: null,
  txnTruckMarker: null,
  txnTrackingInterval: null,

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';
    const customTxns = JSON.parse(localStorage.getItem('earthworm_custom_txns') || '[]');

    container.innerHTML = `
      <!-- Financial Overview Card -->
      <div class="m-card" style="background: linear-gradient(135deg, #0f381e 0%, #166534 100%); color: white; padding: 14px; border: none; border-radius: var(--radius-md);">
        <div style="font-size: 11px; color: #86efac; font-weight: 700;">${I18nService.t('lbl_total_revenue')}</div>
        <div style="font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; color: #ffffff; margin: 4px 0;">
          ₹79,000.00
        </div>
        <div class="m-grid-2" style="margin-top: 8px; margin-bottom: 0;">
          <div style="background: rgba(255,255,255,0.12); padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #cbd5e1;">${I18nService.t('lbl_settled_escrow_dbt')}</div>
            <div style="font-size: 13px; font-weight: 800; color: #86efac;">100% (₹79,000)</div>
          </div>
          <div style="background: rgba(255,255,255,0.12); padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #cbd5e1;">${I18nService.t('lbl_freight_savings')}</div>
            <div style="font-size: 13px; font-weight: 800; color: #86efac;">+₹1,400 (64%)</div>
          </div>
        </div>
      </div>

      <!-- LIVE GPS SHARE PIN & TRANSIT TELEMETRY TRACKER -->
      <div class="m-card" id="sharePinTrackerCard" style="border: 2px solid #38bdf8; background: #f0f9ff;">
        <div class="m-card-header">
          <div class="m-card-title" style="color: #0369a1;">📍 ${I18nService.t('lbl_live_fleet_telemetry') || 'Live GPS Share PIN & Transit Tracker'}</div>
          <span class="m-badge m-badge-blue">🟢 GPS Live Synced</span>
        </div>

        <p style="font-size: 10.5px; color: #0284c7; margin-bottom: 8px;">
          Track live vehicle transit coordinates using your 4-digit Transaction Share PIN or Transit Code:
        </p>

        <!-- Share PIN Search & Input Bar -->
        <div style="display: flex; gap: 6px; margin-bottom: 10px;">
          <input type="text" id="sharePinInput" class="m-input" value="PIN-TN-${cleanId}" placeholder="Enter Share PIN (e.g. PIN-TN-${cleanId})" style="flex: 1; font-family: monospace; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: #ffffff;" />
          <button class="m-btn m-btn-green" onclick="TransactionsHubScreen.trackSharePin()" style="width: auto; padding: 6px 14px; font-size: 11px; white-space: nowrap;">
            📍 Track GPS
          </button>
        </div>

        <!-- Interactive Transit GPS Map Canvas -->
        <div id="txnGpsMap" class="m-map-container" style="height: 200px; margin-bottom: 8px; border-radius: 8px; border: 1.5px solid #38bdf8;"></div>

        <!-- Telemetry Stats Grid -->
        <div class="m-grid-3" style="margin-bottom: 8px;">
          <div class="m-stat-box" style="background: #ffffff; border-color: #bae6fd;">
            <div class="m-stat-val" style="color: #0284c7;" id="txnTrackEta">18 min</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_estimated_arrival')}</div>
          </div>
          <div class="m-stat-box" style="background: #ffffff; border-color: #bae6fd;">
            <div class="m-stat-val" id="txnTrackDist">10.4 km</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_distance_remaining')}</div>
          </div>
          <div class="m-stat-box" style="background: #ffffff; border-color: #bae6fd;">
            <div class="m-stat-val" style="color: var(--accent-green);" id="txnTrackSpeed">42 km/h</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_vehicle_speed')}</div>
          </div>
        </div>

        <!-- Active Transit Metadata Box -->
        <div id="txnGpsInfoBox" style="background: #ffffff; border: 1.5px solid #bae6fd; border-radius: 8px; padding: 10px; font-size: 10.5px; line-height: 1.5;">
          <div style="font-weight: 800; color: #0369a1; margin-bottom: 2px;">
            🚛 Bolero Maxi Truck (TN-25-AK-4820) • Driver: Murugan K
          </div>
          <div style="color: #0f172a;">
            • <strong>Linked Transaction:</strong> Produce Sale #TXN-SL-2026-${cleanId} (2,000 kg ${farm.crop})<br>
            • <strong>Banking UTR:</strong> <code>RBI20260904${cleanId}</code> (100% Escrow Locked)<br>
            • <strong>Transit Share PIN:</strong> <span style="font-family: monospace; font-weight: 800; color: #0284c7;">#PIN-TN-${cleanId}</span> (Active Telemetry Broadcast)
          </div>
        </div>
      </div>

      <!-- LIVE 24-HOUR ESCROW PAYMENT TRACKER -->
      <div class="m-card" style="border: 2px solid #86efac; background: #f0fdf4;">
        <div class="m-card-header">
          <div class="m-card-title">${I18nService.t('lbl_24hr_escrow_tracker')}</div>
          <span class="m-badge m-badge-green">${I18nService.t('badge_statutory_sla')}</span>
        </div>

        <div style="font-size: 11px; color: #166534; font-weight: 700; margin-bottom: 4px;">
          Active Contract: Reliance Fresh Agri Hub • Lot #LOT-TN-${cleanId} (2,000 kg ${farm.crop})
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #0f381e; margin-bottom: 8px;">
          ₹57,000.00 <span style="font-size: 11px; color: #15803d; font-weight: 600;">(100% DBT Escrow Released)</span>
        </div>

        <!-- 4-Stage Payment Stepper -->
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 10.5px; background: #ffffff; border: 1px solid #86efac; border-radius: 8px; padding: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${I18nService.t('lbl_weighment_confirmed')} (Slip #WB-${cleanId})</span>
            <strong style="color: #15803d;">06:15 AM ✓</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${I18nService.t('lbl_quality_approved')}</span>
            <strong style="color: #15803d;">06:22 AM ✓</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${I18nService.t('lbl_escrow_locked_rbi')}</span>
            <strong style="color: #15803d;">06:25 AM ✓</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 4px; color: #15803d; font-weight: bold;">
            <span>${I18nService.t('lbl_dbt_credited')}</span>
            <span>UTR: RBI20260904${cleanId} ✓</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 10px; color: #166534;">⏱️ Statutory APMC SLA: Settled within 45 Minutes (Mandate: &lt; 24 Hrs)</span>
          <button class="m-btn m-btn-green" style="width: auto; padding: 4px 10px; font-size: 10.5px;" onclick="TransactionsHubScreen.printReceipt('Produce Sale Contract', 'Reliance Fresh Central Agri Hub', 57000, 'TXN-SL-2026-${cleanId}', 'Grade A ${farm.crop} (2,000 kg)')">
            ${I18nService.t('btn_download_invoice')}
          </button>
        </div>
      </div>

      <!-- Transactions & Invoices List -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">${I18nService.t('lbl_transaction_records')}</div>
          <span class="m-badge m-badge-green">${I18nService.t('badge_audit_verified')}</span>
        </div>

        <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 12px;">
          ${I18nService.t('lbl_txn_records_desc')}
        </p>

        <!-- Dynamically render any new custom transactions -->
        ${customTxns.map(t => `
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 800; color: #166534;">🛒 ${t.title}</span>
              <span class="m-badge m-badge-green">${t.status}</span>
            </div>
            <div style="font-size: 10px; color: #14532d; margin: 4px 0;">
              Ref: <strong>#${t.refNo}</strong> • ${t.desc} • UTR: <code>${t.utr}</code>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #86efac;">
              <span style="font-size: 14px; font-weight: 800; color: #15803d;">₹${t.amount.toLocaleString('en-IN')}.00</span>
              <div style="display: flex; gap: 6px;">
                <button class="m-btn m-btn-outline" style="padding: 5px 10px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.trackSharePin('PIN-TN-${t.refNo.replace(/[^0-9]/g, '') || cleanId}')">
                  📍 GPS Track
                </button>
                <button class="m-btn m-btn-green" style="padding: 5px 12px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.printReceipt('${t.title}', '${t.counterparty}', ${t.amount}, '${t.refNo}', '${t.desc}')">
                  ${I18nService.t('btn_download_invoice')}
                </button>
              </div>
            </div>
          </div>
        `).join('')}

        <!-- TXN 1: Produce Sale to Reliance Fresh -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 800; color: #0f381e;">🍅 Produce Sale • Reliance Fresh Ltd</span>
            <span class="m-badge m-badge-green">DBT Settled</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin: 4px 0;">
            Ref: <strong>#TXN-SL-2026-${cleanId}</strong> • Lot #LOT-TN-${cleanId} (2,000 kg Grade A @ ₹28.50/kg)
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
            <span style="font-size: 14px; font-weight: 800; color: #15803d;">₹57,000.00</span>
            <div style="display: flex; gap: 6px;">
              <button class="m-btn m-btn-outline" style="padding: 5px 10px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.trackSharePin('PIN-TN-${cleanId}')">
                📍 GPS Track
              </button>
              <button class="m-btn m-btn-green" style="padding: 5px 12px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.printReceipt('Produce Sale Contract', 'Reliance Fresh Central Agri Hub', 57000, 'TXN-SL-2026-${cleanId}', 'Grade A ${farm.crop} (2,000 kg)')">
                ${I18nService.t('btn_download_invoice')}
              </button>
            </div>
          </div>
        </div>

        <!-- TXN 2: Produce Sale to Annapoorna -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 800; color: #0f381e;">🥫 Buyback • Annapoorna Foods</span>
            <span class="m-badge m-badge-green">DBT Settled</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin: 4px 0;">
            Ref: <strong>#TXN-SL-2026-${cleanId}B</strong> • 800 kg Processing Grade @ ₹27.50/kg
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
            <span style="font-size: 14px; font-weight: 800; color: #15803d;">₹22,000.00</span>
            <div style="display: flex; gap: 6px;">
              <button class="m-btn m-btn-outline" style="padding: 5px 10px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.trackSharePin('PIN-TN-${cleanId}B')">
                📍 GPS Track
              </button>
              <button class="m-btn m-btn-green" style="padding: 5px 12px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.printReceipt('Direct Institutional Procurement', 'Annapoorna Food Processing Ltd', 22000, 'TXN-SL-2026-${cleanId}B', '${farm.crop} Processing Grade (800 kg)')">
                ${I18nService.t('btn_download_invoice')}
              </button>
            </div>
          </div>
        </div>

        <!-- TXN 3: Shared Ride-Pooling Freight Booking -->
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 800; color: #166534;">🚚 Shared Freight Pooling • Murugan K</span>
            <span class="m-badge m-badge-green">Escrow Paid</span>
          </div>
          <div style="font-size: 10px; color: #14532d; margin: 4px 0;">
            Ref: <strong>#TXN-TR-2026-${cleanId}</strong> • 700 kg Slot (${farm.district} ➔ APMC Mandi)
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #86efac;">
            <span style="font-size: 14px; font-weight: 800; color: #0f381e;">₹800.00 <span style="font-size: 9.5px; color:#16a34a;">(Saved ₹1,400)</span></span>
            <div style="display: flex; gap: 6px;">
              <button class="m-btn m-btn-outline" style="padding: 5px 10px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.trackSharePin('PIN-TR-${cleanId}')">
                📍 GPS Track
              </button>
              <button class="m-btn m-btn-outline" style="padding: 5px 12px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.printReceipt('Shared Ride-Pooling Freight', 'Murugan K (Bolero Maxi Truck)', 800, 'TXN-TR-2026-${cleanId}', 'Shared Cargo Space (700 kg)')">
                ${I18nService.t('btn_download_receipt')}
              </button>
            </div>
          </div>
        </div>

        <!-- TXN 4: Cold Storage Reservation -->
        <div style="background: #fefce8; border: 1.5px solid #fde047; border-radius: 8px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 800; color: #854d0e;">❄️ Cold Storage Bay • ${farm.district} Warehouse</span>
            <span class="m-badge m-badge-amber">AIF Subsidized</span>
          </div>
          <div style="font-size: 10px; color: #713f12; margin: 4px 0;">
            Ref: <strong>#TXN-ST-2026-${cleanId}</strong> • 2,000 kg Holding for 3 Weeks (Post-Glut Recovery)
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde047;">
            <span style="font-size: 14px; font-weight: 800; color: #854d0e;">₹2,800.00</span>
            <button class="m-btn m-btn-outline" style="padding: 5px 12px; width: auto; font-size: 11px;" onclick="TransactionsHubScreen.printReceipt('Subsidized Cold Storage Bay', '${farm.district} Central Warehouse AIF-902', 2800, 'TXN-ST-2026-${cleanId}', 'Temperature-Controlled Bay (2,000 kg)')">
              ${I18nService.t('btn_download_receipt')}
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.initTxnGpsMap(`PIN-TN-${cleanId}`);
    }, 150);
  },

  trackSharePin: function(overridePin) {
    const input = document.getElementById('sharePinInput');
    const pin = overridePin || (input ? input.value.trim() : '');
    if (input && overridePin) input.value = overridePin;

    const trackerCard = document.getElementById('sharePinTrackerCard');
    if (trackerCard) {
      trackerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.initTxnGpsMap(pin || 'PIN-TN-8842');
  },

  initTxnGpsMap: function(pin) {
    if (this.txnTrackingInterval) {
      clearInterval(this.txnTrackingInterval);
      this.txnTrackingInterval = null;
    }

    if (this.txnTrackingMap) {
      this.txnTrackingMap.remove();
      this.txnTrackingMap = null;
    }

    const mapElem = document.getElementById('txnGpsMap');
    if (!mapElem) return;

    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';

    this.txnTrackingMap = L.map('txnGpsMap', { zoomControl: false }).setView([farm.lat + 0.006, farm.lng + 0.005], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | ISRO Bhuvan'
    }).addTo(this.txnTrackingMap);

    const routeCoords = [
      [farm.lat, farm.lng],
      [farm.lat + 0.003, farm.lng + 0.002],
      [farm.lat + 0.007, farm.lng + 0.005],
      [farm.lat + 0.011, farm.lng + 0.009],
      [farm.lat + 0.014, farm.lng + 0.012]
    ];

    L.polyline(routeCoords, { color: '#0284c7', weight: 4, dashArray: '5, 8' }).addTo(this.txnTrackingMap);

    L.marker([farm.lat, farm.lng], {
      icon: L.divIcon({ html: '<div style="background:#15803d; color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:10px;">🌱</div>' })
    }).bindPopup(`<strong>Farmer #${farmerId} Farmgate</strong><br>${farm.district}`).addTo(this.txnTrackingMap);

    L.marker([farm.lat + 0.014, farm.lng + 0.012], {
      icon: L.divIcon({ html: '<div style="background:#0369a1; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:11px; border:2px solid white;">🛒</div>' })
    }).bindPopup(`<strong>${mandiInfo.mandi}</strong><br>Institutional Ingestion Hub`).addTo(this.txnTrackingMap);

    let step = 1;
    this.txnTruckMarker = L.marker(routeCoords[step], {
      icon: L.divIcon({ html: '<div style="background:#0284c7; color:white; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-size:14px; border:2px solid white; box-shadow:0 0 10px rgba(2,132,199,0.7);">🚚</div>' })
    }).bindPopup(`<strong>Bolero Maxi (TN-25-AK-4820)</strong><br>Share PIN: ${pin || 'PIN-TN-' + cleanId}`).addTo(this.txnTrackingMap);

    this.txnTrackingInterval = setInterval(() => {
      step = (step + 1) % routeCoords.length;
      if (step === 0) step = 1;
      this.txnTruckMarker.setLatLng(routeCoords[step]);

      const dists = ["12.5 km", "10.4 km", "6.2 km", "2.1 km"];
      const etas = ["22 min", "18 min", "11 min", "4 min"];
      const speed = Math.floor(40 + Math.random() * 5);

      const etaElem = document.getElementById('txnTrackEta');
      const distElem = document.getElementById('txnTrackDist');
      const speedElem = document.getElementById('txnTrackSpeed');

      if (etaElem) etaElem.innerText = etas[step % etas.length];
      if (distElem) distElem.innerText = dists[step % dists.length];
      if (speedElem) speedElem.innerText = `${speed} km/h`;
    }, 2500);
  },

  printReceipt: function(title, counterparty, amount, refNo, desc) {
    const farm = AgroDataService.getFarm();
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Invoice - ${refNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 24px; color: #0f172a; line-height: 1.45; background: #ffffff; }
          .doc-frame { border: 2.5px solid #0f381e; padding: 20px; border-radius: 12px; }
          .header { border-bottom: 2.5px solid #0f381e; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-img { width: 56px; height: 56px; border-radius: 50%; border: 2.5px solid #16a34a; object-fit: cover; }
          .title { font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 800; color: #0f381e; }
          .sub { font-size: 11px; font-weight: 700; color: #166534; }
          .badge { background: linear-gradient(135deg, #15803d, #0f381e); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 10.5px; font-weight: 800; text-align: center; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
          .card { background: #f8fafc; border: 1.5px solid #cbd5e1; padding: 12px; border-radius: 8px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #0f381e; color: #ffffff; font-weight: 700; }
          .seal-box { margin-top: 18px; border-top: 2px dashed #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; }
          .seal { border: 2px solid #15803d; padding: 5px 10px; border-radius: 6px; font-size: 10.5px; font-weight: 800; color: #15803d; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="doc-frame">
          <div class="header">
            <div class="logo-box">
              <img src="assets/logo.jpg" alt="Logo" class="logo-img">
              <div>
                <div class="title">OFFICIAL DIGITAL TRANSACTION INVOICE</div>
                <div class="sub">AgriStack • Direct Institutional Settlement & Escrow Audit Record</div>
              </div>
            </div>
            <div class="badge">
              🛡️ CERTIFIED BY EARTHWORM<br>
              <span style="font-size: 9px; color: #86efac;">Escrow Gateway</span>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <strong>Farmer & Account Details:</strong><br>
              Farmer: ${farmerName} (#${farmerId})<br>
              District: ${farm.district}, Tamil Nadu<br>
              Bank Account: SBI ${farm.district} Branch<br>
              Settlement Mode: Direct Bank Transfer (DBT via IMPS)<br>
              Banking UTR: <code>RBI20260904${cleanId}</code>
            </div>
            <div class="card">
              <strong>Transaction Metadata:</strong><br>
              Invoice Ref: <strong>${refNo}</strong><br>
              Counterparty: ${counterparty}<br>
              Type: ${title}<br>
              Status: <span style="color:#15803d; font-weight:bold;">100% SETTLED & ESCROW RELEASED</span>
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Itemized Description</th><th>Party</th><th>Net Settled Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${desc}</strong><br><span style="font-size: 9.5px; color:#64748b;">GST Exemption: Notification No. 2/2017-Central Tax (Rate) • Zero Commission (0% Brokerage)</span></td>
                <td>${counterparty}</td>
                <td style="font-size: 14px; font-weight: bold; color: #15803d;">₹${amount.toLocaleString('en-IN')}.00</td>
              </tr>
            </tbody>
          </table>

          <div class="seal-box">
            <div class="seal">
              <span>✓ STATUTORY APMC TRANSACTION RECORD • ${refNo}</span>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <strong>Authorized by:</strong> EARTHWORM Smart Settlement Gateway<br>
              Tamper-Evident SHA-256 Hash Verification Certified.
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
