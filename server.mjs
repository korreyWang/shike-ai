import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const key = process.env.DEEPSEEK_API_KEY;

async function json(res, status, body) {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
  res.end(JSON.stringify(body));
}

async function body(req) { let s=''; for await (const chunk of req) s+=chunk; return JSON.parse(s || '{}'); }

async function callDeepSeek(payload) {
  if (!key) throw new Error('DEEPSEEK_API_KEY is not configured on the server');
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method:'POST', headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
    body: JSON.stringify({model:'deepseek-chat', ...payload})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `DeepSeek HTTP ${response.status}`);
  return data;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/ai/chat' && req.method === 'POST') {
      const input = await body(req);
      const data = await callDeepSeek({messages: input.messages || [], temperature: 0.2});
      return json(res, 200, {reply: data.choices?.[0]?.message?.content || '', usage: data.usage || null});
    }
    if (req.url === '/api/ai/analyze-food' && req.method === 'POST') {
      return json(res, 501, {error:'视觉识别接口已预留，待接入支持图片输入的模型与持久化数据层。'});
    }
    const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const file = path.resolve(root, 'dist', '.' + requested);
    if (!file.startsWith(path.resolve(root, 'dist'))) return json(res, 400, {error:'invalid path'});
    const data = await readFile(file);
    const ext = path.extname(file);
    const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
    res.writeHead(200, {'content-type': types[ext] || 'application/octet-stream'}); res.end(data);
  } catch (error) { json(res, error.message.includes('not configured') ? 503 : 500, {error:error.message}); }
});
server.listen(port, () => console.log(`食刻 AI running at http://localhost:${port}`));
