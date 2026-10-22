/**
 * Procedural Bioscience and Physics Spatiotemporal Video Frame Generator
 * AI Studio Minimal Monochrome & 4K 60FPS Architecture
 */

import { DatasetId, DatasetMeta, VideoFrameData } from '../types/simulator.js';

export const DATASET_METADATA: Record<DatasetId, DatasetMeta> = {
  mitosis: {
    id: 'mitosis',
    title: 'Cell Mitosis & Chromosome Segregation',
    category: 'Cellular Biology',
    description: 'High-contrast confocal microscopy showing spindle poles and sister chromatid separation.',
    durationSec: 4.8,
    fps: 30,
    totalFrames: 36,
    resolution: '1920 × 1080 (FHD)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Mitotic Kinetochore Microtubule Separation',
      imagingModality: 'Fluorescent Confocal (DAPI / GFP-Tubulin)',
      keyFeatures: [
        'Equatorial metaphase alignment',
        'Bipolar anaphase pulling force',
        'Cytokinetic contractile cleavage furrow',
        'Spacetime V-bifurcation in X-T slice',
      ],
      spatiotemporalSignificance:
        'Slicing in X-T exposes the exact chromatid velocity and segregation synchrony across sister chromatids.',
    },
  },
  microfluidic_4k: {
    id: 'microfluidic_4k',
    title: 'Microfluidic Jet Droplet Pinch-off (4K 60fps)',
    category: 'High-Speed 4K',
    description: 'Ultra-high-speed 60fps stroboscopic recording of hydrodynamic capillary wave breakup and micro-droplet formation at 4K resolution.',
    durationSec: 1.0,
    fps: 60,
    totalFrames: 60,
    resolution: '3840 × 2160 (4K UHD)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Rayleigh-Plateau Capillary Instability',
      imagingModality: 'Laser Stroboscopic Shadowgraphy @ 60 FPS',
      keyFeatures: [
        'High-speed 60 FPS temporal sampling',
        'Filament thinning and satellite droplet pinch-off',
        'Capillary wave frequency propagation',
        'Sub-millisecond kinematic worldlines',
      ],
      spatiotemporalSignificance:
        'At 60 frames per second, the steep worldlines in the spacetime block reveal sub-millisecond pinch-off kinetics and satellite droplet deceleration.',
    },
  },
  cardiac: {
    id: 'cardiac',
    title: 'Cardiac Myocyte Ca²⁺ Wave Propagation',
    category: 'Physiology',
    description: 'Optical mapping of action potential wavefront through myocardial tissue.',
    durationSec: 3.6,
    fps: 30,
    totalFrames: 36,
    resolution: '1920 × 1080 (FHD)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Intracellular Calcium Transient & Sarcomere Shortening',
      imagingModality: 'Fast Spinning-Disk Optical Calcium Imaging',
      keyFeatures: [
        'Sinoatrial trigger pulse initiation',
        'Planar calcium wavefront propagation',
        'Peak isometric contractile strain',
        'SERCA pump temporal reuptake decay',
      ],
      spatiotemporalSignificance:
        'In the 4D spacetime block, planar propagation forms an inclined temporal hyper-plane whose angle reflects conduction velocity.',
    },
  },
  embryogenesis: {
    id: 'embryogenesis',
    title: 'C. elegans Embryonic Cleavage Lineage',
    category: 'Developmental',
    description: 'Differential interference contrast & fluorescent nuclei tracking early embryonic cell division.',
    durationSec: 4.8,
    fps: 30,
    totalFrames: 36,
    resolution: '1920 × 1080 (FHD)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Asymmetric Holoblastic Cleavage & Cell Lineage',
      imagingModality: '4D Light-Sheet Fluorescence Microscopy',
      keyFeatures: [
        'Zygote P0 asymmetric cleavage',
        'Daughter cell separation into AB & P1',
        'Nuclear spindle orientation rotation',
        '4-cell diamond configuration',
      ],
      spatiotemporalSignificance:
        'Worldlines extruded along the temporal axis reveal exact developmental lineage branching trees in 3D.',
    },
  },
  vortex: {
    id: 'vortex',
    title: 'von Kármán Vortex Shedding & Fluid Wake',
    category: 'Fluid Dynamics',
    description: 'Spatiotemporal evolution of alternating vorticity eddies detaching behind an obstacle.',
    durationSec: 3.6,
    fps: 30,
    totalFrames: 36,
    resolution: '1920 × 1080 (FHD)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Periodic Hydrodynamic Boundary Layer Separation',
      imagingModality: 'Particle Image Velocimetry (PIV)',
      keyFeatures: [
        'Alternating clockwise/counter-clockwise eddies',
        'Strouhal frequency periodicity',
        'Wake core convection downstream',
        'Sinusoidal wave envelopes in X-T slice',
      ],
      spatiotemporalSignificance:
        'Horizontal slicing along time yields a continuous helical braid demonstrating temporal phase coherence.',
    },
  },
  custom: {
    id: 'custom',
    title: 'Custom Uploaded Video (4K 60fps Ready)',
    category: 'User Custom',
    description: 'User-provided 4K/60fps video stream sampled into 4D spacetime voxel frames.',
    durationSec: 5.0,
    fps: 60,
    totalFrames: 60,
    resolution: '3840 × 2160 (4K UHD Ready)',
    is4KCapable: true,
    scientificContext: {
      phenomenon: 'Custom User Video Temporal Dynamics',
      imagingModality: 'User Provided High-Res Video Stream',
      keyFeatures: [
        'Up to 4K UHD resolution support',
        'High-frame-rate 60 FPS playback synchronization',
        'Multi-axis orthogonal slicing',
        'Interactive temporal scrubbing',
      ],
      spatiotemporalSignificance:
        'Inspect any high-speed 60fps or 4K video as a solid Minkowski block and navigate spacetime slices interactively.',
    },
  },
};

const WIDTH = 384;
const HEIGHT = 256;

/**
 * Procedurally render a single frame of the chosen dataset with AI Studio minimal palette
 */
export function renderProceduralFrame(
  datasetId: DatasetId,
  frameIndex: number,
  totalFrames: number,
  canvas: HTMLCanvasElement
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const progress = frameIndex / Math.max(1, totalFrames - 1); // 0 to 1

  ctx.clearRect(0, 0, w, h);

  if (datasetId === 'microfluidic_4k') {
    renderMicrofluidic4K(ctx, w, h, progress, frameIndex);
  } else if (datasetId === 'mitosis') {
    renderMitosis(ctx, w, h, progress, frameIndex);
  } else if (datasetId === 'cardiac') {
    renderCardiac(ctx, w, h, progress, frameIndex);
  } else if (datasetId === 'embryogenesis') {
    renderEmbryogenesis(ctx, w, h, progress, frameIndex);
  } else if (datasetId === 'vortex') {
    renderVortex(ctx, w, h, progress, frameIndex);
  } else {
    renderFallback(ctx, w, h, progress, frameIndex);
  }
}

/**
 * 4K 60FPS Microfluidic Droplet Breakup & High-Speed Jet Simulation
 */
function renderMicrofluidic4K(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  frame: number
): void {
  // AI Studio Dark Minimal Background
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  // Microfluidic capillary nozzle (left)
  const nozzleW = 50;
  const nozzleH = 40;
  const cy = h / 2;

  // Nozzle body (machined graphite / brushed titanium)
  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, cy - nozzleH / 2, nozzleW, nozzleH);
  ctx.strokeStyle = '#3F3F46';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, cy - nozzleH / 2, nozzleW, nozzleH);

  // Fluid Jet exiting nozzle: high speed continuous jet transitioning into pinch-off neck
  const jetLength = 70;
  const jetStartX = nozzleW;

  // Jet core (monochrome high-contrast fluid)
  ctx.fillStyle = '#F4F4F5';
  ctx.beginPath();
  ctx.moveTo(jetStartX, cy - 14);
  ctx.lineTo(jetStartX + jetLength, cy - 6);
  ctx.lineTo(jetStartX + jetLength, cy + 6);
  ctx.lineTo(jetStartX, cy + 14);
  ctx.closePath();
  ctx.fill();

  // 60 FPS high-speed periodic breakup: 3 distinct droplet cycles across 60 frames
  const cycle = (t * 3) % 1; // 0 to 1 cycle
  const pinchX = jetStartX + jetLength + cycle * 45;

  // Thin liquid neck with capillary ripples
  const neckThickness = Math.max(1, 6 * (1 - Math.pow(cycle, 1.5)));
  ctx.fillStyle = '#E4E4E7';
  ctx.beginPath();
  ctx.ellipse(pinchX, cy, 18, neckThickness, 0, 0, Math.PI * 2);
  ctx.fill();

  // Released primary droplets flying downstream at 60 FPS
  const primaryDropletRadius = 16;
  const numDroplets = 4;
  for (let i = 0; i < numDroplets; i++) {
    const dropletProgress = (cycle + i * 0.33) % 1;
    const dx = jetStartX + jetLength + 50 + dropletProgress * (w - jetStartX - jetLength - 70);
    // Droplet shape oscillation (prolate-oblate deformation during flight)
    const deform = Math.sin(frame * 0.4 + i * 2) * 3;
    const rx = primaryDropletRadius + deform;
    const ry = Math.max(6, primaryDropletRadius - deform);

    // Droplet shadowgraphy: dark refracted perimeter with bright central caustic
    const dropGrad = ctx.createRadialGradient(dx, cy, 2, dx, cy, rx);
    dropGrad.addColorStop(0, '#FFFFFF');
    dropGrad.addColorStop(0.6, '#A1A1AA');
    dropGrad.addColorStop(0.95, '#27272A');
    dropGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = dropGrad;
    ctx.beginPath();
    ctx.ellipse(dx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Satellite micro-droplet trailing behind
    if (cycle > 0.4) {
      const satX = dx - 26;
      ctx.fillStyle = '#D4D4D8';
      ctx.beginPath();
      ctx.arc(satX, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Laser Stroboscopic Scale Graticule (AI Studio minimal graticule)
  ctx.strokeStyle = 'rgba(161, 161, 170, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 60; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, cy - 45);
    ctx.lineTo(x, cy + 45);
    ctx.stroke();
  }

  drawMinimalOverlay(ctx, w, h, '4K 60FPS | SHADOWGRAPHY', t, '60Hz CAPTURE', '3840×2160 UHD');
}

function renderMitosis(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  frame: number
): void {
  // Deep Minimal Black Background
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const rBase = Math.min(w, h) * 0.38;

  // Cytokinetic furrowing
  const furrowDepth = t > 0.45 ? (t - 0.45) * 1.8 : 0;
  const rYFurrow = Math.max(15, rBase * (1 - furrowDepth * 0.45));
  const rXElongate = rBase * (1 + (t > 0.4 ? (t - 0.4) * 0.5 : 0));

  // Cortical Actin boundary (monochrome crisp hairline)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rXElongate, rYFurrow, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#52525B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle interior cytoplasm
  ctx.fillStyle = 'rgba(24, 24, 27, 0.4)';
  ctx.fill();

  // Spindle Poles (Clean neutral white/zinc)
  const poleDist = 30 + (t > 0.3 ? (t - 0.3) * 80 : 0);
  const poleLeftX = cx - poleDist;
  const poleRightX = cx + poleDist;

  [poleLeftX, poleRightX].forEach((px) => {
    const starGrad = ctx.createRadialGradient(px, cy, 2, px, cy, 22);
    starGrad.addColorStop(0, '#FAFAFA');
    starGrad.addColorStop(0.4, 'rgba(212, 212, 216, 0.5)');
    starGrad.addColorStop(1, 'rgba(212, 212, 216, 0)');
    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(px, cy, 22, 0, Math.PI * 2);
    ctx.fill();
  });

  // Microtubules radiating from poles
  ctx.lineWidth = 1;
  for (let a = -0.7; a <= 0.7; a += 0.2) {
    ctx.beginPath();
    ctx.moveTo(poleLeftX, cy);
    ctx.quadraticCurveTo(cx, cy + a * 50, poleRightX, cy);
    ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
    ctx.stroke();
  }

  // Chromosomes / Sister Chromatids (High contrast crisp white)
  let chromLeftX = cx - 4;
  let chromRightX = cx + 4;
  if (t > 0.4) {
    const segT = (t - 0.4) / 0.6;
    const segDist = Math.pow(segT, 0.85) * (poleDist - 25);
    chromLeftX = cx - segDist;
    chromRightX = cx + segDist;
  }

  [chromLeftX, chromRightX].forEach((chX, i) => {
    ctx.save();
    const chromGrad = ctx.createRadialGradient(chX, cy, 3, chX, cy, 28);
    chromGrad.addColorStop(0, '#FFFFFF');
    chromGrad.addColorStop(0.35, '#E4E4E7');
    chromGrad.addColorStop(0.8, 'rgba(113, 113, 122, 0.6)');
    chromGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = chromGrad;

    for (let dy = -28; dy <= 28; dy += 14) {
      const armOffset = Math.sin(dy * 0.2 + frame * 0.3) * 3;
      const armCurve = (i === 0 ? 6 : -6) * (t > 0.4 ? 1.5 : 0.2);
      ctx.beginPath();
      ctx.ellipse(chX + armCurve, cy + dy + armOffset, 7, 12, (i === 0 ? -0.2 : 0.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  ctx.restore();

  drawMinimalOverlay(ctx, w, h, 'CONFOCAL 60X | DAPI+TUBULIN', t * 4.8, 'ANAPHASE SEGREGATION', '1080p FHD');
}

function renderCardiac(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  _frame: number
): void {
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  // Myocyte fiber orientation texture
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
  ctx.lineWidth = 1;
  for (let y = 10; y < h; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + Math.sin(y) * 4);
    ctx.stroke();
  }

  const wavePos = 20 + t * (w - 40);
  const waveWidth = 55;

  const grad = ctx.createLinearGradient(wavePos - waveWidth * 1.5, 0, wavePos + waveWidth * 0.5, 0);
  grad.addColorStop(0, 'rgba(39, 39, 42, 0)');
  grad.addColorStop(0.3, 'rgba(113, 113, 122, 0.4)');
  grad.addColorStop(0.7, 'rgba(228, 228, 231, 0.85)');
  grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(wavePos - waveWidth * 1.5, 0);
  for (let y = 0; y <= h; y += 20) {
    const waveNoise = Math.sin(y * 0.05 + t * 4) * 16 + Math.cos(y * 0.12) * 8;
    ctx.lineTo(wavePos + waveNoise, y);
  }
  ctx.lineTo(wavePos - waveWidth * 1.5, h);
  ctx.closePath();
  ctx.fill();

  drawMinimalOverlay(ctx, w, h, 'FLUO-4 AM | CA2+ CONDUCTION', t * 3.6, `WAVEFRONT: ${Math.round(wavePos)}px`, '1080p FHD');
}

function renderEmbryogenesis(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  _frame: number
): void {
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.42;
  const ry = h * 0.36;

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#3F3F46';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (t < 0.45) {
    const splitT = t / 0.45;
    const dist = splitT * 48;
    drawMinimalEmbryoCell(ctx, cx - dist * 0.9, cy, 48 - splitT * 8, 'AB');
    drawMinimalEmbryoCell(ctx, cx + dist * 0.9, cy, 44 - splitT * 7, 'P1');
  } else {
    const splitT4 = (t - 0.45) / 0.55;
    const offset = 48 + splitT4 * 14;
    drawMinimalEmbryoCell(ctx, cx - offset, cy - splitT4 * 24, 34, 'ABa');
    drawMinimalEmbryoCell(ctx, cx - offset * 0.2, cy + splitT4 * 28, 32, 'ABp');
    drawMinimalEmbryoCell(ctx, cx + offset * 0.2, cy - splitT4 * 18, 30, 'EMS');
    drawMinimalEmbryoCell(ctx, cx + offset, cy + splitT4 * 10, 28, 'P2');
  }

  drawMinimalOverlay(ctx, w, h, 'DIC + LIGHT-SHEET 4D', t * 4.8, t < 0.45 ? '1->2 CELL' : '2->4 CELL', '1080p FHD');
}

function drawMinimalEmbryoCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  label: string
): void {
  ctx.save();
  const cellGrad = ctx.createRadialGradient(x, y, 4, x, y, radius);
  cellGrad.addColorStop(0, '#FFFFFF');
  cellGrad.addColorStop(0.3, '#D4D4D8');
  cellGrad.addColorStop(0.8, 'rgba(39, 39, 42, 0.7)');
  cellGrad.addColorStop(1, 'rgba(113, 113, 122, 0.2)');

  ctx.fillStyle = cellGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#71717A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '10px monospace';
  ctx.fillText(label, x - 8, y - radius - 4);
  ctx.restore();
}

function renderVortex(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  _frame: number
): void {
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  const obsX = 60;
  const obsY = h / 2;
  const obsR = 18;

  ctx.strokeStyle = 'rgba(113, 113, 122, 0.2)';
  ctx.lineWidth = 1;
  for (let y = 20; y < h; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(obsX - obsR - 5, y);
    ctx.stroke();
  }

  const cylGrad = ctx.createRadialGradient(obsX - 5, obsY - 5, 2, obsX, obsY, obsR);
  cylGrad.addColorStop(0, '#E4E4E7');
  cylGrad.addColorStop(0.7, '#3F3F46');
  cylGrad.addColorStop(1, '#18181B');
  ctx.fillStyle = cylGrad;
  ctx.beginPath();
  ctx.arc(obsX, obsY, obsR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#71717A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const vortexSpacing = 65;
  const wakeSpeed = 80;
  const phase = t * 4;

  const numVortices = 6;
  for (let i = 0; i < numVortices; i++) {
    const isUpper = i % 2 === 0;
    const baseVx = obsX + obsR + 25 + i * vortexSpacing;
    const vx = ((baseVx + phase * wakeSpeed - obsX) % (w - obsX - 20)) + obsX;
    const vy = obsY + (isUpper ? -1 : 1) * (20 + (vx - obsX) * 0.12);
    const vRadius = 14 + (vx - obsX) * 0.08;

    const vGrad = ctx.createRadialGradient(vx, vy, 2, vx, vy, vRadius);
    vGrad.addColorStop(0, '#FFFFFF');
    vGrad.addColorStop(0.3, isUpper ? '#E4E4E7' : '#A1A1AA');
    vGrad.addColorStop(0.8, 'rgba(39, 39, 42, 0.4)');
    vGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(vx, vy, vRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMinimalOverlay(ctx, w, h, 'PIV VORTICITY | Re = 250', t * 3.6, 'STROUHAL St = 0.21', '1080p FHD');
}

function renderFallback(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  frame: number
): void {
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, w, h);

  const x = (t * w) % w;
  ctx.fillStyle = '#E4E4E7';
  ctx.beginPath();
  ctx.arc(x, h / 2, 25, 0, Math.PI * 2);
  ctx.fill();

  drawMinimalOverlay(ctx, w, h, 'CHRONO TEST PATTERN', t * 5, `FRAME #${frame}`, '4K READY');
}

function drawMinimalOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  channelInfo: string,
  timeSec: number,
  stage: string,
  resBadge: string
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
  ctx.fillRect(8, h - 34, 210, 26);
  ctx.strokeStyle = '#27272A';
  ctx.strokeRect(8, h - 34, 210, 26);

  ctx.fillStyle = '#F4F4F5';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(channelInfo, 14, h - 21);

  ctx.fillStyle = '#71717A';
  ctx.font = '8px monospace';
  ctx.fillText(`T = ${timeSec.toFixed(2)}s | ${stage}`, 14, h - 11);

  // Resolution & Scale bar
  ctx.fillStyle = '#27272A';
  ctx.fillRect(w - 75, h - 28, 67, 20);
  ctx.strokeStyle = '#3F3F46';
  ctx.strokeRect(w - 75, h - 28, 67, 20);

  ctx.fillStyle = '#E4E4E7';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(resBadge, w - 71, h - 15);
  ctx.restore();
}

/**
 * Pre-generate sequence of frames for a given dataset
 */
export function generateDatasetFrames(
  datasetId: DatasetId,
  canvasWidth = WIDTH,
  canvasHeight = HEIGHT
): VideoFrameData[] {
  const meta = DATASET_METADATA[datasetId];
  const count = meta.totalFrames;
  const frames: VideoFrameData[] = [];

  for (let i = 0; i < count; i++) {
    const c = document.createElement('canvas');
    c.width = canvasWidth;
    c.height = canvasHeight;
    renderProceduralFrame(datasetId, i, count, c);
    const timeSec = (i / count) * meta.durationSec;
    frames.push({
      index: i,
      timeSec,
      canvas: c,
      thumbnailUrl: c.toDataURL('image/jpeg', 0.6),
      sourceWidth: meta.id === 'microfluidic_4k' ? 3840 : 1920,
      sourceHeight: meta.id === 'microfluidic_4k' ? 2160 : 1080,
      is4K: meta.is4KCapable,
    });
  }

  return frames;
}
