import pool from "../db";
import type { IocType } from "../constants/provider.interface";

export interface AnalyticsSummary {
  total_lookups: number;
  unique_iocs: number;
  ioc_type_breakdown: {
    ip: number;
    domain: number;
    url: number;
    hash: number;
  };
  recent_lookups: Array<{
    ioc_type: IocType;
    ioc_value: string;
    timestamp: string;
  }>;
}

interface RecentLookupRow {
  ioc_type: IocType;
  ioc_value: string;
  timestamp: Date | string;
}

export async function getUserAnalyticsSummary(
  userId: string,
  recentLimit = 10,
): Promise<AnalyticsSummary> {
  const { rows } = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_lookups,
      COUNT(DISTINCT ioc_value)::int AS unique_iocs,
      COUNT(*) FILTER (WHERE LOWER(ioc_type) = 'ip')::int AS ip_count,
      COUNT(*) FILTER (WHERE LOWER(ioc_type) = 'domain')::int AS domain_count,
      COUNT(*) FILTER (WHERE LOWER(ioc_type) = 'url')::int AS url_count,
      COUNT(*) FILTER (WHERE LOWER(ioc_type) = 'hash')::int AS hash_count
    FROM ioc_history
    WHERE owner_type = $1
      AND owner_id = $2
    `,
    ["user", userId],
  );

  const summaryRow = rows[0] || {
    total_lookups: 0,
    unique_iocs: 0,
    ip_count: 0,
    domain_count: 0,
    url_count: 0,
    hash_count: 0,
  };

  const recentResult = await pool.query<RecentLookupRow>(
    `
    SELECT
      ioc_type,
      ioc_value,
      created_at AS timestamp
    FROM ioc_history
    WHERE owner_type = $1
      AND owner_id = $2
    ORDER BY created_at DESC
    LIMIT $3
    `,
    ["user", userId, recentLimit],
  );

  const recent_lookups = recentResult.rows.map((row) => ({
    ioc_type: row.ioc_type,
    ioc_value: row.ioc_value,
    timestamp:
      row.timestamp instanceof Date
        ? row.timestamp.toISOString()
        : new Date(row.timestamp).toISOString(),
  }));

  return {
    total_lookups: Number(summaryRow.total_lookups || 0),
    unique_iocs: Number(summaryRow.unique_iocs || 0),
    ioc_type_breakdown: {
      ip: Number(summaryRow.ip_count || 0),
      domain: Number(summaryRow.domain_count || 0),
      url: Number(summaryRow.url_count || 0),
      hash: Number(summaryRow.hash_count || 0),
    },
    recent_lookups,
  };
}
