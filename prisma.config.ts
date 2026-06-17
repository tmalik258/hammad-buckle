import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getDirectDatabaseUrl } from "./lib/db/connection";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx lib/seed/index.ts",
  },
  datasource: {
    url: getDirectDatabaseUrl(),
  },
});
