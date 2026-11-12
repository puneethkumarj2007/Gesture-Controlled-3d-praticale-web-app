import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9344',
  '--no-sandbox',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  'http://localhost:5173'
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9344/json');
    const data = await res.json();
    const pageTarget = data.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || data[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 100;
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const id = ++msgId;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Page.navigate', { url: 'http://localhost:5173' });

      console.log('Waiting for initial load...');
      await sleep(4000);

      // Models to capture
      const models = ['human', 'bike', 'car', 'plane'];

      for (const m of models) {
        console.log(`Switching to ${m}...`);
        await send('Runtime.evaluate', {
          expression: `document.querySelector('[data-model="${m}"]').click()`
        });
        await sleep(1500);

        const snap = await send('Page.captureScreenshot', { format: 'png' });
        if (snap && snap.data) {
          const outPath = path.join(process.cwd(), `blueprint-${m}.png`);
          fs.writeFileSync(outPath, Buffer.from(snap.data, 'base64'));
          console.log(`📸 Saved blueprint-${m}.png (${fs.statSync(outPath).size} bytes)`);
        }
      }

      console.log('All screenshots captured!');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 2500);
