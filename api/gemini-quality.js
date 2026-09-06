// Serverless API Handler: Google Gemini AI Produce Quality Scan & Visual Assaying Engine
// Endpoint: POST /api/gemini-quality (Vision Inference) | GET /api/gemini-quality (Health Check)
// Dedicated Security Architecture: Consumes QUALITY_SCAN_GEMINI_API_KEY (falls back safely to GEMINI_API_KEY)
// Zero API Key Exposure: Secret is loaded strictly on the server-side

const https = require('https');

function handleRestrictedCors(req, res, allowedMethods) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  const customAllowed = process.env.ALLOWED_ORIGIN;

  let isAllowed = false;

  if (!origin) {
    isAllowed = true;
  } else {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
    const isVercel = /^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin);
    const isCustomDomain = customAllowed && (origin === customAllowed || customAllowed.split(',').map(s => s.trim()).includes(origin));
    const isSameHost = host && (origin === `http://${host}` || origin === `https://${host}`);

    if (isLocalhost || isVercel || isCustomDomain || isSameHost) {
      isAllowed = true;
    }
  }

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', allowedMethods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
  }

  return isAllowed;
}

function singleGeminiCall(urlStr, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const parsedUrl = new URL(urlStr);

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      family: 4, // Enforce IPv4 on Windows to prevent IPv6 DNS delay
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, ok: false, data: { error: { message: data || 'Invalid response from upstream' } } });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini Quality Vision API request timed out after 60 seconds'));
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function requestGeminiApiWithRetry(urlStr, payload) {
  let result = await singleGeminiCall(urlStr, payload);
  if (!result.ok && (result.status === 503 || result.status === 429)) {
    console.log(`[Gemini Quality API] Received HTTP ${result.status}. Retrying after 1500ms backoff...`);
    await new Promise(r => setTimeout(r, 1500));
    result = await singleGeminiCall(urlStr, payload);
  }
  return result;
}

module.exports = async (req, res) => {
  const environment = process.env.VERCEL ? 'production' : 'local';
  
  // Dedicated Quality Scan Key with graceful fallback to GEMINI_API_KEY
  const apiKey = process.env.QUALITY_SCAN_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const primaryModel = 'gemini-3.6-flash';

  // 1. Enforce CORS Validation
  const corsAllowed = handleRestrictedCors(req, res, 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    if (!corsAllowed) {
      return res.status(403).json({ success: false, error: 'Forbidden: CORS origin not allowed.' });
    }
    return res.status(200).end();
  }

  if (!corsAllowed) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Cross-origin request denied.',
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: req.method,
        modelUsed: primaryModel,
        qualityApiKeyConfigured: !!apiKey,
        upstreamStatus: 403
      }
    });
  }

  // 2. Health & Diagnostic Check Endpoint (GET /api/gemini-quality)
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      status: 'EARTHWORM AI Quality Scan Vision Engine Operational',
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: 'GET',
        modelUsed: primaryModel,
        qualityApiKeyConfigured: !!apiKey,
        usingDedicatedKey: !!process.env.QUALITY_SCAN_GEMINI_API_KEY,
        upstreamStatus: 200
      }
    });
  }

  // 3. Enforce POST Method for Quality Vision Assaying
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST for AI quality grading or GET for health check.',
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: req.method,
        modelUsed: primaryModel,
        qualityApiKeyConfigured: !!apiKey,
        upstreamStatus: 405
      }
    });
  }

  // Robust body extraction
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const {
    prompt,
    systemPrompt,
    imageBase64,
    mimeType = 'image/jpeg',
    temperature = 0.1,
    maxOutputTokens = 2000,
    responseMimeType = 'application/json'
  } = body;

  console.log(`[Gemini Quality API] Environment: ${environment}, Method: POST, Model: ${primaryModel}, hasImage: ${!!imageBase64}, keyConfigured: ${!!apiKey}, dedicatedKey: ${!!process.env.QUALITY_SCAN_GEMINI_API_KEY}`);

  if (!apiKey) {
    console.warn('[Gemini Quality API] Error: Neither QUALITY_SCAN_GEMINI_API_KEY nor GEMINI_API_KEY is configured.');
    return res.status(500).json({
      success: false,
      error: `QUALITY_SCAN_GEMINI_API_KEY missing: Configure in ${environment === 'production' ? 'Vercel Project Settings' : 'local .env file'}.`,
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        qualityApiKeyConfigured: false,
        upstreamStatus: 500
      }
    });
  }

  if (!prompt && !imageBase64) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request: "prompt" or "imageBase64" is required for AI quality scan.',
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        qualityApiKeyConfigured: true,
        upstreamStatus: 400
      }
    });
  }

  // Build Gemini parts payload with structured image data
  const parts = [];
  if (prompt) {
    parts.push({ text: prompt });
  }
  if (imageBase64) {
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  const payload = {
    contents: [{ role: 'user', parts: parts }],
    generationConfig: {
      temperature: parseFloat(temperature) || 0.1,
      maxOutputTokens: parseInt(maxOutputTokens, 10) || 2000
    }
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  if (responseMimeType) {
    payload.generationConfig.responseMimeType = responseMimeType;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
    const result = await requestGeminiApiWithRetry(url, payload);

    console.log(`[Gemini Quality API] Upstream response received: HTTP ${result.status}`);

    if (result.ok) {
      const data = result.data;
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let rawText = data.candidates[0].content.parts[0].text.trim();
        
        // Clean markdown code blocks if JSON was requested
        if (responseMimeType === 'application/json' || rawText.startsWith('```')) {
          rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        return res.status(200).json({
          success: true,
          model: primaryModel,
          text: rawText,
          diagnostics: {
            environment: environment,
            endpoint: '/api/gemini-quality',
            requestReachedApi: true,
            httpMethod: 'POST',
            modelUsed: primaryModel,
            qualityApiKeyConfigured: true,
            upstreamStatus: 200
          }
        });
      } else {
        console.warn('[Gemini Quality API] Warning: Empty response candidate from upstream model.');
        return res.status(502).json({
          success: false,
          error: 'Gemini Quality API returned an empty response candidate.',
          diagnostics: {
            environment: environment,
            endpoint: '/api/gemini-quality',
            requestReachedApi: true,
            httpMethod: 'POST',
            modelUsed: primaryModel,
            qualityApiKeyConfigured: true,
            upstreamStatus: 200
          }
        });
      }
    } else {
      const errData = result.data || {};
      const errMsg = errData.error?.message || `HTTP ${result.status} from Gemini API`;
      console.warn(`[Gemini Quality API] Upstream error: HTTP ${result.status}, message: ${errMsg}`);

      return res.status(result.status || 502).json({
        success: false,
        error: `Gemini Quality Upstream Error (${primaryModel}): ${errMsg}`,
        diagnostics: {
          environment: environment,
          endpoint: '/api/gemini-quality',
          requestReachedApi: true,
          httpMethod: 'POST',
          modelUsed: primaryModel,
          qualityApiKeyConfigured: true,
          upstreamStatus: result.status
        }
      });
    }
  } catch (error) {
    console.error('[Gemini Quality API] Handler Exception:', error);
    return res.status(500).json({
      success: false,
      error: `Internal Server Error: ${error.message || 'Unknown processing error.'}`,
      diagnostics: {
        environment: environment,
        endpoint: '/api/gemini-quality',
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        qualityApiKeyConfigured: true,
        upstreamStatus: 500
      }
    });
  }
};
