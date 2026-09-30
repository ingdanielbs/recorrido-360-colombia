import { hub, tours } from './tours-data.js';

if (!window.AFRAME.components.billboard) {
  window.AFRAME.registerComponent('billboard', {
    tick() {
      const camera = this.el.sceneEl?.camera;
      if (!camera) return;
      const target = camera.getWorldPosition(new window.THREE.Vector3());
      this.el.object3D.lookAt(target);
    },
  });
}

const RADIUS = 9;
const sceneEl = document.querySelector('#scene');
const skyEl = document.querySelector('#sky');
const loader = document.querySelector('#loader');
const hint = document.querySelector('#hint');
const enterVrBtn = document.querySelector('#enter-vr');
const camera = document.querySelector('#camera');
const hotspotLayer = document.querySelector('#hotspot-layer');
const panel = document.querySelector('#info-panel');
const panelTitle = document.querySelector('#panel-title');
const panelSubtitle = document.querySelector('#panel-subtitle');
const panelText = document.querySelector('#panel-text');
const panelAction = document.querySelector('#panel-action');
const panelClose = document.querySelector('#panel-close');
const sceneLabel = document.querySelector('#scene-label');
const tourNav = document.querySelector('#tour-nav');

let currentTourId = 'hub';
let currentSceneId = null;
let activeHotspot = null;
let fov = 80;

/**
 * u/v → posición local (SphereGeometry).
 * #hotspot-layer usa yaw = -yaw del cielo (cielo -90° → capa +90°).
 */
function uvToPosition(u, v) {
  const theta = u * Math.PI * 2;
  const phi = v * Math.PI;

  return {
    x: -RADIUS * Math.sin(phi) * Math.cos(theta),
    y: RADIUS * Math.cos(phi),
    z: RADIUS * Math.sin(phi) * Math.sin(theta),
  };
}

/** Apunta la cámara al hotspot (útil para calibrar). */
function lookAtHotspot(id) {
  const el = document.querySelector(`[data-hotspot-id="${id}"]`);
  const look = camera?.components?.['look-controls'];
  if (!el || !look) return null;
  const pos = el.object3D.getWorldPosition(new window.THREE.Vector3());
  look.yawObject.rotation.y = Math.atan2(-pos.x, -pos.z);
  look.pitchObject.rotation.x = Math.max(
    -1.2,
    Math.min(1.2, Math.atan2(pos.y - 1.6, Math.hypot(pos.x, pos.z))),
  );
  return id;
}

window.__lookAtHotspot = lookAtHotspot;

function getSceneConfig() {
  if (currentTourId === 'hub') return hub;
  return tours[currentTourId]?.scenes?.[currentSceneId] ?? hub;
}

function hideLoader() {
  loader?.classList.add('is-done');
}

function hideHintSoon() {
  window.setTimeout(() => hint?.classList.add('is-hidden'), 7000);
}

function closePanel() {
  panel?.classList.remove('is-open');
  activeHotspot = null;
  panelAction.hidden = true;
  panelAction.onclick = null;
}

function openPanel(hotspot) {
  activeHotspot = hotspot;
  panelTitle.textContent = hotspot.title;
  panelSubtitle.textContent = hotspot.subtitle || '';
  panelText.textContent = hotspot.description || '';

  const canEnterTour = Boolean(hotspot.tourId && tours[hotspot.tourId]);
  const canGoScene = Boolean(hotspot.targetScene);
  const canGoHub = hotspot.targetTour === 'hub';

  if (canEnterTour) {
    panelAction.hidden = false;
    panelAction.textContent = 'Entrar al recorrido →';
    panelAction.onclick = () => enterTour(hotspot.tourId);
  } else if (canGoScene) {
    panelAction.hidden = false;
    panelAction.textContent = 'Ir a esta vista →';
    panelAction.onclick = () => loadScene(currentTourId, hotspot.targetScene);
  } else if (canGoHub) {
    panelAction.hidden = false;
    panelAction.textContent = 'Volver a Colombia →';
    panelAction.onclick = () => enterHub();
  } else {
    panelAction.hidden = false;
    panelAction.textContent = 'Próximamente';
    panelAction.onclick = null;
    panelAction.disabled = true;
  }

  if (canEnterTour || canGoScene || canGoHub) {
    panelAction.disabled = false;
  }

  panel?.classList.add('is-open');
  hint?.classList.add('is-hidden');
}

function clearHotspots() {
  while (hotspotLayer.firstChild) {
    hotspotLayer.removeChild(hotspotLayer.firstChild);
  }
}

/** Etiqueta con canvas: soporta tildes y alto contraste sobre el panorama. */
function createLabelCanvas(title, subtitle = '') {
  const canvas = document.createElement('canvas');
  // Alta resolución: la tilde (á/í) no se pierde al escalar en 3D
  canvas.width = 1024;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  const safeTitle = String(title).normalize('NFC');
  const safeSubtitle = String(subtitle || '').normalize('NFC');

  const padX = 24;
  const padY = 22;
  const boxW = canvas.width - padX * 2;
  const boxH = canvas.height - padY * 2;
  const radius = 28;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Halo negro exterior
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  roundRect(ctx, padX + 8, padY + 10, boxW, boxH, radius);
  ctx.fill();

  // Placa opaca
  ctx.fillStyle = '#050805';
  roundRect(ctx, padX, padY, boxW, boxH, radius);
  ctx.fill();

  // Doble borde: blanco grueso + dorado
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f0c94a';
  roundRect(ctx, padX + 8, padY + 8, boxW - 16, boxH - 16, radius - 6);
  ctx.stroke();

  const titleFont = '"DM Serif Display", "Noto Sans", Georgia, serif';
  const subFont = '"Noto Sans", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleY = safeSubtitle ? canvas.height / 2 - 28 : canvas.height / 2;
  drawAccentedLine(ctx, safeTitle, canvas.width / 2, titleY, `700 86px ${titleFont}`, '#ffffff', 12);

  if (safeSubtitle) {
    drawAccentedLine(
      ctx,
      safeSubtitle,
      canvas.width / 2,
      canvas.height / 2 + 42,
      `600 42px ${subFont}`,
      '#ffe08a',
      6,
    );
  }

  return canvas;
}

const ACCENT_MAP = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
};

/** Texto con tilde dibujada a mano (más legible en texturas 3D pequeñas). */
function drawAccentedLine(ctx, text, centerX, y, font, fill, strokeW) {
  ctx.font = font;
  const fontSize = Number(String(font).match(/(\d+)px/)?.[1] || 48);
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ACCENT_MAP[ch] || ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = centerX - total / 2;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  chars.forEach((ch, i) => {
    const base = ACCENT_MAP[ch] || ch;
    const w = widths[i];
    const cx = x + w / 2;
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = fill;
    ctx.textAlign = 'center';
    ctx.strokeText(base, cx, y);
    ctx.fillText(base, cx, y);

    if (ACCENT_MAP[ch]) {
      const ax = cx + fontSize * 0.02;
      const ay = y - fontSize * 0.52;
      ctx.lineWidth = Math.max(4, fontSize * 0.1);
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(ax - fontSize * 0.1, ay + fontSize * 0.08);
      ctx.lineTo(ax + fontSize * 0.12, ay - fontSize * 0.14);
      ctx.stroke();
      ctx.lineWidth = Math.max(2.5, fontSize * 0.07);
      ctx.strokeStyle = fill;
      ctx.stroke();
    }
    x += w;
  });

  ctx.textAlign = 'center';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createHotspotEntity(hotspot) {
  const { x, y, z } = uvToPosition(hotspot.u ?? 0.5, hotspot.v ?? 0.5);
  const isHome = hotspot.variant === 'home';

  const root = document.createElement('a-entity');
  root.setAttribute('class', 'interactive hotspot');
  root.setAttribute('position', `${x} ${y} ${z}`);
  root.setAttribute('billboard', '');
  root.dataset.hotspotId = hotspot.id;

  // Marcador: halo negro + anillo blanco pulsante + núcleo dorado (alto contraste)
  const halo = document.createElement('a-entity');
  halo.setAttribute('geometry', 'primitive: circle; radius: 0.85');
  halo.setAttribute(
    'material',
    'color: #000000; opacity: 0.95; shader: flat; side: double; transparent: true',
  );
  halo.setAttribute('position', '0 0 -0.03');

  const pulse = document.createElement('a-entity');
  pulse.setAttribute('geometry', 'primitive: ring; radiusInner: 0.42; radiusOuter: 0.72');
  pulse.setAttribute(
    'material',
    'color: #ffffff; opacity: 1; shader: flat; side: double; transparent: true',
  );
  pulse.setAttribute(
    'animation',
    'property: scale; from: 1 1 1; to: 1.28 1.28 1.28; dir: alternate; loop: true; dur: 1100; easing: easeInOutSine',
  );

  const ringGold = document.createElement('a-entity');
  ringGold.setAttribute('geometry', 'primitive: ring; radiusInner: 0.28; radiusOuter: 0.45');
  ringGold.setAttribute(
    'material',
    `color: ${isHome ? '#ffffff' : '#ffd24a'}; opacity: 1; shader: flat; side: double`,
  );

  const core = document.createElement('a-entity');
  core.setAttribute('geometry', 'primitive: circle; radius: 0.26');
  core.setAttribute(
    'material',
    'color: #ffffff; opacity: 1; shader: flat; side: double',
  );
  core.setAttribute('class', 'interactive');
  core.setAttribute('position', '0 0 0.01');

  const labelCanvas = createLabelCanvas(hotspot.title, hotspot.subtitle || '');
  const label = document.createElement('a-image');
  label.setAttribute('src', labelCanvas.toDataURL('image/png'));
  label.setAttribute('width', '4.2');
  label.setAttribute('height', '1.15');
  label.setAttribute('position', '0 1.45 0.04');
  label.setAttribute('material', 'shader: flat; transparent: true; alphaTest: 0.05; depthTest: true');
  label.classList.add('interactive');

  // Placa negra detrás del texto (por si la textura pierde opacidad)
  const labelBack = document.createElement('a-plane');
  labelBack.setAttribute('width', '4.0');
  labelBack.setAttribute('height', '1.05');
  labelBack.setAttribute('position', '0 1.45 0.02');
  labelBack.setAttribute(
    'material',
    'color: #000000; opacity: 0.75; shader: flat; transparent: true; side: double',
  );

  root.append(halo, pulse, ringGold, core, labelBack, label);

  const onActivate = (event) => {
    event.stopPropagation();
    const inVr = document.body.classList.contains('is-vr');

    // En VR el HTML overlay no se ve: navegar directo
    if (inVr) {
      if (hotspot.tourId && tours[hotspot.tourId]) {
        enterTour(hotspot.tourId);
        return;
      }
      if (hotspot.targetScene) {
        loadScene(currentTourId, hotspot.targetScene);
        return;
      }
      if (hotspot.targetTour === 'hub') {
        enterHub();
        return;
      }
      return;
    }

    if (hotspot.targetScene) {
      loadScene(currentTourId, hotspot.targetScene);
      return;
    }
    if (hotspot.targetTour === 'hub') {
      enterHub();
      return;
    }
    openPanel(hotspot);
  };

  root.addEventListener('click', onActivate);
  core.addEventListener('click', onActivate);
  label.addEventListener('click', onActivate);

  return root;
}

function hotspotLayerRotation(skyRotation = '0 -90 0') {
  const skyYaw = Number(String(skyRotation).trim().split(/\s+/)[1]) || 0;
  return `0 ${-skyYaw} 0`;
}

async function renderHotspots(config) {
  clearHotspots();
  hotspotLayer.setAttribute('rotation', hotspotLayerRotation(config.skyRotation));

  try {
    await document.fonts.load('700 86px "DM Serif Display"');
    await document.fonts.load('700 78px "Noto Sans"');
    await document.fonts.load('600 42px "Noto Sans"');
    await document.fonts.ready;
  } catch {
    // Fallback: Segoe UI / Arial
  }

  for (const hotspot of config.hotspots || []) {
    hotspotLayer.appendChild(createHotspotEntity(hotspot));
  }
}

function updateTourNav() {
  if (!tourNav) return;
  tourNav.innerHTML = '';

  if (currentTourId === 'hub') {
    tourNav.hidden = true;
    return;
  }

  const tour = tours[currentTourId];
  if (!tour) {
    tourNav.hidden = true;
    return;
  }

  tourNav.hidden = false;

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'tour-chip';
  back.textContent = '← Hub';
  back.addEventListener('click', enterHub);
  tourNav.appendChild(back);

  for (const scene of Object.values(tour.scenes)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'tour-chip';
    if (scene.id === currentSceneId) chip.classList.add('is-active');
    chip.textContent = scene.title;
    chip.addEventListener('click', () => loadScene(currentTourId, scene.id));
    tourNav.appendChild(chip);
  }
}

function setSky(src, rotation = '0 -90 0') {
  const absolute = new URL(src, window.location.href).href;
  skyEl.setAttribute('rotation', rotation);
  skyEl.setAttribute('material', {
    shader: 'flat',
    side: 'back',
    src: absolute,
  });
  skyEl.setAttribute('src', absolute);
}

function loadScene(tourId, sceneId) {
  closePanel();

  if (tourId === 'hub') {
    enterHub();
    return;
  }

  const tour = tours[tourId];
  const scene = tour?.scenes?.[sceneId];
  if (!scene) return;

  currentTourId = tourId;
  currentSceneId = sceneId;
  setSky(scene.src, scene.skyRotation);
  void renderHotspots(scene);
  updateTourNav();

  if (sceneLabel) {
    sceneLabel.textContent = `${tour.title} · ${scene.title}`;
    sceneLabel.hidden = false;
  }
}

function enterTour(tourId) {
  const tour = tours[tourId];
  if (!tour) return;
  loadScene(tourId, tour.startScene);
}

function enterHub() {
  closePanel();
  currentTourId = 'hub';
  currentSceneId = null;
  setSky(hub.src, hub.skyRotation);
  void renderHotspots(hub);
  updateTourNav();
  if (sceneLabel) {
    sceneLabel.textContent = hub.title;
    sceneLabel.hidden = false;
  }
}

sceneEl?.addEventListener('loaded', () => {
  hideLoader();
  hideHintSoon();
  enterHub();
});

window.setTimeout(() => {
  hideLoader();
  if (!hotspotLayer?.childElementCount) enterHub();
}, 8000);

['mousedown', 'touchstart', 'wheel'].forEach((eventName) => {
  window.addEventListener(
    eventName,
    () => hint?.classList.add('is-hidden'),
    { once: true, passive: true },
  );
});

sceneEl?.addEventListener('enter-vr', () => {
  document.body.classList.add('is-vr');
  hint?.classList.add('is-hidden');
});

sceneEl?.addEventListener('exit-vr', () => {
  document.body.classList.remove('is-vr');
});

enterVrBtn?.addEventListener('click', async () => {
  if (!sceneEl) return;
  try {
    await sceneEl.enterVR();
  } catch {
    enterVrBtn.textContent = 'VR no disponible';
  }
});

panelClose?.addEventListener('click', closePanel);

panel?.addEventListener('click', (event) => {
  if (event.target === panel) closePanel();
});

window.addEventListener(
  'wheel',
  (event) => {
    if (!camera || document.body.classList.contains('is-vr')) return;
    event.preventDefault();
    fov = Math.min(100, Math.max(50, fov + Math.sign(event.deltaY) * 3));
    camera.setAttribute('camera', 'fov', fov);
  },
  { passive: false },
);
