import { spawn } from 'child_process';
import fs from 'fs';

const c = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9341',
  '--no-sandbox',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9341/json');
    const data = await res.json();
    const pageTarget = data.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || data[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 10, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 11, method: 'Page.navigate', params: { url: 'http://localhost:5173' } }));
      ws.send(JSON.stringify({
        id: 12,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }
      }));

      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      }, 6000);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        if (msg.result && msg.result.data) {
          fs.writeFileSync('live-realcam-screenshot.png', Buffer.from(msg.result.data, 'base64'));
          console.log('✅ Captured live-realcam-screenshot.png');
        }
        c.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error('Error:', err);
    c.kill();
    process.exit(1);
  }
}, 3000);
