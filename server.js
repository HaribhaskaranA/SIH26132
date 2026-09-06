// ==============================================================================
// EARTHWORM - Local Development Server
// Environment-independent Node server that mirrors Vercel serverless /api routes
// Serves static web assets and provides real /api/gemini and /api/agromarket backends
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Safe .env Parser (Zero external dependencies required)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const equalsIdx = trimmed.indexOf('=');
          if (equalsIdx > 0) {
            const key = trimmed.substring(0, equalsIdx).trim();
            let val = trimmed.substring(equalsIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Server] Notice: Could not read .env file:', e.message);
    }
  }
}

loadEnv();

// Dynamic lazy import to prevent build bundlers from resolving serverless functions during Vercel builds
function getGeminiHandler() {
  const handlerPath = path.join(__dirname, 'api', 'gemini.js');
  return require(handlerPath);
}

function getAgromarketHandler() {
  const handlerPath = path.join(__dirname, 'api', 'agromarket.js');
  return require(handlerPath);
}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Request dispatcher
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  let pathname = parsedUrl.pathname;

  // Add Express/Vercel response compatibility helpers
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };

  req.query = Object.fromEntries(parsedUrl.searchParams);

  // -------------------------------------------------------------
  // 1. API Route: /api/gemini
  // -------------------------------------------------------------
  if (pathname === '/api/gemini' || pathname === '/api/gemini.js') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      if (bodyData.length > 25 * 1024 * 1024) {
        res.status(413).json({ success: false, error: 'Payload too large (>25MB)' });
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = {};
      }

      try {
        const handler = getGeminiHandler();
        await handler(req, res);
      } catch (handlerErr) {
        console.error('[Server] Gemini Handler Unhandled Exception:', handlerErr);
        if (!res.writableEnded) {
          res.status(500).json({
            success: false,
            error: `Server Handler Error: ${handlerErr.message}`,
            diagnostics: {
              environment: 'local',
              requestReachedApi: true,
              httpMethod: req.method,
              modelUsed: 'gemini-3.6-flash',
              apiKeyConfigured: !!process.env.GEMINI_API_KEY,
              upstreamStatus: 500
            }
          });
        }
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // 2. API Route: /api/agromarket
  // -------------------------------------------------------------
  if (pathname === '/api/agromarket' || pathname === '/api/agromarket.js') {
    try {
      const handler = getAgromarketHandler();
      await handler(req, res);
    } catch (handlerErr) {
      console.error('[Server] Agromarket Handler Exception:', handlerErr);
      if (!res.writableEnded) {
        res.status(500).json({ success: false, error: handlerErr.message });
      }
    }
    return;
  }

  // -------------------------------------------------------------
  // 3. Static File Server (HTML, CSS, JS, Assets)
  // -------------------------------------------------------------
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  
  // Resolve file from multiple possible root locations (local and cloud environments)
  let filePath = path.join(__dirname, safePath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), safePath);
  }
  if (!fs.existsSync(filePath) && safePath.startsWith(path.sep + 'index.html')) {
    filePath = path.join(__dirname, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  const isKeyConfigured = !!process.env.GEMINI_API_KEY;
  const isDataGovConfigured = !!process.env.DATA_GOV_API_KEY;

  console.log('\n=============================================================');
  console.log('🌱 EARTHWORM AGRITECH MOBILE WEB APP — DEV SERVER READY');
  console.log('=============================================================');
  console.log(`🌐 Local App URL        : http://localhost:${PORT}`);
  console.log(`📱 Mobile Network Access: http://127.0.0.1:${PORT}`);
  console.log(`🤖 Gemini AI API        : /api/gemini (Model: gemini-3.6-flash)`);
  console.log(`🔑 Gemini Key Status    : ${isKeyConfigured ? '✓ Configured Server-Side (Hidden from Client)' : '⚠️ Missing GEMINI_API_KEY in .env'}`);
  console.log(`🌾 Agmarknet API Status : ${isDataGovConfigured ? '✓ Live Data.gov.in Active' : '⚠️ Missing DATA_GOV_API_KEY'}`);
  console.log('=============================================================\n');
});
