const http = require('http');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];

const server = http.createServer(async (req, res) => {
  try {
    // Extract target URL from path
    const targetUrl = decodeURIComponent(req.url.substring(1));
    
    // Validate URL
    if (!targetUrl.startsWith('http')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Use format: /https://example.com');
    }

    // Prepare headers
    const headers = {
      'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      'Referer': new URL(targetUrl).origin,
      'Host': new URL(targetUrl).host
    };

    // IP spoofing for IP addresses
    const host = new URL(targetUrl).hostname;
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      headers['X-Forwarded-For'] = generateRandomIP();
    }

    // Fetch target content
    const response = await fetch(targetUrl, { headers, redirect: 'follow' });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Copy headers from target
    for (const [name, value] of response.headers) {
      if (!['content-security-policy', 'x-frame-options'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    }

    // Stream content directly
    response.body.pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Proxy Error: ${err.message}`);
  }
});

function generateRandomIP() {
  return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

server.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/https://example.com`);
});
