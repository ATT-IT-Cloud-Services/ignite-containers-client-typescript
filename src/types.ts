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
  | "server:read"
  | "server:write"
  | "server:power"
  | "server:console"
  | "server:files"
  | "server:backup"
  | "server:database"
  | "server:sftp"
  | "server:secrets"
  | "database:read"
  | "database:write"
  | "notification:send"
  | "notification:read"
  | "proxy:read"
  | "proxy:write";

export type NodeDriver = "docker" | "kubernetes";
export type NodeStatus = "pending" | "online" | "degraded" | "offline" | "maintenance";
export type PortProtocol = "tcp" | "udp" | "both";
export type ServerState =
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
  | "update_template";
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

export interface ServerEnvironment {
  environment: Record<string, string>;
}

export type ProxyTls = "auto" | "internal";

export interface ProxyRoute {
  id: Uuid;
  domain: string;
  upstream: string;
  tls: ProxyTls;
  enabled: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CreateProxyRouteRequest {
  domain: string;
  upstream: string;
  tls?: ProxyTls;
  enabled?: boolean;
}

export interface UpdateProxyRouteRequest {
  domain?: string;
  upstream?: string;
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
  error?: string | null;
}

export interface ProxyReconcileResult {
  configured: boolean;
  applied: boolean;
  routes: number;
  warning?: string | null;
  caddy?: unknown;
}

export interface DesiredServer {
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
  servers: DesiredServer[];
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
  server_id?: Uuid | null;
  primary: boolean;
  label?: string | null;
  created_at: Timestamp;
}

export interface ApiKey {
  id: Uuid;
  name: string;
  prefix: string;
  scopes: Scope[];
  server_ids: Uuid[];
  expires_at?: Timestamp | null;
  last_used_at?: Timestamp | null;
  revoked_at?: Timestamp | null;
  created_at: Timestamp;
}

export interface CreatedKey {
  key: ApiKey;
  token: string;
}

export interface Server {
  id: Uuid;
  node_id: Uuid;
  template_id: Uuid;
  template_version: string;
  name: string;
  description: string;
  external_ref?: string | null;
  idempotency_key?: string | null;
  labels: Record<string, string>;
  image: string;
  startup: string;
  limits: Limits;
  state: ServerState;
  desired_running: boolean;
  suspended: boolean;
  generation: number;
  container_id?: string | null;
  primary_allocation_id?: Uuid | null;
  last_error?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ServerDetail extends Server {
  allocations: Allocation[];
}

export interface Job {
  id: Uuid;
  node_id: Uuid;
  server_id?: Uuid | null;
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
  server_id: Uuid;
  cursor: string;
  lines: string[];
  truncated: boolean;
}

export interface ServerStats {
  server_id: Uuid;
  cpu_percent: number;
  memory_bytes: number;
  memory_limit_bytes: number;
  disk_bytes: number;
  disk_limit_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  pids: number;
  uptime_seconds: number;
  state: ServerState;
  sampled_at: Timestamp;
}

export interface Me {
  key_id: Uuid;
  name: string;
  scopes: Scope[];
  server_ids: Uuid[];
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

export interface ServerDatabase {
  id: Uuid;
  server_id: Uuid;
  host_id: Uuid;
  database_name: string;
  username: string;
  remote: string;
  created_at: Timestamp;
}

export interface CreatedDatabase extends ServerDatabase {
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

export interface CreateServerDatabaseRequest {
  host_id?: Uuid;
  remote?: string;
}

export type BackupState = "creating" | "completed" | "failed" | "restoring";

export interface Backup {
  id: Uuid;
  server_id: Uuid;
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
  server_id: Uuid;
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
}

export interface BulkResult {
  server_id: Uuid;
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
  server_id: Uuid;
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
}

export interface UpdateNodeRequest {
  name?: string;
  fqdn?: string;
  endpoint?: string;
  driver?: NodeDriver;
  maintenance?: boolean;
  labels?: Record<string, string>;
}

export interface CreateAllocationsRequest {
  ip?: string;
  ports?: string;
  start?: number;
  end?: number;
  protocol?: PortProtocol;
  label?: string;
}

export interface CreateServerRequest {
  node_id: Uuid;
  template_id: Uuid;
  template_version?: string;
  name: string;
  description?: string;
  external_ref?: string;
  idempotency_key?: string;
  labels?: Record<string, string>;
  image?: string;
  variables?: Record<string, string>;
  limits?: Limits;
  allocations?: Uuid[];
  auto_allocations?: number;
  protocol?: PortProtocol;
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  external_ref?: string;
  idempotency_key?: string;
  labels?: Record<string, string>;
  image?: string;
  variables?: Record<string, string>;
  limits?: Limits;
  template_version?: string;
}

export interface ServerQuery {
  node_id?: Uuid;
  state?: ServerState;
  external_ref?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface CreateKeyRequest {
  name: string;
  scopes: Scope[];
  server_ids?: Uuid[];
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
