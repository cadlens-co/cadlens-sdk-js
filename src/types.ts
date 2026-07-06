export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Job {
  id: string;
  status: JobStatus;
  fileName: string;
  fileSize: number;
  webhookUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  imageUrl: string | null;
}

export interface VectorEntity {
  type: string;
  layer: string;
  color: number;
  lineweight: number;
  [key: string]: unknown;
}

/**
 * One hatch pattern-definition line family (HATCH entities only).
 * Values are in drawing units with the hatch's rotation and scale already applied.
 */
export interface HatchPatternLine {
  /** Line angle in degrees, CCW from +X */
  angle: number;
  /** Base point of the first line */
  base: { x: number; y: number };
  /** Offset vector to the next parallel line */
  offset: { x: number; y: number };
  /** Dash/gap lengths (+ dash, − gap, 0 = dot); empty array = solid line */
  dashes: number[];
}

export interface Layer {
  name: string;
  color: number;
  lineweight: number;
  isVisible: boolean;
}

export interface DrawingMetadata {
  version: string;
  units: string;
  width: number;
  height: number;
  createdDate: string | null;
  layouts?: string[];
  layoutLabels?: string[];
  layoutKeys?: string[];
  /** LTYPE table: linetype name → dash/gap array in drawing units (+ dash, − gap) */
  linetypePatterns?: Record<string, number[]>;
  /** DXF $LTSCALE global linetype scale factor */
  ltscale?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface FileInfo {
  name: string;
  format: string;
  version: string;
  units: string;
}

export interface ResultSummary {
  totalSheets: number;
  totalEntities: number;
  totalLayers: number;
  boundingBox?: BoundingBox;
  truncated: boolean;
}

export interface Sheet {
  name: string;
  key: string;
  index: number;
  imageUrl: string | null;
  entityCount: number;
  layerCount: number;
  boundingBox: BoundingBox;
  area: number;
  perimeter: number;
  layers: Layer[];
  entities: VectorEntity[];
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  file?: FileInfo;
  summary?: ResultSummary;
  sheets: Sheet[];
  metadata: DrawingMetadata;
  imageUrl?: string | null;
  imageUrls?: string[];
  createdAt: string;
}

/** A Sheet without the raw geometry arrays — the shape used in webhook payloads. */
export type SheetSummary = Omit<Sheet, 'entities' | 'layers'>;

export type WebhookEvent = 'job.processing' | 'job.completed' | 'job.failed';

/**
 * `result` block of a `job.completed` webhook. Sheets carry metadata only
 * (no entities/layers) — fetch full geometry from `resultUrl`
 * (GET /v1/jobs/:id/result). Payloads over 256 KB omit `sheets` entirely.
 */
export interface WebhookResult {
  imageUrl?: string;
  imageUrls?: string[];
  metadata?: DrawingMetadata;
  file?: FileInfo;
  summary?: ResultSummary;
  sheets?: SheetSummary[];
  /** URL of the full parse result (entities, layers) on the CADLens API. */
  resultUrl?: string;
}

/** Body of a CADLens webhook POST. */
export interface WebhookPayload {
  eventId: string;
  sequence: number;
  event: WebhookEvent;
  jobId: string;
  status: string;
  timestamp: string;
  result?: WebhookResult;
  error?: string;
}

export interface ParseOptions {
  webhookUrl?: string;
  mode?: 'async' | 'sync';
  /**
   * Email address to notify when a queued job finishes after the uploader
   * stopped watching (max 320 chars).
   */
  notifyEmail?: string;
}

export interface ParseResponse {
  job_id: string;
  status: JobStatus;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface ImageResponse {
  imageUrl: string;
  imageUrls: string[];
}

export interface CadlensClientOptions {
  apiKey: string;
  baseUrl?: string;
}
