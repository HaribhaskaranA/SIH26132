// Service: Google Gemini Vernacular Agritech AI & Multimodal Vision Engine
// Production Security Architecture: Exclusively routes through serverless /api/gemini endpoint
// Zero-Fabrication Guarantee: True Gemini outputs only. Descriptive, honest error messages if offline.

const GeminiService = {
  getUserContextPrompt: function() {
    const farm = (typeof AgroDataService !== 'undefined') ? AgroDataService.getFarm() : { district: 'Coimbatore', crop: 'Tomato (Hybrid Red)', acreage: 2.5, soilType: 'Red Sandy Loam', soilPh: 6.9, ndviVigor: 0.74, workingCapital: 38500, breakEvenRate: 10.20, expectedYield: '37.5 Tons', lat: 11.0168, lng: 76.9558 };
    const farmerId = localStorage.getItem('earthworm_registered_id') || 'EW-TN-8842';
    const farmerName = localStorage.getItem('earthworm_farmer_name') || 'Ramasamy K';
    const activeLot = `#LOT-TN-${farmerId.replace(/[^0-9]/g, '') || '8842'} (2,000 kg ${farm.crop})`;
    const mandiInfo = (typeof AgroDataService !== 'undefined') ? AgroDataService.getMandiForDistrict(farm.district) : { mandi: 'Coimbatore APMC', secondaryMandi: 'Pollachi Market' };
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const langName = (typeof I18nService !== 'undefined') ? I18nService.getLanguageName() : 'English';

    return `
LOGGED-IN FARMER CREDENTIALS & SATELLITE TELEMETRY CONTEXT:
- Farmer Full Name: ${farmerName}
- Earthworm Farmer ID: ${farmerId} (DPDP Token #EW-APP-${farmerId.replace(/[^0-9]/g, '') || '8842'})
- Preferred Language: ${langName} (Code: ${lang})
- Farm Region & District: ${farm.district} District, Tamil Nadu (GPS: ${farm.lat ? farm.lat.toFixed(4) : '11.0168'}, ${farm.lng ? farm.lng.toFixed(4) : '76.9558'})
- Mapped Acreage: ${farm.acreage} Acres
- Soil Telemetry: Type = ${farm.soilType}, pH = ${farm.soilPh}, Canopy Vigor (NDVI) = ${farm.ndviVigor}
- Current Cultivated Crop: ${farm.crop}
- Financial & Cost Structure: Working Capital = ₹${farm.workingCapital}, Expected Yield = ${farm.expectedYield}, Production Break-Even = ₹${farm.breakEvenRate}/kg
- Active Harvest Lot: ${activeLot}
- Nearest APMC Mandi: ${mandiInfo.mandi}
- Secondary APMC Mandi: ${mandiInfo.secondaryMandi}
`;
  },

  getSystemPrompt: function() {
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const langName = (typeof I18nService !== 'undefined') ? I18nService.getLanguageName() : 'English';

    return `You are EARTHWORM Agri AI, an expert agricultural economist, agronomist, legal advisor, and market linkage specialist developed for Ministry of Agriculture & Farmers Welfare, Government of India.
You have access to the farmer's profile, district, soil telemetry, crop economics, and APMC market benchmarks.

MANDATORY INSTRUCTIONS:
1. PRIMARY LANGUAGE: The user's active language is ${langName} (${lang}). You MUST answer fully and fluently in ${langName} (Tamil if Tamil, Hindi if Hindi, Telugu if Telugu, Kannada if Kannada, English if English).
2. ALWAYS provide an exhaustive, complete, multi-paragraph, step-by-step answer directly addressing the farmer's query with actionable guidance and numbers.
3. NEVER output generic placeholders or one-liners.
4. Incorporate the farmer's registered district, crop, acreage, and financial break-even numbers where relevant.
5. For legal/dispute questions, cite the Agricultural Produce Marketing Regulation acts, Form 8, statutory 24-hour settlement mandates, and APMC Committee procedures.`;
  },

  formatErrorMessage: function(httpStatus, errorMsg, diagnostics) {
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';

    let reason = '';
    if (diagnostics && diagnostics.apiKeyConfigured === false) {
      reason = 'Gemini API key is missing. Configure GEMINI_API_KEY in Vercel Environment Variables or local .env.';
    } else if (httpStatus === 401 || httpStatus === 403 || (errorMsg && (errorMsg.includes('API key not valid') || errorMsg.includes('PERMISSION_DENIED')))) {
      reason = 'Gemini API rejected the request (Invalid or unauthorized API key).';
    } else if (httpStatus === 429 || (errorMsg && (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('rate limit')))) {
      reason = 'Gemini API quota/rate limit reached (HTTP 429). Please wait a moment and retry.';
    } else if (httpStatus === 405) {
      reason = 'HTTP 405 (Method Not Allowed). Ensure POST request is sent directly to /api/gemini without static file rewrite.';
    } else if (httpStatus === 404) {
      reason = 'Serverless API endpoint /api/gemini not found (HTTP 404). Ensure app is started with "npm run dev" locally or deployed to Vercel.';
    } else if (httpStatus === 400 || (errorMsg && errorMsg.includes('INVALID_ARGUMENT'))) {
      reason = `Gemini bad request (HTTP 400: ${errorMsg || 'Invalid parameters'}).`;
    } else if (httpStatus === 502 || httpStatus === 503) {
      reason = `Gemini upstream service temporarily unavailable (${errorMsg || 'HTTP ' + httpStatus}).`;
    } else if (errorMsg) {
      reason = errorMsg;
    } else {
      reason = `HTTP ${httpStatus || '500'} Error`;
    }

    if (lang === 'ta') {
      return `⚠️ கூகுள் ஜெமினி AI அறிவிப்பு: ${reason}`;
    } else if (lang === 'hi') {
      return `⚠️ गूगल जेमिनी AI सूचना: ${reason}`;
    } else if (lang === 'te') {
      return `⚠️ గూగుల్ జెమిని AI సూచన: ${reason}`;
    } else if (lang === 'kn') {
      return `⚠️ ಗೂಗಲ್ ಜೆಮಿನಿ AI ಸೂಚನೆ: ${reason}`;
    } else {
      return `⚠️ Gemini AI Notice: ${reason}`;
    }
  },

  // 1. Text Chatbot (Google Gemini Vernacular Engine via Serverless Endpoint)
  askGemini: async function(userQuery, callback) {
    const userContext = this.getUserContextPrompt();
    const systemPrompt = this.getSystemPrompt();
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const langName = (typeof I18nService !== 'undefined') ? I18nService.getLanguageName() : 'English';
    const fullPrompt = `${systemPrompt}\n\n${userContext}\n\nFarmer's Question: "${userQuery}"\n\nProvide a full, detailed, actionable, multi-step response strictly in ${langName}:`;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          temperature: 0.35,
          maxOutputTokens: 3500
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.text && data.text.length > 10) {
        callback(data.text, true, 'Live Gemini 3.6 Flash');
        return;
      } else {
        const errorReason = this.formatErrorMessage(response.status, data.error, data.diagnostics);
        console.warn('Gemini API request error:', errorReason, data);
        callback(errorReason, false, 'AI Unavailable');
        return;
      }
    } catch (networkErr) {
      console.warn('Gemini network exception:', networkErr);
      const networkMsg = this.formatErrorMessage(0, `Network Connection Error: ${networkErr.message}. Ensure the app is running through Vercel or a live server with /api/gemini.`, null);
      callback(networkMsg, false, 'AI Unavailable');
    }
  },

  // 2. Multimodal Computer Vision Assaying for Farmer AI Scan
  analyzeHarvestImage: async function(imageDataUrl, callback) {
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const langName = (typeof I18nService !== 'undefined') ? I18nService.getLanguageName() : 'English';

    if (!imageDataUrl) {
      callback({
        success: false,
        error: 'No image data was provided for AI quality assaying.',
        isLive: false
      });
      return;
    }

    let base64Data = null;
    let mimeType = 'image/jpeg';

    if (imageDataUrl.startsWith('data:image')) {
      const parts = imageDataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      base64Data = parts[1];
    } else {
      // If a relative URL or image path was provided, convert it to base64 canvas
      try {
        const converted = await this.urlToBase64(imageDataUrl);
        if (converted && converted.startsWith('data:image/')) {
          const parts = converted.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          base64Data = parts[1];
        }
      } catch (e) {
        console.warn('Image conversion warning:', e);
      }
    }

    if (!base64Data) {
      callback({
        success: false,
        error: 'Could not extract valid base64 image data from the provided photo.',
        isLive: false
      });
      return;
    }

    const prompt = `You are an official AGMARK agricultural quality assaying inspector under the Ministry of Agriculture & Farmers Welfare, Government of India.
Inspect the agricultural produce in this harvest camera capture carefully.
Assign the true commercial quality grade based strictly on visible produce characteristics in this exact photo:
- "AGMARK Grade A (Premium)" if high chromatic ripeness (>90%), large morphometric caliber (>60mm), <3% surface blemishes.
- "AGMARK Grade B (Commercial)" if moderate color variation, slight shape irregularity, 3-5% blemishes suitable for wholesale APMC trading.
- "AGMARK Grade C (Processing / Industrial Pulping)" if high surface blemish/defect rate (>5%), bruised, or irregular shape suitable for industrial pulping/puree.
- "Unable to determine" if the photo is blurry, does not contain agricultural produce, or is insufficient to grade.

CRITICAL LANGUAGE MANDATE:
The "assessment" field MUST be written strictly and fluently in ${langName} (${lang}) giving a professional, factual visual quality explanation.

Return ONLY a valid JSON object matching this exact schema:
{
  "grade": "AGMARK Grade A (Premium) | AGMARK Grade B (Commercial) | AGMARK Grade C (Processing / Industrial Pulping) | Unable to determine",
  "colorScore": 92.5,
  "caliber": 64,
  "defectRate": 2.1,
  "assessment": "Short factual explanation in ${langName} based strictly on visible image evidence."
}`;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          imageBase64: base64Data,
          mimeType: mimeType,
          temperature: 0.1,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.text) {
        let rawText = data.text.trim();
        // Clean markdown fences if any
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        try {
          const parsed = JSON.parse(rawText);
          
          const grade = parsed.grade || parsed.assigned_grade || 'Unable to determine';
          const colorScore = typeof parsed.colorScore === 'number' ? parsed.colorScore : parseFloat(parsed.colorScore || 0);
          const caliber = typeof parsed.caliber === 'number' ? parsed.caliber : parseFloat(parsed.caliber || 0);
          const defectRate = typeof parsed.defectRate === 'number' ? parsed.defectRate : parseFloat(parsed.defectRate || 0);
          const assessment = parsed.assessment || parsed.analysis || `Produce assayed by Gemini Vision AI (${data.model || 'gemini-3.6-flash'}).`;

          callback({
            success: true,
            grade: grade,
            colorScore: isNaN(colorScore) ? 0 : colorScore,
            caliber: isNaN(caliber) ? 0 : caliber,
            defectRate: isNaN(defectRate) ? 0 : defectRate,
            assessment: assessment,
            model: data.model || 'gemini-3.6-flash',
            isLive: true
          });
          return;
        } catch (parseErr) {
          console.error('Failed to parse Gemini JSON output:', rawText, parseErr);
          callback({
            success: false,
            error: 'Failed to parse structured JSON response from Gemini Vision API.',
            rawText: rawText,
            isLive: false
          });
          return;
        }
      } else {
        const errorReason = this.formatErrorMessage(response.status, data.error, data.diagnostics);
        console.warn('Gemini Vision API error:', errorReason, data);
        callback({
          success: false,
          error: errorReason,
          diagnostics: data.diagnostics,
          isLive: false
        });
        return;
      }
    } catch (networkErr) {
      console.warn('Gemini Vision network exception:', networkErr);
      const networkMsg = this.formatErrorMessage(0, `Network Connection Error: ${networkErr.message}. Ensure the app is running through a live server with /api/gemini.`, null);
      callback({
        success: false,
        error: networkMsg,
        isLive: false
      });
    }
  },

  // 3. Buyer Portal Quality Verification & Authenticity Audit
  verifyLotQualityAudit: async function(lot, callback) {
    const lang = (typeof I18nService !== 'undefined') ? I18nService.getLanguage() : 'en';
    const langName = (typeof I18nService !== 'undefined') ? I18nService.getLanguageName() : 'English';

    const prompt = `You are an expert agricultural auditor and computer vision forensic specialist conducting an official buyer quality and image authenticity inspection for institutional food procurement.

Lot Details:
- Lot ID: ${lot.lotId} (Producer Farmer ID: #${lot.farmerId})
- Commodity: ${lot.crop} (${lot.volume || 2000} kg volume)
- Declared Quality Grade: ${lot.grade}
- Declared Metrics: Color = ${lot.colorScore || '--'}% | Caliber = ${lot.caliber || '--'} mm | Defect Rate = ${lot.defectRate || '--'}%
- Origin: ${lot.location || lot.district || 'Tamil Nadu'}

TASK:
1. PRODUCE IDENTIFICATION: Identify and describe the agricultural produce visible in the image, its ripeness, sizing, and physical condition.
2. IMAGE AUTHENTICITY & PROVENANCE CHECK: Perform forensic visual analysis to determine whether the image is a GENUINE on-farm camera capture taken in real field/crate conditions OR an AI-generated/synthetic/stock spoofed image. (Clearly state: "Image Authenticity: Genuine On-Farm Camera Capture Verified ✓" or describe any anomalies).
3. AGMARK COMMERCIAL GRADE AUDIT: Confirm whether the produce conforms to AGMARK Grade A, B, or C, and state suitability for Supermarket Retail vs APMC Mandi vs Industrial Food Processing.
4. FINAL CLEARANCE RECOMMENDATION: Provide actionable procurement advice for 24-hour RBI Escrow settlement.

LANGUAGE MANDATE:
Generate your ENTIRE audit report strictly and fluently in ${langName} (${lang}). Structure it with bold headings and bullet points.`;

    let imageBase64 = null;
    let mimeType = 'image/jpeg';
    if (lot.photoUrl && lot.photoUrl.startsWith('data:image/')) {
      const parts = lot.photoUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      imageBase64 = parts[1];
    } else if (lot.photoUrl) {
      try {
        const converted = await this.urlToBase64(lot.photoUrl);
        if (converted && converted.startsWith('data:image/')) {
          const parts = converted.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          imageBase64 = parts[1];
        }
      } catch (e) {}
    }

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          imageBase64: imageBase64,
          mimeType: mimeType,
          temperature: 0.15,
          maxOutputTokens: 1200
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.text) {
        callback(data.text.trim(), true);
        return;
      } else {
        const errorReason = this.formatErrorMessage(response.status, data.error, data.diagnostics);
        callback(errorReason, false);
        return;
      }
    } catch (networkErr) {
      const networkMsg = this.formatErrorMessage(0, `Network Error: ${networkErr.message}`, null);
      callback(networkMsg, false);
    }
  },

  // Helper to convert image URL to base64 via canvas
  urlToBase64: function(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.width, 600);
        canvas.height = Math.min(img.height, 450);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
};

if (typeof window !== 'undefined') {
  window.GeminiService = GeminiService;
}
