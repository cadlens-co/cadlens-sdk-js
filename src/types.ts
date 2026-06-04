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
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  vectorJson: VectorEntity[];
  layersJson: Layer[];
  metadata: DrawingMetadata;
  imageUrl: string | null;
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
}

export interface CadlensClientOptions {
  apiKey: string;
  baseUrl?: string;
}
