function expandEnv(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.replace(/\$\{(\w+)\}/g, (_, key: string) => process.env[key] ?? "");
}

function buildSupabaseDatabaseUrl(mode: "pooled" | "direct"): string {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const password = process.env.SUPABASE_POSTGRES_PASS;
  const region = process.env.SUPABASE_DB_REGION ?? "ap-south-1";

  if (!projectId || !password) {
    throw new Error(
      "Set SUPABASE_PROJECT_ID and SUPABASE_POSTGRES_PASS, or provide a full DATABASE_URL.",
    );
  }

  const encodedPassword = encodeURIComponent(password);
  const port = mode === "pooled" ? "6543" : "5432";
  const params = mode === "pooled" ? "?pgbouncer=true" : "";

  return `postgresql://postgres.${projectId}:${encodedPassword}@aws-1-${region}.pooler.supabase.com:${port}/postgres${params}`;
}

export function getDatabaseUrl(): string {
  if (process.env.SUPABASE_PROJECT_ID && process.env.SUPABASE_POSTGRES_PASS) {
    return buildSupabaseDatabaseUrl("pooled");
  }

  const fromEnv = expandEnv(process.env.DATABASE_URL);
  if (fromEnv && !fromEnv.includes("${")) {
    return fromEnv;
  }

  throw new Error(
    "Database connection is not configured. Set SUPABASE_PROJECT_ID and SUPABASE_POSTGRES_PASS.",
  );
}

export function getDirectDatabaseUrl(): string {
  if (process.env.SUPABASE_PROJECT_ID && process.env.SUPABASE_POSTGRES_PASS) {
    return buildSupabaseDatabaseUrl("direct");
  }

  const fromEnv = expandEnv(process.env.DIRECT_URL);
  if (fromEnv && !fromEnv.includes("${")) {
    return fromEnv;
  }

  throw new Error(
    "Database connection is not configured. Set SUPABASE_PROJECT_ID and SUPABASE_POSTGRES_PASS.",
  );
}
