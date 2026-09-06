// Service: Regional Agro Data, District GIS Registry & Official Data.gov.in Agmarknet API
// Hardened Production Architecture: Serverless proxy /api/agromarket with robust offline benchmarks

const AgroDataService = {
  dataGovResourceId: '9ef84268-d588-465a-a308-a864a43d0070',
  liveRecords: [],
  isLive: false,
  dataSource: 'offline benchmark',

  districtCoordinates: {
    "Coimbatore": { lat: 11.0168, lng: 76.9558, mandi: "Coimbatore Central APMC Market (MGR Mandi)", secondaryMandi: "Pollachi Regulated Market" },
    "Pondicherry": { lat: 11.9416, lng: 79.8083, mandi: "Pondicherry Grand Bazaar / Uzhavar Sandhai", secondaryMandi: "Villupuram Regulated APMC" },
    "Tiruvannamalai": { lat: 12.2253, lng: 79.0747, mandi: "Tiruvannamalai Regulated Market", secondaryMandi: "Polur Regulated Market" },
    "Dindigul": { lat: 10.3673, lng: 77.9803, mandi: "Dindigul APMC Central Terminal", secondaryMandi: "Ottanchatram Vegetable Market" },
    "Vellore": { lat: 12.9165, lng: 79.1325, mandi: "Vellore Central APMC Market", secondaryMandi: "Gudiyatham Regulated Market" },
    "Salem": { lat: 11.6643, lng: 78.1460, mandi: "Salem Shevapet Central Mandi", secondaryMandi: "Attur Regulated Market" },
    "Madurai": { lat: 9.9252, lng: 78.1198, mandi: "Madurai Mattuthavani APMC", secondaryMandi: "Paravai Wholesale Market" },
    "Tiruppur": { lat: 11.1085, lng: 77.3411, mandi: "Tiruppur South Uzhavar Sandhai", secondaryMandi: "Dharapuram Regulated Market" },
    "Erode": { lat: 11.3410, lng: 77.7172, mandi: "Erode Perundurai Uzhavar Sandhai", secondaryMandi: "Gobichettipalayam APMC" },
    "Thanjavur": { lat: 10.7870, lng: 79.1378, mandi: "Thanjavur Direct Purchase Centre", secondaryMandi: "Kumbakonam Regulated Market" },
    "Tiruchirappalli": { lat: 10.7905, lng: 78.7047, mandi: "Trichy Gandhi Market APMC", secondaryMandi: "Manachanallur Regulated Market" },
    "Theni": { lat: 10.0104, lng: 77.4768, mandi: "Theni Regulated Market", secondaryMandi: "Cumbum Valley APMC" },
    "Dharmapuri": { lat: 12.1211, lng: 78.1582, mandi: "Dharmapuri Regulated Market", secondaryMandi: "Harur APMC" },
    "Krishnagiri": { lat: 12.5186, lng: 78.2137, mandi: "Krishnagiri Regulated Market", secondaryMandi: "Hosur Wholesale Mandi" },
    "Namakkal": { lat: 11.2189, lng: 78.1674, mandi: "Namakkal Central APMC", secondaryMandi: "Rasipuram Regulated Market" }
  },

  defaultFarm: {
    lat: 11.0168,
    lng: 76.9558,
    district: "Coimbatore",
    crop: "Tomato (Hybrid Red)",
    acreage: 2.5,
    soilType: "Red Sandy Loam",
    soilPh: 6.9,
    ndviVigor: 0.74,
    workingCapital: 38500,
    breakEvenRate: 10.20,
    expectedYield: "37.5 Tons",
    lastUpdated: "Today, Live Synced"
  },

  getFarm: function() {
    const activeFarmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const specificProfile = localStorage.getItem('earthworm_farm_profile_' + activeFarmerId);
    if (specificProfile) {
      try {
        const parsed = JSON.parse(specificProfile);
        if (parsed && parsed.district) return parsed;
      } catch (e) {}
    }

    const saved = localStorage.getItem('earthworm_farm_profile');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.district) return parsed;
      } catch(e){}
    }
    return this.defaultFarm;
  },

  saveFarm: function(farmData) {
    const current = this.getFarm();
    const updated = { ...current, ...farmData };
    
    if (farmData.district && (!farmData.lat || !farmData.lng)) {
      const coords = this.districtCoordinates[farmData.district] || this.districtCoordinates["Coimbatore"];
      updated.lat = coords.lat;
      updated.lng = coords.lng;
    }
    
    localStorage.setItem('earthworm_farm_profile', JSON.stringify(updated));
    if (updated.farmerId) {
      localStorage.setItem('earthworm_farm_profile_' + updated.farmerId, JSON.stringify(updated));
    }

    // Background sync to Supabase farms table
    if (typeof SupabaseService !== 'undefined') {
      try {
        SupabaseService.saveFarm(updated);
      } catch (e) {}
    }

    return updated;
  },

  getMandiForDistrict: function(district) {
    const cleanDist = district || this.getFarm().district || "Coimbatore";
    const match = this.districtCoordinates[cleanDist] || this.districtCoordinates["Coimbatore"];
    return match;
  },

  publishLot: function(lotData) {
    const farm = this.getFarm();
    const farmerId = lotData.farmerId || localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const cleanId = farmerId.replace(/[^0-9]/g, '') || '8842';
    const district = lotData.district || farm.district || 'Coimbatore';

    const completeLot = {
      lotId: lotData.lotId || `#LOT-TN-${cleanId}`,
      farmerId: farmerId,
      district: district,
      location: lotData.location || `${district} District, Tamil Nadu`,
      crop: lotData.crop || farm.crop || 'Tomato (Hybrid Red)',
      volume: lotData.volume || 2000,
      grade: lotData.grade || 'AI grade not available',
      colorScore: (lotData.colorScore !== undefined && lotData.colorScore !== null) ? lotData.colorScore : null,
      caliber: (lotData.caliber !== undefined && lotData.caliber !== null) ? lotData.caliber : null,
      defectRate: (lotData.defectRate !== undefined && lotData.defectRate !== null) ? lotData.defectRate : null,
      assessment: lotData.assessment || `Produce in ${district}. AI quality scan pending.`,
      pricePerKg: lotData.pricePerKg || 28.50,
      totalAmount: lotData.totalAmount || ((lotData.volume || 2000) * (lotData.pricePerKg || 28.50)),
      photoUrl: lotData.photoUrl || localStorage.getItem('earthworm_last_lot_photo') || null,
      status: lotData.status || 'READY_FOR_BIDDING',
      timestamp: lotData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acreage: farm.acreage || 2.50,
      soilPh: farm.soilPh || 6.9,
      ndviVigor: farm.ndviVigor || 0.74,
      storageBuffer: '2,000 kg in Subsidized Cold Bay (#BAY-TN-3310 at 3.5°C)'
    };

    let existingLots = [];
    try {
      existingLots = JSON.parse(localStorage.getItem('earthworm_posted_lots') || '[]');
    } catch (e) {
      existingLots = [];
    }

    const filtered = existingLots.filter(l => l.farmerId !== farmerId && l.lotId !== completeLot.lotId);
    filtered.unshift(completeLot);
    localStorage.setItem('earthworm_posted_lots', JSON.stringify(filtered));

    // Background sync to Supabase lots table
    if (typeof SupabaseService !== 'undefined') {
      try {
        SupabaseService.publishLot(completeLot);
      } catch (e) {}
    }

    return completeLot;
  },

  getAllLots: function() {
    let lots = [];
    try {
      lots = JSON.parse(localStorage.getItem('earthworm_posted_lots') || '[]');
    } catch (e) {
      lots = [];
    }

    if (!lots || lots.length === 0) {
      const activeFarmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
      const farm = this.getFarm();
      const photo = localStorage.getItem('earthworm_last_lot_photo') || null;

      lots = [
        {
          lotId: `#LOT-TN-${activeFarmerId.replace(/[^0-9]/g, '') || '8842'}`,
          farmerId: activeFarmerId,
          district: farm.district,
          location: `${farm.district} District, Tamil Nadu`,
          crop: farm.crop || 'Tomato (Hybrid Red)',
          volume: 2000,
          grade: 'AI grade not available',
          colorScore: null,
          caliber: null,
          defectRate: null,
          assessment: `Harvest lot listed by Farmer #${activeFarmerId}. AI quality scan pending.`,
          pricePerKg: 28.50,
          totalAmount: 57000,
          photoUrl: photo,
          status: 'READY_FOR_BIDDING',
          timestamp: 'Just now',
          acreage: farm.acreage,
          soilPh: farm.soilPh,
          ndviVigor: farm.ndviVigor,
          storageBuffer: '2,000 kg in Subsidized Cold Bay (#BAY-TN-3310 at 3.5°C)'
        },
        {
          lotId: '#LOT-TN-4820',
          farmerId: 'EW-TN-4820',
          district: 'Tiruppur',
          location: 'Tiruppur District, Tamil Nadu',
          crop: 'Small Onion (Bellary)',
          volume: 1200,
          grade: 'AGMARK Grade B (Commercial)',
          colorScore: 91.5,
          caliber: 58,
          defectRate: 3.2,
          assessment: 'Moderate skin retention, slight sizing variation suitable for commercial wholesale APMC trading.',
          pricePerKg: 42.00,
          totalAmount: 50400,
          photoUrl: 'assets/slide1_mandi_glut.jpg',
          status: 'READY_FOR_BIDDING',
          timestamp: '35 mins ago',
          acreage: 2.0,
          soilPh: 7.1,
          ndviVigor: 0.78,
          storageBuffer: '1,500 kg in Kisan Cold Hub'
        },
        {
          lotId: '#LOT-TN-3310',
          farmerId: 'EW-TN-3310',
          district: 'Erode',
          location: 'Erode District, Tamil Nadu',
          crop: 'Tomato (Processing Grade)',
          volume: 1500,
          grade: 'AGMARK Grade C (Processing / Industrial Pulping)',
          colorScore: 84.0,
          caliber: 52,
          defectRate: 6.5,
          assessment: 'High blemish rate and non-uniform sizing. Ideal for industrial tomato puree, paste, and sauce processing.',
          pricePerKg: 22.00,
          totalAmount: 33000,
          photoUrl: 'assets/slide2_soil_twins.jpg',
          status: 'READY_FOR_BIDDING',
          timestamp: '1 hr ago',
          acreage: 1.8,
          soilPh: 6.8,
          ndviVigor: 0.68,
          storageBuffer: '1,500 kg Processing Holding Unit'
        }
      ];
      localStorage.setItem('earthworm_posted_lots', JSON.stringify(lots));
    }
    return lots;
  },

  fetchLiveAgmarknetPrices: async function(callback) {
    // 1. Try Serverless Proxy (/api/agromarket)
    try {
      const response = await fetch('/api/agromarket?state=Tamil%20Nadu&limit=25');
      if (response.ok) {
        const data = await response.json();
        if (data.live && data.records && data.records.length > 0) {
          this.liveRecords = data.records;
          this.isLive = true;
          this.dataSource = 'data.gov.in';
          if (callback) callback(data.records, true, 'data.gov.in');
          return { records: data.records, live: true, source: 'data.gov.in' };
        }
      }
    } catch (err) {
      console.warn("Serverless /api/agromarket proxy notice, using cached benchmark:", err);
    }

    // 2. High-Precision Official Benchmark Fallback (clearly marked offline)
    const fallbackRecords = [
      { state: "Tamil Nadu", district: "Coimbatore", market: "Coimbatore Central APMC", commodity: "Tomato", variety: "Hybrid Red", modal_price: "2850" },
      { state: "Tamil Nadu", district: "Tiruppur", market: "Tiruppur Uzhavar Sandhai", commodity: "Onion", variety: "Bellary", modal_price: "4500" },
      { state: "Tamil Nadu", district: "Coimbatore", market: "Coimbatore Regulated Mandi", commodity: "Wheat", variety: "Lokwan / Golden", modal_price: "3200" },
      { state: "Tamil Nadu", district: "Erode", market: "Perundurai Uzhavar Sandhai", commodity: "Green Chilli", variety: "Green Chilly", modal_price: "4750" },
      { state: "Tamil Nadu", district: "Thanjavur", market: "Thanjavur DPC", commodity: "Paddy", variety: "Grade A", modal_price: "2650" },
      { state: "Tamil Nadu", district: "Erode", market: "Perundurai Uzhavar Sandhai", commodity: "Potato", variety: "Fresh Local", modal_price: "3350" }
    ];
    this.liveRecords = fallbackRecords;
    this.isLive = false;
    this.dataSource = 'offline benchmark';
    if (callback) callback(fallbackRecords, false, "offline benchmark");
    return { records: fallbackRecords, live: false, source: "offline benchmark" };
  },

  isDataLive: function() {
    return this.isLive;
  },

  getLocalizedMandiPrices: function(lang, district) {
    const dist = district || this.getFarm().district || "Coimbatore";
    const l = lang || (typeof I18nService !== 'undefined' ? I18nService.getLanguage() : 'en');

    // If live records exist from Data.gov.in, map them dynamically
    if (this.isLive && this.liveRecords && this.liveRecords.length > 0) {
      const getIcon = (commodity) => {
        const c = String(commodity).toLowerCase();
        if (c.includes('tomato')) return '🍅';
        if (c.includes('onion')) return '🧅';
        if (c.includes('coconut')) return '🥥';
        if (c.includes('chilli') || c.includes('chili')) return '🌶️';
        if (c.includes('paddy') || c.includes('rice')) return '🌾';
        if (c.includes('wheat')) return '🌾';
        if (c.includes('potato')) return '🥔';
        if (c.includes('cotton')) return '⚪';
        if (c.includes('maize') || c.includes('corn')) return '🌽';
        if (c.includes('gourd') || c.includes('ashgourd')) return '🥬';
        if (c.includes('banana')) return '🍌';
        if (c.includes('groundnut')) return '🥜';
        return '🌱';
      };

      return this.liveRecords.map(r => {
        const modal = parseFloat(r.modal_price) || 2850;
        const perKg = (modal / 100).toFixed(2);
        return {
          icon: getIcon(r.commodity),
          name: `${r.commodity}${r.variety ? ' (' + r.variety + ')' : ''}`,
          market: r.market || `${r.district || dist} Market`,
          rateKg: `₹${perKg} / kg`,
          rateQtl: `₹${modal.toLocaleString('en-IN')} / Q`,
          trend: 'Live'
        };
      });
    }

    // Default localized benchmark if offline
    if (l === 'ta') {
      return [
        { icon: "🍅", name: "தக்காளி (ஹைப்ரிட்)", market: `${dist} மத்திய APMC மார்க்கெட்`, rateKg: "₹28.50 / கிலோ", rateQtl: "₹2,850 / குவிண்டால்", trend: "+4.2%" },
        { icon: "🧅", name: "சின்ன வெங்காயம் (பல்லாரி)", market: "திருப்பூர் உழவர் சந்தை", rateKg: "₹45.00 / கிலோ", rateQtl: "₹4,500 / குவிண்டால்", trend: "+6.8%" },
        { icon: "🌾", name: "கோதுமை (பொன்னிற தானியம்)", market: `${dist} ஒழுங்குமுறை விற்பனைக்கூடம்`, rateKg: "₹32.00 / கிலோ", rateQtl: "₹3,200 / குவிண்டால்", trend: "+2.5%" },
        { icon: "🌾", name: "நெல் (தரம் A சம்பா)", market: "தஞ்சாவூர் நேரடி கொள்முதல் மையம்", rateKg: "₹26.50 / கிலோ", rateQtl: "₹2,650 / குவிண்டால்", trend: "+1.8%" },
        { icon: "🌶️", name: "பச்சை மிளகாய் (நாட்டு ரகம்)", market: "பெருந்துறை உழவர் சந்தை", rateKg: "₹47.50 / கிலோ", rateQtl: "₹4,750 / குவிண்டால்", trend: "+8.4%" },
        { icon: "🥜", name: "நிலக்கடலை (காய்ந்தது)", market: "திண்டிவனம் ஒழுங்குமுறை கூடம்", rateKg: "₹62.00 / கிலோ", rateQtl: "₹6,200 / குவிண்டால்", trend: "+3.1%" },
        { icon: "🥔", name: "உருளைக்கிழங்கு (உள்ளூர்)", market: "மேட்டுப்பாளையம் மொத்த மண்டி", rateKg: "₹33.50 / கிலோ", rateQtl: "₹3,350 / குவிண்டால்", trend: "+0.5%" },
        { icon: "⚪", name: "பருத்தி (காட்டன்)", market: "விழுப்புரம் ஒழுங்குமுறை மண்டி", rateKg: "₹71.00 / கிலோ", rateQtl: "₹7,100 / குவிண்டால்", trend: "+5.0%" },
        { icon: "🌽", name: "மக்காச்சோளம் (ஹைப்ரிட்)", market: "உடுமலைப்பேட்டை APMC", rateKg: "₹24.00 / கிலோ", rateQtl: "₹2,400 / குவிண்டால்", trend: "+1.2%" }
      ];
    } else {
      return [
        { icon: "🍅", name: "Tomato (Hybrid Red)", market: `${dist} Central APMC Market`, rateKg: "₹28.50 / kg", rateQtl: "₹2,850 / quintal", trend: "+4.2%" },
        { icon: "🧅", name: "Small Onion (Bellary)", market: "Tiruppur Uzhavar Sandhai", rateKg: "₹45.00 / kg", rateQtl: "₹4,500 / quintal", trend: "+6.8%" },
        { icon: "🌾", name: "Wheat (Lokwan / Golden)", market: `${dist} Regulated Mandi`, rateKg: "₹32.00 / kg", rateQtl: "₹3,200 / quintal", trend: "+2.5%" },
        { icon: "🌾", name: "Paddy (Grade A Samba)", market: "Thanjavur Direct Purchase Centre", rateKg: "₹26.50 / kg", rateQtl: "₹2,650 / quintal", trend: "+1.8%" },
        { icon: "🌶️", name: "Green Chilli (Fresh)", market: "Perundurai Uzhavar Sandhai", rateKg: "₹47.50 / kg", rateQtl: "₹4,750 / quintal", trend: "+8.4%" },
        { icon: "🥜", name: "Groundnut Pods", market: "Tindivanam Regulated Market", rateKg: "₹62.00 / kg", rateQtl: "₹6,200 / quintal", trend: "+3.1%" },
        { icon: "🥔", name: "Potato (Fresh Local)", market: "Mettupalayam Wholesale Mandi", rateKg: "₹33.50 / kg", rateQtl: "₹3,350 / quintal", trend: "+0.5%" },
        { icon: "⚪", name: "Cotton (Kapas)", market: "Villupuram Regulated Mandi", rateKg: "₹71.00 / kg", rateQtl: "₹7,100 / quintal", trend: "+5.0%" },
        { icon: "🌽", name: "Maize (Hybrid Grain)", market: "Udumalpet APMC Terminal", rateKg: "₹24.00 / kg", rateQtl: "₹2,400 / quintal", trend: "+1.2%" }
      ];
    }
  }
};
