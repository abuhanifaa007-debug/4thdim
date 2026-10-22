/**
 * ChronoSpatial 4D - Simulator Data Models & Types
 * AI Studio Minimal Monochrome Architecture & 4K 60FPS Support
 */

export type DatasetId =
  | 'mitosis'
  | 'cardiac'
  | 'microfluidic_4k'
  | 'embryogenesis'
  | 'vortex'
  | 'custom';

export type VisualizationMode =
  | 'spacetime_block' // 3D box with orthogonal XY, XZ, YZ slicing
  | 'temporal_stack' // Layered semi-transparent time slices
  | 'hyper_rotation' // 4D rotation mixing space and time (SO(4) XW/YW projection)
  | 'worldlines'; // Trajectory particle paths traversing time

export type ResolutionTier = '4k' | '1080p' | '720p';

export interface SpacetimeSliceState {
  timeZ: number; // Normalized [0, 1] - XY plane position along time
  slitY: number; // Normalized [0, 1] - XZ horizontal slit cut position along Y
  slitX: number; // Normalized [0, 1] - YZ vertical slit cut position along X
  tiltXW: number; // 4D angle in radians between X and Time
  tiltYW: number; // 4D angle in radians between Y and Time
  sliceSpacing: number; // Spacing multiplier between stacked slices
  stackLayers: number; // Number of slices in volumetric stack (e.g. 12 to 60)
  sliceOpacity: number; // Opacity of volumetric slices
  colorTransfer: 'natural' | 'monochrome' | 'high_contrast';
  showWorldlines: boolean;
  showBoundingFrame: boolean;
  showOrthoSlices: boolean;
  activeAxis: 'xy' | 'xz' | 'yz' | 'all';
  fpsTarget: 24 | 30 | 60 | 120;
  resolutionTier: ResolutionTier;
}

export interface VideoFrameData {
  index: number;
  timeSec: number;
  canvas: HTMLCanvasElement;
  thumbnailUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  is4K?: boolean;
}

export interface DatasetMeta {
  id: DatasetId;
  title: string;
  category: 'Cellular Biology' | 'Physiology' | 'High-Speed 4K' | 'Developmental' | 'Fluid Dynamics' | 'User Custom';
  description: string;
  durationSec: number;
  fps: number;
  totalFrames: number;
  resolution: string; // e.g. "3840 x 2160 (4K UHD)" or "1920 x 1080"
  is4KCapable: boolean;
  scientificContext: {
    phenomenon: string;
    imagingModality: string;
    keyFeatures: string[];
    spatiotemporalSignificance: string;
  };
}

export interface SpacetimeMarker {
  id: string;
  label: string;
  x: number; // Normalized [0, 1]
  y: number; // Normalized [0, 1]
  timeSec: number;
  color: string;
}

export interface VelocityMeasurement {
  p1: SpacetimeMarker;
  p2: SpacetimeMarker;
  dxNorm: number;
  dyNorm: number;
  dtSec: number;
  velocityNormPerSec: number;
  apparentSpeed: string;
  fpsScale: number;
}
