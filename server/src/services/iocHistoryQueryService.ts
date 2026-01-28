import pool from "../db";

export interface HistoryQueryParams {
  ownerType: string;
  ownerId: string;
  limit: number;
  offset: number;
  search?: string;
}

export async function queryHistory({
  ownerType,
  ownerId,
  limit,
  offset,
  search,
}: HistoryQueryParams) {
  const params: Array<string | number> = [ownerType, ownerId];
  let searchClause = "";

  if (search) {
    params.push(`%${search}%`);
    const searchIndex = params.length;
    searchClause =
      "AND (ioc_value ILIKE $" +
      searchIndex +
      " OR ioc_type ILIKE $" +
      searchIndex +
      " OR verdict ILIKE $" +
      searchIndex +
      ")";
  }

  params.push(limit, offset);

  const limitIndex = search ? params.length - 1 : 3;
  const offsetIndex = search ? params.length : 4;

  const { rows } = await pool.query(
    `
    SELECT
      ioc_value,
      ioc_type,
      verdict,
      created_at as timestamp,
      score
    FROM ioc_history
    WHERE owner_type = $1
      AND owner_id = $2
      ${searchClause}
    ORDER BY created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
    params,
  );

  return rows;
}
