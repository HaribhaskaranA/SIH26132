const https = require('https');

function testHttpsRequest() {
  console.log('Testing Node https.request (IPv4 first)...');
  const key = 'AQ.Ab8RN6ITNcG_ga6ZL2KYV-TLvP94dUGXso5w79UxCi69azlotQ';
  const postData = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Can I cultivate onion in Coimbatore?' }] }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    family: 4 // Force IPv4 to bypass Windows IPv6 DNS delays
  };

  const start = Date.now();
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`https.request completed in ${Date.now() - start}ms, status: ${res.statusCode}`);
      const json = JSON.parse(data);
      console.log('Snippet:', json.candidates[0].content.parts[0].text.substring(0, 150));
    });
  });

  req.on('error', (e) => console.error('https.request error:', e));
  req.write(postData);
  req.end();
}

testHttpsRequest();
