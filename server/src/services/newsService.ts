import pool from "../db";

export type NewsListItem = {
  id: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  source: string;
};

export type NewsDetail = NewsListItem & {
  url: string;
  iocs: { type: string; value: string }[];
};

type NewsCountRow = { count: number };
type NewsListRow = {
  id: string;
  title: string;
  summary: string | null;
  published_at: Date | string | null;
  source: string;
};

type NewsDetailRow = NewsListRow & {
  url: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toIsoString(value: Date | string | null): string | null {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function fetchNewsList(
  limit: number,
  offset: number,
): Promise<{ items: NewsListItem[]; total: number }> {
  const totalResult = await pool.query<NewsCountRow>(
    "SELECT COUNT(*)::int AS count FROM news_articles",
  );

  const total = Number(totalResult.rows[0]?.count ?? 0);

  if (total === 0) {
    return { items: [], total: 0 };
  }

  const { rows } = await pool.query<NewsListRow>(
    `
    SELECT
      a.id,
      a.title,
      a.summary,
      a.published_at,
      s.name AS source
    FROM news_articles a
    INNER JOIN news_sources s ON s.id = a.source_id
    ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      published_at: toIsoString(row.published_at),
      source: row.source,
    })),
    total,
  };
}

export async function fetchNewsDetail(id: string): Promise<NewsDetail | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const articleResult = await pool.query<NewsDetailRow>(
    `
    SELECT
      a.id,
      a.title,
      a.summary,
      a.url,
      a.published_at,
      s.name AS source
    FROM news_articles a
    INNER JOIN news_sources s ON s.id = a.source_id
    WHERE a.id = $1
    `,
    [id],
  );

  const article = articleResult.rows[0];

  if (!article) {
    return null;
  }

  const { rows: iocRows } = await pool.query<{ type: string; value: string }>(
    `
    SELECT
      ioc_type AS type,
      ioc_value AS value
    FROM news_iocs
    WHERE article_id = $1
    ORDER BY ioc_type ASC, ioc_value ASC
    `,
    [id],
  );

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    published_at: toIsoString(article.published_at),
    source: article.source,
    iocs: iocRows.map((ioc) => ({
      type: ioc.type,
      value: ioc.value,
    })),
  };
}
