import { gte, lte, and, SQL } from 'drizzle-orm';
import { AnyColumn } from 'drizzle-orm';

/**
 * Creates a date range filter for Drizzle ORM queries
 * @param column - The column to filter on
 * @param fromDate - Start date (inclusive, set to 00:00:00.000)
 * @param toDate - End date (inclusive, set to 23:59:59.999)
 * @returns SQL condition or undefined if no dates provided
 */
export function toRange(
  column: AnyColumn,
  fromDate?: string,
  toDate?: string
): SQL | undefined {
  if (!fromDate && !toDate) return undefined;

  // parse, create start and end date (local -> convert to UTC by Date)
  let whereClauses: SQL[] = [];

  if (fromDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    whereClauses.push(gte(column, from));
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    whereClauses.push(lte(column, to));
  }

  return whereClauses.length === 0 ? undefined : and(...whereClauses);
}

/**
 * Legacy function for backward compatibility with rewardHistory.date
 * @deprecated Use the generic toRange function instead
 */
export function toRangeRewardHistory(
  fromDate?: string,
  toDate?: string
): SQL | undefined {
  // Import here to avoid circular dependency
  const { rewardHistory } = require('@/database/schema');
  return toRange(rewardHistory.date, fromDate, toDate);
}
