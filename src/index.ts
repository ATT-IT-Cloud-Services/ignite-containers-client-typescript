import type {
  AdapterList,
  AddressQuery,
  CreateMeteringProfileRequest,
  CreateResourceGroupRequest,
  GrantTenantAccessRequest,
  ComposeConverted,
  ComposeDeployResult,
  BindExternalDatabaseRequest,
  CreateExternalDatabaseRequest,
  CreateStorageBackendRequest,
  CreateStorageGatewayTokenRequest,
  CreateVolumeRequest,
  DatabaseTest,
  DeployComposeRequest,
  ExternalDatabase,
  MountVolumeRequest,
  PodExternalDatabase,
  PodExternalDatabaseView,
  PodPortEvent,
  PodVolumeMount,
  PodVolumeMountView,
  CreatedStorageGatewayToken,
  StorageBackend,
  StorageGatewayToken,
  UpdateExternalDatabaseRequest,
  UpdateStorageBackendRequest,
  UpdateVolumeRequest,
  Volume,
  CreateGitCredentialRequest,
  CreateGitSourceRequest,
  CreatePodPortRequest,
  CreatedGitSource,
  GitBuild,
  GitCredential,
  GitSource,
  Image,
  MetricsArchive,
  MetricsArchiveReport,
  MetricsStoragePolicy,
  UpsertMetricsStoragePolicyRequest,
  UpdateGitSourceRequest,
  ImageCopy,
  ImagePull,
  PullImageRequest,
  PodPort,
  UploadImageRequest,
  UpdatePodPortRequest,
  CreateTenantRequest,
  CreateTransferKeyRequest,
  CreatedTransferKey,
  MeteringProfile,
  ReferenceAggregate,
  ResourceGroup,
  StartTransferRequest,
  Tenant,
  TenantTransfer,
  TransferKey,
  UpdateResourceGroupRequest,
  UpdateTenantRequest,
  UsageValue,
  Allocation,
  ApiKey,
  AuditEvent,
  BindIpRequest,
  Consumption,
  CreateAdapterRequest,
  CreateForwardRequest,
  CreateIpRequest,
  CreateProxyRouteRequest,
  CreateRuntimeGroupRequest,
  CreateWebhookRequest,
  CreatedWebhook,
  FloatingMode,
  IpAddress,
  IpKind,
  JobQuery,
  MeterUnit,
  MeterView,
  MeterViewRequest,
  ImportNestRequest,
  NestImportResult,
  PlatformSpec,
  PortForward,
  ProvisionConfirmation,
  ProxyAdapter,
  Revision,
  Rollout,
  RuntimeGroup,
  TransferAccepted,
  TransferRequest,
  UpdateForwardRequest,
  UpdateIpRequest,
  UpdatePolicy,
  UpdateRuntimeGroupRequest,
  UpdateWebhookRequest,
  UsageSample,
  UsageSummary,
  WebhookDelivery,
  WebhookSubscription,
  CreateVnetRequest,
  AttachVnetRequest,
  CreateInterconnectRequest,
  CreateListenerRequest,
  CreateListenerRouteRequest,
  ExportTemplateRequest,
  CloneTemplateRequest,
  ExportTemplateResult,
  CloneTemplateResult,
  Vnet,
  VnetAttachment,
  Interconnect,
  ProxyListener,
  ProxyListenerRoute,
  ProxyDeleteResult,
  ProxyMutation,
  ProxyReconcileResult,
  ProxyRoute,
  ProxyStatus,
  ProxyCertificate,
  ProxyCertificateMutation,
  ProxyCertificateDeleteResult,
  UploadProxyCertificateRequest,
  PublishTemplateVersionRequest,
  PodEnvironment,
  UpdateProxyRouteRequest,
  NodeState,
  CreateAllocationsRequest,
  CreateDatabaseHostRequest,
  CreateKeyRequest,
  CreateNodeRequest,
  CreatePodDatabaseRequest,
  CreatePodRequest,
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
  Pod,
  PodDatabase,
  PodDetail,
  PodQuery,
  PodStats,
  TemplateRecord,
  TemplateVersionRecord,
  UpdateNodeRequest,
  UpdatePodRequest,
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
    // Avoid a potentially quadratic regular expression on an
    // attacker-controlled base URL; strip trailing slashes linearly.
    let baseUrl = options.baseUrl;
    while (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    this.baseUrl = baseUrl;
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

  getPodEnvironment(id: string): Promise<PodEnvironment> {
    return this.request("GET", `/api/v1/pods/${id}/environment`);
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

  async listProxyCertificates(): Promise<ProxyCertificate[]> {
    const data = await this.request<{ certificates: ProxyCertificate[] }>(
      "GET",
      "/api/v1/proxy/certificates",
    );
    return data.certificates;
  }

  uploadProxyCertificate(request: UploadProxyCertificateRequest): Promise<ProxyCertificateMutation> {
    return this.request("POST", "/api/v1/proxy/certificates", request);
  }

  getProxyCertificate(id: string): Promise<ProxyCertificate> {
    return this.request("GET", `/api/v1/proxy/certificates/${id}`);
  }

  deleteProxyCertificate(id: string): Promise<ProxyCertificateDeleteResult> {
    return this.request("DELETE", `/api/v1/proxy/certificates/${id}`);
  }

  // network fabric ---------------------------------------------------------

  async listVnets(): Promise<Vnet[]> {
    const data = await this.request<{ vnets: Vnet[] }>("GET", "/api/v1/vnets");
    return data.vnets;
  }

  createVnet(request: CreateVnetRequest): Promise<Vnet> {
    return this.request("POST", "/api/v1/vnets", request);
  }

  deleteVnet(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/vnets/${id}`);
  }

  async listVnetAttachments(id: string): Promise<VnetAttachment[]> {
    const data = await this.request<{ attachments: VnetAttachment[] }>(
      "GET",
      `/api/v1/vnets/${id}/attachments`,
    );
    return data.attachments;
  }

  attachVnet(id: string, request: AttachVnetRequest): Promise<VnetAttachment> {
    return this.request("POST", `/api/v1/vnets/${id}/attachments`, request);
  }

  detachVnet(id: string, podId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/vnets/${id}/attachments/${podId}`);
  }

  async listInterconnects(): Promise<Interconnect[]> {
    const data = await this.request<{ interconnects: Interconnect[] }>(
      "GET",
      "/api/v1/interconnects",
    );
    return data.interconnects;
  }

  createInterconnect(request: CreateInterconnectRequest): Promise<Interconnect> {
    return this.request("POST", "/api/v1/interconnects", request);
  }

  deleteInterconnect(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/interconnects/${id}`);
  }

  async listListeners(): Promise<ProxyListener[]> {
    const data = await this.request<{ listeners: ProxyListener[] }>(
      "GET",
      "/api/v1/proxy/listeners",
    );
    return data.listeners;
  }

  createListener(request: CreateListenerRequest): Promise<ProxyListener> {
    return this.request("POST", "/api/v1/proxy/listeners", request);
  }

  deleteListener(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/proxy/listeners/${id}`);
  }

  async listListenerRoutes(id: string): Promise<ProxyListenerRoute[]> {
    const data = await this.request<{ routes: ProxyListenerRoute[] }>(
      "GET",
      `/api/v1/proxy/listeners/${id}/routes`,
    );
    return data.routes;
  }

  createListenerRoute(
    id: string,
    request: CreateListenerRouteRequest,
  ): Promise<ProxyListenerRoute> {
    return this.request("POST", `/api/v1/proxy/listeners/${id}/routes`, request);
  }

  deleteListenerRoute(id: string, routeId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/proxy/listeners/${id}/routes/${routeId}`);
  }

  exportTemplate(
    podId: string,
    request: ExportTemplateRequest,
  ): Promise<ExportTemplateResult> {
    return this.request("POST", `/api/v1/pods/${podId}/export-template`, request);
  }

  cloneTemplate(
    templateId: string,
    request: CloneTemplateRequest,
  ): Promise<CloneTemplateResult> {
    return this.request("POST", `/api/v1/templates/${templateId}/clone`, request);
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

  async listPodDatabases(podId: string): Promise<PodDatabase[]> {
    const data = await this.request<{ databases: PodDatabase[] }>(
      "GET",
      `/api/v1/pods/${podId}/databases`,
    );
    return data.databases;
  }

  createPodDatabase(
    podId: string,
    request: CreatePodDatabaseRequest = {},
  ): Promise<CreatedDatabase> {
    return this.request("POST", `/api/v1/pods/${podId}/databases`, request);
  }

  deletePodDatabase(podId: string, databaseId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${podId}/databases/${databaseId}`);
  }

  // sftp -------------------------------------------------------------------

  createSftpCredential(podId: string, ttlSeconds?: number): Promise<CreatedSftp> {
    return this.request("POST", `/api/v1/pods/${podId}/sftp`, {
      ttl_seconds: ttlSeconds,
    });
  }

  async listSftpCredentials(podId: string): Promise<SftpCredential[]> {
    const data = await this.request<{ credentials: SftpCredential[] }>(
      "GET",
      `/api/v1/pods/${podId}/sftp`,
    );
    return data.credentials;
  }

  revokeSftpCredential(podId: string, credentialId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${podId}/sftp/${credentialId}`);
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

  async bulkPower(podIds: string[], signal: PowerSignal): Promise<BulkResult[]> {
    const data = await this.request<{ results: BulkResult[] }>(
      "POST",
      "/api/v1/pods/bulk/power",
      { pod_ids: podIds, signal },
    );
    return data.results;
  }

  async bulkCommand(podIds: string[], command: string): Promise<BulkResult[]> {
    const data = await this.request<{ results: BulkResult[] }>(
      "POST",
      "/api/v1/pods/bulk/command",
      { pod_ids: podIds, command },
    );
    return data.results;
  }

  // backups ----------------------------------------------------------------

  async listBackups(podId: string): Promise<Backup[]> {
    const data = await this.request<{ backups: Backup[] }>(
      "GET",
      `/api/v1/pods/${podId}/backups`,
    );
    return data.backups;
  }

  createBackup(podId: string, name?: string): Promise<Backup> {
    return this.request("POST", `/api/v1/pods/${podId}/backups`, {
      name,
    });
  }

  deleteBackup(podId: string, backupId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${podId}/backups/${backupId}`);
  }

  restoreBackup(podId: string, backupId: string): Promise<Backup> {
    return this.request("POST", `/api/v1/pods/${podId}/backups/${backupId}/restore`, {});
  }

  async downloadBackup(podId: string, backupId: string): Promise<ArrayBuffer> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/pods/${podId}/backups/${backupId}/download`,
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

  // volume export / import ------------------------------------------------

  async downloadVolume(podId: string, path?: string): Promise<ArrayBuffer> {
    const query = path ? `?path=${encodeURIComponent(path)}` : "";
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/pods/${podId}/volume/export${query}`,
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

  async importVolume(
    podId: string,
    archive: Blob | ArrayBuffer | Uint8Array,
    options: { path?: string; wipe?: boolean } = {},
  ): Promise<{ ok: boolean; bytes: number }> {
    const path = options.path ?? "";
    const wipe = options.wipe ?? true;
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/pods/${podId}/volume/import?path=${encodeURIComponent(path)}&wipe=${wipe}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/gzip",
        },
        body: archive as unknown as BodyInit,
        signal: this.signal,
      },
    );
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "upload_failed", text);
    }
    return JSON.parse(text) as { ok: boolean; bytes: number };
  }

  // schedules --------------------------------------------------------------

  async listSchedules(podId: string): Promise<Schedule[]> {
    const data = await this.request<{ schedules: Schedule[] }>(
      "GET",
      `/api/v1/pods/${podId}/schedules`,
    );
    return data.schedules;
  }

  createSchedule(
    podId: string,
    request: { name: string; cron: string; actions: ScheduleAction[]; enabled?: boolean },
  ): Promise<Schedule> {
    return this.request("POST", `/api/v1/pods/${podId}/schedules`, request);
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

  listFiles(podId: string, path = "/"): Promise<FileList> {
    return this.request(
      "GET",
      `/api/v1/pods/${podId}/files?path=${encodeURIComponent(path)}`,
    );
  }

  readFile(podId: string, path: string): Promise<FileContent> {
    return this.request(
      "GET",
      `/api/v1/pods/${podId}/files/content?path=${encodeURIComponent(path)}`,
    );
  }

  writeFile(
    podId: string,
    path: string,
    content: string,
    encoding: "utf8" | "base64" = "utf8",
  ): Promise<FileEntry> {
    return this.request("PUT", `/api/v1/pods/${podId}/files/content`, {
      path,
      content,
      encoding,
    });
  }

  mkdir(podId: string, path: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/pods/${podId}/files/mkdir`, { path });
  }

  renameFile(podId: string, from: string, to: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/pods/${podId}/files/rename`, { from, to });
  }

  chmodFile(podId: string, path: string, mode: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/pods/${podId}/files/chmod`, { path, mode });
  }

  deleteFile(podId: string, path: string): Promise<{ ok: boolean }> {
    return this.request(
      "DELETE",
      `/api/v1/pods/${podId}/files?path=${encodeURIComponent(path)}`,
    );
  }

  compressFile(podId: string, path: string): Promise<FileEntry> {
    return this.request("POST", `/api/v1/pods/${podId}/files/compress`, { path });
  }

  decompressFile(podId: string, path: string): Promise<{ ok: boolean }> {
    return this.request("POST", `/api/v1/pods/${podId}/files/decompress`, { path });
  }

  suspendPod(podId: string): Promise<Pod> {
    return this.request("POST", `/api/v1/pods/${podId}/suspend`, {});
  }

  resumePod(podId: string): Promise<Pod> {
    return this.request("POST", `/api/v1/pods/${podId}/resume`, {});
  }

  // allocations ------------------------------------------------------------

  async listAllocations(params: { nodeId?: string; podId?: string } = {}): Promise<Allocation[]> {
    const query = new URLSearchParams();
    if (params.nodeId) query.set("node_id", params.nodeId);
    if (params.podId) query.set("pod_id", params.podId);
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

  // pods ----------------------------------------------------------------

  async listPods(query: PodQuery = {}): Promise<Pod[]> {
    const params = new URLSearchParams();
    if (query.node_id) params.set("node_id", query.node_id);
    if (query.state) params.set("state", query.state);
    if (query.external_ref) params.set("external_ref", query.external_ref);
    if (query.name) params.set("name", query.name);
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.offset !== undefined) params.set("offset", String(query.offset));
    const qs = params.toString();
    const suffix = qs.length > 0 ? `?${qs}` : "";
    const data = await this.request<{ pods: Pod[] }>("GET", `/api/v1/pods${suffix}`);
    return data.pods;
  }

  createPod(request: CreatePodRequest): Promise<PodDetail> {
    return this.request("POST", "/api/v1/pods", request);
  }

  getPod(id: string): Promise<PodDetail> {
    return this.request("GET", `/api/v1/pods/${id}`);
  }

  updatePod(id: string, request: UpdatePodRequest): Promise<Pod> {
    return this.request("PATCH", `/api/v1/pods/${id}`, request);
  }

  deletePod(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${id}`);
  }

  power(id: string, signal: PowerSignal): Promise<Job> {
    return this.request("POST", `/api/v1/pods/${id}/power`, { signal });
  }

  command(id: string, command: string): Promise<unknown> {
    return this.request("POST", `/api/v1/pods/${id}/command`, { command });
  }

  logs(id: string, lines = 200): Promise<LogChunk> {
    return this.request(
      "GET",
      `/api/v1/pods/${id}/logs?lines=${Math.max(1, Math.min(2000, Math.trunc(lines)))}`,
    );
  }

  stats(id: string): Promise<PodStats> {
    return this.request("GET", `/api/v1/pods/${id}/stats`);
  }

  setLimits(id: string, limits: Limits): Promise<Pod> {
    return this.request("PATCH", `/api/v1/pods/${id}`, { limits });
  }

  attachAllocation(id: string, allocationId: string): Promise<Allocation> {
    return this.request("POST", `/api/v1/pods/${id}/allocations`, { allocation_id: allocationId });
  }

  detachAllocation(id: string, allocationId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${id}/allocations/${allocationId}`);
  }

  reinstall(id: string): Promise<Job> {
    return this.request("POST", `/api/v1/pods/${id}/reinstall`, {});
  }

  async listJobs(id: string): Promise<Job[]> {
    const data = await this.request<{ jobs: Job[] }>("GET", `/api/v1/pods/${id}/jobs`);
    return data.jobs;
  }

  /**
   * Open the authenticated SSE log stream. The caller owns the response and
   * must consume/close `response.body`.
   */
  async logsStream(id: string): Promise<Response> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/pods/${id}/logs/stream`, {
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

  // runtime groups ---------------------------------------------------------

  async listDeploymentClasses(): Promise<RuntimeGroup[]> {
    const data = await this.request<{ groups: RuntimeGroup[] }>(
      "GET",
      "/api/v1/deployment-classes",
    );
    return data.groups;
  }

  createDeploymentClass(request: CreateRuntimeGroupRequest): Promise<RuntimeGroup> {
    return this.request("POST", "/api/v1/deployment-classes", request);
  }

  updateDeploymentClass(
    id: string,
    request: UpdateRuntimeGroupRequest,
  ): Promise<RuntimeGroup> {
    return this.request("PATCH", `/api/v1/deployment-classes/${id}`, request);
  }

  deleteDeploymentClass(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/deployment-classes/${id}`);
  }

  async listRuntimeGroups(): Promise<RuntimeGroup[]> {
    const data = await this.request<{ groups: RuntimeGroup[] }>(
      "GET",
      "/api/v1/runtime-groups",
    );
    return data.groups;
  }

  createRuntimeGroup(request: CreateRuntimeGroupRequest): Promise<RuntimeGroup> {
    return this.request("POST", "/api/v1/runtime-groups", request);
  }

  updateRuntimeGroup(
    id: string,
    request: UpdateRuntimeGroupRequest,
  ): Promise<RuntimeGroup> {
    return this.request("PATCH", `/api/v1/runtime-groups/${id}`, request);
  }

  deleteRuntimeGroup(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/runtime-groups/${id}`);
  }

  runtimeGroupUsage(id: string, from: string, to: string): Promise<UsageSummary> {
    const query = new URLSearchParams({ from, to });
    return this.request("GET", `/api/v1/runtime-groups/${id}/usage?${query.toString()}`);
  }

  // provision confirmation -------------------------------------------------

  podConfirmation(id: string, waitSeconds?: number): Promise<ProvisionConfirmation> {
    const suffix =
      waitSeconds === undefined
        ? ""
        : `?wait_seconds=${Math.max(0, Math.min(120, Math.trunc(waitSeconds)))}`;
    return this.request("GET", `/api/v1/pods/${id}/confirmation${suffix}`);
  }

  // addresses and port forwards --------------------------------------------

  async listIps(query: AddressQuery = {}): Promise<IpAddress[]> {
    const params = new URLSearchParams();
    if (query.node_id) params.set("node_id", query.node_id);
    if (query.pod_id) params.set("pod_id", query.pod_id);
    const encoded = params.toString();
    const data = await this.request<{ addresses: IpAddress[] }>(
      "GET",
      `/api/v1/ips${encoded ? `?${encoded}` : ""}`,
    );
    return data.addresses;
  }

  createIp(request: CreateIpRequest): Promise<IpAddress> {
    return this.request("POST", "/api/v1/ips", request);
  }

  getIp(id: string): Promise<IpAddress> {
    return this.request("GET", `/api/v1/ips/${id}`);
  }

  updateIp(id: string, request: UpdateIpRequest): Promise<IpAddress> {
    return this.request("PATCH", `/api/v1/ips/${id}`, request);
  }

  deleteIp(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/ips/${id}`);
  }

  async listForwards(query: AddressQuery = {}): Promise<PortForward[]> {
    const params = new URLSearchParams();
    if (query.node_id) params.set("node_id", query.node_id);
    if (query.pod_id) params.set("pod_id", query.pod_id);
    const encoded = params.toString();
    const data = await this.request<{ forwards: PortForward[] }>(
      "GET",
      `/api/v1/forwards${encoded ? `?${encoded}` : ""}`,
    );
    return data.forwards;
  }

  async listPodIps(id: string): Promise<IpAddress[]> {
    const data = await this.request<{ addresses: IpAddress[] }>(
      "GET",
      `/api/v1/pods/${id}/ips`,
    );
    return data.addresses;
  }

  bindPodIp(id: string, request: BindIpRequest): Promise<IpAddress> {
    return this.request("POST", `/api/v1/pods/${id}/ips`, request);
  }

  unbindPodIp(id: string, ipId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${id}/ips/${ipId}`);
  }

  async listPodForwards(id: string): Promise<PortForward[]> {
    const data = await this.request<{ forwards: PortForward[] }>(
      "GET",
      `/api/v1/pods/${id}/forwards`,
    );
    return data.forwards;
  }

  createPodForward(id: string, request: CreateForwardRequest): Promise<PortForward> {
    return this.request("POST", `/api/v1/pods/${id}/forwards`, request);
  }

  updatePodForward(
    id: string,
    forwardId: string,
    request: UpdateForwardRequest,
  ): Promise<PortForward> {
    return this.request("PATCH", `/api/v1/pods/${id}/forwards/${forwardId}`, request);
  }

  deletePodForward(id: string, forwardId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${id}/forwards/${forwardId}`);
  }

  // platform ---------------------------------------------------------------

  getPlatform(id: string): Promise<PlatformSpec> {
    return this.request("GET", `/api/v1/pods/${id}/platform`);
  }

  putPlatform(id: string, spec: PlatformSpec): Promise<PlatformSpec> {
    return this.request("PUT", `/api/v1/pods/${id}/platform`, spec);
  }

  // autonomous updates -----------------------------------------------------

  getUpdatePolicy(id: string): Promise<UpdatePolicy> {
    return this.request("GET", `/api/v1/pods/${id}/update-policy`);
  }

  putUpdatePolicy(id: string, policy: UpdatePolicy): Promise<UpdatePolicy> {
    return this.request("PUT", `/api/v1/pods/${id}/update-policy`, policy);
  }

  checkPodUpdates(id: string): Promise<{ accepted: boolean }> {
    return this.request("POST", `/api/v1/pods/${id}/updates/check`, {});
  }

  async listRevisions(id: string): Promise<Revision[]> {
    const data = await this.request<{ revisions: Revision[] }>(
      "GET",
      `/api/v1/pods/${id}/revisions`,
    );
    return data.revisions;
  }

  deleteRevision(id: string, revisionId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${id}/revisions/${revisionId}`);
  }

  pinRevision(id: string, revisionId: string, pinned = true): Promise<Revision> {
    return this.request("POST", `/api/v1/pods/${id}/revisions/${revisionId}/pin`, {
      pinned,
    });
  }

  async getRollout(id: string): Promise<Rollout | undefined> {
    const data = await this.request<{ rollout: Rollout | null }>(
      "GET",
      `/api/v1/pods/${id}/rollout`,
    );
    return data.rollout ?? undefined;
  }

  // metering ---------------------------------------------------------------

  getMeterView(scope: string, scopeId?: string): Promise<MeterView> {
    const params = new URLSearchParams({ scope });
    if (scopeId) params.set("scope_id", scopeId);
    return this.request("GET", `/api/v1/metering?${params.toString()}`);
  }

  setMeterView(request: MeterViewRequest): Promise<MeterView> {
    return this.request("PUT", "/api/v1/metering", request);
  }

  podUsage(id: string, from: string, to: string): Promise<UsageSummary> {
    const query = new URLSearchParams({ from, to });
    return this.request("GET", `/api/v1/pods/${id}/usage?${query.toString()}`);
  }

  async podUsageSamples(id: string, from: string, to: string): Promise<UsageSample[]> {
    const query = new URLSearchParams({ from, to });
    const data = await this.request<{ samples: UsageSample[] }>(
      "GET",
      `/api/v1/pods/${id}/usage/samples?${query.toString()}`,
    );
    return data.samples;
  }

  // jobs and transfer ------------------------------------------------------

  async listAllJobs(query: JobQuery = {}): Promise<Job[]> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.limit !== undefined) params.set("limit", String(Math.trunc(query.limit)));
    const encoded = params.toString();
    const data = await this.request<{ jobs: Job[] }>(
      "GET",
      `/api/v1/jobs${encoded ? `?${encoded}` : ""}`,
    );
    return data.jobs;
  }

  getJob(id: string): Promise<Job> {
    return this.request("GET", `/api/v1/jobs/${id}`);
  }

  retryJob(id: string): Promise<Job> {
    return this.request("POST", `/api/v1/jobs/${id}/retry`, {});
  }

  transferPod(id: string, request: TransferRequest): Promise<TransferAccepted> {
    return this.request("POST", `/api/v1/pods/${id}/transfer`, request);
  }

  // webhooks ---------------------------------------------------------------

  async listWebhooks(): Promise<WebhookSubscription[]> {
    const data = await this.request<{ webhooks: WebhookSubscription[] }>(
      "GET",
      "/api/v1/webhooks",
    );
    return data.webhooks;
  }

  createWebhook(request: CreateWebhookRequest): Promise<CreatedWebhook> {
    return this.request("POST", "/api/v1/webhooks", request);
  }

  updateWebhook(id: string, request: UpdateWebhookRequest): Promise<WebhookSubscription> {
    return this.request("PATCH", `/api/v1/webhooks/${id}`, request);
  }

  deleteWebhook(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/webhooks/${id}`);
  }

  async rotateWebhookSecret(id: string): Promise<string> {
    const data = await this.request<{ secret: string }>(
      "POST",
      `/api/v1/webhooks/${id}/rotate-secret`,
      {},
    );
    return data.secret;
  }

  async listWebhookDeliveries(id: string): Promise<WebhookDelivery[]> {
    const data = await this.request<{ deliveries: WebhookDelivery[] }>(
      "GET",
      `/api/v1/webhooks/${id}/deliveries`,
    );
    return data.deliveries;
  }

  // template nests ---------------------------------------------------------

  async importTemplateToml(toml: string): Promise<ImportResult> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/templates/import?save=true`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/toml",
        },
        body: toml,
        signal: this.signal,
      },
    );
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "import_failed", text);
    }
    return JSON.parse(text) as ImportResult;
  }

  async exportTemplateToml(id: string): Promise<string> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/templates/${id}/export?format=toml`,
      {
        headers: { authorization: `Bearer ${this.apiKey}` },
        signal: this.signal,
      },
    );
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "export_failed", text);
    }
    return text;
  }

  async convertCompose(yaml: string): Promise<ComposeConverted> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/compose/convert`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/yaml",
      },
      body: yaml,
      signal: this.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "convert_failed", text);
    }
    return JSON.parse(text) as ComposeConverted;
  }

  importNest(request: ImportNestRequest): Promise<NestImportResult> {
    return this.request("POST", "/api/v1/templates/nests", request);
  }

  // proxy adapters ---------------------------------------------------------

  listProxyAdapters(): Promise<AdapterList> {
    return this.request("GET", "/api/v1/proxy/adapters");
  }

  createProxyAdapter(request: CreateAdapterRequest): Promise<ProxyAdapter> {
    return this.request("POST", "/api/v1/proxy/adapters", request);
  }

  deleteProxyAdapter(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/proxy/adapters/${id}`);
  }

  // files and limits -------------------------------------------------------

  async downloadFile(podId: string, path: string): Promise<ArrayBuffer> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/pods/${podId}/files/download?path=${encodeURIComponent(path)}`,
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

  async uploadFile(
    podId: string,
    path: string,
    contents: Blob | ArrayBuffer | Uint8Array,
  ): Promise<FileEntry> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/api/v1/pods/${podId}/files/upload?path=${encodeURIComponent(path)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/octet-stream",
        },
        body: contents as unknown as BodyInit,
        signal: this.signal,
      },
    );
    const text = await response.text();
    if (!response.ok) {
      throw new IgniteContainersError(response.status, "upload_failed", text);
    }
    return JSON.parse(text) as FileEntry;
  }

  updateLimits(id: string, limits: Limits): Promise<Pod> {
    return this.request("PATCH", `/api/v1/pods/${id}/limits`, { limits });
  }

  deployCompose(request: DeployComposeRequest): Promise<ComposeDeployResult> {
    return this.request("POST", "/api/v1/compose/deploy", request);
  }

  // storage ----------------------------------------------------------------

  async listStorageBackends(tenantId?: string): Promise<StorageBackend[]> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    const data = await this.request<{ backends: StorageBackend[] }>(
      "GET",
      `/api/v1/storage/backends${suffix}`,
    );
    return data.backends;
  }

  createStorageBackend(request: CreateStorageBackendRequest): Promise<StorageBackend> {
    return this.request("POST", "/api/v1/storage/backends", request);
  }

  getStorageBackend(id: string): Promise<StorageBackend> {
    return this.request("GET", `/api/v1/storage/backends/${id}`);
  }

  updateStorageBackend(
    id: string,
    request: UpdateStorageBackendRequest,
  ): Promise<StorageBackend> {
    return this.request("PATCH", `/api/v1/storage/backends/${id}`, request);
  }

  deleteStorageBackend(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/storage/backends/${id}`);
  }

  async listVolumes(resourceGroupId?: string): Promise<Volume[]> {
    const suffix = resourceGroupId ? `?resource_group_id=${resourceGroupId}` : "";
    const data = await this.request<{ volumes: Volume[] }>(
      "GET",
      `/api/v1/storage/volumes${suffix}`,
    );
    return data.volumes;
  }

  createVolume(request: CreateVolumeRequest): Promise<Volume> {
    return this.request("POST", "/api/v1/storage/volumes", request);
  }

  getVolume(id: string): Promise<Volume> {
    return this.request("GET", `/api/v1/storage/volumes/${id}`);
  }

  updateVolume(id: string, request: UpdateVolumeRequest): Promise<Volume> {
    return this.request("PATCH", `/api/v1/storage/volumes/${id}`, request);
  }

  deleteVolume(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/storage/volumes/${id}`);
  }

  async listStorageGatewayTokens(tenantId: string): Promise<StorageGatewayToken[]> {
    const data = await this.request<{ tokens: StorageGatewayToken[] }>(
      "GET",
      `/api/v1/storage/gateway-tokens?tenant_id=${tenantId}`,
    );
    return data.tokens;
  }

  createStorageGatewayToken(
    request: CreateStorageGatewayTokenRequest,
  ): Promise<CreatedStorageGatewayToken> {
    return this.request("POST", "/api/v1/storage/gateway-tokens", request);
  }

  revokeStorageGatewayToken(id: string, tenantId: string): Promise<void> {
    return this.request(
      "DELETE",
      `/api/v1/storage/gateway-tokens/${id}?tenant_id=${tenantId}`,
    );
  }

  reportVolumeUsage(id: string, usedBytes: number): Promise<Volume> {
    return this.request("POST", `/api/v1/storage/volumes/${id}/usage`, {
      used_bytes: usedBytes,
    });
  }

  async listPodVolumes(podId: string): Promise<PodVolumeMountView[]> {
    const data = await this.request<{ mounts: PodVolumeMountView[] }>(
      "GET",
      `/api/v1/pods/${podId}/volumes`,
    );
    return data.mounts;
  }

  mountVolume(podId: string, request: MountVolumeRequest): Promise<PodVolumeMount> {
    return this.request("POST", `/api/v1/pods/${podId}/volumes`, request);
  }

  unmountVolume(podId: string, mountId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${podId}/volumes/${mountId}`);
  }

  async listExternalDatabases(tenantId?: string): Promise<ExternalDatabase[]> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    const data = await this.request<{ databases: ExternalDatabase[] }>(
      "GET",
      `/api/v1/external-databases${suffix}`,
    );
    return data.databases;
  }

  createExternalDatabase(request: CreateExternalDatabaseRequest): Promise<ExternalDatabase> {
    return this.request("POST", "/api/v1/external-databases", request);
  }

  getExternalDatabase(id: string): Promise<ExternalDatabase> {
    return this.request("GET", `/api/v1/external-databases/${id}`);
  }

  updateExternalDatabase(
    id: string,
    request: UpdateExternalDatabaseRequest,
  ): Promise<ExternalDatabase> {
    return this.request("PATCH", `/api/v1/external-databases/${id}`, request);
  }

  deleteExternalDatabase(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/external-databases/${id}`);
  }

  testExternalDatabase(id: string): Promise<DatabaseTest> {
    return this.request("POST", `/api/v1/external-databases/${id}/test`, {});
  }

  async listPodExternalDatabases(
    podId: string,
  ): Promise<PodExternalDatabaseView[]> {
    const data = await this.request<{ bindings: PodExternalDatabaseView[] }>(
      "GET",
      `/api/v1/pods/${podId}/external-databases`,
    );
    return data.bindings;
  }

  bindPodExternalDatabase(
    podId: string,
    request: BindExternalDatabaseRequest,
  ): Promise<PodExternalDatabase> {
    return this.request("POST", `/api/v1/pods/${podId}/external-databases`, request);
  }

  unbindPodExternalDatabase(podId: string, bindingId: string): Promise<void> {
    return this.request(
      "DELETE",
      `/api/v1/pods/${podId}/external-databases/${bindingId}`,
    );
  }

  // metrics storage --------------------------------------------------------

  getMetricsStoragePolicy(tenantId?: string): Promise<MetricsStoragePolicy> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    return this.request("GET", `/api/v1/metrics/storage-policy${suffix}`);
  }

  putMetricsStoragePolicy(
    request: UpsertMetricsStoragePolicyRequest,
    tenantId?: string,
  ): Promise<MetricsStoragePolicy> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    return this.request("PUT", `/api/v1/metrics/storage-policy${suffix}`, request);
  }

  async listMetricsArchives(tenantId?: string): Promise<MetricsArchive[]> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    const data = await this.request<{ archives: MetricsArchive[] }>(
      "GET",
      `/api/v1/metrics/archive${suffix}`,
    );
    return data.archives;
  }

  archiveMetrics(tenantId?: string): Promise<MetricsArchiveReport> {
    const suffix = tenantId ? `?tenant_id=${tenantId}` : "";
    return this.request("POST", `/api/v1/metrics/archive-now${suffix}`, {});
  }

  // git -------------------------------------------------------------------

  listGitCredentials(): Promise<GitCredential[]> {
    return this.request("GET", "/api/v1/git/credentials");
  }

  createGitCredential(request: CreateGitCredentialRequest): Promise<GitCredential> {
    return this.request("POST", "/api/v1/git/credentials", request);
  }

  getGitCredential(id: string): Promise<GitCredential> {
    return this.request("GET", `/api/v1/git/credentials/${id}`);
  }

  deleteGitCredential(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/git/credentials/${id}`);
  }

  listGitSources(): Promise<GitSource[]> {
    return this.request("GET", "/api/v1/git/sources");
  }

  createGitSource(request: CreateGitSourceRequest): Promise<CreatedGitSource> {
    return this.request("POST", "/api/v1/git/sources", request);
  }

  getGitSource(id: string): Promise<GitSource> {
    return this.request("GET", `/api/v1/git/sources/${id}`);
  }

  updateGitSource(id: string, request: UpdateGitSourceRequest): Promise<GitSource> {
    return this.request("PATCH", `/api/v1/git/sources/${id}`, request);
  }

  deleteGitSource(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/git/sources/${id}`);
  }

  triggerGitBuild(id: string, reference?: string): Promise<GitBuild> {
    return this.request("POST", `/api/v1/git/sources/${id}/build`, { reference });
  }

  async listGitBuilds(): Promise<GitBuild[]> {
    const data = await this.request<{ builds: GitBuild[] }>("GET", "/api/v1/git/builds");
    return data.builds;
  }

  getGitBuild(id: string): Promise<GitBuild> {
    return this.request("GET", `/api/v1/git/builds/${id}`);
  }

  // images ----------------------------------------------------------------

  async listImages(): Promise<Image[]> {
    const data = await this.request<{ images: Image[] }>("GET", "/api/v1/images");
    return data.images;
  }

  getImage(id: string): Promise<Image> {
    return this.request("GET", `/api/v1/images/${id}`);
  }

  imageCopies(id: string): Promise<ImageCopy[]> {
    return this.request("GET", `/api/v1/images/${id}/copies`);
  }

  imagePulls(id: string): Promise<ImagePull[]> {
    return this.request("GET", `/api/v1/images/${id}/pulls`);
  }

  imageUsage(): Promise<unknown[]> {
    return this.request("GET", "/api/v1/images/usage");
  }

  allImagePulls(): Promise<ImagePull[]> {
    return this.request("GET", "/api/v1/images/pulls");
  }

  pullImage(request: PullImageRequest): Promise<Image> {
    return this.request("POST", "/api/v1/images/pull", request);
  }

  uploadImage(request: UploadImageRequest): Promise<Image> {
    return this.request("POST", "/api/v1/images/upload", request);
  }

  deleteImage(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/images/${id}`);
  }

  // pod port bindings ---------------------------------------------------

  async listPodPorts(podId: string): Promise<PodPort[]> {
    const data = await this.request<{ ports: PodPort[] }>(
      "GET",
      `/api/v1/pods/${podId}/ports`,
    );
    return data.ports;
  }

  createPodPort(
    podId: string,
    request: CreatePodPortRequest,
  ): Promise<PodPort> {
    return this.request("POST", `/api/v1/pods/${podId}/ports`, request);
  }

  updatePodPort(
    podId: string,
    portId: string,
    request: UpdatePodPortRequest,
  ): Promise<PodPort> {
    return this.request(
      "PATCH",
      `/api/v1/pods/${podId}/ports/${portId}`,
      request,
    );
  }

  async podPortHistory(podId: string): Promise<PodPortEvent[]> {
    const data = await this.request<{ events: PodPortEvent[] }>(
      "GET",
      `/api/v1/pods/${podId}/ports/history`,
    );
    return data.events;
  }

  deletePodPort(podId: string, portId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/pods/${podId}/ports/${portId}`);
  }

  // tenants and resource groups -------------------------------------------

  listTenants(): Promise<Tenant[]> {
    return this.request("GET", "/api/v1/tenants");
  }

  createTenant(request: CreateTenantRequest): Promise<Tenant> {
    return this.request("POST", "/api/v1/tenants", request);
  }

  getTenant(id: string): Promise<Tenant> {
    return this.request("GET", `/api/v1/tenants/${id}`);
  }

  updateTenant(id: string, request: UpdateTenantRequest): Promise<Tenant> {
    return this.request("PATCH", `/api/v1/tenants/${id}`, request);
  }

  async listTenantAccess(tenantId: string): Promise<string[]> {
    const data = await this.request<{ api_key_ids: string[] }>(
      "GET",
      `/api/v1/tenants/${tenantId}/access`,
    );
    return data.api_key_ids;
  }

  async grantTenantAccess(
    tenantId: string,
    request: GrantTenantAccessRequest,
  ): Promise<string[]> {
    const data = await this.request<{ api_key_ids: string[] }>(
      "POST",
      `/api/v1/tenants/${tenantId}/access`,
      request,
    );
    return data.api_key_ids;
  }

  revokeTenantAccess(tenantId: string, keyId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/tenants/${tenantId}/access/${keyId}`);
  }

  listTenantResourceGroups(tenantId: string): Promise<ResourceGroup[]> {
    return this.request("GET", `/api/v1/tenants/${tenantId}/resource-groups`);
  }

  createResourceGroup(
    tenantId: string,
    request: CreateResourceGroupRequest,
  ): Promise<ResourceGroup> {
    return this.request("POST", `/api/v1/tenants/${tenantId}/resource-groups`, request);
  }

  listResourceGroups(): Promise<ResourceGroup[]> {
    return this.request("GET", "/api/v1/resource-groups");
  }

  getResourceGroup(id: string): Promise<ResourceGroup> {
    return this.request("GET", `/api/v1/resource-groups/${id}`);
  }

  updateResourceGroup(id: string, request: UpdateResourceGroupRequest): Promise<ResourceGroup> {
    return this.request("PATCH", `/api/v1/resource-groups/${id}`, request);
  }

  deleteResourceGroup(id: string): Promise<void> {
    return this.request("DELETE", `/api/v1/resource-groups/${id}`);
  }

  getReference(referenceId: string): Promise<ReferenceAggregate> {
    return this.request("GET", `/api/v1/references/${encodeURIComponent(referenceId)}`);
  }

  // transfers --------------------------------------------------------------

  createTransferKey(request: CreateTransferKeyRequest): Promise<CreatedTransferKey> {
    return this.request("POST", "/api/v1/transfer-keys", request);
  }

  listTransferKeys(tenantId: string): Promise<TransferKey[]> {
    return this.request("GET", `/api/v1/transfer-keys?tenant_id=${tenantId}`);
  }

  revokeTransferKey(id: string, tenantId: string): Promise<void> {
    return this.request("DELETE", `/api/v1/transfer-keys/${id}?tenant_id=${tenantId}`);
  }

  startTransfer(resourceGroupId: string, request: StartTransferRequest): Promise<TenantTransfer> {
    return this.request("POST", `/api/v1/resource-groups/${resourceGroupId}/transfer`, request);
  }

  listTransfers(resourceGroupId: string): Promise<TenantTransfer[]> {
    return this.request("GET", `/api/v1/resource-groups/${resourceGroupId}/transfers`);
  }

  getTransfer(id: string): Promise<TenantTransfer> {
    return this.request("GET", `/api/v1/transfers/${id}`);
  }

  cancelTransfer(id: string): Promise<TenantTransfer> {
    return this.request("POST", `/api/v1/transfers/${id}/cancel`, {});
  }

  dismissTransfer(id: string): Promise<TenantTransfer> {
    return this.request("POST", `/api/v1/transfers/${id}/dismiss`, {});
  }

  // usage and token profiles ----------------------------------------------

  usage(
    scope: string,
    scopeId: string,
    window: string,
    unit: "times" | "tokens" = "times",
    includeExact = false,
  ): Promise<UsageValue> {
    const params = new URLSearchParams({
      scope,
      scope_id: scopeId,
      window,
      unit,
      include_exact: String(includeExact),
    });
    return this.request("GET", `/api/v1/usage?${params.toString()}`);
  }

  listMeteringProfiles(): Promise<MeteringProfile[]> {
    return this.request("GET", "/api/v1/metering/profiles");
  }

  createMeteringProfile(request: CreateMeteringProfileRequest): Promise<MeteringProfile> {
    return this.request("POST", "/api/v1/metering/profiles", request);
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
   * `path` is relative to `/api/v1`, e.g. `/pods?limit=1`.
   */
  requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method.toUpperCase(), `/api/v1${path}`, body);
  }
}

export default IgniteContainersClient;
