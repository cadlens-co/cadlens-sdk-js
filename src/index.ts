import type {
  CadlensClientOptions,
  ImageResponse,
  Job,
  JobResult,
  ParseOptions,
  ParseResponse,
} from './types.js';

export * from './types.js';

export class CadlensClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor({ apiKey, baseUrl = 'https://api.cadlens.co' }: CadlensClientOptions) {
    if (!apiKey) throw new Error('Cadlens API key is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(init.headers ?? {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Cadlens API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  /**
   * Upload a CAD file for parsing.
   * Returns a job_id immediately (async mode) or the full result (sync mode).
   */
  async parse(file: Blob | File, fileName: string, options: ParseOptions = {}): Promise<ParseResponse> {
    const form = new FormData();
    form.append('file', file, fileName);
    if (options.webhookUrl) form.append('webhookUrl', options.webhookUrl);
    if (options.mode) form.append('mode', options.mode);

    return this.request<ParseResponse>('/v1/parse', { method: 'POST', body: form });
  }

  /** Get the status and metadata for a job. */
  getJob(jobId: string): Promise<Job> {
    return this.request<Job>(`/v1/jobs/${jobId}`);
  }

  /** List up to 100 recent parse jobs for this API key. */
  listJobs(): Promise<{ jobs: Job[] }> {
    return this.request<{ jobs: Job[] }>('/v1/jobs');
  }

  /**
   * Fetch the full parsed result. Returns `file`, `summary`, and `sheets[]`
   * (entities and layers grouped per sheet). Only available when job status is COMPLETED.
   */
  getResult(jobId: string): Promise<JobResult> {
    return this.request<JobResult>(`/v1/jobs/${jobId}/result`);
  }

  /** Get a fresh presigned PNG preview URL (valid for 1 hour). */
  getImage(jobId: string): Promise<ImageResponse> {
    return this.request<ImageResponse>(`/v1/jobs/${jobId}/image`);
  }

  /** Delete a job and its S3 artifacts. Irreversible. */
  deleteJob(jobId: string): Promise<void> {
    return this.request<void>(`/v1/jobs/${jobId}`, { method: 'DELETE' });
  }

  /**
   * Upload and wait for completion (convenience wrapper for sync-style usage).
   * Polls every `pollIntervalMs` until the job completes or fails.
   */
  async parseAndWait(
    file: Blob | File,
    fileName: string,
    options: ParseOptions & { pollIntervalMs?: number; timeoutMs?: number } = {},
  ): Promise<JobResult> {
    const { pollIntervalMs = 3000, timeoutMs = 300_000, ...parseOptions } = options;
    const { job_id: jobId } = await this.parse(file, fileName, parseOptions);

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const job = await this.getJob(jobId);
      if (job.status === 'COMPLETED') return this.getResult(jobId);
      if (job.status === 'FAILED') throw new Error(`Job ${jobId} failed`);
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    throw new Error(`Job ${jobId} did not complete within ${timeoutMs}ms`);
  }
}
