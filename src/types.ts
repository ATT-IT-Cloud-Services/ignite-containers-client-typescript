export type Uuid = string;
export type Timestamp = string;

export type Scope =
  | "admin"
  | "apikey:read"
  | "apikey:write"
  | "audit:read"
  | "node:read"
  | "node:write"
  | "allocation:read"
  | "allocation:write"
  | "template:read"
  | "template:write"
  | "pod:read"
  | "pod:write"
  | "pod:power"
  | "pod:console"
  | "pod:files"
  | "pod:backup"
  | "pod:database"
  | "pod:sftp"
  | "pod:secrets"
  | "database:read"
  | "database:write"
  | "notification:send"
  | "notification:read"
  | "proxy:read"
  | "proxy:write"
  | "webhook:read"
  | "webhook:write"
  | "vnet:read"
  | "vnet:write"
  | "ip:read"
  | "ip:write"
  | "tenant:read"
  | "tenant:write"
  | "tenant:create"
  | "tenant:transfer"
  | "resource-group:read"
  | "resource-group:write"
  | "metering:read"
  | "metering:write"
  | "git:read"
  | "git:write";

export type NodeDriver = "docker" | "kubernetes" | "rusternetes";
export type NodeStatus = "pending" | "online" | "degraded" | "offline" | "maintenance";
export type PortProtocol = "tcp" | "udp" | "both";
export type PodState =
  | "installing"
  | "offline"
  | "starting"
  | "running"
  | "stopping"
  | "suspended"
  | "pending"
  | "unknown";
export type JobKind =
  | "create"
  | "delete"
  | "start"
  | "stop"
  | "restart"
  | "kill"
  | "command"
  | "reinstall"
  | "sync"
  | "update_template"
  | "transfer"
  | "rollout";
export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type PowerSignal = "start" | "stop" | "restart" | "kill";
export type Channel = "stable" | "beta" | "dev";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "power"
  | "command"
  | "import"
  | "revoke"
  | "login"
  | "read";

export interface AuditEvent {
  id: Uuid;
  api_key_id?: Uuid | null;
  action: AuditAction;
  resource: string;
  resource_id?: string | null;
  client_ip_hash?: string | null;
  metadata: unknown;
  created_at: Timestamp;
}

export interface PodEnvironment {
  environment: Record<string, string>;
}

export type ProxyTls = "auto" | "internal";

export interface Vnet {
  id: Uuid;
  name: string;
  cidr: string;
  gateway: string;
  scope: "node" | "cluster";
  node_id?: Uuid | null;
  internal: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface VnetAttachment {
  id: Uuid;
  vnet_id: Uuid;
  pod_id: Uuid;
  ip: string;
  created_at: Timestamp;
}

export interface RelayBackend {
  pod_id: Uuid;
  ip: string;
  port: number;
  weight?: number;
}

export interface RelayContract {
  listen: string;
  protocol: string;
  distribution: string;
  profile: string;
  sticky?: boolean;
  health_path?: string | null;
  vnet_id: Uuid;
  backends: RelayBackend[];
}

export interface InternalRelay {
  id: Uuid;
  pod_id: Uuid;
  vnet_id: Uuid;
  node_id: Uuid;
  resource_group_id?: Uuid | null;
  name: string;
  listen_port: number;
  backend_port: number;
  protocol: string;
  distribution: string;
  profile: string;
  image: string;
  startup: string;
  membership: string;
  member_pods?: Uuid[];
  weights?: Record<string, number>;
  health_path?: string | null;
  sticky?: boolean;
  proxy_route_id?: Uuid | null;
  enabled?: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface RelayDetail {
  relay: InternalRelay;
  address?: string | null;
  config: RelayContract;
}

export interface CreateRelayRequest {
  name: string;
  vnet_id: Uuid;
  node_id?: Uuid;
  resource_group_id?: Uuid;
  listen_port?: number;
  backend_port?: number;
  protocol?: string;
  distribution?: string;
  membership?: string;
  member_pod_ids?: Uuid[];
  weights?: Record<string, number>;
  image?: string;
  startup?: string;
  health_path?: string;
  sticky?: boolean;
  domain?: string;
  limits?: Limits;
}

export interface UpdateRelayRequest {
  listen_port?: number;
  backend_port?: number;
  protocol?: string;
  distribution?: string;
  membership?: string;
  member_pod_ids?: Uuid[];
  weights?: Record<string, number>;
  image?: string;
  startup?: string;
  health_path?: string;
  clear_health_path?: boolean;
  sticky?: boolean;
  enabled?: boolean;
}

export interface Interconnect {
  id: Uuid;
  name: string;
  vnet_id: Uuid;
  pod_ids: Uuid[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProxyListener {
  id: Uuid;
  name: string;
  node_id: Uuid;
  bind_ip: string;
  port: number;
  protocol: "tcp" | "udp";
  adapter: string;
  real_ip: string;
  velocity_secret?: string | null;
  enabled: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProxyListenerRoute {
  id: Uuid;
  listener_id: Uuid;
  match_kind: "exact" | "suffix" | "default";
  match_value: string;
  pod_id?: Uuid | null;
  upstream?: string | null;
  upstream_port?: number | null;
  auto_start: boolean;
  offline_motd: string;
  queue_timeout_seconds: number;
  enabled: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreateVnetRequest {
  name: string;
  cidr: string;
  gateway?: string;
  scope?: "node" | "cluster";
  node_id?: Uuid;
  internal?: boolean;
}

export interface AttachVnetRequest {
  pod_id: Uuid;
  ip?: string;
}

export interface CreateInterconnectRequest {
  name: string;
  vnet_id: Uuid;
  pod_ids?: Uuid[];
}

export interface CreateListenerRequest {
  name: string;
  node_id: Uuid;
  bind_ip?: string;
  port: number;
  protocol: "tcp" | "udp";
  adapter: string;
  real_ip?: string;
  velocity_secret?: string;
}

export interface CreateListenerRouteRequest {
  match_kind?: "exact" | "suffix" | "default";
  match_value?: string;
  pod_id?: Uuid;
  upstream?: string;
  upstream_port?: number;
  auto_start?: boolean;
  offline_motd?: string;
  queue_timeout_seconds?: number;
  enabled?: boolean;
}

export interface UpdateListenerRequest {
  name?: string;
  bind_ip?: string;
  port?: number;
  protocol?: "tcp" | "udp";
  adapter?: string;
  real_ip?: string;
  velocity_secret?: string;
  clear_velocity_secret?: boolean;
  enabled?: boolean;
}

export interface UpdateListenerRouteRequest {
  match_kind?: "exact" | "suffix" | "default";
  match_value?: string;
  pod_id?: Uuid;
  upstream?: string;
  upstream_port?: number;
  auto_start?: boolean;
  offline_motd?: string;
  queue_timeout_seconds?: number;
  enabled?: boolean;
}

export interface ExportTemplateRequest {
  slug: string;
  name?: string;
  description?: string;
  version: string;
  include_files?: boolean;
}

export interface CloneTemplateRequest {
  node_id: Uuid;
  name: string;
  description?: string;
  limits?: Limits;
  variables?: Record<string, string>;
  auto_allocations?: number;
  restore_files?: boolean;
}

export interface ExportTemplateResult {
  record: TemplateRecord;
  backup_id?: Uuid | null;
  snapshot_ready: boolean;
}

export interface CloneTemplateResult {
  pod: Pod;
  allocations: Allocation[];
  files_restored: boolean;
  warning?: string | null;
}

export interface ProxyRoute {
  id: Uuid;
  domain: string;
  upstream: string;
  pod_id?: Uuid | null;
  target_port?: number | null;
  tls: ProxyTls;
  enabled: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ProxyCertificateStatus = "valid" | "expiring" | "expired" | "not_yet_valid";

export interface ProxyCertificate {
  id: Uuid;
  domain: string;
  certificate_pem: string;
  subject: string;
  issuer: string;
  san: string[];
  serial: string;
  fingerprint_sha256: string;
  not_before: Timestamp;
  not_after: Timestamp;
  chain_length: number;
  days_remaining: number;
  status: ProxyCertificateStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UploadProxyCertificateRequest {
  domain: string;
  certificate_pem: string;
  private_key_pem: string;
}

export interface ProxyCertificateMutation {
  certificate: ProxyCertificate;
  replaced: boolean;
  applied: boolean;
  warning?: string | null;
}

export interface ProxyCertificateDeleteResult {
  deleted: boolean;
  applied: boolean;
  warning?: string | null;
}

export interface CreateProxyRouteRequest {
  domain: string;
  upstream?: string;
  pod_id?: Uuid;
  target_port?: number;
  tls?: ProxyTls;
  enabled?: boolean;
}

export interface UpdateProxyRouteRequest {
  domain?: string;
  upstream?: string;
  pod_id?: Uuid;
  target_port?: number;
  tls?: ProxyTls;
  enabled?: boolean;
}

export interface ProxyMutation {
  route: ProxyRoute;
  applied: boolean;
  warning?: string | null;
}

export interface ProxyDeleteResult {
  deleted: boolean;
  applied: boolean;
  warning?: string | null;
}

export interface ProxyStatus {
  configured: boolean;
  admin_url?: string | null;
  reachable: boolean;
  routes: number;
  certificates: number;
  error?: string | null;
  nodes: ProxyNodeStatus[];
}

export interface ProxyNodeStatus {
  node_id: Uuid;
  node_name: string;
  bind_ip: string;
  enabled: boolean;
  admin_url?: string | null;
  reachable: boolean;
  error?: string | null;
}

export interface ProxyReconcileResult {
  configured: boolean;
  applied: boolean;
  routes: number;
  certificates: number;
  warning?: string | null;
  caddy?: unknown;
  nodes: ProxyNodeApply[];
}

export interface ProxyNodeApply {
  node_id: Uuid;
  node_name: string;
  applied: boolean;
  error?: string | null;
}

export interface ProxyNode {
  node_id: Uuid;
  admin_url: string;
  bind_ip: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertProxyNodeRequest {
  admin_url: string;
  bind_ip: string;
  enabled?: boolean;
}

export interface ProxyNodeMutation {
  node: ProxyNode;
  applied: boolean;
  warning?: string | null;
}

export interface ProxyNodeDeleteResult {
  deleted: boolean;
  applied: boolean;
  warning?: string | null;
}

export interface DesiredPod {
  id: Uuid;
  name: string;
  image: string;
  environment: Record<string, string>;
  [key: string]: unknown;
}

export interface NodeState {
  protocol_version: number;
  node_id: Uuid;
  revision: number;
  generated_at: Timestamp;
  pods: DesiredPod[];
}

export interface NodeCapacity {
  memory_mb: number;
  disk_mb: number;
  cpu_millis: number;
}

export interface Limits {
  memory_mb: number;
  disk_mb: number;
  cpu_millis: number;
  swap_mb: number;
  io_weight: number;
  pids_limit: number;
  cpuset?: string | null;
}

export interface Node {
  id: Uuid;
  name: string;
  fqdn: string;
  endpoint: string;
  driver: NodeDriver;
  status: NodeStatus;
  maintenance: boolean;
  labels: Record<string, string>;
  capacity: NodeCapacity;
  last_heartbeat_at?: Timestamp | null;
  agent_version?: string | null;
  host_updates_supported: boolean;
  updates_available: number;
  reboot_required: boolean;
  host_updates_auto_reboot: boolean;
  last_update_check?: Timestamp | null;
  last_update_apply?: Timestamp | null;
  host_update_error?: string | null;
  runtime_group_id?: Uuid | null;
  dedicated_tenant_id?: Uuid | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface NodeWithToken extends Node {
  agent_token: string;
}

export interface Allocation {
  id: Uuid;
  node_id: Uuid;
  ip: string;
  port: number;
  protocol: PortProtocol;
  pod_id?: Uuid | null;
  primary: boolean;
  label?: string | null;
  created_at: Timestamp;
}

export interface ApiKeyLimits {
  max_pods?: number;
  max_memory_mb?: number;
  max_disk_mb?: number;
  max_cpu_millis?: number;
}

export interface ApiKey {
  id: Uuid;
  name: string;
  prefix: string;
  scopes: Scope[];
  pod_ids: Uuid[];
  labels?: Record<string, string>;
  rate_limit_per_minute?: number | null;
  limits?: ApiKeyLimits;
  expires_at?: Timestamp | null;
  last_used_at?: Timestamp | null;
  revoked_at?: Timestamp | null;
  created_at: Timestamp;
}

export interface CreatedKey {
  key: ApiKey;
  token: string;
}

export interface Pod {
  id: Uuid;
  node_id: Uuid;
  template_id: Uuid;
  template_version: string;
  name: string;
  description: string;
  external_ref?: string | null;
  idempotency_key?: string | null;
  created_by_key_id?: Uuid | null;
  cap_add: string[];
  devices: string[];
  labels: Record<string, string>;
  image: string;
  startup: string;
  limits: Limits;
  stop?: {
    kind: "command" | "signal";
    value: string;
    timeout_seconds: number;
  } | null;
  state: PodState;
  desired_running: boolean;
  suspended: boolean;
  generation: number;
  container_id?: string | null;
  primary_allocation_id?: Uuid | null;
  last_error?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PodDetail extends Pod {
  allocations: Allocation[];
  confirmation?: ProvisionConfirmation | null;
}

export interface Job {
  id: Uuid;
  node_id: Uuid;
  pod_id?: Uuid | null;
  kind: JobKind;
  payload: unknown;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  last_error?: string | null;
  result?: unknown;
  created_at: Timestamp;
  updated_at: Timestamp;
  completed_at?: Timestamp | null;
}

export interface AutoUpdate {
  enabled: boolean;
  channel: Channel;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  default: string;
  user_viewable: boolean;
  user_editable: boolean;
  rules: string;
  field_type?: string | null;
}

export interface Template {
  schema: string;
  meta: {
    name: string;
    slug: string;
    author: string;
    description: string;
    version: string;
    features: string[];
    source: {
      origin: "egg" | "manual";
      egg_author?: string | null;
      egg_version?: string | null;
      update_url?: string | null;
      imported_at?: Timestamp | null;
    };
  };
  runtime: {
    images: Record<string, string>;
    startup: string;
    stop: { kind: "command" | "signal"; value: string; timeout_seconds: number };
    detection: { kind: "log_line" | "port_open" | "immediate"; value?: string | null; timeout_seconds: number };
    install: {
      enabled: boolean;
      image?: string | null;
      entrypoint?: string | null;
      script?: string | null;
      timeout_seconds: number;
    };
    shell: "auto" | "never" | "always";
  };
  variables: TemplateVariable[];
  config_files: Array<{
    path: string;
    parser: "properties" | "yaml" | "json" | "xml" | "file";
    replacements: Record<string, string>;
  }>;
  file_denylist: string[];
  ports: { primary_env: string; default_protocol: PortProtocol; max_additional: number };
}

export interface TemplateVersionRecord {
  id: Uuid;
  template_id: Uuid;
  version: string;
  channel: Channel;
  template: Template;
  digest: string;
  signature?: string | null;
  public_key?: string | null;
  notes: string;
  created_at: Timestamp;
}

export interface PublishTemplateVersionRequest {
  template: Template;
  channel?: Channel;
  notes?: string;
  signature?: string;
  public_key?: string;
}

export interface TemplateRecord {
  id: Uuid;
  slug: string;
  name: string;
  description: string;
  auto_update: AutoUpdate;
  latest_version?: TemplateVersionRecord | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ImportResult {
  saved: boolean;
  template: Template;
  record?: TemplateRecord | null;
}

export interface LogChunk {
  pod_id: Uuid;
  cursor: string;
  lines: string[];
  truncated: boolean;
}

export interface PodStats {
  pod_id: Uuid;
  cpu_percent: number;
  memory_bytes: number;
  memory_limit_bytes: number;
  disk_bytes: number;
  disk_limit_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  pids: number;
  uptime_seconds: number;
  state: PodState;
  sampled_at: Timestamp;
}

export interface Me {
  key_id: Uuid;
  name: string;
  scopes: Scope[];
  pod_ids: Uuid[];
  expires_at?: Timestamp | null;
}

export interface HostUpdateStatus {
  supported: boolean;
  updates_available: number;
  reboot_required: boolean;
  auto_reboot: boolean;
  checked_at?: Timestamp | null;
  applied_at?: Timestamp | null;
  last_error?: string | null;
}

export interface DatabaseHost {
  id: Uuid;
  name: string;
  host: string;
  port: number;
  admin_user: string;
  max_databases: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PodDatabase {
  id: Uuid;
  pod_id: Uuid;
  host_id: Uuid;
  database_name: string;
  username: string;
  remote: string;
  created_at: Timestamp;
}

export interface CreatedDatabase extends PodDatabase {
  password: string;
  /** Connection host, not the same as `host_id`. */
  host: string;
  port: number;
}

export interface CreateDatabaseHostRequest {
  name: string;
  host: string;
  port?: number;
  admin_user: string;
  admin_password: string;
  max_databases?: number;
}

export interface CreatePodDatabaseRequest {
  host_id?: Uuid;
  remote?: string;
}

export type BackupState = "creating" | "completed" | "failed" | "restoring";

export interface Backup {
  id: Uuid;
  pod_id: Uuid;
  name: string;
  bytes: number;
  checksum: string;
  state: BackupState;
  error?: string | null;
  created_at: Timestamp;
  completed_at?: Timestamp | null;
}

export type ScheduleActionKind = "power" | "command" | "backup";

export interface ScheduleAction {
  type: ScheduleActionKind;
  signal?: PowerSignal;
  command?: string;
  name?: string;
}

export interface Schedule {
  id: Uuid;
  pod_id: Uuid;
  name: string;
  cron: string;
  actions: ScheduleAction[];
  enabled: boolean;
  last_run_at?: Timestamp | null;
  next_run_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  is_symlink: boolean;
  size: number;
  modified_at?: Timestamp | null;
  mode?: number | null;
  etag?: string | null;
}

export interface FileList {
  path: string;
  entries: FileEntry[];
}

export interface FileContent {
  path: string;
  encoding: "utf8" | "base64";
  content: string;
  size: number;
  truncated: boolean;
  etag?: string | null;
}

export interface BulkResult {
  pod_id: Uuid;
  success: boolean;
  error?: string | null;
  job_id?: Uuid | null;
}

export type EmailStatus = "queued" | "sending" | "sent" | "failed";

export interface EmailMessage {
  id: Uuid;
  recipients: string[];
  subject: string;
  body: string;
  status: EmailStatus;
  attempts: number;
  max_attempts: number;
  last_error?: string | null;
  next_attempt_at?: Timestamp | null;
  created_at: Timestamp;
  sent_at?: Timestamp | null;
}

export interface SftpCredential {
  id: Uuid;
  pod_id: Uuid;
  username: string;
  expires_at: Timestamp;
  revoked_at?: Timestamp | null;
  created_at: Timestamp;
}

export interface CreatedSftp extends SftpCredential {
  host: string;
  port: number;
  password: string;
}

export interface EmailConfig {
  enabled: boolean;
  from?: string | null;
  recipients: string[];
  tls?: string | null;
}

export interface FeedResult {
  published: Array<{ slug: string; version: string }>;
  skipped: Array<{ slug: string; reason: string }>;
}

export interface CreateNodeRequest {
  name: string;
  fqdn: string;
  endpoint: string;
  driver?: NodeDriver;
  maintenance?: boolean;
  labels?: Record<string, string>;
  capacity?: NodeCapacity;
  agent_token?: string;
  runtime_group_id?: Uuid;
  dedicated_tenant_id?: Uuid;
}

export interface UpdateNodeRequest {
  name?: string;
  fqdn?: string;
  endpoint?: string;
  driver?: NodeDriver;
  maintenance?: boolean;
  labels?: Record<string, string>;
  runtime_group_id?: Uuid;
  clear_runtime_group?: boolean;
  dedicated_tenant_id?: Uuid;
  clear_dedicated_tenant?: boolean;
}

export interface CreateAllocationsRequest {
  ip?: string;
  ports?: string;
  start?: number;
  end?: number;
  protocol?: PortProtocol;
  label?: string;
}

export interface CreatePodRequest {
  node_id?: Uuid;
  runtime_group_id?: Uuid;
  auto_start?: boolean;
  cap_add?: string[];
  devices?: string[];
  /** Omit together with `image` to start a plain container image. */
  template_id?: Uuid;
  template_version?: string;
  name: string;
  description?: string;
  external_ref?: string;
  idempotency_key?: string;
  labels?: Record<string, string>;
  image?: string;
  variables?: Record<string, string>;
  limits?: Limits;
  stop?: {
    kind: "command" | "signal";
    value: string;
    timeout_seconds: number;
  };
  allocations?: Uuid[];
  auto_allocations?: number;
  protocol?: PortProtocol;
}

export interface UpdatePodRequest {
  name?: string;
  description?: string;
  external_ref?: string;
  idempotency_key?: string;
  cap_add?: string[];
  devices?: string[];
  labels?: Record<string, string>;
  image?: string;
  variables?: Record<string, string>;
  limits?: Limits;
  template_version?: string;
}

export interface PodQuery {
  node_id?: Uuid;
  state?: PodState;
  external_ref?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface CreateKeyRequest {
  name: string;
  scopes: Scope[];
  pod_ids?: Uuid[];
  limits?: ApiKeyLimits;
  expires_at?: Timestamp;
}

export interface ImportEggRequest {
  egg: unknown;
  version?: string;
  channel?: Channel;
  slug?: string;
  save?: boolean;
  signature?: string;
  public_key?: string;
}

// runtime groups ---------------------------------------------------------

export type ConfirmationStatus =
  | "pending"
  | "installing"
  | "created"
  | "started"
  | "failed";

export interface RuntimeGroup {
  id: Uuid;
  slug: string;
  name: string;
  description: string;
  tenant_id?: Uuid | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreateRuntimeGroupRequest {
  slug: string;
  name: string;
  description?: string;
  tenant_id?: Uuid;
}

export interface UpdateRuntimeGroupRequest {
  name?: string;
  description?: string;
  tenant_id?: Uuid;
  clear_tenant?: boolean;
}

export interface ProvisionConfirmation {
  id: Uuid;
  pod_id: Uuid;
  node_id: Uuid;
  runtime_group_id?: Uuid | null;
  auto_start: boolean;
  status: ConfirmationStatus;
  success?: boolean | null;
  message: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// addresses and port forwards --------------------------------------------

export type IpKind = "shared" | "floating";
export type FloatingMode = "nat" | "direct";

export interface IpAddress {
  id: Uuid;
  ip: string;
  prefix: number;
  kind: IpKind;
  node_id?: Uuid | null;
  pod_id?: Uuid | null;
  target_ip?: string | null;
  mode: FloatingMode;
  primary: boolean;
  label?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PortForward {
  id: Uuid;
  node_id: Uuid;
  pod_id: Uuid;
  external_ip: string;
  external_port: number;
  protocol: PortProtocol;
  internal_ip: string;
  internal_port: number;
  label?: string | null;
  created_at: Timestamp;
}

export interface AddressQuery {
  node_id?: Uuid;
  pod_id?: Uuid;
}

export interface CreateIpRequest {
  ip: string;
  prefix?: number;
  kind: IpKind;
  node_id?: Uuid;
  pod_id?: Uuid;
  target_ip?: string;
  mode?: FloatingMode;
  primary?: boolean;
  label?: string;
}

export interface UpdateIpRequest {
  node_id?: Uuid;
  pod_id?: Uuid;
  unbind?: boolean;
  target_ip?: string;
  mode?: FloatingMode;
  primary?: boolean;
  label?: string;
  clear_label?: boolean;
}

export interface BindIpRequest {
  ip_id?: Uuid;
  ip?: string;
  target_ip?: string;
  mode?: FloatingMode;
  primary?: boolean;
  label?: string;
}

export interface CreateForwardRequest {
  external_ip: string;
  external_port: number;
  protocol?: PortProtocol;
  internal_ip?: string;
  internal_port: number;
  label?: string;
}

export interface UpdateForwardRequest {
  external_ip?: string;
  external_port?: number;
  protocol?: PortProtocol;
  internal_ip?: string;
  internal_port?: number;
  label?: string;
  clear_label?: boolean;
}

// platform ---------------------------------------------------------------

export interface PrometheusSpec {
  enabled: boolean;
  path: string;
  port?: number | null;
  interval: string;
  scheme: string;
}

export interface KedaTrigger {
  type: string;
  metric_type?: string;
  metadata: Record<string, string>;
}

export interface KedaSpec {
  enabled: boolean;
  min_replicas: number;
  max_replicas: number;
  polling_interval_seconds: number;
  cooldown_seconds: number;
  triggers: KedaTrigger[];
}

export interface KnativeSpec {
  enabled: boolean;
  min_scale: number;
  max_scale: number;
  concurrency: number;
  timeout_seconds: number;
  visibility: string;
}

export interface ArgoCdSpec {
  enabled: boolean;
  project: string;
  repo_url: string;
  path: string;
  target_revision: string;
  namespace: string;
  manage_workload: boolean;
  automated: boolean;
}

export interface PlatformSpec {
  prometheus: PrometheusSpec;
  keda: KedaSpec;
  knative: KnativeSpec;
  argocd: ArgoCdSpec;
}

// autonomous updates -----------------------------------------------------

export type UpdateSourceKind = "docker_image" | "github_tag";
export type RetentionMode = "sliding" | "pin_oldest";
export type Activation = "immediate" | "hold_latest";

export interface UpdateSource {
  kind: UpdateSourceKind;
  reference: string;
  tag?: string;
  dockerfile?: string;
}

export interface RetentionPolicy {
  mode: RetentionMode;
  keep: number;
}

export interface RolloutPolicy {
  steps: number[];
  step_seconds: number;
}

export interface UpdatePolicy {
  enabled: boolean;
  interval_seconds: number;
  sources: UpdateSource[];
  rollout: RolloutPolicy;
  retention: RetentionPolicy;
  activation: Activation;
}

export interface Revision {
  id: Uuid;
  source: string;
  reference: string;
  version: string;
  image: string;
  status: string;
  pinned: boolean;
  created_at: Timestamp;
}

export interface Rollout {
  id: Uuid;
  revision_id: Uuid;
  job_id?: Uuid | null;
  weight: number;
  status: string;
  message: string;
  step_index: number;
}

// metering ---------------------------------------------------------------

export type MeterUnit = "times" | "tokens";

export interface MeterView {
  scope: string;
  scope_id?: Uuid | null;
  unit: MeterUnit;
}

export interface MeterViewRequest {
  scope: string;
  scope_id?: Uuid;
  unit: MeterUnit;
}

export interface ConsumptionLine {
  meter: string;
  quantity: number;
  unit: string;
}

export interface Consumption {
  unit: MeterUnit;
  lines: ConsumptionLine[];
}

export interface UsageWindow {
  interval_seconds: number;
  gaps: number;
  cpu_millis_seconds: number;
  memory_byte_seconds: number;
  disk_byte_seconds: number;
  io_bytes: number;
  net_internal_bytes: number;
  net_external_bytes: number;
  net_ingress_bytes: number;
  net_egress_bytes: number;
  net_unsplit_bytes: number;
  image_storage_byte_seconds: number;
  storage_byte_seconds: number;
  storage_ingress_bytes: number;
  storage_egress_bytes: number;
  backup_storage_byte_seconds: number;
  backup_count: number;
  image_pull_bytes: number;
  image_pull_count: number;
  replica_seconds: number;
  cold_starts: number;
  at_rest_seconds: number;
}

export interface PodUsage {
  pod_id: Uuid;
  unit: MeterUnit;
  consumption: Consumption;
  usage: UsageWindow;
}

export interface UsageSummary {
  subject: string;
  id?: Uuid | null;
  from: Timestamp;
  to: Timestamp;
  unit: MeterUnit;
  consumption: Consumption;
  usage: UsageWindow;
  pods?: PodUsage[];
}

export interface UsageSample {
  sampled_at: Timestamp;
  cpu_millis: number;
  memory_bytes: number;
  disk_bytes: number;
  replicas: number;
  at_rest: boolean;
  block_read_bytes: number;
  block_write_bytes: number;
  net_rx_bytes: number;
  net_tx_bytes: number;
  net_internal_rx_bytes: number;
  net_internal_tx_bytes: number;
  network_split: boolean;
  autoscaler: string;
}

export interface UsageRangeQuery {
  from: Timestamp;
  to: Timestamp;
}

// billing report ---------------------------------------------------------

export interface BillingCoverage {
  requested_from_ms: number;
  requested_to_ms: number;
  effective_from_ms: number;
  effective_to_ms: number;
  first_sample_ms?: number | null;
  last_sample_ms?: number | null;
  interval_seconds: number;
  gaps: number;
  complete: boolean;
}

export interface BillingVolumeTotals {
  count: number;
  attached_count: number;
  unattached_count: number;
  provisioned_byte_seconds: number;
  used_bytes: number;
  used_byte_seconds: number;
  ingress_bytes: number;
  egress_bytes: number;
}

export interface BillingPortTotals {
  declared_current: number;
  allocated_current: number;
  forwarded_current: number;
  port_seconds: number;
  created: number;
  updated: number;
  deleted: number;
}

export interface BillingBuildTotals {
  count: number;
  succeeded: number;
  failed: number;
  running: number;
  queued: number;
  cancelled: number;
  duration_ms: number;
  duration_micros: number;
  measured_count: number;
  build_ms: number;
  build_micros: number;
  cpu_millis: number;
  cpu_micros: number;
  memory_byte_seconds: number;
  memory_byte_millis: number;
  memory_byte_micros: string;
  max_peak_memory_bytes: number;
  disk_read_bytes: number;
  disk_write_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  context_bytes: number;
  image_bytes: number;
}

export interface BillingImageTotals {
  count: number;
  stored_bytes: number;
  copy_bytes: number;
  pull_bytes: number;
  pull_count: number;
}

export interface BillingBackupTotals {
  count: number;
  current: number;
  created: number;
  completed: number;
  deleted: number;
  stored_bytes: number;
  stored_byte_seconds: number;
}

export interface BillingTotals {
  pod_usage: UsageWindow;
  volumes: BillingVolumeTotals;
  ports: BillingPortTotals;
  builds: BillingBuildTotals;
  images: BillingImageTotals;
  backups: BillingBackupTotals;
}

export interface BillingDeclaredPort {
  port_id: Uuid;
  container_port: number;
  host_ip?: string | null;
  host_port?: number | null;
  protocol: string;
  exposure: string;
  label?: string | null;
  created_at_ms: number;
}

export interface BillingAllocatedPort {
  allocation_id: Uuid;
  ip: string;
  port: number;
  protocol: string;
  primary: boolean;
  label?: string | null;
  created_at_ms: number;
}

export interface BillingForwardedPort {
  forward_id: Uuid;
  external_ip: string;
  external_port: number;
  protocol: string;
  internal_ip: string;
  internal_port: number;
  label?: string | null;
  created_at_ms: number;
}

export interface BillingPodPorts {
  declared_current: number;
  allocated_current: number;
  forwarded_current: number;
  port_seconds: number;
  created: number;
  updated: number;
  deleted: number;
  declared: BillingDeclaredPort[];
  allocated: BillingAllocatedPort[];
  forwarded: BillingForwardedPort[];
}

export interface BillingPod {
  pod_id: Uuid;
  resource_group_id: Uuid;
  name: string;
  external_ref?: string | null;
  reference_id?: string | null;
  coverage: BillingCoverage;
  usage: UsageWindow;
  ports: BillingPodPorts;
}

export interface BillingVolumeMount {
  pod_id: Uuid;
  mount_path: string;
  read_only: boolean;
  created_at_ms: number;
}

export interface BillingVolume {
  volume_id: Uuid;
  resource_group_id: Uuid;
  name: string;
  storage_class: string;
  reference_id?: string | null;
  provisioned_mb: number;
  max_size_mb: number;
  auto_scale: boolean;
  used_bytes: number;
  last_used_at_ms?: number | null;
  attached: boolean;
  attribution: string;
  mounts: BillingVolumeMount[];
  provisioned_byte_seconds: number;
  used_byte_seconds: number;
  ingress_bytes: number;
  egress_bytes: number;
  coverage: BillingCoverage;
  used_coverage: BillingCoverage;
}

export interface BillingBuild {
  build_id: Uuid;
  source_id: Uuid;
  pod_id: Uuid;
  resource_group_id: Uuid;
  status: string;
  reference: string;
  commit_sha?: string | null;
  image?: string | null;
  error?: string | null;
  created_at_ms: number;
  started_at_ms?: number | null;
  finished_at_ms?: number | null;
  queue_ms?: number | null;
  queue_micros?: number | null;
  duration_ms?: number | null;
  duration_micros?: number | null;
  usage?: BuildUsage | null;
  coverage: BillingCoverage;
}

export interface BillingImage {
  image_id: Uuid;
  reference: string;
  digest: string;
  reference_id?: string | null;
  owned_by_resource_group: boolean;
  stored_bytes: number;
  copy_bytes: number;
  pull_bytes: number;
  pull_count: number;
  created_at_ms: number;
  updated_at_ms: number;
}

export interface BillingBackup {
  backup_id: Uuid;
  pod_id: Uuid;
  name: string;
  stored_bytes: number;
  stored_byte_seconds: number;
  created_at_ms: number;
  completed_at_ms?: number | null;
  deleted_at_ms?: number | null;
  deleted: boolean;
  coverage: BillingCoverage;
}

export interface BillingResourceGroup {
  resource_group_id: Uuid;
  tenant_id: Uuid;
  name: string;
  slug: string;
  reference_id?: string | null;
  coverage: BillingCoverage;
  totals: BillingTotals;
  pods: BillingPod[];
  volumes: BillingVolume[];
  builds: BillingBuild[];
  images: BillingImage[];
  backups: BillingBackup[];
}

export interface BillingReport {
  scope: string;
  scope_id: Uuid;
  from_ms: number;
  to_ms: number;
  coverage: BillingCoverage;
  totals: BillingTotals;
  resource_groups: BillingResourceGroup[];
}

// jobs, transfer, webhooks -----------------------------------------------

export interface JobQuery {
  status?: JobStatus;
  limit?: number;
}

export interface TransferRequest {
  node_id: Uuid;
  mode?: "copy" | "shared" | "handover" | "live";
  drain_seconds?: number;
}

export interface TransferAccepted {
  job: Job;
  message?: string | null;
}

export type WebhookDeliveryStatus = "pending" | "delivered" | "failed";

export interface WebhookSubscription {
  id: Uuid;
  url: string;
  events: string[];
  enabled: boolean;
  description?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreatedWebhook extends WebhookSubscription {
  secret: string;
}

export interface WebhookDelivery {
  id: Uuid;
  subscription_id: Uuid;
  event_type: string;
  payload: unknown;
  status: WebhookDeliveryStatus;
  attempts: number;
  last_error?: string | null;
  created_at: Timestamp;
  delivered_at?: Timestamp | null;
}

export interface CreateWebhookRequest {
  url: string;
  events?: string[];
  description?: string;
  enabled?: boolean;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  description?: string | null;
  enabled?: boolean;
}

// template nests ---------------------------------------------------------

export interface ImportNestRequest {
  nest: unknown;
  version?: string;
  channel?: Channel;
  save?: boolean;
}

export interface NestImportFailure {
  name: string;
  error: string;
}

export interface NestImportResult {
  saved: boolean;
  imported: ImportResult[];
  failed: NestImportFailure[];
}

// proxy adapters ---------------------------------------------------------

export type AdapterProtocol = "tcp" | "udp";

export interface ProxyAdapter {
  id: Uuid;
  name: string;
  slug: string;
  protocol: AdapterProtocol;
  endpoint: string;
  timeout_ms: number;
  enabled: boolean;
  description: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface BuiltinAdapter {
  slug: string;
  name: string;
  protocol: AdapterProtocol;
  description: string;
}

export interface AdapterList {
  builtin: BuiltinAdapter[];
  custom: ProxyAdapter[];
}

export interface CreateAdapterRequest {
  name: string;
  slug: string;
  protocol: AdapterProtocol;
  endpoint: string;
  timeout_ms?: number;
  description?: string;
}


// tenants, resource groups and transfers ---------------------------------

export type TenantStatus = "active" | "suspended" | "deleted";

export interface Tenant {
  id: Uuid;
  name: string;
  slug: string;
  description?: string;
  status: TenantStatus;
  reference_id?: string | null;
  limits?: ApiKeyLimits;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ResourceGroup {
  id: Uuid;
  tenant_id: Uuid;
  name: string;
  slug: string;
  description?: string;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type TransferKeyStatus = "active" | "used" | "revoked" | "expired";

export interface TransferKey {
  id: Uuid;
  tenant_id: Uuid;
  label: string;
  created_by_key_id?: Uuid | null;
  status: TransferKeyStatus;
  created_at: Timestamp;
  expires_at: Timestamp;
  used_at?: Timestamp | null;
  used_by_resource_group_id?: Uuid | null;
}

export interface CreatedTransferKey extends TransferKey {
  token: string;
}

export type TenantTransferStatus = "queued" | "waiting" | "completed" | "failed" | "cancelled";

export interface TenantTransfer {
  id: Uuid;
  resource_group_id: Uuid;
  source_tenant_id?: Uuid | null;
  target_tenant_id?: Uuid | null;
  status: TenantTransferStatus;
  pending: string[];
  warning?: string | null;
  error?: string | null;
  created_at: Timestamp;
  started_at?: Timestamp | null;
  completed_at?: Timestamp | null;
  dismissed_at?: Timestamp | null;
}

export type MeterScopeKind =
  | "global"
  | "container"
  | "resource_group"
  | "tenant"
  | "deployment_class";

export interface MeteringProfile {
  id: Uuid;
  scope: MeterScopeKind;
  scope_id?: Uuid | null;
  formula: string;
  bill_internal_traffic: boolean;
  version: number;
  effective_from: Timestamp;
  created_at: Timestamp;
}

export interface UsageValue {
  scope: string;
  scope_id: Uuid;
  from_ms: number;
  to_ms: number;
  unit: "times" | "tokens";
  times: UsageWindow;
  tokens?: string | null;
  tokens_exact?: string | null;
  cutover_ms?: number | null;
}

export interface ReferenceAggregate {
  reference_id: string;
  tenants: Tenant[];
  resource_groups: ResourceGroup[];
  pods: unknown[];
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  description?: string;
  reference_id?: string;
  limits?: ApiKeyLimits;
}

export interface UpdateTenantRequest {
  name?: string;
  description?: string;
  status?: TenantStatus;
  reference_id?: string;
  clear_reference?: boolean;
  limits?: ApiKeyLimits;
}

export interface CreateResourceGroupRequest {
  name: string;
  slug: string;
  description?: string;
  reference_id?: string;
}

export interface UpdateResourceGroupRequest {
  name?: string;
  description?: string;
  reference_id?: string;
  clear_reference?: boolean;
}

export interface CreateTransferKeyRequest {
  tenant_id: Uuid;
  label?: string;
}

export interface StartTransferRequest {
  transfer_key: string;
  idempotency_key?: string;
}

export interface CreateMeteringProfileRequest {
  scope: MeterScopeKind;
  scope_id?: Uuid;
  formula: string;
  bill_internal_traffic?: boolean;
  effective_from?: Timestamp;
}


// pod port bindings --------------------------------------------------

export type PortExposure = "public" | "internal";

export interface PodPort {
  id: Uuid;
  pod_id: Uuid;
  container_port: number;
  host_ip?: string | null;
  host_port?: number | null;
  protocol: PortProtocol;
  exposure: PortExposure;
  label?: string | null;
  created_at: Timestamp;
}

export interface CreatePodPortRequest {
  container_port: number;
  protocol?: PortProtocol;
  exposure?: PortExposure;
  host_ip?: string;
  host_port?: number;
  label?: string;
}

export interface UpdatePodPortRequest {
  container_port?: number;
  protocol?: PortProtocol;
  exposure?: PortExposure;
  host_ip?: string;
  host_port?: number;
  label?: string;
  clear_label?: boolean;
}

export interface ComposeConverted {
  stack_toml: string;
  warnings: string[];
}

// images ----------------------------------------------------------------

export type ImageSource = "pull" | "upload" | "build";

export interface Image {
  id: Uuid;
  reference: string;
  digest: string;
  source: ImageSource;
  compressed_bytes: number;
  stored_bytes: number;
  resource_group_id?: Uuid | null;
  reference_id?: string | null;
  labels: Record<string, string>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ImageCopy {
  id: Uuid;
  image_id: Uuid;
  node_id: Uuid;
  size_bytes: number;
  status: string;
  last_used_at?: Timestamp | null;
  created_at: Timestamp;
}

export interface ImagePull {
  id: Uuid;
  image_id: Uuid;
  node_id?: Uuid | null;
  registry: string;
  reference: string;
  digest: string;
  bytes: number;
  duration_ms: number;
  resource_group_id?: Uuid | null;
  reference_id?: string | null;
  created_at: Timestamp;
}

export interface PullImageRequest {
  reference: string;
  digest?: string;
  registry?: string;
  bytes?: number;
  duration_ms?: number;
  node_id?: Uuid;
  resource_group_id?: Uuid;
  reference_id?: string;
}

export interface UploadImageRequest {
  reference: string;
  digest: string;
  stored_bytes?: number;
  compressed_bytes?: number;
  resource_group_id?: Uuid;
  reference_id?: string;
}

// git -------------------------------------------------------------------

export type GitProvider = "github" | "gitlab" | "gitea" | "generic";
export type GitAuthKind = "ssh" | "token";
export type GitRefKind = "branch" | "tag" | "commit";
export type BuildStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface GitCredential {
  id: Uuid;
  tenant_id: Uuid;
  resource_group_id?: Uuid | null;
  name: string;
  provider: GitProvider;
  auth: GitAuthKind;
  public_key?: string | null;
  base_url?: string | null;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GitSource {
  id: Uuid;
  resource_group_id: Uuid;
  pod_id: Uuid;
  credential_id?: Uuid | null;
  name: string;
  provider: GitProvider;
  repo: string;
  reference: string;
  ref_kind: GitRefKind;
  dockerfile: string;
  context: string;
  build_args: Record<string, string>;
  auto_update: boolean;
  enabled: boolean;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreatedGitSource extends GitSource {
  webhook_secret: string;
}

export interface BuildUsageSample {
  sampled_at: Timestamp;
  driver: string;
  measurement: string;
  wall_ms: number;
  wall_micros: number;
  cpu_millis: number;
  cpu_micros: number;
  memory_bytes: number;
  disk_read_bytes: number;
  disk_write_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  final_sample: boolean;
}

export interface BuildUsage {
  driver: string;
  measurement: string;
  wall_ms: number;
  wall_micros: number;
  setup_ms: number;
  setup_micros: number;
  clone_ms: number;
  clone_micros: number;
  build_ms: number;
  build_micros: number;
  cpu_millis: number;
  cpu_micros: number;
  memory_byte_seconds: number;
  memory_byte_millis: number;
  memory_byte_micros: string;
  peak_memory_bytes: number;
  disk_read_bytes: number;
  disk_write_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  context_bytes: number;
  image_bytes: number;
  sample_count: number;
  first_sample_ms?: number | null;
  last_sample_ms?: number | null;
  gaps: number;
  complete: boolean;
}

export interface BuildUsageReport {
  build_id: Uuid;
  from_ms: number;
  to_ms: number;
  usage: BuildUsage;
  current?: BuildUsageSample | null;
}

export interface BuildUsageSamples {
  build_id: Uuid;
  samples: BuildUsageSample[];
}

export interface GitBuild {
  id: Uuid;
  source_id: Uuid;
  resource_group_id: Uuid;
  pod_id: Uuid;
  status: BuildStatus;
  reference: string;
  commit_sha?: string | null;
  image?: string | null;
  logs: string;
  error?: string | null;
  job_id?: Uuid | null;
  revision_id?: Uuid | null;
  created_at: Timestamp;
  started_at?: Timestamp | null;
  finished_at?: Timestamp | null;
  build_usage?: BuildUsage | null;
}

export interface CreateGitCredentialRequest {
  tenant_id: Uuid;
  resource_group_id?: Uuid;
  name: string;
  provider: GitProvider;
  auth: GitAuthKind;
  token?: string;
  base_url?: string;
  reference_id?: string;
}

export interface CreateGitSourceRequest {
  resource_group_id: Uuid;
  pod_id: Uuid;
  credential_id?: Uuid;
  name: string;
  provider: GitProvider;
  repo: string;
  reference: string;
  ref_kind: GitRefKind;
  dockerfile: string;
  context?: string;
  build_args?: Record<string, string>;
  auto_update: boolean;
  enabled: boolean;
  reference_id?: string;
}

export interface UpdateGitSourceRequest {
  name?: string;
  provider?: GitProvider;
  repo?: string;
  reference?: string;
  ref_kind?: GitRefKind;
  dockerfile?: string;
  context?: string;
  build_args?: Record<string, string>;
  auto_update?: boolean;
  enabled?: boolean;
  reference_id?: string;
}

// metrics storage -------------------------------------------------------

export interface MetricsStoragePolicy {
  id: Uuid;
  tenant_id?: Uuid | null;
  local_enabled: boolean;
  local_retention_days: number;
  archive_after_days: number;
  total_retention_days: number;
  local_buffer_minutes: number;
  deletion_grace_days: number;
  s3_bucket?: string | null;
  s3_prefix?: string | null;
  s3_region?: string | null;
  s3_endpoint?: string | null;
  s3_configured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface MetricsArchive {
  id: Uuid;
  tenant_id?: Uuid | null;
  resource_group_id?: Uuid | null;
  pod_id?: Uuid | null;
  from_ms: number;
  to_ms: number;
  format: string;
  object_key: string;
  rows: number;
  bytes: number;
  checksum: string;
  schema_version: string;
  created_at: Timestamp;
  deleted_at?: Timestamp | null;
}

export interface MetricsArchiveReport {
  tenant_id?: Uuid | null;
  archived_samples: number;
  archives: number;
  object_keys: string[];
  deleted_local_samples: number;
  deleted_total_samples: number;
  deleted_archives: number;
}

export interface UpsertMetricsStoragePolicyRequest {
  local_enabled?: boolean;
  local_retention_days?: number;
  archive_after_days?: number;
  total_retention_days?: number;
  local_buffer_minutes?: number;
  deletion_grace_days?: number;
  s3_bucket?: string;
  s3_prefix?: string;
  s3_region?: string;
  s3_endpoint?: string;
  s3_access_key?: string;
  s3_secret_key?: string;
  confirm_short_grace?: boolean;
}


export interface ComposeDeployedService {
  service: string;
  pod_id: Uuid;
  node_id: Uuid;
  image: string;
  ports: PodPort[];
}

export interface ComposeDeployResult {
  stack: string;
  pods: ComposeDeployedService[];
  warnings: string[];
}

export interface DeployComposeRequest {
  compose: string;
  template_id: Uuid;
  template_version?: string;
  resource_group_id: Uuid;
  node_id?: Uuid;
  runtime_group_id?: Uuid;
  auto_start?: boolean;
  limits?: Limits;
  reference_id?: string;
  stack_name?: string;
  volume_size_mb?: number;
  volume_backend_id?: Uuid;
  network_cidrs?: Record<string, string>;
}

// storage ---------------------------------------------------------------

export type StorageBackendKind = "nfs" | "smb" | "s3" | "iscsi" | "csi";
export type VolumeAccessMode = "read_write_once" | "read_only_many" | "read_write_many";
export type ExternalDatabaseEngine =
  | "mysql"
  | "mariadb"
  | "postgresql"
  | "mongodb"
  | "redis"
  | "other";

export interface StorageBackend {
  id: Uuid;
  tenant_id: Uuid;
  resource_group_id?: Uuid | null;
  name: string;
  kind: StorageBackendKind;
  endpoint: string;
  options: Record<string, string>;
  secret_configured: boolean;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type VolumeStorageClass = "s3" | "file" | "block";

export interface Volume {
  id: Uuid;
  resource_group_id: Uuid;
  backend_id?: Uuid | null;
  storage_class: VolumeStorageClass;
  name: string;
  size_mb: number;
  access_mode: VolumeAccessMode;
  auto_scale: boolean;
  max_size_mb: number;
  used_bytes: number;
  last_used_at?: Timestamp | null;
  gateway_token_id?: Uuid | null;
  kubernetes_storage_class?: string | null;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PodVolumeMount {
  id: Uuid;
  pod_id: Uuid;
  volume_id: Uuid;
  mount_path: string;
  read_only: boolean;
  created_at: Timestamp;
}

export interface PodVolumeMountView extends PodVolumeMount {
  volume: Volume;
}

export interface ExternalDatabase {
  id: Uuid;
  tenant_id: Uuid;
  resource_group_id?: Uuid | null;
  name: string;
  engine: ExternalDatabaseEngine;
  host: string;
  port: number;
  database_name?: string | null;
  username?: string | null;
  password_configured: boolean;
  options: Record<string, string>;
  reference_id?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PodExternalDatabase {
  id: Uuid;
  pod_id: Uuid;
  database_id: Uuid;
  env_prefix: string;
  created_at: Timestamp;
}

export interface PodExternalDatabaseView extends PodExternalDatabase {
  database: ExternalDatabase;
}

export interface DatabaseTest {
  reachable: boolean;
  error?: string | null;
}

export interface CreateStorageBackendRequest {
  tenant_id: Uuid;
  resource_group_id?: Uuid;
  name: string;
  kind: StorageBackendKind;
  endpoint?: string;
  options?: Record<string, string>;
  secret?: string;
  reference_id?: string;
}

export interface UpdateStorageBackendRequest {
  name?: string;
  kind?: StorageBackendKind;
  endpoint?: string;
  options?: Record<string, string>;
  resource_group_id?: Uuid;
  clear_resource_group?: boolean;
  secret?: string;
  reference_id?: string;
  clear_reference?: boolean;
}

export interface CreateVolumeRequest {
  resource_group_id: Uuid;
  backend_id?: Uuid;
  storage_class?: VolumeStorageClass;
  name: string;
  size_mb?: number;
  max_size_mb?: number;
  auto_scale?: boolean;
  access_mode: VolumeAccessMode;
  reference_id?: string;
}

export interface UpdateVolumeRequest {
  name?: string;
  size_mb?: number;
  max_size_mb?: number;
  auto_scale?: boolean;
  storage_class?: VolumeStorageClass;
  access_mode?: VolumeAccessMode;
  backend_id?: Uuid;
  clear_backend?: boolean;
  reference_id?: string;
  clear_reference?: boolean;
}

export interface MountVolumeRequest {
  volume_id: Uuid;
  mount_path: string;
  read_only?: boolean;
}

export interface CreateExternalDatabaseRequest {
  tenant_id: Uuid;
  resource_group_id?: Uuid;
  name: string;
  engine: ExternalDatabaseEngine;
  host: string;
  port: number;
  database_name?: string;
  username?: string;
  password?: string;
  options?: Record<string, string>;
  reference_id?: string;
}

export interface UpdateExternalDatabaseRequest {
  name?: string;
  engine?: ExternalDatabaseEngine;
  host?: string;
  port?: number;
  database_name?: string;
  username?: string;
  password?: string;
  options?: Record<string, string>;
  resource_group_id?: Uuid;
  clear_resource_group?: boolean;
  reference_id?: string;
  clear_reference?: boolean;
}

export interface BindExternalDatabaseRequest {
  database_id: Uuid;
  env_prefix?: string;
}


export interface PodPortEvent {
  id: Uuid;
  pod_id: Uuid;
  port_id?: Uuid | null;
  container_port: number;
  host_ip?: string | null;
  host_port?: number | null;
  protocol: PortProtocol;
  exposure: PortExposure;
  label?: string | null;
  action: "created" | "updated" | "deleted" | "moved";
  recorded_at: Timestamp;
  from_pod_id?: Uuid | null;
  to_pod_id?: Uuid | null;
}

export interface MovePodForwardRequest {
  podId: string;
  internalIp?: string;
  internalPort?: number;
}


export interface GrantTenantAccessRequest {
  api_key_id: Uuid;
}


export interface StorageGatewayToken {
  id: Uuid;
  tenant_id: Uuid;
  resource_group_id?: Uuid | null;
  backend_id: Uuid;
  volume_id?: Uuid | null;
  label: string;
  prefix?: string | null;
  read_only: boolean;
  access_key?: string | null;
  created_at: Timestamp;
  expires_at: Timestamp;
  revoked_at?: Timestamp | null;
  last_used_at?: Timestamp | null;
}

export interface CreatedStorageGatewayToken extends StorageGatewayToken {
  token: string;
  secret_key: string;
}

export interface CreateStorageGatewayTokenRequest {
  tenant_id: Uuid;
  resource_group_id?: Uuid;
  backend_id?: Uuid;
  volume_id?: Uuid;
  label?: string;
  prefix?: string;
  read_only?: boolean;
  expires_in_days?: number;
}
