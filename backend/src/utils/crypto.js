import crypto from 'node:crypto';

/** Hex SHA-256 of a string (used for hashing refresh tokens and AI input keys). */
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

/** Cryptographically-random opaque token (hex). */
export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString('hex');

/** Stable hash of an object — key order independent — for cache keys. */
export function stableHash(obj) {
  const normalize = (val) => {
    if (Array.isArray(val)) return val.map(normalize);
    if (val && typeof val === 'object') {
      return Object.keys(val)
        .sort()
        .reduce((acc, k) => {
          if (val[k] !== undefined) acc[k] = normalize(val[k]);
          return acc;
        }, {});
    }
    return val;
  };
  return sha256(JSON.stringify(normalize(obj)));
}
