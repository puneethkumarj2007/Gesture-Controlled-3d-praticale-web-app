/**
 * Browser Diagnostics Script using Chrome DevTools Protocol
 */
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9334;
const tempDir = path.join(process.cwd(), '.chrome-temp-' + Date.now());

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log(`🚀 Spawning Chrome with remote debugging on port ${port}...`);

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tempDir}`,
  '--no-sandbox',
  '--disable-gpu',
  '--disable-web-security',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  'http://localhost:5173'
]);

chrome.stderr.on('data', (d) => {
  const msg = d.toString();
  if (!msg.includes('DevTools listening')) {
    // console.log('[Chrome]', msg.trim());
  }
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, (r) => {
          let data = '';
          r.on('data', (c) => (data += c));
          r.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });

      if (res && res.length > 0) {
        const pageTarget = res.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || res[0];
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          return pageTarget.webSocketDebuggerUrl;
        }
      }
    } catch (e) {
      // retry
    }
  }
  throw new Error('Could not connect to Chrome CDP endpoint');
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    console.log('🔗 Connected to Chrome DevTools Protocol:', wsUrl);

    // Native WebSocket in Node 24
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve) => (ws.onopen = resolve));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const resp = JSON.parse(event.data);
          if (resp.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(resp.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[Browser Console ${type.toUpperCase()}]:`, text);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Exception]:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Console.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('🌐 Navigating to http://localhost:5173 ...');
    await send('Page.navigate', { url: 'http://localhost:5173' });

    console.log('⏳ Waiting 6 seconds to observe browser execution and model loading...');
    await sleep(6000);

    // Evaluate DOM state
    const evalResult = await send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        loaderHidden: document.getElementById('app-loader')?.classList.contains('hidden'),
        loaderStatus: document.getElementById('loader-status')?.textContent,
        errorModalHidden: document.getElementById('error-modal')?.classList.contains('hidden'),
        videoReadyState: document.getElementById('video-bg')?.readyState,
        threeCanvas: !!document.querySelector('#three-canvas-container canvas'),
        fps: document.getElementById('fps-value')?.textContent
      })`,
      returnByValue: true
    });

    console.log('\n📊 Browser DOM & App State:', JSON.stringify(evalResult.result.value, null, 2));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('browser-test-screenshot.png', Buffer.from(shot.data, 'base64'));
      console.log('📸 Screenshot saved to browser-test-screenshot.png');
    }

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
