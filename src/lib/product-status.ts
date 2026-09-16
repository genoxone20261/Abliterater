export const PRODUCT_STATUS = [
  "connected",
  "provisioned",
  "running",
  "completed",
  "failed",
  "cleanup_verified",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const CAPABILITY_SCHEMA_KEYS = [
  "id",
  "name",
  "auth",
  "tier",
  "instance",
  "job",
  "list",
  "read",
  "create",
  "stop",
  "remove",
  "logs",
  "artifacts",
  "webhook",
  "officialDocs",
  "verifiedAt",
  "limitations",
  "regions",
  "hardware",
  "spot",
  "idleShutdown",
] as const;
