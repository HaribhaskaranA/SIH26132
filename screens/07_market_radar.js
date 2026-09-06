// Mobile Screen 07: Mandi Arrival Volume & Supply Glut Danger Radar
const MarketRadarScreen = {
  render: function(container) {
    const farm = AgroDataService.getFarm();
    const mandiInfo = AgroDataService.getMandiForDistrict(farm.district);

    container.innerHTML = `
      <div class="m-card">
        <!-- Glut Danger Alert Banner -->
        <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:8px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:800; color:#991b1b;">⚠️ ${I18nService.t('lbl_mandi_glut_radar')} (${farm.district.toUpperCase()})</span>
            <span class="m-badge m-badge-red">${I18nService.t('badge_glut_alert')}</span>
          </div>
          <p style="font-size:10.5px; color:#7f1d1d; margin-top:4px;">
            ${I18nService.t('lbl_glut_alert_desc')}
          </p>
        </div>

        <!-- Live Data.gov.in Agmarknet Variety Prices -->
        <div style="background:#f0f9ff; border:1.5px solid #38bdf8; border-radius:8px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#0369a1;">${I18nService.t('lbl_official_agmarknet')} (${farm.district})</span>
            ${AgroDataService.isDataLive() ? '<span class="m-badge m-badge-green" style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800;">● LIVE DATA</span>' : '<span class="m-badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:700;">⚠️ OFFLINE BENCHMARK</span>'}
          </div>
          <div style="display:flex; flex-direction:column; gap:5px; font-size:10px; max-height:220px; overflow-y:auto;">
            ${AgroDataService.getLocalizedMandiPrices(I18nService.getLanguage(), farm.district).slice(0, 6).map(item => `
              <div style="display:flex; justify-content:space-between; background:#ffffff; padding:5px 8px; border-radius:4px; border:1px solid #bae6fd;">
                <span>${item.icon} <strong>${item.name}</strong> • ${item.market}</span>
                <strong style="color:#15803d;">${item.rateKg} (${item.rateQtl})</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Net Realization Index -->
        <div class="m-card-header">
          <div class="m-card-title">${I18nService.t('lbl_net_realization_idx')} (${farm.district})</div>
          <span style="font-size:10px; color:#64748b;">${I18nService.t('lbl_freight_deducted')}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; font-size:11.5px; margin-bottom:14px;">
          <!-- Mandi 1 (Primary) -->
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between;">
              <span>📍 <strong>${mandiInfo.mandi}</strong> (14 km away)</span>
              <span style="font-weight:800; color:#15803d;">Net: ₹27.20/kg</span>
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">
              Gross: ₹28.50 | Freight: ₹1.30/kg | Status: 🟡 High Volume
            </div>
          </div>

          <!-- Mandi 2 (Secondary) -->
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between;">
              <span>📍 <strong>${mandiInfo.secondaryMandi}</strong> (38 km away)</span>
              <span style="font-weight:800; color:#1e40af;">Net: ₹26.50/kg</span>
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">
              Gross: ₹29.00 | Freight: ₹2.50/kg | Status: 🟢 Fast Clearance
            </div>
          </div>

          <!-- Mandi 3 (Interstate Hub) -->
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between;">
              <span>📍 <strong>Regional Sourcing Terminal</strong> (180 km away)</span>
              <span style="font-weight:800; color:#b45309;">Net: ₹24.50/kg</span>
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">
              Gross: ₹31.00 | Freight: ₹6.50/kg | Status: 🔴 High Toll & Transit
            </div>
          </div>
        </div>

        <!-- Verified Direct Institutional Food Processors -->
        <div style="font-size:12px; font-weight:800; color:var(--primary-forest); margin-bottom:8px;">
          ${I18nService.t('lbl_verified_processors')}
        </div>

        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:800; color:#166534;">🍅 Reliance Fresh & Annapoorna Processing</span>
            <span class="m-badge m-badge-green">${I18nService.t('badge_fixed_contract')}</span>
          </div>
          <div style="font-size:10.5px; color:#14532d; margin:4px 0;">
            Assayed Requirement: ${farm.crop} • <strong>₹28.50 / kg Farmgate Guaranteed</strong>
          </div>
          <button class="m-btn m-btn-green" style="padding:6px 12px; font-size:11px; margin-top:4px;" onclick="MarketRadarScreen.connectBuyer()">
            ${I18nService.t('btn_initiate_contract')}
          </button>
        </div>

      </div>
    `;
  },

  connectBuyer: function() {
    const farm = AgroDataService.getFarm();
    alert(`🎉 Direct supply contract inquiry dispatched to Reliance Fresh Agri Hub in ${farm.district} at guaranteed farmgate rate of ₹28.50/kg!`);
  }
};
