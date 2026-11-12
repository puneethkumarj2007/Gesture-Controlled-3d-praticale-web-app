import { spawn } from 'child_process';

const c = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9340',
  '--no-sandbox',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9340/json');
    const data = await res.json();
    const pageTarget = data.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || data[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 10, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 11, method: 'Console.enable' }));
      ws.send(JSON.stringify({ id: 12, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 13, method: 'Page.navigate', params: { url: 'http://localhost:5173' } }));

      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `({
              fps: document.getElementById('fps-value')?.textContent,
              cameraStatus: document.getElementById('camera-text')?.textContent,
              handLabel: document.getElementById('hand-mode-label')?.textContent,
              canvasWidth: document.getElementById('landmark-canvas')?.width,
              canvasHeight: document.getElementById('landmark-canvas')?.height,
              modelTitle: document.getElementById('model-title')?.textContent,
              labelsCount: document.querySelectorAll('.lbl-card').length,
              threeActive: !!document.querySelector('#three-canvas-container canvas')
            })`,
            returnByValue: true
          }
        }));
      }, 6000);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Hand & Model Live Engine State:', JSON.stringify(msg.result.result.value, null, 2));
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
