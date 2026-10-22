/**
 * Video Extractor & Slit-Scan Synthesizer
 * Optimized for 4K UHD and 60FPS video sources.
 */

import { VideoFrameData } from '../types/simulator.js';

/**
 * Extracts N frames evenly sampled from a user-uploaded File or Blob
 * Compatible with 4K UHD (3840x2160) and 60fps files.
 */
export async function extractFramesFromVideoFile(
  videoFile: File | Blob,
  targetFrameCount = 60, // 60 frames default for high-speed / 60fps compatibility
  onProgress?: (pct: number) => void
): Promise<{
  frames: VideoFrameData[];
  duration: number;
  width: number;
  height: number;
  is4K: boolean;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 5;
        const rawW = video.videoWidth || 1920;
        const rawH = video.videoHeight || 1080;
        const is4K = rawW >= 3840 || rawH >= 2160;

        // Voxel downsampling buffer: 480x270 for super sharp texture slices while preventing browser OOM
        const width = 480;
        const height = Math.round((rawH / rawW) * 480);

        const frames: VideoFrameData[] = [];
        const interval = duration / targetFrameCount;

        for (let i = 0; i < targetFrameCount; i++) {
          const seekTime = Math.min(duration - 0.02, i * interval);
          await seekVideo(video, seekTime);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, 0, 0, width, height);
          }

          frames.push({
            index: i,
            timeSec: seekTime,
            canvas,
            thumbnailUrl: canvas.toDataURL('image/jpeg', 0.6),
            sourceWidth: rawW,
            sourceHeight: rawH,
            is4K,
          });

          if (onProgress) {
            onProgress(Math.round(((i + 1) / targetFrameCount) * 100));
          }
        }

        URL.revokeObjectURL(objectUrl);
        resolve({ frames, duration, width: rawW, height: rawH, is4K });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video file. Please check codec format.'));
    };
  });
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      resolve();
    };
    video.addEventListener('seeked', handleSeeked);
    video.currentTime = time;
  });
}

/**
 * Generates Horizontal Slit-Scan (X-T Spacetime slice)
 * Minimalist high-contrast sampling
 */
export function generateHorizontalSlitScan(
  frames: VideoFrameData[],
  normalizedY: number
): HTMLCanvasElement {
  if (frames.length === 0) {
    const fallback = document.createElement('canvas');
    fallback.width = 100;
    fallback.height = 100;
    return fallback;
  }

  const frameW = frames[0].canvas.width;
  const frameH = frames[0].canvas.height;
  const targetY = Math.floor(Math.max(0, Math.min(frameH - 1, normalizedY * frameH)));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = frameW;
  const rowHeight = Math.max(2, Math.floor(280 / frames.length));
  outCanvas.height = frames.length * rowHeight;

  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  for (let t = 0; t < frames.length; t++) {
    const srcCanvas = frames[t].canvas;
    outCtx.drawImage(
      srcCanvas,
      0,
      targetY,
      frameW,
      1,
      0,
      t * rowHeight,
      frameW,
      rowHeight
    );
  }

  return outCanvas;
}

/**
 * Generates Vertical Slit-Scan (Y-T Spacetime slice)
 */
export function generateVerticalSlitScan(
  frames: VideoFrameData[],
  normalizedX: number
): HTMLCanvasElement {
  if (frames.length === 0) {
    const fallback = document.createElement('canvas');
    fallback.width = 100;
    fallback.height = 100;
    return fallback;
  }

  const frameW = frames[0].canvas.width;
  const frameH = frames[0].canvas.height;
  const targetX = Math.floor(Math.max(0, Math.min(frameW - 1, normalizedX * frameW)));

  const colWidth = Math.max(2, Math.floor(360 / frames.length));
  const outCanvas = document.createElement('canvas');
  outCanvas.width = frames.length * colWidth;
  outCanvas.height = frameH;

  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  for (let t = 0; t < frames.length; t++) {
    const srcCanvas = frames[t].canvas;
    outCtx.drawImage(
      srcCanvas,
      targetX,
      0,
      1,
      frameH,
      t * colWidth,
      0,
      colWidth,
      frameH
    );
  }

  return outCanvas;
}
