import React, { useEffect, useRef } from 'react';
import { VideoFrameData, SpacetimeSliceState } from '../types/simulator.js';
import { generateHorizontalSlitScan, generateVerticalSlitScan } from '../utils/videoExtractor.js';
import { X, Activity, Info } from 'lucide-react';

interface SlitScanInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: VideoFrameData[];
  sliceState: SpacetimeSliceState;
  onSeekTime: (normTime: number) => void;
  onSetSlitY: (normY: number) => void;
  durationSec: number;
}

export const SlitScanInspectorModal: React.FC<SlitScanInspectorModalProps> = ({
  isOpen,
  onClose,
  frames,
  sliceState,
  onSeekTime,
  onSetSlitY,
  durationSec,
}) => {
  const xtCanvasRef = useRef<HTMLCanvasElement>(null);
  const ytCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || frames.length === 0) return;

    // Generate X-T (horizontal slice across time)
    const xtSrc = generateHorizontalSlitScan(frames, sliceState.slitY);
    const xtTarget = xtCanvasRef.current;
    if (xtTarget) {
      xtTarget.width = xtSrc.width;
      xtTarget.height = xtSrc.height;
      const ctx = xtTarget.getContext('2d');
      if (ctx) {
        ctx.drawImage(xtSrc, 0, 0);

        // Draw current time indicator line across X-T
        const timeY = sliceState.timeZ * xtTarget.height;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, timeY);
        ctx.lineTo(xtTarget.width, timeY);
        ctx.stroke();

        // Draw slit X indicator
        const slitXPos = sliceState.slitX * xtTarget.width;
        ctx.strokeStyle = '#71717A';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(slitXPos, 0);
        ctx.lineTo(slitXPos, xtTarget.height);
        ctx.stroke();
      }
    }

    // Generate Y-T (vertical slice across time)
    const ytSrc = generateVerticalSlitScan(frames, sliceState.slitX);
    const ytTarget = ytCanvasRef.current;
    if (ytTarget) {
      ytTarget.width = ytSrc.width;
      ytTarget.height = ytSrc.height;
      const ctx = ytTarget.getContext('2d');
      if (ctx) {
        ctx.drawImage(ytSrc, 0, 0);

        const timeX = sliceState.timeZ * ytTarget.width;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(timeX, 0);
        ctx.lineTo(timeX, ytTarget.height);
        ctx.stroke();
      }
    }
  }, [isOpen, frames, sliceState.slitY, sliceState.slitX, sliceState.timeZ]);

  const handleXtClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = xtCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const normTime = Math.max(0, Math.min(1, clickY / rect.height));
    onSeekTime(normTime);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slit-scan-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="slit-scan-title" className="text-xs font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                SPACETIME SLIT-SCAN INSPECTOR (X-T & Y-T)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Continuous 2D cuts through the 4D Minkowski spacetime continuum.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Slit-Scan Inspector"
            className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-5">
          <div className="flex items-start gap-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-zinc-200">
                Spacetime Velocity & Slit-Scan Mechanics:
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Horizontal slice row Y is sampled across all frames through time. Moving structures form tilted trajectories where slope (Δx / Δt) represents physical velocity. At 60 FPS, microsecond dynamics are cleanly unrolled.
              </p>
            </div>
          </div>

          {/* Primary View: X-T Slit Scan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-zinc-200 font-semibold">
                  X-T Spacetime Slice (Row Y = {Math.round(sliceState.slitY * 100)}%)
                </span>
                <span className="text-[10px] text-zinc-500">
                  [Click to scrub time]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">Row Y:</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={sliceState.slitY}
                  onChange={(e) => onSetSlitY(parseFloat(e.target.value))}
                  aria-label="Adjust Cut Row Y"
                  className="w-20 sm:w-28 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                />
              </div>
            </div>

            <div className="relative bg-black border border-zinc-800 rounded-lg overflow-hidden p-2 flex flex-col items-center">
              <div className="w-full flex justify-between text-[9px] font-mono text-zinc-500 mb-1 px-2">
                <span>← Left Space (X = 0)</span>
                <span>Spatial Axis X</span>
                <span>Right Space (X = W) →</span>
              </div>

              <div className="relative">
                <canvas
                  ref={xtCanvasRef}
                  onClick={handleXtClick}
                  className="w-full max-w-[640px] h-[220px] object-contain rounded border border-zinc-900 cursor-crosshair shadow-inner"
                />
                <div className="absolute left-1 top-1 text-[9px] font-mono text-zinc-300 bg-zinc-900/90 px-1 rounded border border-zinc-800">
                  t = 0.0s
                </div>
                <div className="absolute left-1 bottom-1 text-[9px] font-mono text-zinc-300 bg-zinc-900/90 px-1 rounded border border-zinc-800">
                  t = {durationSec.toFixed(2)}s
                </div>
              </div>

              <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-2 px-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-zinc-100" />
                  <span>Time Cursor: {(sliceState.timeZ * durationSec).toFixed(2)}s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-zinc-500" />
                  <span>Slit X: {Math.round(sliceState.slitX * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary View: Y-T Slit Scan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-200 font-semibold">
                Y-T Spacetime Slice (Column X = {Math.round(sliceState.slitX * 100)}%)
              </span>
              <span className="text-[11px] text-zinc-500">
                Vertical axis across time
              </span>
            </div>

            <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden p-2 flex flex-col items-center">
              <canvas
                ref={ytCanvasRef}
                className="w-full max-w-[640px] h-[160px] object-contain rounded border border-zinc-900 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-3 border-t border-zinc-800 bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
