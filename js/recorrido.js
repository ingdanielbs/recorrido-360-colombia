const scene = document.querySelector('#scene');
const loader = document.querySelector('#loader');
const hint = document.querySelector('#hint');
const enterVrBtn = document.querySelector('#enter-vr');
const camera = document.querySelector('#camera');

function hideLoader() {
  loader?.classList.add('is-done');
}

function hideHintSoon() {
  window.setTimeout(() => {
    hint?.classList.add('is-hidden');
  }, 6000);
}

scene?.addEventListener('loaded', () => {
  hideLoader();
  hideHintSoon();
});

// Fallback if assets take longer or event already fired
window.setTimeout(hideLoader, 8000);

['mousedown', 'touchstart', 'wheel'].forEach((eventName) => {
  window.addEventListener(
    eventName,
    () => hint?.classList.add('is-hidden'),
    { once: true, passive: true },
  );
});

scene?.addEventListener('enter-vr', () => {
  document.body.classList.add('is-vr');
  hint?.classList.add('is-hidden');
});

scene?.addEventListener('exit-vr', () => {
  document.body.classList.remove('is-vr');
});

enterVrBtn?.addEventListener('click', async () => {
  if (!scene) return;

  try {
    if (scene.enterVR) {
      await scene.enterVR();
      return;
    }
  } catch {
    // Fall through to native WebXR request
  }

  const xrSession = navigator.xr;
  if (!xrSession) {
    enterVrBtn.textContent = 'VR no disponible';
    return;
  }

  const supported = await xrSession.isSessionSupported('immersive-vr');
  if (!supported) {
    enterVrBtn.textContent = 'VR no disponible';
    return;
  }

  await scene.enterVR();
});

// Smooth zoom on desktop via mouse wheel (FOV)
let fov = 80;
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
