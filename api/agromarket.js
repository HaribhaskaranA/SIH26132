// Serverless API Handler: Data.gov.in Agmarknet Daily APMC Market Rates
// Endpoint: GET /api/agromarket

function handleRestrictedCors(req, res, allowedMethods) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  const customAllowed = process.env.ALLOWED_ORIGIN;

  let isAllowed = false;

  if (!origin) {
    // Same-origin browser request or direct server request
    isAllowed = true;
  } else {
    // 1. Local development origins (localhost, 127.0.0.1)
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
    // 2. Vercel deployment preview and production domains
    const isVercel = /^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin);
    // 3. Optional custom production domain
    const isCustomDomain = customAllowed && (origin === customAllowed || customAllowed.split(',').map(s => s.trim()).includes(origin));
    // 4. Same-host validation
    const isSameHost = host && (origin === `http://${host}` || origin === `https://${host}`);

    if (isLocalhost || isVercel || isCustomDomain || isSameHost) {
      isAllowed = true;
    }
  }

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', allowedMethods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }

  return isAllowed;
}

module.exports = async (req, res) => {
  // 1. Enforce Tightened CORS Validation
  const corsAllowed = handleRestrictedCors(req, res, 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    if (!corsAllowed) {
      return res.status(403).json({ success: false, error: 'Forbidden: CORS origin not allowed.' });
    }
    return res.status(200).end();
  }

  if (!corsAllowed) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Cross-origin request denied.'
    });
  }

  const fallbackBenchmarkRecords = [
    { state: "Tamil Nadu", district: "Coimbatore", market: "Coimbatore Central APMC", commodity: "Tomato", variety: "Hybrid Red", modal_price: "2850" },
    { state: "Tamil Nadu", district: "Tiruppur", market: "Tiruppur Uzhavar Sandhai", commodity: "Onion", variety: "Bellary", modal_price: "4500" },
    { state: "Tamil Nadu", district: "Coimbatore", market: "Coimbatore Regulated Mandi", commodity: "Wheat", variety: "Lokwan / Golden", modal_price: "3200" },
    { state: "Tamil Nadu", district: "Erode", market: "Perundurai Uzhavar Sandhai", commodity: "Green Chilli", variety: "Green Chilly", modal_price: "4750" },
    { state: "Tamil Nadu", district: "Thanjavur", market: "Thanjavur DPC", commodity: "Paddy", variety: "Grade A", modal_price: "2650" },
    { state: "Tamil Nadu", district: "Erode", market: "Perundurai Uzhavar Sandhai", commodity: "Potato", variety: "Fresh Local", modal_price: "3350" }
  ];

  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    const resourceId = process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    
    const state = req.query?.state || 'Tamil Nadu';
    const district = req.query?.district || '';
    const limit = parseInt(req.query?.limit, 10) || 25;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        source: 'offline benchmark',
        live: false,
        error: 'DATA_GOV_API_KEY missing: Environment variable is not configured in Vercel/.env.',
        records: fallbackBenchmarkRecords
      });
    }

    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=${limit}&filters[state]=${encodeURIComponent(state)}`;
    if (district) {
      url += `&filters[district]=${encodeURIComponent(district)}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const records = data.records || [];
      if (records.length > 0) {
        return res.status(200).json({
          success: true,
          source: 'data.gov.in',
          live: true,
          total: data.total || records.length,
          records: records
        });
      }
    }

    // Fallback if upstream error or empty
    return res.status(200).json({
      success: false,
      source: 'offline benchmark',
      live: false,
      error: `Data.gov.in API returned HTTP status ${response.status}`,
      records: fallbackBenchmarkRecords
    });

  } catch (error) {
    console.error('Serverless Agromarket Handler Error:', error);
    return res.status(200).json({
      success: false,
      source: 'offline benchmark',
      live: false,
      error: `Internal Server Error: ${error.message}`,
      records: fallbackBenchmarkRecords
    });
  }
};
