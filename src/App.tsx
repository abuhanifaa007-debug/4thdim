/**
 * ChronoSpatial 4D - Spacetime Video Simulator Main Application
 * AI Studio Minimal Monochrome Edition & 4K 60FPS Architecture
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DatasetId,
  DatasetMeta,
  SpacetimeSliceState,
  VisualizationMode,
  VideoFrameData,
  SpacetimeMarker,
  VelocityMeasurement,
} from './types/simulator.js';
import {
  DATASET_METADATA,
  generateDatasetFrames,
} from './utils/proceduralVideoGenerator.js';
import { calculateSpacetimeVelocity } from './utils/spacetimeMath.js';
import { ThreeCanvas } from './components/ThreeCanvas.js';
import { HUDHeader } from './components/HUDHeader.js';
import { BottomControlDock } from './components/BottomControlDock.js';
import { SlitScanInspectorModal } from './components/SlitScanInspectorModal.js';
import { VideoUploadModal } from './components/VideoUploadModal.js';

export default function App() {
  const [currentDatasetId, setCurrentDatasetId] = useState<DatasetId>('microfluidic_4k');
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta>(
    DATASET_METADATA.microfluidic_4k
  );
  const [frames, setFrames] = useState<VideoFrameData[]>([]);

  // 4D Slicing and Spacetime state with 60FPS & 4K UHD support
  const [sliceState, setSliceState] = useState<SpacetimeSliceState>({
    timeZ: 0.28,
    slitY: 0.5,
    slitX: 0.45,
    tiltXW: 0,
    tiltYW: 0,
    sliceSpacing: 1.0,
    stackLayers: 36,
    sliceOpacity: 0.26,
    colorTransfer: 'monochrome',
    showWorldlines: true,
    showBoundingFrame: true,
    showOrthoSlices: true,
    activeAxis: 'all',
    fpsTarget: 60,
    resolutionTier: '4k',
  });

  const [visMode, setVisMode] = useState<VisualizationMode>('spacetime_block');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Modals & Zen mode
  const [isSlitScanOpen, setIsSlitScanOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Spacetime Caliper Measurements
  const [markers, setMarkers] = useState<SpacetimeMarker[]>([]);
  const [activeMeasurementPoint, setActiveMeasurementPoint] = useState<1 | 2 | null>(null);
  const [activeMeasurement, setActiveMeasurement] = useState<VelocityMeasurement | null>(null);

  // 1. Load initial frames on mount or dataset change
  useEffect(() => {
    if (currentDatasetId !== 'custom') {
      const meta = DATASET_METADATA[currentDatasetId];
      setDatasetMeta(meta);
      const generated = generateDatasetFrames(currentDatasetId);
      setFrames(generated);
      setMarkers([]);
      setActiveMeasurement(null);
      setActiveMeasurementPoint(null);
      setSliceState((prev) => ({
        ...prev,
        fpsTarget: meta.fps === 60 ? 60 : 30,
        resolutionTier: meta.is4KCapable ? '4k' : '1080p',
      }));
    }
  }, [currentDatasetId]);

  // 2. 60 FPS Lossless Animation Loop
  const sliceStateRef = useRef(sliceState);
  sliceStateRef.current = sliceState;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const durationRef = useRef(datasetMeta.durationSec);
  durationRef.current = datasetMeta.durationSec;
  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  useEffect(() => {
    let lastTime = performance.now();
    let animId = 0;

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlayingRef.current && durationRef.current > 0) {
        const deltaNorm = (dt * playbackSpeedRef.current) / durationRef.current;
        let nextZ = sliceStateRef.current.timeZ + deltaNorm;

        if (nextZ >= 1.0) {
          if (isLoopingRef.current) {
            nextZ = 0.0;
          } else {
            nextZ = 1.0;
            setIsPlaying(false);
          }
        }

        setSliceState((prev) => ({ ...prev, timeZ: nextZ }));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 3. User interaction handlers
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleStepFrame = useCallback(
    (direction: -1 | 1) => {
      if (frames.length <= 1) return;
      const step = 1 / (frames.length - 1);
      setSliceState((prev) => ({
        ...prev,
        timeZ: Math.max(0, Math.min(1, prev.timeZ + direction * step)),
      }));
    },
    [frames.length]
  );

  const handleTimeChange = useCallback((newNormTime: number) => {
    setSliceState((prev) => ({ ...prev, timeZ: newNormTime }));
  }, []);

  const handleUpdateSliceState = useCallback(
    (partial: Partial<SpacetimeSliceState>) => {
      setSliceState((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  // 4. Handle 3D slice click for Spacetime Caliper
  const handleSliceClick = useCallback(
    (coords: { x: number; y: number; normTime: number }) => {
      if (!activeMeasurementPoint) return;

      const timeSec = coords.normTime * datasetMeta.durationSec;
      const newMarker: SpacetimeMarker = {
        id: `point-${activeMeasurementPoint}`,
        label: `P${activeMeasurementPoint}`,
        x: coords.x,
        y: coords.y,
        timeSec,
        color: activeMeasurementPoint === 1 ? '#FFFFFF' : '#A1A1AA',
      };

      setMarkers((prev) => {
        const updated = [...prev];
        if (activeMeasurementPoint === 1) {
          updated[0] = newMarker;
          setActiveMeasurementPoint(2);
        } else {
          updated[1] = newMarker;
          setActiveMeasurementPoint(null);
        }

        if (updated[0] && updated[1]) {
          const p1 = updated[0];
          const p2 = updated[1];
          const vel = calculateSpacetimeVelocity(
            { x: p1.x * 100, y: p1.y * 100, timeSec: p1.timeSec },
            { x: p2.x * 100, y: p2.y * 100, timeSec: p2.timeSec }
          );

          setActiveMeasurement({
            p1,
            p2,
            dxNorm: vel.dx / 100,
            dyNorm: vel.dy / 100,
            dtSec: vel.dt,
            velocityNormPerSec: vel.velocity,
            apparentSpeed: `${vel.velocity.toFixed(1)}% / s`,
            fpsScale: datasetMeta.fps,
          });
        }

        return updated;
      });
    },
    [activeMeasurementPoint, datasetMeta.durationSec, datasetMeta.fps]
  );

  const handleClearMarkers = useCallback(() => {
    setMarkers([]);
    setActiveMeasurement(null);
    setActiveMeasurementPoint(null);
  }, []);

  const handleCustomVideoLoaded = useCallback(
    (newFrames: VideoFrameData[], meta: DatasetMeta) => {
      setFrames(newFrames);
      setDatasetMeta(meta);
      setCurrentDatasetId('custom');
      setSliceState((prev) => ({
        ...prev,
        timeZ: 0,
        fpsTarget: meta.fps === 60 ? 60 : 30,
        resolutionTier: meta.is4KCapable ? '4k' : '1080p',
      }));
    },
    []
  );

  // 5. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(1);
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZenMode((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsSlitScanOpen((prev) => !prev);
      } else if (e.key === 'u' || e.key === 'U') {
        setIsUploadOpen(true);
      } else if (e.key === '1') {
        setCurrentDatasetId('microfluidic_4k');
      } else if (e.key === '2') {
        setCurrentDatasetId('mitosis');
      } else if (e.key === '3') {
        setCurrentDatasetId('cardiac');
      } else if (e.key === '4') {
        setCurrentDatasetId('embryogenesis');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleStepFrame]);

  const totalFramesCount = frames.length || 1;
  const currentFrameIdx = Math.min(
    totalFramesCount - 1,
    Math.floor(sliceState.timeZ * (totalFramesCount - 1))
  );
  const currentTimeSec = sliceState.timeZ * datasetMeta.durationSec;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans text-zinc-100 select-none">
      {/* 3D WebGL Spacetime Viewport (100vw x 100vh full-bleed) */}
      <ThreeCanvas
        frames={frames}
        sliceState={sliceState}
        visMode={visMode}
        onTimeChange={handleTimeChange}
        onSliceClick={handleSliceClick}
        markers={markers}
        activeMeasurementPoint={activeMeasurementPoint}
      />

      {/* Top HUD Header (AI Studio Minimal Design) */}
      <HUDHeader
        currentDataset={currentDatasetId}
        onSelectDataset={setCurrentDatasetId}
        visMode={visMode}
        onSelectVisMode={setVisMode}
        currentFrameIndex={currentFrameIdx}
        totalFrames={totalFramesCount}
        currentTimeSec={currentTimeSec}
        durationSec={datasetMeta.durationSec}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSlitScan={() => setIsSlitScanOpen(true)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        fps={sliceState.fpsTarget}
      />

      {/* Interactive Bottom Control Dock */}
      {!isZenMode && (
        <BottomControlDock
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onStepFrame={handleStepFrame}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping((prev) => !prev)}
          currentTimeSec={currentTimeSec}
          durationSec={datasetMeta.durationSec}
          currentFrameIndex={currentFrameIdx}
          totalFrames={totalFramesCount}
          sliceState={sliceState}
          onChangeSliceState={handleUpdateSliceState}
          visMode={visMode}
          datasetMeta={datasetMeta}
          markers={markers}
          activeMeasurement={activeMeasurement}
          onClearMarkers={handleClearMarkers}
          onSelectMarkerMode={(pt) =>
            setActiveMeasurementPoint((prev) => (prev === pt ? null : pt))
          }
          activeMeasurementPoint={activeMeasurementPoint}
        />
      )}

      {/* Slit-Scan Inspector Modal */}
      <SlitScanInspectorModal
        isOpen={isSlitScanOpen}
        onClose={() => setIsSlitScanOpen(false)}
        frames={frames}
        sliceState={sliceState}
        onSeekTime={handleTimeChange}
        onSetSlitY={(y) => handleUpdateSliceState({ slitY: y })}
        durationSec={datasetMeta.durationSec}
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFramesLoaded={handleCustomVideoLoaded}
      />
    </div>
  );
}
