import type {
  Allocation,
  ApiKey,
  AuditEvent,
  CreateProxyRouteRequest,
  ProxyDeleteResult,
  ProxyMutation,
  ProxyReconcileResult,
  ProxyRoute,
  ProxyStatus,
  PublishTemplateVersionRequest,
  ServerEnvironment,
  UpdateProxyRouteRequest,
  NodeState,
  CreateAllocationsRequest,
  CreateDatabaseHostRequest,
  CreateKeyRequest,
  CreateNodeRequest,
  CreateServerDatabaseRequest,
  CreateServerRequest,
  CreatedDatabase,
  Backup,
  BulkResult,
  CreatedKey,
  DatabaseHost,
  CreatedSftp,
  EmailConfig,
  EmailMessage,
  SftpCredential,
  FileContent,
  FileEntry,
  FileList,
  Schedule,
  ScheduleAction,
  FeedResult,
  HostUpdateStatus,
  ImportEggRequest,
  ImportResult,
  Job,
  Limits,
  LogChunk,
  Me,
  Node,
  NodeWithToken,
  PowerSignal,
  Server,
  ServerDatabase,
  ServerDetail,
  ServerQuery,
  ServerStats,
  TemplateRecord,
  TemplateVersionRecord,
  UpdateNodeRequest,
  UpdateServerRequest,
} from "./types.js";

export * from "./types.js";

export class IgniteContainersError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "IgniteContainersError";
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export interface IgniteContainersClientOptions {
  /** Control plane base URL, e.g. `https://games.example.com`. */
  baseUrl: string;
  /** API key (`ic_...`). */
  apiKey: string;
  /** Custom fetch implementation (testing, proxies, edge runtimes). */
  fetch?: typeof fetch;
  /** Optional AbortSignal applied to every request. */
  signal?: AbortSignal;
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: unknown };
}

export class IgniteContainersClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly signal?: AbortSignal;

  constructor(options: IgniteContainersClientOptions) {
    if (!/^https?:\/\//.test(options.baseUrl)) {
      throw new TypeError("baseUrl must start with http:// or https://");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.signal = options.signal;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.apiKey}`,
      accept: "application/json",
    };
    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: this.signal,
    });
    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    let data: unknown;
    if (text.length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }
    if (!response.ok) {
      const envelope = data as ErrorEnvelope | undefined;
      throw new IgniteContainersError(
        response.status,
        envelope?.error?.code ?? "unknown",
        envelope?.error?.message ?? `${response.status} ${response.statusText}`,
        envelope?.error?.details,
      );
    }
    return data as T;
  }

  // auth -------------------------------------------------------------------

  me(): Promise<Me> {
    return this.request("GET", "/api/v1/me");
  }

  // environment / audit ----------------------------------------------------

  getServerEnvironment(id: string): Promise<ServerEnvironment> {
    return this.request("GET", `/api/v1/servers/${id}/environment`);
  }

  async listAuditEvents(limit = 100): Promise<AuditEvent[]> {
    const data = await this.request<{ events: AuditEvent[] }>(
      "GET",
      `/api/v1/audit-events?limit=${Math.max(1, Math.min(1000, Math.trunc(limit)))}`,
    );
    return data.events;
  }

  // proxy ------------------------------------------------------------------

  async listProxyRoutes(): Promise<ProxyRoute[]> {
    const data = await this.request<{ routes: ProxyRoute[] }>("GET", "/api/v1/proxy/routes");
    return data.routes;
  }

  createProxyRoute(request: CreateProxyRouteRequest): Promise<ProxyMutation> {
    return this.request("POST", "/api/v1/proxy/routes", request);
  }

  updateProxyRoute(id: string, request: UpdateProxyRouteRequest): Promise<ProxyMutation> {
    return this.request("PATCH", `/api/v1/proxy/routes/${id}`, request);
  }

  deleteProxyRoute(id: string): Promise<ProxyDeleteResult> {
    return this.request("DELETE", `/api/v1/proxy/routes/${id}`);
  }

  proxyStatus(): Promise<ProxyStatus> {
    return this.request("GET", "/api/v1/proxy/status");
  }

  reconcileProxy(): Promise<ProxyReconcileResult> {
    return this.request("POST", "/api/v1/proxy/reconcile", {});
  }

  // api keys ---------------------------------------------------------------

  async listApiKeys(): Promise<ApiKey[]> {
    const data = await this.request<{ keys: ApiKey[] }>("GET", "/api/v1/api-keys");
    return data.keys;
  }

  createApiKey(request: CreateKeyRequest): Promise<CreatedKey> {
    return this.request("POST", "/api/v1/api-keys", request);
  }

  revokeApiKey(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/api-keys/${id}`);
  }

  // nodes ------------------------------------------------------------------

  async listNodes(): Promise<Node[]> {
    const data = await this.request<{ nodes: Node[] }>("GET", "/api/v1/nodes");
    return data.nodes;
  }

  createNode(request: CreateNodeRequest): Promise<NodeWithToken> {
    return this.request("POST", "/api/v1/nodes", request);
  }

  getNode(id: string): Promise<Node> {
    return this.request("GET", `/api/v1/nodes/${id}`);
  }

  getNodeState(id: string): Promise<NodeState> {
    return this.request("GET", `/api/v1/nodes/${id}/state`);
  }

  updateNode(id: string, request: UpdateNodeRequest): Promise<Node> {
    return this.request("PATCH", `/api/v1/nodes/${id}`, request);
  }

  deleteNode(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/nodes/${id}`);
  }

  rotateNodeToken(id: string): Promise<{ id: string; agent_token: string }> {
    return this.request("POST", `/api/v1/nodes/${id}/rotate-token`, {});
  }

  // host updates -----------------------------------------------------------

  nodeUpdates(id: string): Promise<HostUpdateStatus> {
    return this.request("GET", `/api/v1/nodes/${id}/updates`);
  }

  checkNodeUpdates(id: string): Promise<HostUpdateStatus> {
    return this.request("POST", `/api/v1/nodes/${id}/updates/check`, {});
  }

  applyNodeUpdates(id: string, reboot: boolean): Promise<{ accepted: boolean }> {
    return this.request("POST", `/api/v1/nodes/${id}/updates/apply`, { reboot });
  }

  rebootNode(id: string): Promise<{ accepted: boolean }> {
    return this.request("POST", `/api/v1/nodes/${id}/reboot`, {});
  }

  // databases --------------------------------------------------------------

  async listDatabaseHosts(): Promise<DatabaseHost[]> {
    const data = await this.request<{ hosts: DatabaseHost[] }>("GET", "/api/v1/database-hosts");
    return data.hosts;
  }

  getDatabaseHost(id: string): Promise<DatabaseHost> {
    return this.request("GET", `/api/v1/database-hosts/${id}`);
  }

  createDatabaseHost(request: CreateDatabaseHostRequest): Promise<DatabaseHost> {
    return this.request("POST", "/api/v1/database-hosts", request);
  }

  deleteDatabaseHost(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/database-hosts/${id}`);
  }

  testDatabaseHost(id: string): Promise<{ version: string }> {
    return this.request("POST", `/api/v1/database-hosts/${id}/test`, {});
  }

  async listServerDatabases(serverId: string): Promise<ServerDatabase[]> {
    const data = await this.request<{ databases: ServerDatabase[] }>(
      "GET",
      `/api/v1/servers/${serverId}/databases`,
    );
    return data.databases;
  }

  createServerDatabase(
    serverId: string,
    request: CreateServerDatabaseRequest = {},
  ): Promise<CreatedDatabase> {
    return this.request("POST", `/api/v1/servers/${serverId}/databases`, request);
  }

  deleteServerDatabase(serverId: string, databaseId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/servers/${serverId}/databases/${databaseId}`);
  }

  // sftp -------------------------------------------------------------------

  createSftpCredential(serverId: string, ttlSeconds?: number): Promise<CreatedSftp> {
    return this.request("POST", `/api/v1/servers/${serverId}/sftp`, {
      ttl_seconds: ttlSeconds,
    });
  }

  async listSftpCredentials(serverId: string): Promise<SftpCredential[]> {
    const data = await this.request<{ credentials: SftpCredential[] }>(
      "GET",
      `/api/v1/servers/${serverId}/sftp`,
    );
    return data.credentials;
  }

  revokeSftpCredential(serverId: string, credentialId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/servers/${serverId}/sftp/${credentialId}`);
  }

  // notifications ----------------------------------------------------------

  sendEmail(to: string[], subject: string, body: string): Promise<EmailMessage> {
    return this.request("POST", "/api/v1/notifications/email", { to, subject, body });
  }

  async listEmails(limit = 100): Promise<EmailMessage[]> {
    const data = await this.request<{ emails: EmailMessage[] }>(
      "GET",
      `/api/v1/notifications/emails?limit=${limit}`,
    );
    return data.emails;
  }

  retryEmail(id: string): Promise<EmailMessage> {
    return this.request("POST", `/api/v1/notifications/emails/${id}/retry`, {});
  }

  notificationConfig(): Promise<EmailConfig> {
    return this.request("GET", "/api/v1/notifications/config");
  }

  // bulk -------------------------------------------------------------------

  async bulkPower(serverIds: string[], signal: PowerSignal): Promise<BulkResult[]> {
    const data = await this.request<{ results: BulkResult[] }>(
      "POST",
      "/api/v1/servers/bulk/power",
      { server_ids: serverIds, signal },
    );
    return data.results;
  }

  async bulkCommand(serverIds: string[], command: string): Promise<BulkResult[]> {
    const data = await this.request<{ results: BulkResult[] }>(
      "POST",
      "/api/v1/servers/bulk/command",
      { server_ids: serverIds, command },
    );
    return data.results;
  }

  // backups ----------------------------------------------------------------

  async listBackups(serverId: string): Promise<Backup[]> {
    const data = await this.request<{ backups: Backup[] }>(
      "GET",
      `/api/v1/servers/${serverId}/backups`,
    );
    return data.backups;
  }

  createBackup(serverId: string, name?: string): Promise<Backup> {
    return this.request("POST", `/api/v1/servers/${serverId}/backups`, {
      name,
    });
  }

  deleteBackup(serverId: string, backupId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/servers/${serverId}/backups/${backupId}`);
  }

  restoreBackup(serverId: string, backupId: string): Promise<Backup> {
    return this.request("POST", `/api/v1/servers/${serverId}/backups/${backupId}/restore`, {});
  }

  async downloadBackup(serverId: string, backupId: string): Promise<ArrayBuffer> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/servers/${serverId}/backups/${backupId}/download`,
      {
        headers: { authorization: `Bearer ${this.apiKey}` },
        signal: this.signal,
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new IgniteContainersError(response.status, "download_failed", text);
    }
    return response.arrayBuffer();
  }

  // schedules --------------------------------------------------------------

  async listSchedules(serverId: string): Promise<Schedule[]> {
    const data = await this.request<{ schedules: Schedule[] }>(
      "GET",
      `/api/v1/servers/${serverId}/schedules`,
    );
    return data.schedules;
  }

  createSchedule(
    serverId: string,
    request: { name: string; cron: string; actions: ScheduleAction[]; enabled?: boolean },
  ): Promise<Schedule> {
    return this.request("POST", `/api/v1/servers/${serverId}/schedules`, request);
  }

  updateSchedule(
    scheduleId: string,
    request: {
      name?: string;
      cron?: string;
      actions?: ScheduleAction[];
      enabled?: boolean;
    },
  ): Promise<Schedule> {
    return this.request("PATCH", `/api/v1/schedules/${scheduleId}`, request);
  }

  deleteSchedule(scheduleId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/schedules/${scheduleId}`);
  }

  runSchedule(scheduleId: string): Promise<{ accepted: boolean }> {
    return this.request("POST", `/api/v1/schedules/${scheduleId}/run`, {});
  }

  // files ------------------------------------------------------------------

  listFiles(serverId: string, path = "/"): Promise<FileList> {
    return this.request(
      "GET",
      `/api/v1/servers/${serverId}/files?path=${encodeURIComponent(path)}`,
    );
  }

  readFile(serverId: string, path: string): Promise<FileContent> {
    return this.request(
      "GET",
      `/api/v1/servers/${serverId}/files/content?path=${encodeURIComponent(path)}`,
    );
  }

  writeFile(
    serverId: string,
    path: string,
    content: string,
    encoding: "utf8" | "base64" = "utf8",
  ): Promise<FileEntry> {
    return this.request("PUT", `/api/v1/servers/${serverId}/files/content`, {
      path,
      content,
      encoding,
    });
  }

  mkdir(serverId: string, path: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/servers/${serverId}/files/mkdir`, { path });
  }

  renameFile(serverId: string, from: string, to: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/servers/${serverId}/files/rename`, { from, to });
  }

  chmodFile(serverId: string, path: string, mode: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/servers/${serverId}/files/chmod`, { path, mode });
  }

  deleteFile(serverId: string, path: string): Promise<{ ok: boolean }> {
    return this.request(
      "DELETE",
      `/api/v1/servers/${serverId}/files?path=${encodeURIComponent(path)}`,
    );
  }

  compressFile(serverId: string, path: string): Promise<FileEntry> {
    return this.request("POST", `/api/v1/servers/${serverId}/files/compress`, { path });
  }

  decompressFile(serverId: string, path: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/servers/${serverId}/files/decompress`, { path });
  }

  suspendServer(serverId: string): Promise<Server> {
    return this.request("POST", `/api/v1/servers/${serverId}/suspend`, {});
  }

  resumeServer(serverId: string): Promise<Server> {
    return this.request("POST", `/api/v1/servers/${serverId}/resume`, {});
  }

  // allocations ------------------------------------------------------------

  async listAllocations(params: { nodeId?: string; serverId?: string } = {}): Promise<Allocation[]> {
    const query = new URLSearchParams();
    if (params.nodeId) query.set("node_id", params.nodeId);
    if (params.serverId) query.set("server_id", params.serverId);
    const qs = query.toString();
    const suffix = qs.length > 0 ? `?${qs}` : "";
    const data = await this.request<{ allocations: Allocation[] }>("GET", `/api/v1/allocations${suffix}`);
    return data.allocations;
  }

  createAllocations(
    nodeId: string,
    request: CreateAllocationsRequest,
  ): Promise<{ created: number; requested: number; skipped: number }> {
    return this.request("POST", `/api/v1/nodes/${nodeId}/allocations`, request);
  }

  deleteAllocation(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/allocations/${id}`);
  }

  // templates --------------------------------------------------------------

  async listTemplates(): Promise<TemplateRecord[]> {
    const data = await this.request<{ templates: TemplateRecord[] }>("GET", "/api/v1/templates");
    return data.templates;
  }

  getTemplate(id: string): Promise<TemplateRecord> {
    return this.request("GET", `/api/v1/templates/${id}`);
  }

  async listTemplateVersions(id: string): Promise<TemplateVersionRecord[]> {
    const data = await this.request<{ versions: TemplateVersionRecord[] }>(
      "GET",
      `/api/v1/templates/${id}/versions`,
    );
    return data.versions;
  }

  publishTemplateVersion(
    id: string,
    request: PublishTemplateVersionRequest,
  ): Promise<TemplateRecord> {
    return this.request("POST", `/api/v1/templates/${id}/versions`, request);
  }

  importEgg(request: ImportEggRequest): Promise<ImportResult> {
    return this.request("POST", "/api/v1/templates", { save: true, ...request });
  }

  setAutoUpdate(
    id: string,
    policy: { enabled: boolean; channel: "stable" | "beta" | "dev" },
  ): Promise<TemplateRecord> {
    return this.request("PATCH", `/api/v1/templates/${id}`, { auto_update: policy });
  }

  deleteTemplate(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/templates/${id}`);
  }

  syncTemplateFeed(args: {
    feed: unknown;
    signature: string;
    publicKey: string;
    createMissing?: boolean;
  }): Promise<FeedResult> {
    return this.request("POST", "/api/v1/template-feeds", {
      feed: args.feed,
      signature: args.signature,
      public_key: args.publicKey,
      create_missing: args.createMissing ?? false,
    });
  }

  // servers ----------------------------------------------------------------

  async listServers(query: ServerQuery = {}): Promise<Server[]> {
    const params = new URLSearchParams();
    if (query.node_id) params.set("node_id", query.node_id);
    if (query.state) params.set("state", query.state);
    if (query.external_ref) params.set("external_ref", query.external_ref);
    if (query.name) params.set("name", query.name);
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.offset !== undefined) params.set("offset", String(query.offset));
    const qs = params.toString();
    const suffix = qs.length > 0 ? `?${qs}` : "";
    const data = await this.request<{ servers: Server[] }>("GET", `/api/v1/servers${suffix}`);
    return data.servers;
  }

  createServer(request: CreateServerRequest): Promise<ServerDetail> {
    return this.request("POST", "/api/v1/servers", request);
  }

  getServer(id: string): Promise<ServerDetail> {
    return this.request("GET", `/api/v1/servers/${id}`);
  }

  updateServer(id: string, request: UpdateServerRequest): Promise<Server> {
    return this.request("PATCH", `/api/v1/servers/${id}`, request);
  }

  deleteServer(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/servers/${id}`);
  }

  power(id: string, signal: PowerSignal): Promise<Job> {
    return this.request("POST", `/api/v1/servers/${id}/power`, { signal });
  }

  command(id: string, command: string): Promise<unknown> {
    return this.request("POST", `/api/v1/servers/${id}/command`, { command });
  }

  logs(id: string, lines = 200): Promise<LogChunk> {
    return this.request(
      "GET",
      `/api/v1/servers/${id}/logs?lines=${Math.max(1, Math.min(2000, Math.trunc(lines)))}`,
    );
  }

  stats(id: string): Promise<ServerStats> {
    return this.request("GET", `/api/v1/servers/${id}/stats`);
  }

  setLimits(id: string, limits: Limits): Promise<Server> {
    return this.request("PATCH", `/api/v1/servers/${id}`, { limits });
  }

  attachAllocation(id: string, allocationId: string): Promise<Allocation> {
    return this.request("POST", `/api/v1/servers/${id}/allocations`, { allocation_id: allocationId });
  }

  detachAllocation(id: string, allocationId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/servers/${id}/allocations/${allocationId}`);
  }

  reinstall(id: string): Promise<Job> {
    return this.request("POST", `/api/v1/servers/${id}/reinstall`, {});
  }

  async listJobs(id: string): Promise<Job[]> {
    const data = await this.request<{ jobs: Job[] }>("GET", `/api/v1/servers/${id}/jobs`);
    return data.jobs;
  }

  /**
   * Open the authenticated SSE log stream. The caller owns the response and
   * must consume/close `response.body`.
   */
  async logsStream(id: string): Promise<Response> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/servers/${id}/logs/stream`, {
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        accept: "text/event-stream",
      },
      signal: this.signal,
    });
    if (!response.ok) {
      let text = "";
      try { text = await response.text(); } catch { /* ignore */ }
      throw new IgniteContainersError(response.status, "unknown", text || `${response.status} ${response.statusText}`);
    }
    return response;
  }

  health(): Promise<{ status: string; service: string; version: string; uptime_seconds: number }> {
    return this.request("GET", "/healthz");
  }

  ready(): Promise<{ status: string; database: string }> {
    return this.request("GET", "/readyz");
  }

  openapi(): Promise<unknown> {
    return this.request("GET", "/openapi.json");
  }

  async docs(): Promise<string> {
    const response = await this.fetchImpl(`${this.baseUrl}/docs`, {
      headers: { authorization: `Bearer ${this.apiKey}` },
      signal: this.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "docs_failed", text);
    }
    return text;
  }

  async metrics(): Promise<string> {
    const response = await this.fetchImpl(`${this.baseUrl}/metrics`, {
      headers: { authorization: `Bearer ${this.apiKey}` },
      signal: this.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "unknown", text || `${response.status} ${response.statusText}`);
    }
    return text;
  }

  /**
   * Escape hatch for endpoints added before this client is regenerated.
   * `path` is relative to `/api/v1`, e.g. `/servers?limit=1`.
   */
  requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method.toUpperCase(), `/api/v1${path}`, body);
  }
}

export default IgniteContainersClient;
