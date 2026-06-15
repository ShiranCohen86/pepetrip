/**
 * Mongoose toJSON cleanup: expose `id` (string), drop `_id` and `__v`.
 * Applied to top-level and sub-schemas so nested docs serialize consistently.
 * @param {import('mongoose').Schema} schema
 */
export function toJSONClean(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      if (ret._id != null) ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
}
