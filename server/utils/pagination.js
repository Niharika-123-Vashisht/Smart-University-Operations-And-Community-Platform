/**
 * Pagination helper utility.
 * Reads `page` and `limit` query parameters and returns calculated values.
 * Defaults: page = 1, limit = 20.
 * Returns `{ page, limit, skip }` where `skip = (page - 1) * limit`.
 */
export default function paginationHelper(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
