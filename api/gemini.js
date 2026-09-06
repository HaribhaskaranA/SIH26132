// Serverless API Handler: Google Gemini Vernacular AI & Multimodal Vision
// Endpoint: POST /api/gemini (Inference) | GET /api/gemini (Health & Diagnostic Check)
// Production & Local Architecture: Exclusively routes through serverless /api/gemini endpoint
// Zero API Key Exposure: API key is loaded strictly on the server-side from environment variables

const https = require('https');

function handleRestrictedCors(req, res, allowedMethods) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  const customAllowed = process.env.ALLOWED_ORIGIN;

  let isAllowed = false;

  if (!origin) {
    // Same-origin browser request, localhost test, or direct server-to-server request
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
      reject(new Error('Gemini upstream API request timed out after 60 seconds'));
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function requestGeminiApiWithRetry(urlStr, payload) {
  let result = await singleGeminiCall(urlStr, payload);
  // If upstream returns temporary capacity spike (503) or rate limit (429), retry once after brief pause
  if (!result.ok && (result.status === 503 || result.status === 429)) {
    console.log(`[Gemini API] Received HTTP ${result.status}. Retrying after 1500ms backoff...`);
    await new Promise(r => setTimeout(r, 1500));
    result = await singleGeminiCall(urlStr, payload);
  }
  return result;
}

module.exports = async (req, res) => {
  const environment = process.env.VERCEL ? 'production' : 'local';
  const apiKey = process.env.GEMINI_API_KEY;

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
        requestReachedApi: true,
        httpMethod: req.method,
        modelUsed: 'gemini-3.6-flash',
        apiKeyConfigured: !!apiKey,
        upstreamStatus: 403
      }
    });
  }

  // 2. Health & Diagnostic Check Endpoint (GET /api/gemini)
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      status: 'EARTHWORM Gemini AI Endpoint Operational',
      diagnostics: {
        environment: environment,
        requestReachedApi: true,
        httpMethod: 'GET',
        modelUsed: 'gemini-3.6-flash',
        apiKeyConfigured: !!apiKey,
        upstreamStatus: 200
      }
    });
  }

  // 3. Enforce POST Method for AI Inference
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST for AI inference or GET for health check.',
      diagnostics: {
        environment: environment,
        requestReachedApi: true,
        httpMethod: req.method,
        modelUsed: 'gemini-3.6-flash',
        apiKeyConfigured: !!apiKey,
        upstreamStatus: 405
      }
    });
  }

  // Robust body extraction (supports pre-parsed body objects or raw strings)
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  // Model selection (defaults to confirmed working model: gemini-3.6-flash)
  const primaryModel = body.model || 'gemini-3.6-flash';
  const {
    prompt,
    systemPrompt,
    imageBase64,
    mimeType = 'image/jpeg',
    temperature = 0.2,
    maxOutputTokens = 3500,
    responseMimeType
  } = body;

  // Safe Server Diagnostics Logging (NEVER log the actual API key)
  console.log(`[Gemini API] Environment: ${environment}, Method: POST, Model: ${primaryModel}, hasImage: ${!!imageBase64}, apiKeyConfigured: ${!!apiKey}`);

  // 4. Check for GEMINI_API_KEY environment variable
  if (!apiKey) {
    console.warn('[Gemini API] Error: GEMINI_API_KEY environment variable is not configured.');
    return res.status(500).json({
      success: false,
      error: `GEMINI_API_KEY missing: Environment variable is not configured in ${environment === 'production' ? 'Vercel Project Settings' : 'local .env file'}.`,
      diagnostics: {
        environment: environment,
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        apiKeyConfigured: false,
        upstreamStatus: 500
      }
    });
  }

  if (!prompt && !imageBase64) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request: "prompt" or "imageBase64" is required.',
      diagnostics: {
        environment: environment,
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        apiKeyConfigured: true,
        upstreamStatus: 400
      }
    });
  }

  // Build Gemini parts payload
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
      temperature: parseFloat(temperature) || 0.2,
      maxOutputTokens: parseInt(maxOutputTokens, 10) || 3500
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

    console.log(`[Gemini API] Upstream response received: HTTP ${result.status}`);

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
            requestReachedApi: true,
            httpMethod: 'POST',
            modelUsed: primaryModel,
            apiKeyConfigured: true,
            upstreamStatus: 200
          }
        });
      } else {
        console.warn('[Gemini API] Warning: Empty response candidate from upstream model.');
        return res.status(502).json({
          success: false,
          error: 'Gemini API returned an empty response candidate.',
          diagnostics: {
            environment: environment,
            requestReachedApi: true,
            httpMethod: 'POST',
            modelUsed: primaryModel,
            apiKeyConfigured: true,
            upstreamStatus: 200
          }
        });
      }
    } else {
      const errData = result.data || {};
      const errMsg = errData.error?.message || `HTTP ${result.status} from Gemini API`;
      console.warn(`[Gemini API] Upstream error: HTTP ${result.status}, message: ${errMsg}`);

      return res.status(result.status || 502).json({
        success: false,
        error: `Gemini Upstream Error (${primaryModel}): ${errMsg}`,
        diagnostics: {
          environment: environment,
          requestReachedApi: true,
          httpMethod: 'POST',
          modelUsed: primaryModel,
          apiKeyConfigured: true,
          upstreamStatus: result.status
        }
      });
    }
  } catch (error) {
    console.error('[Gemini API] Handler Exception:', error);
    return res.status(500).json({
      success: false,
      error: `Internal Server Error: ${error.message || 'Unknown processing error.'}`,
      diagnostics: {
        environment: environment,
        requestReachedApi: true,
        httpMethod: 'POST',
        modelUsed: primaryModel,
        apiKeyConfigured: true,
        upstreamStatus: 500
      }
    });
  }
};
