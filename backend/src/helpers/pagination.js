/** Translate validated { page, limit } into a Mongo skip/limit slice. */
export function getPagination({ page = 1, limit = 20 } = {}) {
  return { page, limit, skip: (page - 1) * limit };
}

/** Build the `meta` block for a paginated list response. */
export function buildPageMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) };
}
