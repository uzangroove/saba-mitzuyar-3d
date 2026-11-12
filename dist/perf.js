// סבא מצויר 15.1 — מתג איכות, מונה FPS וטעינת מודלים מדוללים
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';

const LEVELS = ['low', 'med', 'high'];
const LABELS = {low: 'נמוכה', med: 'רגילה', high: 'גבוהה'};

function readQuality() {
  const fromUrl = new URLSearchParams(location.search).get('q');
  if (LEVELS.includes(fromUrl)) { try { localStorage.setItem('saba-quality', fromUrl); } catch (e) {} return fromUrl; }
  try { const saved = localStorage.getItem('saba-quality'); if (LEVELS.includes(saved)) return saved; } catch (e) {}
  return 'med';
}

export const QUALITY = readQuality();

// איכות גבוהה = המודלים המקוריים; נמוכה ורגילה = התיקייה assets/lite
export function assetUrl(url) {
  if (QUALITY === 'high') return url;
  return url.replace(/assets\/([a-z0-9-]+\.glb)$/, 'assets/lite/$1');
}

export function makeLoader() {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}

export function loadGLTF(url) {
  return makeLoader().loadAsync(assetUrl(url));
}

export const ANTIALIAS = QUALITY !== 'low';
export const SHADOWS = QUALITY !== 'low';

export function pixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  if (QUALITY === 'low') return Math.min(dpr, 0.8);
  if (QUALITY === 'med') return Math.min(dpr, 1);
  return Math.min(dpr, 1.15);
}

// מונה FPS קטן בפינה; לחיצה עליו מחליפה איכות וטוענת מחדש
export function startFpsMeter() {
  const el = document.createElement('button');
  el.id = 'fpsMeter';
  el.type = 'button';
  el.title = 'לחיצה מחליפה איכות גרפיקה';
  el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;font:600 13px system-ui,sans-serif;' +
    'background:rgba(20,40,35,.78);color:#fbd484;border:1px solid #fbd48466;border-radius:8px;padding:4px 8px;direction:rtl';
  document.body.appendChild(el);
  let frames = 0, last = performance.now(), minFps = Infinity;
  const tick = (now) => {
    frames++;
    if (now - last >= 1000) {
      const fps = Math.round(frames * 1000 / (now - last));
      if (now > 5000) minFps = Math.min(minFps, fps);
      el.textContent = `${fps} FPS · מינ׳ ${minFps === Infinity ? '—' : minFps} · איכות ${LABELS[QUALITY]}`;
      el.style.color = fps >= 28 ? '#a6e3a1' : fps >= 20 ? '#fbd484' : '#f38ba8';
      frames = 0; last = now;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  el.addEventListener('click', () => {
    const next = LEVELS[(LEVELS.indexOf(QUALITY) + 1) % LEVELS.length];
    const u = new URL(location.href); u.searchParams.set('q', next); location.href = u.href;
  });
}
