const https = require('https');

async function testFetch() {
  console.log('Testing Node global fetch...');
  const key = 'AQ.Ab8RN6ITNcG_ga6ZL2KYV-TLvP94dUGXso5w79UxCi69azlotQ';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
  
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Can I cultivate onion in Coimbatore?' }] }]
      })
    });
    console.log(`Fetch completed in ${Date.now() - start}ms with status:`, res.status);
    const data = await res.json();
    console.log('Response text:', data.candidates[0].content.parts[0].text.substring(0, 100));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testFetch();
