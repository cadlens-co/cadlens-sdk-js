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

export type EntityCategory = 'Geometry' | 'Annotation' | 'BlockReference' | 'Hatch' | 'Other';

/** Computed axis-aligned bounds (6-decimal). All values null when uncomputable (e.g. INSERT). */
export interface EntityBbox {
  minX: number | null;
  minY: number | null;
  maxX: number | null;
  maxY: number | null;
}

/** Computed helper values (6-decimal, exact-only); null when not applicable. */
export interface EntityMetrics {
  length: number | null;
  area: number | null;
  perimeter: number | null;
  vertexCount: number | null;
}

/** Display properties. HATCH pattern fields are null on non-HATCH types. */
export interface EntityProperties {
  /** ACI color; null = BYLAYER */
  colorIndex: number | null;
  /** Entity override; null = BYLAYER */
  lineType: string | null;
  /** 100ths of mm; -3 BYBLOCK, -2 BYLAYER, -1 default */
  lineweight: number | null;
  /** From the entity layer's isVisible flag */
  visible: boolean;
  solid: boolean | null;
  patternName: string | null;
  patternAngle: number | null;
  patternScale: number | null;
}

/** TEXT/MTEXT content — null on other entity types. */
export interface EntityText {
  value: string;
  height: number;
  style: string | null;
}

/** INSERT block reference — null on other entity types. */
export interface EntityReference {
  blockName: string;
}

/**
 * Schema v2 entity envelope. `geometry` holds spatial data only (per-type
 * fields, original precision — e.g. LINE: start/end; LWPOLYLINE: vertices/
 * closed/filled; ARC: center/radius/startAngle/endAngle in radians).
 * `metrics` and `bbox` are always present with nulls when not applicable.
 */
export interface VectorEntity {
  /** Stable identifier — CAD handle when available, otherwise a synthetic UUID. */
  id: string;
  /** Original CAD handle (DXF group code 5) or null — never derived from `id`. */
  handle: string | null;
  type: string;
  category: EntityCategory;
  layer: string;
  layout: string | null;
  geometry: Record<string, unknown>;
  text: EntityText | null;
  reference: EntityReference | null;
  properties: EntityProperties;
  bbox: EntityBbox;
  metrics: EntityMetrics;
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
  /** Count of 3D-only entity types (3DSOLID/BODY/SURFACE/REGION/MESH) with no extractable geometry. */
  unsupported3DCount?: number;
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

/** Entity counts grouped by type and by category. */
export interface ResultStatistics {
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface ResultSummary {
  totalSheets: number;
  totalEntities: number;
  totalLayers: number;
  statistics?: ResultStatistics;
  boundingBox?: BoundingBox;
  truncated: boolean;
}

/** Parse diagnostics. `durationMs` is null for jobs parsed before Schema v2. */
export interface ParseInfo {
  durationMs: number | null;
  warnings: string[];
  errors: string[];
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
  /** Semver of the JSON contract (Schema v2 = "2.0.0"). */
  schemaVersion?: string;
  /** CAD parser engine version, independent of application releases. */
  parserVersion?: string;
  jobId: string;
  status: JobStatus;
  file?: FileInfo;
  summary?: ResultSummary;
  sheets: Sheet[];
  metadata: DrawingMetadata;
  parseInfo?: ParseInfo;
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
  /** Semver of the result JSON contract (Schema v2 = "2.0.0"). */
  schemaVersion?: string;
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
