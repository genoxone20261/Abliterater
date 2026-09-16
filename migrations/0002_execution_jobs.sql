create table if not exists execution_jobs (
  id text primary key,
  owner_id text not null,
  provider text not null,
  workload text not null,
  status text not null check (status in ('draft','queued','running','succeeded','failed','cancelled','cleanup-pending','cleaned')),
  request_id text not null,
  manifest jsonb not null default '{}'::jsonb,
  budget_usd numeric not null check (budget_usd >= 0),
  max_minutes integer not null check (max_minutes between 1 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, request_id)
);
create table if not exists execution_job_events (
  id bigserial primary key,
  job_id text not null references execution_jobs(id) on delete cascade,
  event_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists execution_artifacts (
  id text primary key,
  job_id text not null references execution_jobs(id) on delete cascade,
  uri text not null,
  sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  bytes bigint check (bytes is null or bytes >= 0),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists execution_jobs_owner_time on execution_jobs(owner_id, created_at desc);
create index if not exists execution_job_events_job_time on execution_job_events(job_id, created_at);
