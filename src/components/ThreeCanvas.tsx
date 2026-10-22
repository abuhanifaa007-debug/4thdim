/**
 * 4D Spacetime Three.js Rendering Engine
 * AI Studio Minimal Monochrome Edition & 60FPS Lossless Pipeline
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  SpacetimeSliceState,
  VideoFrameData,
  VisualizationMode,
  SpacetimeMarker,
} from '../types/simulator.js';
import {
  getFrameInterpolation,
  generateTemporalSlicePositions,
  rotate4DPoint,
  project4DTo3D,
} from '../utils/spacetimeMath.js';

interface ThreeCanvasProps {
  frames: VideoFrameData[];
  sliceState: SpacetimeSliceState;
  visMode: VisualizationMode;
  onTimeChange: (newNormTime: number) => void;
  onSliceClick?: (coords: { x: number; y: number; normTime: number }) => void;
  markers: SpacetimeMarker[];
  activeMeasurementPoint: 1 | 2 | null;
}

const BLOCK_WIDTH = 4.0;
const BLOCK_HEIGHT = 2.66; // Standard 16:9 4K aspect ratio extrusion
const BLOCK_DEPTH = 6.0;

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  frames,
  sliceState,
  visMode,
  onTimeChange,
  onSliceClick,
  markers,
  activeMeasurementPoint,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    frames,
    sliceState,
    visMode,
    onTimeChange,
    onSliceClick,
    markers,
    activeMeasurementPoint,
  });
  propsRef.current = {
    frames,
    sliceState,
    visMode,
    onTimeChange,
    onSliceClick,
    markers,
    activeMeasurementPoint,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer with AI Studio pure black tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera (AI Studio Obsidian Dark Minimal)
    const scene = new THREE.Scene();
    const studioBg = new THREE.Color('#09090B');
    scene.background = studioBg;
    scene.fog = new THREE.FogExp2('#09090B', 0.038);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(5.8, 3.8, 7.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 24;
    controls.minDistance = 2.0;
    controls.target.set(0, 0, 0);

    // 4. Studio Environment & Monochrome Neutral Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Neutral Clean Key Light
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.7);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    // Studio Ambient Fill Light (Zinc/Graphite)
    const hemiLight = new THREE.HemisphereLight('#E4E4E7', '#18181B', 0.9);
    scene.add(hemiLight);

    // Rim Light (Clean White)
    const rimLight = new THREE.DirectionalLight('#A1A1AA', 0.6);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    // 5. Contact Shadow & Minimalist Graphite Ground Grid
    const groundGroup = new THREE.Group();
    const gridHelper = new THREE.GridHelper(16, 32, '#3F3F46', '#18181B');
    gridHelper.position.y = -BLOCK_HEIGHT / 2 - 0.35;
    groundGroup.add(gridHelper);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const g = sCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
      g.addColorStop(0, 'rgba(0,0,0,0.85)');
      g.addColorStop(0.5, 'rgba(0,0,0,0.3)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = g;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(8, 10);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -BLOCK_HEIGHT / 2 - 0.34;
    groundGroup.add(shadowMesh);
    scene.add(groundGroup);

    // 6. Gantry & 3-12 Part Procedural Chassis (Anodized Black & Matte Titanium)
    const gantryGroup = new THREE.Group();

    // Corner Support Pillars (Matte Titanium)
    const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, BLOCK_HEIGHT + 0.2, 16);
    const pillarCapGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16);
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#27272A',
      metalness: 0.85,
      roughness: 0.2,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: '#52525B',
      metalness: 0.9,
      roughness: 0.15,
    });

    const cornerCoords = [
      [-BLOCK_WIDTH / 2, -BLOCK_DEPTH / 2],
      [BLOCK_WIDTH / 2, -BLOCK_DEPTH / 2],
      [BLOCK_WIDTH / 2, BLOCK_DEPTH / 2],
      [-BLOCK_WIDTH / 2, BLOCK_DEPTH / 2],
    ];

    cornerCoords.forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(pillarGeo, metalMat);
      pillar.position.set(cx, 0, cz);
      gantryGroup.add(pillar);

      const cap = new THREE.Mesh(pillarCapGeo, capMat);
      cap.position.set(cx, BLOCK_HEIGHT / 2 + 0.12, cz);
      gantryGroup.add(cap);
    });

    // Dual Chrono Rails (Machined Aluminum)
    const railGeo = new THREE.CylinderGeometry(0.025, 0.025, BLOCK_DEPTH, 16);
    const railMat = new THREE.MeshStandardMaterial({
      color: '#71717A',
      metalness: 0.9,
      roughness: 0.15,
    });
    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.rotation.x = Math.PI / 2;
    railLeft.position.set(-BLOCK_WIDTH / 2, -BLOCK_HEIGHT / 2, 0);
    gantryGroup.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.rotation.x = Math.PI / 2;
    railRight.position.set(BLOCK_WIDTH / 2, -BLOCK_HEIGHT / 2, 0);
    gantryGroup.add(railRight);

    // AI Studio Minimal Bounding Frame (Subtle Zinc Hairlines)
    const boxGeo = new THREE.BoxGeometry(BLOCK_WIDTH, BLOCK_HEIGHT, BLOCK_DEPTH);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLineMat = new THREE.LineBasicMaterial({
      color: '#3F3F46',
      transparent: true,
      opacity: 0.5,
    });
    const boundingBoxLines = new THREE.LineSegments(boxEdges, boxLineMat);
    gantryGroup.add(boundingBoxLines);

    // Temporal Z-Axis Indicator
    const axisDir = new THREE.Vector3(0, 0, 1);
    const axisOrigin = new THREE.Vector3(BLOCK_WIDTH / 2 + 0.3, -BLOCK_HEIGHT / 2, -BLOCK_DEPTH / 2);
    const arrowHelper = new THREE.ArrowHelper(axisDir, axisOrigin, BLOCK_DEPTH + 0.5, 0x71717a, 0.25, 0.12);
    gantryGroup.add(arrowHelper);

    scene.add(gantryGroup);

    // 7. Video Frame Texture Pool
    let frameTextures: THREE.CanvasTexture[] = [];
    const updateTextures = (currentFrames: VideoFrameData[]) => {
      frameTextures.forEach((tex) => tex.dispose());
      frameTextures = currentFrames.map((f) => {
        const tex = new THREE.CanvasTexture(f.canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return tex;
      });
    };

    updateTextures(propsRef.current.frames);

    // 8. Dynamic Slicing Meshes
    // A: Active XY Time Slice
    const xyGeo = new THREE.PlaneGeometry(BLOCK_WIDTH, BLOCK_HEIGHT);
    const xyMat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const xyMesh = new THREE.Mesh(xyGeo, xyMat);
    xyMesh.name = 'xy_slice';
    scene.add(xyMesh);

    // Frame highlighting XY slice (Clean white hairline)
    const xyFrameEdges = new THREE.EdgesGeometry(xyGeo);
    const xyFrameMat = new THREE.LineBasicMaterial({ color: '#FFFFFF', linewidth: 1.5 });
    const xyFrameLines = new THREE.LineSegments(xyFrameEdges, xyFrameMat);
    xyMesh.add(xyFrameLines);

    // B: Secondary XZ Slit-Scan Slice (Horizontal cut along time)
    const xzGeo = new THREE.PlaneGeometry(BLOCK_WIDTH, BLOCK_DEPTH);
    const xzMat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const xzMesh = new THREE.Mesh(xzGeo, xzMat);
    xzMesh.rotation.x = Math.PI / 2;
    xzMesh.name = 'xz_slice';
    scene.add(xzMesh);

    const xzFrameEdges = new THREE.EdgesGeometry(xzGeo);
    const xzFrameMat = new THREE.LineBasicMaterial({ color: '#A1A1AA' });
    const xzFrameLines = new THREE.LineSegments(xzFrameEdges, xzFrameMat);
    xzMesh.add(xzFrameLines);

    // C: Tertiary YZ Slit-Scan Slice (Vertical cut along time)
    const yzGeo = new THREE.PlaneGeometry(BLOCK_DEPTH, BLOCK_HEIGHT);
    const yzMat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const yzMesh = new THREE.Mesh(yzGeo, yzMat);
    yzMesh.rotation.y = Math.PI / 2;
    yzMesh.name = 'yz_slice';
    scene.add(yzMesh);

    const yzFrameEdges = new THREE.EdgesGeometry(yzGeo);
    const yzFrameMat = new THREE.LineBasicMaterial({ color: '#71717A' });
    const yzFrameLines = new THREE.LineSegments(yzFrameEdges, yzFrameMat);
    yzMesh.add(yzFrameLines);

    // 9. Volumetric Stack (Temporal Ribbon)
    const stackGroup = new THREE.Group();
    const maxStackSlices = 60; // Support up to 60 slices for 60fps
    const stackMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < maxStackSlices; i++) {
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      const m = new THREE.Mesh(xyGeo, mat);
      stackGroup.add(m);
      stackMeshes.push(m);
    }
    scene.add(stackGroup);

    // 10. 4D Hyper-Rotation Tesseract Mesh (SO(4) rotation)
    const tesseractGroup = new THREE.Group();
    const tesseractLineMat = new THREE.LineBasicMaterial({
      color: '#D4D4D8',
      transparent: true,
      opacity: 0.6,
    });
    const tesseractLines = new THREE.LineSegments(new THREE.BufferGeometry(), tesseractLineMat);
    tesseractGroup.add(tesseractLines);
    scene.add(tesseractGroup);

    // 11. Spacetime Markers & Worldline Indicators (Minimalist Crisp Design)
    const markersGroup = new THREE.Group();
    const markerSphereGeo = new THREE.SphereGeometry(0.07, 16, 16);
    scene.add(markersGroup);

    const worldlineGeo = new THREE.BufferGeometry();
    const worldlineMat = new THREE.LineDashedMaterial({
      color: '#FAFAFA',
      dashSize: 0.15,
      gapSize: 0.1,
      linewidth: 1.5,
    });
    const worldlineMesh = new THREE.Line(worldlineGeo, worldlineMat);
    scene.add(worldlineMesh);

    // 12. Interactive Raycasting & Dragging on 3D Slices
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDraggingSlice = false;

    const onPointerDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects([xyMesh, xzMesh, yzMesh]);

      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object === xyMesh) {
          isDraggingSlice = true;
          controls.enabled = false;
        }

        if (propsRef.current.onSliceClick && hit.point) {
          const normX = (hit.point.x + BLOCK_WIDTH / 2) / BLOCK_WIDTH;
          const normY = (hit.point.y + BLOCK_HEIGHT / 2) / BLOCK_HEIGHT;
          const normTime = (hit.point.z + BLOCK_DEPTH / 2) / BLOCK_DEPTH;
          propsRef.current.onSliceClick({
            x: Math.max(0, Math.min(1, normX)),
            y: Math.max(0, Math.min(1, normY)),
            normTime: Math.max(0, Math.min(1, normTime)),
          });
        }
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDraggingSlice) return;

      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(planeZ, intersectPoint)) {
        const newNormTime = (intersectPoint.z + BLOCK_DEPTH / 2) / BLOCK_DEPTH;
        propsRef.current.onTimeChange(Math.max(0, Math.min(1, newNormTime)));
      }
    };

    const onPointerUp = () => {
      if (isDraggingSlice) {
        isDraggingSlice = false;
        controls.enabled = true;
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 13. Slit-Scan Dynamic Canvas for XZ & YZ cuts
    const xzCanvas = document.createElement('canvas');
    xzCanvas.width = 384;
    xzCanvas.height = 256;
    const xzCtx = xzCanvas.getContext('2d');
    const xzTexture = new THREE.CanvasTexture(xzCanvas);
    xzTexture.colorSpace = THREE.SRGBColorSpace;
    xzMat.map = xzTexture;

    const yzCanvas = document.createElement('canvas');
    yzCanvas.width = 384;
    yzCanvas.height = 256;
    const yzCtx = yzCanvas.getContext('2d');
    const yzTexture = new THREE.CanvasTexture(yzCanvas);
    yzTexture.colorSpace = THREE.SRGBColorSpace;
    yzMat.map = yzTexture;

    let lastSlitY = -1;
    let lastSlitX = -1;

    const updateSlitTextures = () => {
      const curFrames = propsRef.current.frames;
      if (curFrames.length === 0) return;

      const curSlitY = propsRef.current.sliceState.slitY;
      const curSlitX = propsRef.current.sliceState.slitX;

      if (Math.abs(curSlitY - lastSlitY) > 0.005 && xzCtx) {
        lastSlitY = curSlitY;
        const frameW = curFrames[0].canvas.width;
        const frameH = curFrames[0].canvas.height;
        const py = Math.floor(curSlitY * (frameH - 1));
        const sliceH = Math.max(2, Math.floor(xzCanvas.height / curFrames.length));

        xzCtx.clearRect(0, 0, xzCanvas.width, xzCanvas.height);
        for (let t = 0; t < curFrames.length; t++) {
          xzCtx.drawImage(
            curFrames[t].canvas,
            0,
            py,
            frameW,
            1,
            0,
            t * sliceH,
            xzCanvas.width,
            sliceH
          );
        }
        xzTexture.needsUpdate = true;
      }

      if (Math.abs(curSlitX - lastSlitX) > 0.005 && yzCtx) {
        lastSlitX = curSlitX;
        const frameW = curFrames[0].canvas.width;
        const frameH = curFrames[0].canvas.height;
        const px = Math.floor(curSlitX * (frameW - 1));
        const sliceW = Math.max(2, Math.floor(yzCanvas.width / curFrames.length));

        yzCtx.clearRect(0, 0, yzCanvas.width, yzCanvas.height);
        for (let t = 0; t < curFrames.length; t++) {
          yzCtx.drawImage(
            curFrames[t].canvas,
            px,
            0,
            1,
            frameH,
            t * sliceW,
            0,
            sliceW,
            yzCanvas.height
          );
        }
        yzTexture.needsUpdate = true;
      }
    };

    const updateTesseract = () => {
      const tiltXW = propsRef.current.sliceState.tiltXW;
      const tiltYW = propsRef.current.sliceState.tiltYW;

      const verts4D: Array<{ x: number; y: number; z: number; w: number }> = [];
      for (let i = 0; i < 16; i++) {
        verts4D.push({
          x: ((i & 1) ? 1 : -1) * (BLOCK_WIDTH / 2.2),
          y: ((i & 2) ? 1 : -1) * (BLOCK_HEIGHT / 2.2),
          z: ((i & 4) ? 1 : -1) * (BLOCK_DEPTH / 2.5),
          w: ((i & 8) ? 1 : -1) * 1.5,
        });
      }

      const projected: THREE.Vector3[] = verts4D.map((p) => {
        let pRot = rotate4DPoint(p, 'xw', tiltXW);
        pRot = rotate4DPoint(pRot, 'yw', tiltYW);
        const p3 = project4DTo3D(pRot, 'perspective', 4.0);
        return new THREE.Vector3(p3.x, p3.y, p3.z);
      });

      const linePositions: number[] = [];
      for (let i = 0; i < 16; i++) {
        for (let bit = 1; bit < 16; bit <<= 1) {
          const j = i ^ bit;
          if (i < j) {
            linePositions.push(projected[i].x, projected[i].y, projected[i].z);
            linePositions.push(projected[j].x, projected[j].y, projected[j].z);
          }
        }
      }

      tesseractLines.geometry.dispose();
      tesseractLines.geometry = new THREE.BufferGeometry();
      tesseractLines.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
    };

    // 14. 60 FPS Lossless Render Loop
    let frameId = 0;
    let prevFramesRef = propsRef.current.frames;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 4);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 4);
    }

    const clock = new THREE.Clock();

    const tick = () => {
      const dt = clock.getDelta();
      controls.update();

      const { sliceState: curSlice, visMode: curVisMode, frames: curFrames, markers: curMarkers } =
        propsRef.current;

      if (curFrames !== prevFramesRef) {
        prevFramesRef = curFrames;
        updateTextures(curFrames);
        lastSlitY = -1;
        lastSlitX = -1;
      }

      updateSlitTextures();

      // Exponential damping for smooth 60fps slice navigation
      const currentZ = (curSlice.timeZ - 0.5) * BLOCK_DEPTH;
      xyMesh.position.z = THREE.MathUtils.damp(xyMesh.position.z, currentZ, 14, dt);

      if (frameTextures.length > 0) {
        const interp = getFrameInterpolation(curSlice.timeZ, frameTextures.length);
        xyMat.map = frameTextures[interp.indexA];
        xyMat.needsUpdate = true;
      }

      const slitPosY = (curSlice.slitY - 0.5) * BLOCK_HEIGHT;
      xzMesh.position.y = THREE.MathUtils.damp(xzMesh.position.y, slitPosY, 14, dt);

      const slitPosX = (curSlice.slitX - 0.5) * BLOCK_WIDTH;
      yzMesh.position.x = THREE.MathUtils.damp(yzMesh.position.x, slitPosX, 14, dt);

      if (curVisMode === 'spacetime_block') {
        xyMesh.visible = curSlice.activeAxis === 'all' || curSlice.activeAxis === 'xy';
        xzMesh.visible = curSlice.activeAxis === 'all' || curSlice.activeAxis === 'xz';
        yzMesh.visible = curSlice.activeAxis === 'all' || curSlice.activeAxis === 'yz';
        stackGroup.visible = false;
        tesseractGroup.visible = false;
      } else if (curVisMode === 'temporal_stack') {
        xyMesh.visible = true;
        xzMesh.visible = false;
        yzMesh.visible = false;
        stackGroup.visible = true;
        tesseractGroup.visible = false;

        const sliceCount = Math.min(curSlice.stackLayers, frameTextures.length);
        const positions = generateTemporalSlicePositions(
          sliceCount,
          BLOCK_DEPTH * curSlice.sliceSpacing
        );

        for (let i = 0; i < maxStackSlices; i++) {
          const mesh = stackMeshes[i];
          if (i < sliceCount && i < frameTextures.length) {
            mesh.visible = true;
            mesh.position.z = positions[i];
            const mat = mesh.material as THREE.MeshBasicMaterial;
            const frameIdx = Math.floor((i / (sliceCount - 1 || 1)) * (frameTextures.length - 1));
            mat.map = frameTextures[frameIdx];

            const distFromCursor = Math.abs(mesh.position.z - currentZ);
            if (distFromCursor < 0.2) {
              mat.opacity = Math.min(1.0, curSlice.sliceOpacity * 2.2);
            } else {
              mat.opacity = curSlice.sliceOpacity;
            }
            mat.needsUpdate = true;
          } else {
            mesh.visible = false;
          }
        }
      } else if (curVisMode === 'hyper_rotation') {
        xyMesh.visible = true;
        xzMesh.visible = false;
        yzMesh.visible = false;
        stackGroup.visible = false;
        tesseractGroup.visible = true;
        updateTesseract();
      } else {
        xyMesh.visible = true;
        xzMesh.visible = true;
        yzMesh.visible = false;
        stackGroup.visible = false;
        tesseractGroup.visible = false;
      }

      // Sync Spacetime Markers
      while (markersGroup.children.length < curMarkers.length) {
        const sphere = new THREE.Mesh(
          markerSphereGeo,
          new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            emissive: '#A1A1AA',
            emissiveIntensity: 0.5,
          })
        );
        markersGroup.add(sphere);
      }
      while (markersGroup.children.length > curMarkers.length) {
        markersGroup.remove(markersGroup.children[markersGroup.children.length - 1]);
      }

      curMarkers.forEach((marker, idx) => {
        const sphere = markersGroup.children[idx] as THREE.Mesh;
        const normZ = marker.timeSec / (propsRef.current.frames.length > 0 ? (propsRef.current.frames.length / 10) : 5);
        const mx = (marker.x - 0.5) * BLOCK_WIDTH;
        const my = (marker.y - 0.5) * BLOCK_HEIGHT;
        const mz = (normZ - 0.5) * BLOCK_DEPTH;
        sphere.position.set(mx, my, mz);
        (sphere.material as THREE.MeshStandardMaterial).color.set(marker.color);
      });

      if (curMarkers.length >= 2) {
        const p1 = markersGroup.children[0].position;
        const p2 = markersGroup.children[1].position;
        worldlineMesh.geometry.dispose();
        worldlineMesh.geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        worldlineMesh.computeLineDistances();
        worldlineMesh.visible = true;
      } else {
        worldlineMesh.visible = false;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      renderer.dispose();
      frameTextures.forEach((t) => t.dispose());
      xzTexture.dispose();
      yzTexture.dispose();
      scene.clear();
      if (domElement.parentElement === container) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      data-testid="spacetime-3d-canvas"
    />
  );
};
