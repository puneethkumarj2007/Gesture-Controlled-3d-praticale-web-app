import { spawn } from 'child_process';

const c = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9339',
  '--no-sandbox',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  'http://localhost:5173'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9339/json');
    const data = await res.json();
    const pageTarget = data.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) || data[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    ws.onopen = async () => {
      // First navigate to the app
      ws.send(JSON.stringify({ id: 10, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 11, method: 'Page.navigate', params: { url: 'http://localhost:5173' } }));

      // Wait 5 seconds for page load & camera init
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `({
              url: window.location.href,
              videoFound: !!document.getElementById('video-bg'),
              videoReadyState: document.getElementById('video-bg')?.readyState,
              videoPaused: document.getElementById('video-bg')?.paused,
              videoWidth: document.getElementById('video-bg')?.videoWidth,
              videoHeight: document.getElementById('video-bg')?.videoHeight,
              hasStream: !!document.getElementById('video-bg')?.srcObject,
              streamActive: document.getElementById('video-bg')?.srcObject?.active,
              streamTracks: document.getElementById('video-bg')?.srcObject?.getVideoTracks()?.map(t => ({ label: t.label, enabled: t.enabled, readyState: t.readyState })),
              loaderHidden: document.getElementById('app-loader')?.classList.contains('hidden')
            })`,
            returnByValue: true
          }
        }));
      }, 5000);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Live App Video Status:', JSON.stringify(msg.result.result.value, null, 2));
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
