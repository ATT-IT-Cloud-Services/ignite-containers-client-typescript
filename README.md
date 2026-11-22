# TypeScript client

Zero-dependency, fetch-based client for the Ignite Containers control plane.

```bash
npm install @ignite-containers/client
```

```ts
import { IgniteContainersClient, IgniteContainersError } from "@ignite-containers/client";

const client = new IgniteContainersClient({
  baseUrl: "https://games.example.com",
  apiKey: process.env.IGNITE_CONTAINERS_API_KEY!,
});

const pod = await client.createPod({
  node_id: nodeId,
  template_id: templateId,
  name: "survival",
  external_ref: "customer-42",
  auto_allocations: 1,
  limits: {
    memory_mb: 4096, disk_mb: 10240, cpu_millis: 2000,
    swap_mb: 0, io_weight: 500, pids_limit: 512,
  },
});

await client.power(pod.id, "start");
const stats = await client.stats(pod.id);
console.log(stats.cpu_percent, stats.memory_bytes);

try {
  await client.deletePod(pod.id);
} catch (error) {
  if (error instanceof IgniteContainersError && error.status === 409) {
    console.log("conflict:", error.code, error.message);
  } else {
    throw error;
  }
}
```

Works in Node 18+, Bun, Deno, and edge runtimes that provide `fetch`. Pass a custom
`fetch` for instrumented clients:

```ts
new IgniteContainersClient({ baseUrl, apiKey, fetch: myFetch });
```

Build: `npm run build` → `dist/`. Typecheck without emitting: `npm run typecheck`.

The client never logs the API key. All methods return typed results or throw
`IgniteContainersError` with `status`, `code`, `details`.

## Newer operator endpoints

```ts
const env = await client.getPodEnvironment(podId);
const audit = await client.listAuditEvents(100);
const state = await client.getNodeState(nodeId);
const routes = await client.listProxyRoutes();
await client.reconcileProxy();
const versions = await client.listTemplateVersions(templateId);
const response = await client.logsStream(podId); // SSE Response; read response.body
const metrics = await client.metrics();
```

The client types include audit events, proxy routes/status, node desired state,
pod environment and template versions. `health()`, `ready()`, `openapi()` and `docs()`
cover the root operational endpoints.

## Full operator surface

```ts
const groups = await client.listRuntimeGroups();
const ips = await client.listIps({ node_id: nodeId });
const platform = await client.getPlatform(podId);
const policy = await client.getUpdatePolicy(podId);
const revisions = await client.listRevisions(podId);
const usage = await client.podUsage(podId, from, to);
const webhooks = await client.listWebhooks();
const jobs = await client.listAllJobs({ status: "failed" });
const adapters = await client.listProxyAdapters();
const bytes = await client.downloadFile(podId, "server.properties");
await client.uploadFile(podId, "server.properties", bytes);
await client.transferPod(podId, { node_id: targetNodeId, mode: "copy" });
```

Runtime groups, floating IPs, port forwards, platform settings, autonomous
updates, metering, global jobs, transfers, webhooks, proxy adapters and template
nests are typed. See [`docs/API-COVERAGE.md`](../../docs/API-COVERAGE.md).

## Billing report

```ts
const report = await client.billingReport(
  "tenant",
  tenantId,
  Date.UTC(2026, 9, 1),
  Date.UTC(2026, 10, 1),
);

for (const group of report.resource_groups) {
  console.log(group.totals.pod_usage, group.totals.volumes, group.totals.ports);
  for (const pod of group.pods) console.log(pod.pod_id, pod.usage, pod.ports);
  for (const volume of group.volumes) console.log(volume.volume_id, volume.used_byte_seconds);
}
```

The report is itemised and totals are not double counted. See
[`docs/BILLING.md`](../../docs/BILLING.md#13-one-shot-billing-report).

## Build measurements

```ts
const build = await client.getGitBuild(buildId);
const live = await client.buildUsage(buildId);
console.log(live.current, live.usage.cpu_millis, live.usage.memory_byte_seconds);

const samples = await client.buildUsageSamples(buildId);
```

`billingReport()` includes the same values in `group.builds[].usage` and
`group.totals.builds`. Aborted builds keep their partial samples.
