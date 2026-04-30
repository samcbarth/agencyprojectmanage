import http from 'node:http';
import { runSeniorPmPass } from './runner.js';

const port = Number(process.env.RUNNER_PORT || 8787);
let running = false;

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, message: 'Runner server is ready.' });
  }
  if (req.method === 'POST' && req.url === '/run/senior-pm') {
    if (running) return send(res, 409, { ok: false, message: 'Senior PM runner is already running.' });
    running = true;
    try {
      const result = await runSeniorPmPass();
      return send(res, 200, { ok: true, message: `Senior PM runner finished. Processed ${result.processed} cards.`, ...result });
    } catch (error) {
      return send(res, 500, { ok: false, message: error.message || 'Senior PM runner failed.' });
    } finally {
      running = false;
    }
  }
  return send(res, 404, { ok: false, message: 'Unknown runner endpoint.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Agency agent runner server listening on http://127.0.0.1:${port}`);
});
