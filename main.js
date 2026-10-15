// ============================================
// ATELIER — Portfolio 3D
// ============================================

import * as THREE from 'three';
import { RGBELoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js';

/* ============================================
   CONFIG
   ============================================ */
const PROJETS = [
  {
    id: 'p1',
    title: 'Aurore',
    meta: '2025 · Direction artistique',
    desc: "Un projet de refonte complète d'identité visuelle : palette, typographie, système d'icônes et charte pour une maison de thé japonaise.",
    couleur1: '#e8b88a',
    couleur2: '#c96b3a',
    position: { x: -3, y: 2.2, z: -5.9, rotationY: 0 }
  },
  {
    id: 'p2',
    title: 'Prisme',
    meta: '2024 · Site web',
    desc: "Un site vitrine expérimental pour un studio de design graphique. Animations WebGL, scroll narratif et interaction au curseur.",
    couleur1: '#8ba6c9',
    couleur2: '#3a5a8c',
    position: { x: 0, y: 2.2, z: -5.9, rotationY: 0 }
  },
  {
    id: 'p3',
    title: 'Terra',
    meta: '2024 · Branding',
    desc: "Création d'une marque de céramique artisanale. Logotype, packaging, univers visuel inspiré des textures brutes et des matières premières.",
    couleur1: '#a8c98b',
    couleur2: '#4a6a3a',
    position: { x: 3, y: 2.2, z: -5.9, rotationY: 0 }
  },
  {
    id: 'p4',
    title: 'Écho',
    meta: '2023 · Installation',
    desc: "Installation interactive sonore et visuelle pour un festival d'art numérique. Les spectateurs dessinaient dans l'espace avec leurs mouvements.",
    couleur1: '#d4a5c9',
    couleur2: '#7a3a8c',
    position: { x: -5.9, y: 2.2, z: 0, rotationY: Math.PI / 2 }
  },
  {
    id: 'p5',
    title: 'Nébuleuse',
    meta: '2023 · Application',
    desc: "Design d'une application mobile d'astronomie pour enfants. Exploration d'un système solaire interactif, fiches des planètes.",
    couleur1: '#9d8bc9',
    couleur2: '#3a2d6a',
    position: { x: 5.9, y: 2.2, z: 0, rotationY: -Math.PI / 2 }
  }
];

const ROOM = { width: 12, depth: 12, height: 4 };

/* ============================================
   SETUP
   ============================================ */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e8d8);
scene.fog = new THREE.Fog(0xf0e8d8, 14, 24);

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(42, sizes.w / sizes.h, 0.1, 50);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

/* ============================================
   LUMIÈRES — le HDRI fait 90% du boulot
   ============================================ */
scene.add(new THREE.AmbientLight(0xfff5e6, 0.15));

const sun = new THREE.DirectionalLight(0xffe4b8, 1.4);
sun.position.set(8, 6, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 25;
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
sun.shadow.bias = -0.0005;
scene.add(sun);
scene.add(sun.target);
sun.target.position.set(0, 0, -2);

/* ============================================
   HDRI — éclairage et ambiance réalistes
   ============================================ */
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .load('assets/hdri/church_meeting_room_2k.hdr', (hdr) => {
    const envMap = pmremGenerator.fromEquirectangular(hdr).texture;
    scene.environment = envMap;
    hdr.dispose();
    pmremGenerator.dispose();
  });

/* ============================================
   MATÉRIAUX
   ============================================ */
const matParquet = new THREE.MeshStandardMaterial({
  color: 0xc49a6c,
  roughness: 0.85,
  metalness: 0.0,
});
const matMur = new THREE.MeshStandardMaterial({
  color: 0xf0e8d8,
  roughness: 0.95,
  metalness: 0.0,
});
const matPlafond = new THREE.MeshStandardMaterial({
  color: 0xfaf5e8,
  roughness: 1.0,
});
const matBoisFonce = new THREE.MeshStandardMaterial({
  color: 0x6b4a2e,
  roughness: 0.7,
});
const matBoisClair = new THREE.MeshStandardMaterial({
  color: 0xa88160,
  roughness: 0.75,
});
const matLaiton = new THREE.MeshStandardMaterial({
  color: 0xc9a227,
  roughness: 0.35,
  metalness: 0.7,
});

/* ============================================
   TEXTURE PROCÉDURALE — dégradé de toile
   ============================================ */
function createGradientTexture(c1, c2) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size * 1.25;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, size, size * 1.25);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size * 1.25);

  const img = ctx.getImageData(0, 0, size, size * 1.25);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ============================================
   SALLE — sol, murs, plafond
   ============================================ */
function buildRoom() {
  const group = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    matParquet
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    matPlafond
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.height;
  group.add(ceiling);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.height),
    matMur
  );
  backWall.position.set(0, ROOM.height / 2, -ROOM.depth / 2);
  backWall.receiveShadow = true;
  group.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height),
    matMur
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-ROOM.width / 2, ROOM.height / 2, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height),
    matMur
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(ROOM.width / 2, ROOM.height / 2, 0);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.height),
    matMur
  );
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, ROOM.height / 2, ROOM.depth / 2);
  group.add(frontWall);

  return group;
}

/* ============================================
   FENÊTRE
   ============================================ */
function buildWindow() {
  const group = new THREE.Group();

  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.8),
    new THREE.MeshBasicMaterial({ color: 0xfff3d8 })
  );
  sky.position.set(ROOM.width / 2 - 0.02, 2.4, -2);
  sky.rotation.y = -Math.PI / 2;
  group.add(sky);

  const matCadre = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.7,
  });

  const vBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 2.8, 0.06),
    matCadre
  );
  vBar.position.set(ROOM.width / 2 - 0.05, 2.4, -2);
  vBar.rotation.y = -Math.PI / 2;
  group.add(vBar);

  const hBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.06, 2.2),
    matCadre
  );
  hBar.position.set(ROOM.width / 2 - 0.05, 2.4, -2);
  group.add(hBar);

  const barTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), matCadre);
  barTop.position.set(ROOM.width / 2 - 0.04, 3.85, -2);
  group.add(barTop);

  const barBottom = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), matCadre);
  barBottom.position.set(ROOM.width / 2 - 0.04, 0.95, -2);
  group.add(barBottom);

  const barLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.9, 0.08), matCadre);
  barLeft.position.set(ROOM.width / 2 - 0.04, 2.4, -3.15);
  group.add(barLeft);

  const barRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.9, 0.08), matCadre);
  barRight.position.set(ROOM.width / 2 - 0.04, 2.4, -0.85);
  group.add(barRight);

  return group;
}

/* ============================================
   ÉTABLI
   ============================================ */
function buildTable() {
  const group = new THREE.Group();

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.12, 1.8),
    matBoisFonce
  );
  top.position.y = 0.9;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const piedPositions = [
    [-1.5, 0.45, -0.7], [1.5, 0.45, -0.7],
    [-1.5, 0.45, 0.7], [1.5, 0.45, 0.7]
  ];
  piedPositions.forEach(([x, y, z]) => {
    const pied = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.9, 0.12),
      matBoisFonce
    );
    pied.position.set(x, y, z);
    pied.castShadow = true;
    group.add(pied);
  });

  const traverse = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.08, 0.08),
    matBoisFonce
  );
  traverse.position.set(0, 0.25, 0);
  group.add(traverse);

  group.position.set(0, 0, -1);
  return group;
}

/* ============================================
   OBJETS SUR L'ÉTABLI
   ============================================ */
function buildTableObjects() {
  const group = new THREE.Group();

  const couleursPots = [0xc96b3a, 0x3a5a8c, 0x4a6a3a, 0xc9a227];
  couleursPots.forEach((c, i) => {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.22, 20),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1 })
    );
    pot.position.set(-1.2 + i * 0.32, 1.07, 0.5);
    pot.castShadow = true;
    group.add(pot);
  });

  const bocal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.32, 24, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xfaf5e8,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  bocal.position.set(1.1, 1.12, 0.4);
  group.add(bocal);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const pinceau = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8),
      matBoisClair
    );
    pinceau.position.set(
      1.1 + Math.cos(angle) * 0.06,
      1.3,
      0.4 + Math.sin(angle) * 0.06
    );
    pinceau.rotation.z = Math.cos(angle) * 0.15;
    pinceau.rotation.x = Math.sin(angle) * 0.15;
    group.add(pinceau);

    const poils = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.01, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9 })
    );
    poils.position.set(
      1.1 + Math.cos(angle) * 0.08,
      1.6,
      0.4 + Math.sin(angle) * 0.08
    );
    poils.rotation.z = Math.cos(angle) * 0.15;
    poils.rotation.x = Math.sin(angle) * 0.15;
    group.add(poils);
  }

  const palette = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32),
    matBoisClair
  );
  palette.position.set(0, 1.0, -0.3);
  palette.rotation.y = 0.3;
  group.add(palette);

  const couleursPalette = [0xc96b3a, 0x3a5a8c, 0x4a6a3a, 0xc9a227, 0xd4a5c9];
  couleursPalette.forEach((c, i) => {
    const tache = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.022, 12),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })
    );
    const angle = (i / couleursPalette.length) * Math.PI * 1.6 + 0.5;
    tache.position.set(
      0 + Math.cos(angle) * 0.2,
      1.011,
      -0.3 + Math.sin(angle) * 0.2
    );
    group.add(tache);
  });

  const rouleau = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.9, 20),
    new THREE.MeshStandardMaterial({ color: 0xede4d0, roughness: 1.0 })
  );
  rouleau.position.set(1.55, 1.35, -0.5);
  rouleau.rotation.z = 0.15;
  rouleau.castShadow = true;
  group.add(rouleau);

  group.position.set(0, 0, -1);
  return group;
}

/* ============================================
   CHEVALET
   ============================================ */
function buildEasel() {
  const group = new THREE.Group();

  const positions = [
    { x: -0.35, z: 0.3, rot: -0.15 },
    { x: 0.35, z: 0.3, rot: 0.15 },
    { x: 0, z: -0.3, rot: 0 },
  ];
  positions.forEach(({ x, z, rot }) => {
    const pied = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.0, 0.05),
      matBoisClair
    );
    pied.position.set(x, 1.0, z);
    pied.rotation.z = rot;
    pied.rotation.x = z > 0 ? 0.15 : -0.1;
    pied.castShadow = true;
    group.add(pied);
  });

  const barre = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.06, 0.06),
    matBoisClair
  );
  barre.position.set(0, 1.5, 0.15);
  group.add(barre);

  const toile = new THREE.Mesh(
    new THREE.PlaneGeometry(0.75, 0.95),
    new THREE.MeshStandardMaterial({ color: 0xfaf5e8, roughness: 1.0, side: THREE.DoubleSide })
  );
  toile.position.set(0, 1.65, 0.1);
  toile.rotation.x = -0.08;
  group.add(toile);

  const ebauche = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xa8c98b, roughness: 0.9, side: THREE.DoubleSide })
  );
  ebauche.position.set(0.05, 1.5, 0.11);
  ebauche.rotation.x = -0.08;
  ebauche.rotation.z = 0.3;
  group.add(ebauche);

  group.position.set(-4.2, 0, -3.5);
  group.rotation.y = 0.4;
  return group;
}

/* ============================================
   PROJETS — cadres sur les murs
   ============================================ */
const projetsGroup = new THREE.Group();
const projetsMeshes = [];

PROJETS.forEach((p, i) => {
  const group = new THREE.Group();
  group.position.set(p.position.x, p.position.y, p.position.z);
  group.rotation.y = p.position.rotationY;

  const cadreMat = matBoisFonce;
  const cadreW = 1.4;
  const cadreH = 1.75;

  const barres = [
    { w: cadreW, h: 0.08, d: 0.08, x: 0, y: cadreH / 2, z: 0 },
    { w: cadreW, h: 0.08, d: 0.08, x: 0, y: -cadreH / 2, z: 0 },
    { w: 0.08, h: cadreH, d: 0.08, x: -cadreW / 2, y: 0, z: 0 },
    { w: 0.08, h: cadreH, d: 0.08, x: cadreW / 2, y: 0, z: 0 },
  ];
  barres.forEach(b => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      cadreMat
    );
    bar.position.set(b.x, b.y, b.z);
    bar.castShadow = true;
    group.add(bar);
  });

  const tex = createGradientTexture(p.couleur1, p.couleur2);
  const toile = new THREE.Mesh(
    new THREE.PlaneGeometry(cadreW - 0.16, cadreH - 0.16),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
  );
  toile.position.z = 0.045;
  group.add(toile);

  const fond = new THREE.Mesh(
    new THREE.PlaneGeometry(cadreW, cadreH),
    new THREE.MeshStandardMaterial({ color: 0x1a1208 })
  );
  fond.position.z = 0.02;
  group.add(fond);

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(cadreW + 0.4, cadreH + 0.4),
    new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  halo.position.z = -0.05;
  group.add(halo);

  group.userData = {
    projet: p,
    index: i,
    halo: halo,
    baseScale: 1,
  };

  projetsGroup.add(group);
  projetsMeshes.push(group);
});

scene.add(projetsGroup);

/* ============================================
   MONTAGE DE LA SCÈNE
   ============================================ */
scene.add(buildRoom());
scene.add(buildWindow());
scene.add(buildTable());
scene.add(buildTableObjects());
scene.add(buildEasel());

/* ============================================
   CAMÉRA — position par défaut + parallaxe
   ============================================ */
const cameraBase = new THREE.Vector3(0, 1.9, 4.2);
const cameraTarget = new THREE.Vector3(0, 1.9, -2);

camera.position.copy(cameraBase);
camera.lookAt(cameraTarget);

const mouse = { x: 0, y: 0 };
const mouseSmoothed = { x: 0, y: 0 };

addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / sizes.w) * 2 - 1;
  mouse.y = -((e.clientY / sizes.h) * 2 - 1);
});/* ============================================
   INTERACTIONS — raycasting
   ============================================ */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();

let hovered = null;
let selected = null;
let isAnimating = false;

const panel = document.getElementById('panel');
const panelEyebrow = document.getElementById('panel-eyebrow');
const panelTitle = document.getElementById('panel-title');
const panelMeta = document.getElementById('panel-meta');
const panelDesc = document.getElementById('panel-desc');
const panelClose = document.querySelector('.panel__close');
const hint = document.querySelector('.hint');

/* --- Survol --- */
addEventListener('pointermove', (e) => {
  pointerNDC.x = (e.clientX / sizes.w) * 2 - 1;
  pointerNDC.y = -(e.clientY / sizes.h) * 2 + 1;

  if (selected || isAnimating) return;

  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(projetsMeshes, true);

  let target = null;
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.userData.projet) obj = obj.parent;
    if (obj) target = obj;
  }

  if (target !== hovered) {
    if (hovered) {
      hovered.userData.halo.material.opacity = 0;
    }
    hovered = target;
    if (hovered) {
      hovered.userData.halo.material.opacity = 0.15;
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = '';
    }
  }
});

/* --- Clic --- */
addEventListener('click', (e) => {
  if (isAnimating) return;
  if (e.target.closest('.panel, .header, .footer, .hint')) return;

  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(projetsMeshes, true);

  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.userData.projet) obj = obj.parent;
    if (obj) focusProjet(obj);
  }
});

/* --- Focus sur un projet --- */
function focusProjet(projetGroup) {
  isAnimating = true;
  selected = projetGroup;

  const p = projetGroup.userData.projet;

  const targetPos = new THREE.Vector3(
    p.position.x + Math.sin(p.position.rotationY + Math.PI) * 1.8,
    p.position.y,
    p.position.z + Math.cos(p.position.rotationY + Math.PI) * 1.8
  );

  const lookPos = new THREE.Vector3(p.position.x, p.position.y, p.position.z);

  gsap.to(camera.position, {
    x: targetPos.x, y: targetPos.y, z: targetPos.z,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: () => {
      camera.lookAt(lookPos);
    },
    onComplete: () => {
      isAnimating = false;
    }
  });

  panelEyebrow.textContent = `Projet ${String(projetGroup.userData.index + 1).padStart(2, '0')}`;
  panelTitle.textContent = p.title;
  panelMeta.textContent = p.meta;
  panelDesc.textContent = p.desc;

  panel.classList.add('open');
  hint.classList.add('hidden');

  projetsMeshes.forEach(pm => {
    if (pm !== projetGroup) pm.userData.halo.material.opacity = 0;
  });
  projetGroup.userData.halo.material.opacity = 0.35;
}

/* --- Fermer le panneau / retour --- */
function closeProjet() {
  if (!selected || isAnimating) return;
  isAnimating = true;

  panel.classList.remove('open');

  gsap.to(camera.position, {
    x: cameraBase.x, y: cameraBase.y, z: cameraBase.z,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: () => {
      camera.lookAt(cameraTarget);
    },
    onComplete: () => {
      isAnimating = false;
      selected = null;
      projetsMeshes.forEach(pm => pm.userData.halo.material.opacity = 0);
    }
  });
}

panelClose.addEventListener('click', closeProjet);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjet();
});

/* ============================================
   RESIZE
   ============================================ */
addEventListener('resize', () => {
  sizes.w = innerWidth;
  sizes.h = innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
});

/* ============================================
   LOADER
   ============================================ */
const loaderEl = document.querySelector('.loader');
setTimeout(() => loaderEl.classList.add('hidden'), 800);

/* ============================================
   BOUCLE D'ANIMATION
   ============================================ */
const clock = new THREE.Clock();

function tick() {
  const t = clock.getElapsedTime();

  if (!selected) {
    mouseSmoothed.x += (mouse.x - mouseSmoothed.x) * 0.05;
    mouseSmoothed.y += (mouse.y - mouseSmoothed.y) * 0.05;

    const offsetX = mouseSmoothed.x * 0.35;
    const offsetY = mouseSmoothed.y * 0.18;

    camera.position.x += (cameraBase.x + offsetX - camera.position.x) * 0.08;
    camera.position.y += (cameraBase.y + offsetY - camera.position.y) * 0.08;
    camera.position.z += (cameraBase.z - camera.position.z) * 0.08;
    camera.lookAt(cameraTarget);
  }

  if (hovered && !selected) {
    const pulse = 0.15 + Math.sin(t * 3) * 0.05;
    hovered.userData.halo.material.opacity = pulse;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

/* ============================================
   CONSOLE
   ============================================ */
console.log(
  '%cAtelier',
  'font-family: serif; font-size: 22px; color: #3d2b1f; letter-spacing: 0.1em;'
);
