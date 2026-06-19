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

export interface ParseOptions {
  webhookUrl?: string;
  mode?: 'async' | 'sync';
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
