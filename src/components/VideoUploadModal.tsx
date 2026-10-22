import React, { useState, useRef } from 'react';
import { extractFramesFromVideoFile } from '../utils/videoExtractor.js';
import { VideoFrameData, DatasetMeta } from '../types/simulator.js';
import { Upload, Camera, Film, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFramesLoaded: (frames: VideoFrameData[], meta: DatasetMeta) => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onFramesLoaded,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordCountDown, setRecordCountDown] = useState(3);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processVideoFile(file, file.name);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await processVideoFile(file, file.name);
    } else {
      setErrorMsg('Please drop a valid video file (MP4, WebM, QuickTime MOV).');
    }
  };

  const processVideoFile = async (blob: Blob, name: string) => {
    setIsProcessing(true);
    setProgressPct(5);
    setErrorMsg(null);

    try {
      const result = await extractFramesFromVideoFile(blob, 60, (pct) => {
        setProgressPct(pct);
      });

      const customMeta: DatasetMeta = {
        id: 'custom',
        title: name.length > 28 ? name.substring(0, 25) + '...' : name,
        category: 'User Custom',
        description: `Imported ${result.is4K ? '4K UHD' : 'HD'} video sampled into ${result.frames.length} frames across ${result.duration.toFixed(1)}s.`,
        durationSec: result.duration,
        fps: Math.round(result.frames.length / result.duration) || 60,
        totalFrames: result.frames.length,
        resolution: result.is4K ? '3840 × 2160 (4K UHD)' : `${result.width} × ${result.height}`,
        is4KCapable: result.is4K,
        scientificContext: {
          phenomenon: 'User Video Spatiotemporal Dynamics',
          imagingModality: result.is4K ? '4K 60FPS Video Capture' : 'Standard Digital Video',
          keyFeatures: [
            `${result.width}×${result.height} source resolution`,
            `${result.frames.length} spatiotemporal slice extrusions`,
            'Continuous Minkowski volume',
            'Interactive X-T & Y-T slit-scan analysis',
          ],
          spatiotemporalSignificance:
            'Interactive inspection of any motion sequence in 4D spacetime.',
        },
      };

      onFramesLoaded(result.frames, customMeta);
      setIsProcessing(false);
      onClose();
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMsg(err instanceof Error ? err.message : 'Error extracting frames from video.');
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 60 },
        audio: false,
      });

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        await processVideoFile(blob, 'Webcam_60FPS_Capture.webm');
      };

      setIsRecording(true);
      recorder.start();

      let remaining = 3;
      setRecordCountDown(remaining);
      const timer = setInterval(() => {
        remaining -= 1;
        setRecordCountDown(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          setIsRecording(false);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Camera access unavailable.');
      setIsRecording(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Film className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="upload-modal-title" className="text-xs font-semibold text-zinc-100 uppercase tracking-wider font-mono">
                LOAD 4K / 60FPS VIDEO INTO 4D
              </h2>
              <p className="text-[11px] text-zinc-400">
                Sample any video into continuous temporal slices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload modal"
            className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-red-900/60 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-6 h-6 text-zinc-200 animate-spin" />
              <div className="text-xs font-mono font-medium text-zinc-100 uppercase">
                Extruding 4D Spacetime Block...
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Sampling {progressPct}% of temporal slices into voxel buffer
              </p>
              <div className="w-56 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-zinc-100 transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black w-[320px] h-[220px]">
                <video
                  ref={videoPreviewRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>RECORDING: {recordCountDown}s</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Capturing high-frame-rate movement for 4D extrusion.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-zinc-800 hover:border-zinc-500 rounded-xl p-7 flex flex-col items-center justify-center gap-2 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors cursor-pointer text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-zinc-200">
                  Drag and drop 4K or 60fps video file here
                </div>
                <p className="text-[11px] text-zinc-500 max-w-xs font-mono">
                  Supports MP4, WebM, MOV up to 3840×2160 @ 60 FPS.
                </p>
                <button
                  type="button"
                  className="mt-1 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-zinc-800 flex-1" />
                <span className="text-[10px] font-mono text-zinc-600 uppercase">Or live capture</span>
                <div className="h-px bg-zinc-800 flex-1" />
              </div>

              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Record 3-Second Clip (60 FPS)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
