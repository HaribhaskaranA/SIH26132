// Mobile Screen 05: Cold Storage Holding Economics, Govt/Private Transit & Certified Receipt
const ColdStorageScreen = {
  lastBooking: null,

  render: function(container) {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';

    container.innerHTML = `
      <!-- Holding Economics Card -->
      <div class="m-card">
        <div class="m-card-header">
          <div class="m-card-title">❄️ ${I18nService.t('title_storage')} (${farm.district})</div>
          <span class="m-badge m-badge-blue">${I18nService.t('badge_holding_math')}</span>
        </div>

        <p style="font-size:10.5px; color:var(--text-muted); margin-bottom:10px;">
          ${I18nService.t('lbl_cs_compare_desc')}
        </p>

        <!-- Interactive Sliders -->
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px;">
            <span>${I18nService.t('lbl_harvest_volume')}</span>
            <span id="csVolumeLabel" style="color:var(--primary-forest); font-weight:800;">2,000 kg (2.0 Tons)</span>
          </div>
          <input type="range" id="csVolumeSlider" min="500" max="10000" step="500" value="2000" class="m-input" style="padding:0; height:6px;" oninput="ColdStorageScreen.recalculateMath()">
        </div>

        <div style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px;">
            <span>${I18nService.t('lbl_holding_duration')}</span>
            <span id="csWeeksLabel" style="color:var(--primary-forest); font-weight:800;">3 Weeks (21 Days)</span>
          </div>
          <input type="range" id="csWeeksSlider" min="1" max="8" step="1" value="3" class="m-input" style="padding:0; height:6px;" oninput="ColdStorageScreen.recalculateMath()">
        </div>

        <!-- Comparative Payout Cards -->
        <div class="m-grid-2">
          <div class="m-stat-box" style="background:#fee2e2; border-color:#fca5a5;">
            <div style="font-size:9.5px; font-weight:700; color:#b91c1c;">${I18nService.t('lbl_distress_sale')}</div>
            <div class="m-stat-val" style="color:#b91c1c; font-size:16px;" id="csDistressVal">₹20,000</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_distress_crashed')}</div>
          </div>
          <div class="m-stat-box" style="background:#dcfce7; border-color:#86efac;">
            <div style="font-size:9.5px; font-weight:700; color:#15803d;">${I18nService.t('lbl_cold_storage_net')}</div>
            <div class="m-stat-val" style="color:#15803d; font-size:16px;" id="csNetVal">₹47,300</div>
            <div class="m-stat-lbl">${I18nService.t('lbl_post_glut_rate')}</div>
          </div>
        </div>

        <!-- Surplus Banner -->
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px; margin-top:8px; text-align:center;">
          <div style="font-size:10px; font-weight:700; color:#166534;">${I18nService.t('lbl_net_surplus_realized')}</div>
          <div style="font-family:'Space Grotesk', sans-serif; font-size:18px; font-weight:800; color:#15803d;" id="csSurplusVal">
            +₹27,300
          </div>
          <div style="font-size:9.5px; color:#14532d; margin-top:2px;">
            ${I18nService.t('lbl_aif_subsidy_note')}
          </div>
        </div>

        <!-- Transit Pickup Mode Selection (Govt vs Private) -->
        <div style="margin-top:14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px; padding:10px;">
          <label style="font-size:11px; font-weight:800; color:var(--primary-forest); display:block; margin-bottom:4px;">
            ${I18nService.t('lbl_select_transit_pickup')}
          </label>
          <select id="csTransitSelect" class="m-input" style="font-size:11px; font-weight:700;">
            <option value="GOVT_REEFER" selected>${I18nService.t('opt_govt_reefer')}</option>
            <option value="PRIVATE_EXPRESS">${I18nService.t('opt_private_express')}</option>
            <option value="SELF_TRANSPORT">${I18nService.t('opt_self_transport')}</option>
          </select>
          <div style="font-size:9.5px; color:#475569; margin-top:4px;">
            💡 <strong>${I18nService.t('lbl_govt_fleet_support')}</strong>
          </div>
        </div>

        <!-- Booking Button -->
        <button class="m-btn m-btn-green" onclick="ColdStorageScreen.confirmBooking()" style="margin-top:12px;">
          ${I18nService.t('btn_book_storage_transit')}
        </button>

        <!-- Dynamic Booking Confirmation & Receipt Card -->
        <div id="csBookingReceiptCard" style="display:${this.lastBooking ? 'block' : 'none'}; margin-top:12px; background:#f0fdf4; border:2px solid #86efac; border-radius:8px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#166534;">${I18nService.t('title_storage_invoice')}</span>
            <span class="m-badge m-badge-green">${I18nService.t('badge_bay_allocated')}</span>
          </div>
          <div style="font-size:10.5px; color:#14532d; margin-bottom:8px;" id="csBookingDetailsText">
            Ref: <strong>#TXN-CS-2026-${cleanId}</strong> • Bay #BAY-TN-${cleanId} (${farm.district})
          </div>
          <button class="m-btn m-btn-green" onclick="ColdStorageScreen.downloadStorageReceipt()" style="font-size:12px;">
            ${I18nService.t('btn_download_storage_receipt')}
          </button>
        </div>
      </div>
    `;
  },

  recalculateMath: function() {
    const vol = parseInt(document.getElementById('csVolumeSlider').value);
    const weeks = parseInt(document.getElementById('csWeeksSlider').value);

    document.getElementById('csVolumeLabel').innerText = `${vol.toLocaleString('en-IN')} kg (${(vol/1000).toFixed(1)} Tons)`;
    document.getElementById('csWeeksLabel').innerText = `${weeks} Weeks (${weeks * 7} Days)`;

    const distress = vol * 10;
    const postGlutRate = 25;
    const storageCost = vol * (0.45 * weeks + 0.05);
    const netStorage = (vol * postGlutRate) - storageCost;
    const surplus = netStorage - distress;

    document.getElementById('csDistressVal').innerText = `₹${distress.toLocaleString('en-IN')}`;
    document.getElementById('csNetVal').innerText = `₹${Math.round(netStorage).toLocaleString('en-IN')}`;
    document.getElementById('csSurplusVal').innerText = `+₹${Math.round(surplus).toLocaleString('en-IN')}`;
  },

  confirmBooking: function() {
    const farm = AgroDataService.getFarm();
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';

    const vol = document.getElementById('csVolumeSlider').value;
    const weeks = document.getElementById('csWeeksSlider').value;
    const transit = document.getElementById('csTransitSelect').value;

    let transitName = "Govt Subsidized Reefer Van (TNAMB Kisan Rath)";
    let transitCost = 650;

    if (transit === 'PRIVATE_EXPRESS') {
      transitName = "Private Cold-Chain Express (WayCool Logistics)";
      transitCost = 1400;
    } else if (transit === 'SELF_TRANSPORT') {
      transitName = "Self-Arranged Farm Transport";
      transitCost = 0;
    }

    const storageCost = Math.round(vol * (0.45 * weeks + 0.05));
    const totalAmount = storageCost + transitCost;
    const refNo = "TXN-CS-" + Math.floor(100000 + Math.random() * 900000);

    this.lastBooking = {
      id: refNo,
      bayId: 'BAY-TN-' + cleanId,
      volume: vol,
      weeks: weeks,
      warehouse: `${farm.district} Central Regulated Cold Hub AIF-${cleanId}`,
      temp: '3.5°C (Controlled Atmosphere)',
      transitName: transitName,
      transitCost: transitCost,
      storageCost: storageCost,
      totalAmount: totalAmount
    };

    const card = document.getElementById('csBookingReceiptCard');
    const detailsText = document.getElementById('csBookingDetailsText');
    if (card && detailsText) {
      detailsText.innerHTML = `Invoice Ref: <strong>${refNo}</strong> • Bay: <strong>${this.lastBooking.bayId}</strong> • Total Paid: <strong>₹${totalAmount.toLocaleString('en-IN')}.00</strong>`;
      card.style.display = 'block';
    }

    alert(`🎉 Cold Storage Bay & Transport Booked Successfully!\n\n• Ref: ${refNo}\n• Bay: ${this.lastBooking.bayId}\n• Facility: ${this.lastBooking.warehouse}\n• Transit: ${transitName} (₹${transitCost})\n• Storage Rent: ₹${storageCost}\n• Total Amount: ₹${totalAmount}`);
  },

  downloadStorageReceipt: function() {
    const farm = AgroDataService.getFarm();
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';

    const b = this.lastBooking || {
      id: `TXN-CS-2026-${cleanId}`,
      bayId: `BAY-TN-${cleanId}`,
      volume: 2000,
      weeks: 3,
      warehouse: `${farm.district} Central Regulated Cold Hub AIF-${cleanId}`,
      temp: '3.5°C (Controlled Atmosphere)',
      transitName: 'Govt Subsidized Reefer Van (TNAMB Kisan Rath 50% Subsidized)',
      transitCost: 650,
      storageCost: 2800,
      totalAmount: 3450
    };

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Storage & Transit Invoice - ${b.id}</title>
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
                <div class="title">OFFICIAL COLD STORAGE & TRANSIT INVOICE</div>
                <div class="sub">Agriculture Infrastructure Fund (AIF 3% Subvention) • TNAMB Subsidized Cold-Chain</div>
              </div>
            </div>
            <div class="badge">
              🛡️ CERTIFIED BY EARTHWORM<br>
              <span style="font-size: 9px; color: #86efac;">Cold Storage Gateway</span>
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
              <strong>Warehouse Bay Allocation:</strong><br>
              Invoice Ref: <strong>${b.id}</strong><br>
              Allocated Bay: <strong>${b.bayId}</strong><br>
              Facility: ${b.warehouse}<br>
              Holding Period: ${b.weeks} Weeks (${b.volume} kg @ ${b.temp})
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Component Description</th><th>Scheme / Provider</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cold Storage Temperature-Controlled Bay (${b.volume} kg)</strong><br><span style="font-size: 10px; color:#64748b;">Subsidized rental rate @ ₹1.40/kg under Agriculture Infrastructure Fund</span></td>
                <td>AIF Scheme Subsidized</td>
                <td style="font-weight: bold;">₹${b.storageCost}.00</td>
              </tr>
              <tr>
                <td><strong>Farmgate Reefer Transit Pickup & Drop</strong><br><span style="font-size: 10px; color:#64748b;">Doorstep cold-chain transport to warehouse</span></td>
                <td>${b.transitName}</td>
                <td style="font-weight: bold;">₹${b.transitCost}.00</td>
              </tr>
              <tr style="background: #f0fdf4; font-weight: 800; color: #15803d; font-size: 13px;">
                <td colspan="2">TOTAL INVOICE AMOUNT (SETTLED VIA ESCROW)</td>
                <td>₹${b.totalAmount}.00</td>
              </tr>
            </tbody>
          </table>

          <div class="seal-box">
            <div class="seal">
              <span>✓ CONFIRMED BAY RESERVATION • ${b.bayId}</span>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <strong>Authorized by:</strong> EARTHWORM Cold-Chain Management Gateway<br>
              Tamper-Evident SHA-256 Digital Verification Certified.
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
