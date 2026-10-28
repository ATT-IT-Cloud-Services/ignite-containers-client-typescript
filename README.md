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

const server = await client.createServer({
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

await client.power(server.id, "start");
const stats = await client.stats(server.id);
console.log(stats.cpu_percent, stats.memory_bytes);

try {
  await client.deleteServer(server.id);
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
const env = await client.getServerEnvironment(serverId);
const audit = await client.listAuditEvents(100);
const state = await client.getNodeState(nodeId);
const routes = await client.listProxyRoutes();
await client.reconcileProxy();
const versions = await client.listTemplateVersions(templateId);
const response = await client.logsStream(serverId); // SSE Response; read response.body
const metrics = await client.metrics();
```

The client types include audit events, proxy routes/status, node desired state,
server environment and template versions. `health()`, `ready()`, `openapi()` and `docs()`
cover the root operational endpoints.
