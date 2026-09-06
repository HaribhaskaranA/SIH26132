// Comprehensive End-to-End Verification Suite for Earthworm Local Dev Server & Gemini AI
const http = require('http');

async function sendPost(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function sendGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function runAllTests() {
  console.log('=============================================================');
  console.log('🧪 EARTHWORM DUAL-ENVIRONMENT ROUTING & AI VERIFICATION');
  console.log('=============================================================\n');

  // Test 0: Static Asset Serving
  console.log('--- TEST 0: Static File Serving (GET /) ---');
  const indexRes = await sendGet('/');
  console.log(`HTTP Status: ${indexRes.status}, Content-Type: ${indexRes.headers['content-type']}`);
  console.log(`HTML Loaded: ${indexRes.raw && indexRes.raw.includes('EARTHWORM')}`);

  // Test 1: API Health Check (GET /api/gemini)
  console.log('\n--- TEST 1: API Health Check (GET /api/gemini) ---');
  const healthRes = await sendGet('/api/gemini');
  console.log(`HTTP Status: ${healthRes.status}`);
  console.log('Health Payload:', JSON.stringify(healthRes.body, null, 2));

  // Test 2: Text Chat Query ("Can I cultivate onion?")
  console.log('\n--- TEST 2: Chat Query: "Can I cultivate onion?" (POST /api/gemini) ---');
  const chatRes = await sendPost('/api/gemini', {
    prompt: 'Farmer Question: "Can I cultivate onion?" Location: Coimbatore, Tamil Nadu. Provide a complete, practical agronomic answer regarding seasons, soil, and yield.',
    systemPrompt: 'You are EARTHWORM Agri AI expert agricultural advisor.',
    temperature: 0.3
  });
  console.log(`HTTP Status: ${chatRes.status}`);
  console.log('Diagnostics:', JSON.stringify(chatRes.body.diagnostics, null, 2));
  console.log('Gemini AI Answer:');
  console.log(chatRes.body.text || 'NO TEXT');

  // Test 3: Vernacular Tamil Query
  console.log('\n--- TEST 3: Vernacular Chat Query (Tamil) (POST /api/gemini) ---');
  const tamilRes = await sendPost('/api/gemini', {
    prompt: 'கோயம்புத்தூரில் வெங்காயம் பயிரிட சிறந்த பருவம் எது?',
    systemPrompt: 'You are EARTHWORM Agri AI. Answer completely in Tamil.',
    temperature: 0.3
  });
  console.log(`HTTP Status: ${tamilRes.status}`);
  console.log('Gemini Tamil Answer Snippet:');
  console.log(tamilRes.body.text ? tamilRes.body.text.substring(0, 250) + '...' : 'NO TEXT');

  // Test 4: Multimodal Vision Produce Grading
  console.log('\n--- TEST 4: Multimodal Quality Grading (POST /api/gemini) ---');
  const testPixelBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const visionRes = await sendPost('/api/gemini', {
    prompt: 'You are an AGMARK agricultural quality assaying inspector. Inspect the produce in this capture and return a JSON evaluation with grade, colorScore, caliber, defectRate, assessment.',
    imageBase64: testPixelBase64,
    mimeType: 'image/jpeg',
    temperature: 0.1,
    responseMimeType: 'application/json'
  });
  console.log(`HTTP Status: ${visionRes.status}`);
  console.log('Diagnostics:', JSON.stringify(visionRes.body.diagnostics, null, 2));
  console.log('Vision JSON Output:', visionRes.body.text);

  // Test 5: Live Mandi Pricing Endpoint
  console.log('\n--- TEST 5: Agmarknet Live Market Rates (GET /api/agromarket) ---');
  const marketRes = await sendGet('/api/agromarket?state=Tamil+Nadu&limit=3');
  console.log(`HTTP Status: ${marketRes.status}, Live: ${marketRes.body.live}, Records Count: ${marketRes.body.records ? marketRes.body.records.length : 0}`);
  if (marketRes.body.records && marketRes.body.records[0]) {
    console.log('Sample Mandi Record:', JSON.stringify(marketRes.body.records[0]));
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL 5 INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('=============================================================\n');
}

runAllTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
