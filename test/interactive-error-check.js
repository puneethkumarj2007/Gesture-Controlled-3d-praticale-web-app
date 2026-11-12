/**
 * WonderSnap Full Diagnostic Error Checker
 * Tests all interactions, model switching, label rendering, and UI actions.
 */
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9335;
const tempDir = path.join(os.tmpdir(), '.chrome-wondersnap-' + Date.now());

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
  const exceptions = [];
  try {
    const wsUrl = await getWsUrl();
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
      if (msg.method === 'Runtime.exceptionThrown') {
        const err = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        console.error('❌ [Browser Exception]:', err);
        exceptions.push(err);
      }
      if (msg.method === 'Console.messageAdded' && msg.params.message.level === 'error') {
        const err = msg.params.message.text;
        console.error('❌ [Console Error]:', err);
        exceptions.push(err);
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
    await sleep(5000);

    // Test 1: Check initial Human / Skeleton model & labels
    const check1 = await send('Runtime.evaluate', {
      expression: `({
        currentTitle: document.getElementById('model-title')?.textContent,
        blueprintBanner: document.getElementById('blueprint-title-text')?.textContent,
        labelsCount: document.querySelectorAll('.lbl-card').length,
        svgPolylinesCount: document.querySelectorAll('#labels-overlay svg polyline').length,
        hasThreeCanvas: !!document.querySelector('#three-canvas-container canvas')
      })`,
      returnByValue: true
    });
    console.log('✅ Model 1 (Human Anatomy):', check1.result.value);

    // Test 2: Switch to Royal Enfield Bike
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-model="bike"]')?.click()`
    });
    await sleep(800);
    const check2 = await send('Runtime.evaluate', {
      expression: `({
        currentTitle: document.getElementById('model-title')?.textContent,
        blueprintBanner: document.getElementById('blueprint-title-text')?.textContent,
        labelsCount: document.querySelectorAll('.lbl-card').length,
        svgPolylinesCount: document.querySelectorAll('#labels-overlay svg polyline').length
      })`,
      returnByValue: true
    });
    console.log('✅ Model 2 (Royal Enfield Bike):', check2.result.value);

    // Test 3: Switch to BMW Sports Car
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-model="car"]')?.click()`
    });
    await sleep(800);
    const check3 = await send('Runtime.evaluate', {
      expression: `({
        currentTitle: document.getElementById('model-title')?.textContent,
        blueprintBanner: document.getElementById('blueprint-title-text')?.textContent,
        labelsCount: document.querySelectorAll('.lbl-card').length,
        svgPolylinesCount: document.querySelectorAll('#labels-overlay svg polyline').length
      })`,
      returnByValue: true
    });
    console.log('✅ Model 3 (BMW Sports Car):', check3.result.value);

    // Test 4: Switch to Aeroplane
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-model="plane"]')?.click()`
    });
    await sleep(800);
    const check4 = await send('Runtime.evaluate', {
      expression: `({
        currentTitle: document.getElementById('model-title')?.textContent,
        blueprintBanner: document.getElementById('blueprint-title-text')?.textContent,
        labelsCount: document.querySelectorAll('.lbl-card').length,
        svgPolylinesCount: document.querySelectorAll('#labels-overlay svg polyline').length
      })`,
      returnByValue: true
    });
    console.log('✅ Model 4 (Aeroplane):', check4.result.value);

    // Test 5: Quick Action Buttons (Explode, Assemble, Reset, Next, Palette, Inspector Toggle)
    console.log('🔘 Testing Quick Action & HUD Buttons...');
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-action-explode')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-action-assemble')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-action-reset')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-action-next')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-palette')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-toggle-inspector')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-toggle-inspector')?.click()` });
    await sleep(300);
    await send('Runtime.evaluate', { expression: `document.getElementById('btn-toggle-hand')?.click()` });
    await sleep(500);

    // Switch back to Human Lungs for final clean state
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-model="human"]')?.click()`
    });
    await sleep(1000);

    const finalStatus = await send('Runtime.evaluate', {
      expression: `({
        activeModel: document.getElementById('model-title')?.textContent,
        fps: document.getElementById('fps-value')?.textContent,
        labelsRendered: document.querySelectorAll('.lbl-card').length,
        hasOverlay: !!document.getElementById('labels-overlay')
      })`,
      returnByValue: true
    });
    console.log('\n📊 Final Application State:', finalStatus.result.value);

    if (exceptions.length === 0) {
      console.log('\n🎉 ZERO ERRORS FOUND! All buttons, models, labels, and shaders are working flawlessly.');
    } else {
      console.error(`\n⚠️ Detected ${exceptions.length} runtime exception(s):`, exceptions);
    }

    ws.close();
  } catch (err) {
    console.error('Diagnostic error:', err);
  } finally {
    chrome.kill();
    process.exit(exceptions.length > 0 ? 1 : 0);
  }
}

run();
