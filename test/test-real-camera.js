import { spawn } from 'child_process';

const c = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9338',
  '--no-sandbox',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9338/json');
    const data = await res.json();
    const wsUrl = data[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
              .then(s => ({
                active: s.active,
                tracks: s.getVideoTracks().map(t => ({
                  label: t.label,
                  enabled: t.enabled,
                  readyState: t.readyState,
                  settings: t.getSettings()
                }))
              }))
              .catch(e => ({ errorName: e.name, errorMessage: e.message }))
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Real getUserMedia result:', JSON.stringify(msg.result.result.value, null, 2));
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
