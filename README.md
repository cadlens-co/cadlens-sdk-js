# cadlens

[![npm version](https://badge.fury.io/js/cadlens.svg)](https://www.npmjs.com/package/cadlens)

Official JavaScript/TypeScript SDK for [Cadlens](https://cadlens.co) — the [DWG to JSON API](https://cadlens.co) that converts CAD files into preview images, structured JSON, layer metadata, and vector entities.

- Website: [cadlens.co](https://cadlens.co)
- API Docs: [cadlens.co/docs](https://cadlens.co/docs)
- Dashboard: [cadlens.co/dashboard](https://cadlens.co/dashboard)

---

## Install

```bash
npm install cadlens
```

Requires Node.js 18+ (uses native `fetch` and `FormData`).

---

## Quick Start

```ts
import { CadlensClient } from 'cadlens';
import { readFileSync } from 'fs';

const client = new CadlensClient({ apiKey: process.env.CADLENS_API_KEY! });

// One-shot: upload + poll + return result
const result = await client.parseAndWait(
  new Blob([readFileSync('drawing.dwg')]),
  'drawing.dwg',
);

console.log('Sheets:', result.sheets.length);
console.log('Entities:', result.summary?.totalEntities);
console.log('Layers:', result.summary?.totalLayers);
console.log('Preview:', result.imageUrl ?? result.imageUrls?.[0]);
```

---

## Step-by-step Usage

```ts
import { CadlensClient } from 'cadlens';
import { readFileSync } from 'fs';

const client = new CadlensClient({ apiKey: 'cadl_your_key_here' });
const file = new Blob([readFileSync('drawing.dwg')]);

// 1. Upload
const { job_id } = await client.parse(file, 'drawing.dwg');

// 2. Poll
let job;
do {
  await new Promise((r) => setTimeout(r, 3000));
  job = await client.getJob(job_id);
} while (job.status === 'PENDING' || job.status === 'PROCESSING');

// 3. Result
const result = await client.getResult(job_id);
console.log(result.file);     // { name, format, version, units }
console.log(result.summary);  // { totalSheets, totalEntities, totalLayers, truncated }
for (const sheet of result.sheets) {
  console.log(`${sheet.name}: ${sheet.entityCount} entities, ${sheet.layerCount} layers`);
}
```

---

## API Reference

### `new CadlensClient(options)`

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | Your `cadl_xxx` API key (required) |
| `baseUrl` | `string` | Override API base URL (default: `https://api.cadlens.co`) |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `parse(file, fileName, options?)` | `ParseResponse` | Upload a CAD file; get a `job_id` |
| `parseAndWait(file, fileName, options?)` | `JobResult` | Upload, poll, and return result |
| `getJob(jobId)` | `Job` | Get job status and metadata |
| `listJobs()` | `{ jobs: Job[] }` | List recent jobs (up to 100) |
| `getResult(jobId)` | `JobResult` | Get `file`, `summary`, `sheets[]` (entities + layers per sheet) |
| `getImage(jobId)` | `{ imageUrl: string }` | Get presigned PNG preview URL (1h TTL) |
| `deleteJob(jobId)` | `void` | Delete job and S3 artifacts |

### ParseOptions

| Option | Type | Description |
|--------|------|-------------|
| `webhookUrl` | `string` | Receive a POST callback on completion |
| `mode` | `'async' \| 'sync'` | `sync` waits up to 60s server-side |

---

## Supported Formats

DWG · DXF · DWF · DWFx · DGN · PDF

---

## Get an API Key

Sign up at [cadlens.co](https://cadlens.co), go to the dashboard, and create an API key. Keys start with `cadl_`.

---

## Links

- [Cadlens official website](https://cadlens.co)
- [Cadlens API documentation](https://cadlens.co/docs)
- [Cadlens pricing](https://cadlens.co/pricing)

---

## GitHub Topics

Add these topics to this repo for discovery:
`cad` `dwg` `dxf` `sdk` `typescript` `nodejs` `npm` `cad-api` `engineering-api` `dwg-parser`

---

## License

MIT
