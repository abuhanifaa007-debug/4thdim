import React, { useState } from 'react';
import {
  SpacetimeSliceState,
  VisualizationMode,
  DatasetMeta,
  SpacetimeMarker,
  VelocityMeasurement,
  ResolutionTier,
} from '../types/simulator.js';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  ChevronDown,
  ChevronUp,
  Sliders,
  Box,
  Gauge,
  Info,
  Trash2,
  Tv,
} from 'lucide-react';

interface BottomControlDockProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepFrame: (direction: -1 | 1) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  currentTimeSec: number;
  durationSec: number;
  currentFrameIndex: number;
  totalFrames: number;
  sliceState: SpacetimeSliceState;
  onChangeSliceState: (newState: Partial<SpacetimeSliceState>) => void;
  visMode: VisualizationMode;
  datasetMeta: DatasetMeta;
  markers: SpacetimeMarker[];
  activeMeasurement: VelocityMeasurement | null;
  onClearMarkers: () => void;
  onSelectMarkerMode: (point: 1 | 2 | null) => void;
  activeMeasurementPoint: 1 | 2 | null;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  isPlaying,
  onTogglePlay,
  onStepFrame,
  playbackSpeed,
  onChangeSpeed,
  isLooping,
  onToggleLoop,
  currentTimeSec,
  durationSec,
  currentFrameIndex,
  totalFrames,
  sliceState,
  onChangeSliceState,
  visMode,
  datasetMeta,
  markers,
  activeMeasurement,
  onClearMarkers,
  onSelectMarkerMode,
  activeMeasurementPoint,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'slice' | 'volumetric' | 'physics' | 'settings'>('slice');

  const fpsOptions: Array<24 | 30 | 60 | 120> = [24, 30, 60, 120];
  const resolutionOptions: Array<{ id: ResolutionTier; label: string }> = [
    { id: '4k', label: '4K UHD (3840×2160)' },
    { id: '1080p', label: '1080p FHD' },
    { id: '720p', label: '720p Turbo' },
  ];

  return (
    <div
      className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto z-20 w-[96vw] sm:w-[94vw] max-w-[940px] pointer-events-auto transition-transform duration-300 ease-out select-none"
      style={{
        transform: isCollapsed ? 'translateY(calc(100% - 32px))' : 'translateY(0)',
      }}
    >
      {/* Collapse/Expand Handle */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show bottom control dock' : 'Hide bottom control dock'}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-md bg-zinc-950 border-t border-x border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 shadow-md cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>CONTROLS (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              <span>COLLAPSE (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main AI Studio Minimalist Panel Container */}
      <div className="bg-zinc-950/95 border border-zinc-800/90 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5">
        {/* Row 1: Scrubbing Timeline */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 w-11 text-right">
              {currentTimeSec.toFixed(2)}s
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={sliceState.timeZ}
                onChange={(e) =>
                  onChangeSliceState({ timeZ: parseFloat(e.target.value) })
                }
                aria-label="Temporal scrub along 4D time axis"
                className="w-full h-1.5 bg-zinc-800 rounded-md appearance-none cursor-pointer accent-zinc-100 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 w-11">
              {durationSec.toFixed(2)}s
            </span>
          </div>

          {/* Transport Controls & Tab Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Playback Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStepFrame(-1)}
                aria-label="Step backward one frame"
                className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onStepFrame(1)}
                aria-label="Step forward one frame"
                className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onToggleLoop}
                aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
                className={`p-1.5 rounded-md cursor-pointer border ${
                  isLooping
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              {/* Speed Multipliers */}
              <div className="hidden sm:flex items-center gap-0.5 ml-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                {[0.25, 0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeed(s)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* AI Studio Minimal Tabs */}
            <div className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-md border border-zinc-800 overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('slice')}
                aria-pressed={activeTab === 'slice'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                  activeTab === 'slice'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Slices</span>
              </button>

              <button
                onClick={() => setActiveTab('volumetric')}
                aria-pressed={activeTab === 'volumetric'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                  activeTab === 'volumetric'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>4D Ribbon</span>
              </button>

              <button
                onClick={() => setActiveTab('physics')}
                aria-pressed={activeTab === 'physics'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                  activeTab === 'physics'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Gauge className="w-3 h-3" />
                <span>Caliper</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                aria-pressed={activeTab === 'settings'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>4K / 60FPS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Active Tab Content */}
        <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-300">
          {activeTab === 'slice' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* XY Plane (Time axis scrub) */}
              <div className="flex flex-col gap-1 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/70">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-200">XY Time Slice (Z-Time)</span>
                  <span className="text-zinc-500">
                    F#{currentFrameIndex + 1}/{totalFrames}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={sliceState.timeZ}
                  onChange={(e) => onChangeSliceState({ timeZ: parseFloat(e.target.value) })}
                  aria-label="XY Slice Temporal Position"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              {/* XZ Plane (Horizontal Slit-Scan) */}
              <div className="flex flex-col gap-1 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/70">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-200">XZ Horiz Slit (Row Y)</span>
                  <span className="text-zinc-500">
                    {Math.round(sliceState.slitY * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={sliceState.slitY}
                  onChange={(e) => onChangeSliceState({ slitY: parseFloat(e.target.value) })}
                  aria-label="XZ Horizontal Slit Scan Y Position"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              {/* YZ Plane (Vertical Slit-Scan) */}
              <div className="flex flex-col gap-1 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/70">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-200">YZ Vert Slit (Col X)</span>
                  <span className="text-zinc-500">
                    {Math.round(sliceState.slitX * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={sliceState.slitX}
                  onChange={(e) => onChangeSliceState({ slitX: parseFloat(e.target.value) })}
                  aria-label="YZ Vertical Slit Scan X Position"
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>
            </div>
          )}

          {activeTab === 'volumetric' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-400">Ribbon Slices</span>
                  <span className="text-zinc-200">{sliceState.stackLayers}</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={60}
                  step={4}
                  value={sliceState.stackLayers}
                  onChange={(e) => onChangeSliceState({ stackLayers: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-400">Hyper-Spacing</span>
                  <span className="text-zinc-200">
                    {sliceState.sliceSpacing.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={sliceState.sliceSpacing}
                  onChange={(e) =>
                    onChangeSliceState({ sliceSpacing: parseFloat(e.target.value) })
                  }
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-400">4D Tilt X-Time</span>
                  <span className="text-zinc-200">
                    {Math.round((sliceState.tiltXW * 180) / Math.PI)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-Math.PI / 2}
                  max={Math.PI / 2}
                  step={0.05}
                  value={sliceState.tiltXW}
                  onChange={(e) => onChangeSliceState({ tiltXW: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-zinc-400">4D Tilt Y-Time</span>
                  <span className="text-zinc-200">
                    {Math.round((sliceState.tiltYW * 180) / Math.PI)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-Math.PI / 2}
                  max={Math.PI / 2}
                  step={0.05}
                  value={sliceState.tiltYW}
                  onChange={(e) => onChangeSliceState({ tiltYW: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>
            </div>
          )}

          {activeTab === 'physics' && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">
                  CALIPER:
                </span>
                <button
                  onClick={() => onSelectMarkerMode(1)}
                  aria-pressed={activeMeasurementPoint === 1}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                    activeMeasurementPoint === 1
                      ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-200'
                      : markers[0]
                      ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <span>P1 (t₁)</span>
                  {markers[0] && (
                    <span className="ml-1 text-[10px] text-zinc-400">
                      {markers[0].timeSec.toFixed(2)}s
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onSelectMarkerMode(2)}
                  aria-pressed={activeMeasurementPoint === 2}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                    activeMeasurementPoint === 2
                      ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-200'
                      : markers[1]
                      ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <span>P2 (t₂)</span>
                  {markers[1] && (
                    <span className="ml-1 text-[10px] text-zinc-400">
                      {markers[1].timeSec.toFixed(2)}s
                    </span>
                  )}
                </button>

                {markers.length > 0 && (
                  <button
                    onClick={onClearMarkers}
                    aria-label="Clear caliper markers"
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer border border-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeMeasurement ? (
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md font-mono text-xs text-zinc-200">
                  <span>Δs = {(activeMeasurement.dxNorm * 100).toFixed(1)}%</span>
                  <span>Δt = {activeMeasurement.dtSec.toFixed(2)}s</span>
                  <span className="text-zinc-100 font-bold">
                    Velocity v = {activeMeasurement.apparentSpeed}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-mono text-zinc-500">
                  Click 'P1' then click any feature on the 3D video slice to track kinematic velocity.
                </span>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* FPS Target Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">FRAME RATE:</span>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                  {fpsOptions.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => onChangeSliceState({ fpsTarget: rate })}
                      className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer ${
                        sliceState.fpsTarget === rate
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {rate} FPS
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Tier Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">RESOLUTION:</span>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-md border border-zinc-800">
                  {resolutionOptions.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => onChangeSliceState({ resolutionTier: res.id })}
                      className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer ${
                        sliceState.resolutionTier === res.id
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {res.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
