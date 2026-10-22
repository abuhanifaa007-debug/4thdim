import React from 'react';
import {
  DatasetId,
  DatasetMeta,
  VisualizationMode,
} from '../types/simulator.js';
import { DATASET_METADATA } from '../utils/proceduralVideoGenerator.js';
import {
  Clock,
  Layers,
  Upload,
  Activity,
  Maximize2,
  Scan,
  Compass,
  FileVideo,
  Sparkles,
} from 'lucide-react';

interface HUDHeaderProps {
  currentDataset: DatasetId;
  onSelectDataset: (id: DatasetId) => void;
  visMode: VisualizationMode;
  onSelectVisMode: (mode: VisualizationMode) => void;
  currentFrameIndex: number;
  totalFrames: number;
  currentTimeSec: number;
  durationSec: number;
  onOpenUpload: () => void;
  onOpenSlitScan: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  fps: number;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  currentDataset,
  onSelectDataset,
  visMode,
  onSelectVisMode,
  currentFrameIndex,
  totalFrames,
  currentTimeSec,
  durationSec,
  onOpenUpload,
  onOpenSlitScan,
  isZenMode,
  onToggleZenMode,
  fps,
}) => {
  const currentMeta: DatasetMeta = DATASET_METADATA[currentDataset];

  if (isZenMode) {
    return (
      <header className="absolute top-3 right-3 z-20 pointer-events-auto">
        <button
          onClick={onToggleZenMode}
          aria-label="Exit Zen mode and show HUD controls"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900/90 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono cursor-pointer shadow-lg"
        >
          <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>EXIT ZEN (Z)</span>
        </button>
      </header>
    );
  }

  const datasets: DatasetId[] = [
    'microfluidic_4k',
    'mitosis',
    'cardiac',
    'embryogenesis',
    'vortex',
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Left: AI Studio Minimal Brand & Telemetry */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-zinc-950/90 border border-zinc-800/80 rounded-lg px-3 py-1.5 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-mono text-xs font-semibold">
              4D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-100 tracking-tight">
                  ChronoSpatial
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {currentMeta.resolution.includes('4K') ? '4K UHD' : '1080P'}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {fps} FPS
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Minimalist Telemetry */}
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{currentTimeSec.toFixed(2)}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-zinc-500" />
              <span>F#{currentFrameIndex + 1}/{totalFrames}</span>
            </div>
          </div>
        </div>

        {/* Center: Dataset Tabs (Desktop AI Studio Segmented Bar) */}
        <div className="pointer-events-auto hidden xl:flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-1 shadow-md">
          {datasets.map((id) => {
            const meta = DATASET_METADATA[id];
            const isActive = currentDataset === id;
            return (
              <button
                key={id}
                onClick={() => onSelectDataset(id)}
                aria-pressed={isActive}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {meta.is4KCapable && id === 'microfluidic_4k' && (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
                <span>{meta.title.split(' ')[0]}</span>
                <span className="text-[10px] opacity-60 font-mono">
                  {meta.fps}fps
                </span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-zinc-800 mx-0.5" />

          <button
            onClick={onOpenUpload}
            aria-label="Upload custom video or record camera"
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentDataset === 'custom'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload 4K/60fps</span>
          </button>
        </div>

        {/* Right: Mode Switchers & Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Mode Selector */}
          <div className="flex items-center gap-0.5 bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-1 shadow-md">
            <button
              onClick={() => onSelectVisMode('spacetime_block')}
              title="Spacetime Continuum Block"
              aria-label="Spacetime Continuum Block mode"
              aria-pressed={visMode === 'spacetime_block'}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                visMode === 'spacetime_block'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Block</span>
            </button>

            <button
              onClick={() => onSelectVisMode('temporal_stack')}
              title="Volumetric Temporal Ribbon Stack"
              aria-label="Volumetric Temporal Ribbon Stack mode"
              aria-pressed={visMode === 'temporal_stack'}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                visMode === 'temporal_stack'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stack</span>
            </button>

            <button
              onClick={() => onSelectVisMode('hyper_rotation')}
              title="4D SO(4) Hyper-Rotation"
              aria-label="4D Hyper-Rotation mode"
              aria-pressed={visMode === 'hyper_rotation'}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                visMode === 'hyper_rotation'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SO(4)</span>
            </button>
          </div>

          {/* Slit-Scan Modal Trigger */}
          <button
            onClick={onOpenSlitScan}
            aria-label="Open Spacetime Slit-Scan Inspector"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-mono shadow-md cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">SLIT-SCAN</span>
          </button>

          {/* Zen Mode Button */}
          <button
            onClick={onToggleZenMode}
            aria-label="Enter Zen Cinema Mode"
            title="Enter Zen Mode (Press Z)"
            className="p-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shadow-md cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Dataset Bar (Mobile & Tablet) */}
      <div className="pointer-events-auto flex xl:hidden items-center gap-1 bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-1 overflow-x-auto shadow-md">
        {datasets.map((id) => (
          <button
            key={id}
            onClick={() => onSelectDataset(id)}
            aria-pressed={currentDataset === id}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium cursor-pointer ${
              currentDataset === id ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            {DATASET_METADATA[id].title.split(' ')[0]}
          </button>
        ))}
        <button
          onClick={onOpenUpload}
          className="px-2.5 py-1 rounded text-xs whitespace-nowrap bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center gap-1 font-medium cursor-pointer border border-zinc-700"
        >
          <FileVideo className="w-3 h-3" />
          <span>Upload 4K</span>
        </button>
      </div>
    </header>
  );
};
