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

/** yaw/pitch en grados → posición en la esfera (yaw 0 = frente a la cámara). */
function angularToPosition(yawDeg, pitchDeg) {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;

  return {
    x: RADIUS * Math.cos(pitch) * Math.sin(yaw),
    y: RADIUS * Math.sin(pitch),
    z: -RADIUS * Math.cos(pitch) * Math.cos(yaw),
  };
}

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

function createHotspotEntity(hotspot) {
  const { x, y, z } = angularToPosition(hotspot.yaw ?? 0, hotspot.pitch ?? 0);
  const isHome = hotspot.variant === 'home';
  const color = isHome ? '#f0ebe0' : '#c8a84b';

  const root = document.createElement('a-entity');
  root.setAttribute('class', 'interactive hotspot');
  root.setAttribute('position', `${x} ${y} ${z}`);
  root.setAttribute('billboard', '');
  root.dataset.hotspotId = hotspot.id;

  const pulse = document.createElement('a-entity');
  pulse.setAttribute('geometry', 'primitive: ring; radiusInner: 0.22; radiusOuter: 0.34');
  pulse.setAttribute(
    'material',
    `color: ${color}; opacity: 0.85; shader: flat; side: double; transparent: true`,
  );
  pulse.setAttribute(
    'animation',
    'property: scale; from: 1 1 1; to: 1.25 1.25 1.25; dir: alternate; loop: true; dur: 1400; easing: easeInOutSine',
  );

  const core = document.createElement('a-entity');
  core.setAttribute('geometry', 'primitive: circle; radius: 0.14');
  core.setAttribute(
    'material',
    `color: ${color}; opacity: 0.95; shader: flat; side: double; transparent: true`,
  );
  core.setAttribute('class', 'interactive');

  const label = document.createElement('a-text');
  label.setAttribute('value', hotspot.title);
  label.setAttribute('align', 'center');
  label.setAttribute('baseline', 'bottom');
  label.setAttribute('position', '0 0.48 0');
  label.setAttribute('width', '5');
  label.setAttribute('color', '#f0ebe0');
  label.setAttribute(
    'font',
    'https://cdn.aframe.io/fonts/Exo2Bold.fnt',
  );

  const shadow = document.createElement('a-text');
  shadow.setAttribute('value', hotspot.subtitle || '');
  shadow.setAttribute('align', 'center');
  shadow.setAttribute('baseline', 'top');
  shadow.setAttribute('position', '0 0.42 0');
  shadow.setAttribute('width', '4');
  shadow.setAttribute('color', color);
  shadow.setAttribute(
    'font',
    'https://cdn.aframe.io/fonts/Exo2Bold.fnt',
  );

  root.append(pulse, core, label, shadow);

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

  return root;
}

function renderHotspots(config) {
  clearHotspots();
  hotspotLayer.setAttribute('rotation', '0 0 0');

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
  skyEl.setAttribute('rotation', rotation);
  skyEl.setAttribute('src', src);
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
  renderHotspots(scene);
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
  renderHotspots(hub);
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
