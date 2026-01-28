import type { PoolClient } from "pg";
import pool from "../db";
import type { OwnerContext } from "../constants/owner";

export interface OwnershipMigrationTask {
  table: string;
  ownerTypeColumn: string;
  ownerIdColumn: string;
}

type AnonymousOwner = { type: "anonymous"; id: string }
type UserOwner = { type: "user"; id: string }

export interface OwnershipMigrationParams {
  from: AnonymousOwner;
  to: UserOwner;
}

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertValidIdentifier(value: string, label: string): string {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Invalid ${label} identifier: ${value}`);
  }

  return value;
}

function normalizeTask(task: OwnershipMigrationTask): OwnershipMigrationTask {
  return {
    table: assertValidIdentifier(task.table, "table"),
    ownerTypeColumn: assertValidIdentifier(task.ownerTypeColumn, "owner type column"),
    ownerIdColumn: assertValidIdentifier(task.ownerIdColumn, "owner id column"),
  };
}

// Extend this list as more tables store owner references.
const migrationTasks: OwnershipMigrationTask[] = [
  normalizeTask({
    table: "ioc_history",
    ownerTypeColumn: "owner_type",
    ownerIdColumn: "owner_id",
  }),
];

function assertValidMigrationParams({ from, to }: OwnershipMigrationParams): void {
  if (from.type !== "anonymous") {
    throw new Error("Ownership migration expects an anonymous source owner.");
  }

  if (to.type !== "user") {
    throw new Error("Ownership migration target must be a user owner.");
  }

  if (!from.id || !to.id) {
    throw new Error("Both source and target owner ids are required for migration.");
  }
}

async function runMigrationTask(
  client: PoolClient,
  task: OwnershipMigrationTask,
  { from, to }: OwnershipMigrationParams,
): Promise<void> {
  await client.query(
    `UPDATE ${task.table}
     SET ${task.ownerTypeColumn} = $1, ${task.ownerIdColumn} = $2
     WHERE ${task.ownerTypeColumn} = $3 AND ${task.ownerIdColumn} = $4`,
    [to.type, to.id, from.type, from.id],
  );
}

export async function migrateOwnership(params: OwnershipMigrationParams): Promise<void> {
  assertValidMigrationParams(params);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const task of migrationTasks) {
      await runMigrationTask(client, task, params);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Backward-compatible helper for any existing callers.
export async function migrateAnonymousOwnerToUser(
  anonymousId: string,
  userId: string,
): Promise<void> {
  await migrateOwnership({
    from: { type: "anonymous", id: anonymousId },
    to: { type: "user", id: userId },
  });
}

export function registerOwnershipMigrationTask(task: OwnershipMigrationTask): void {
  migrationTasks.push(normalizeTask(task));
}
