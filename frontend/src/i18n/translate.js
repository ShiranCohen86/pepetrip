import en from './locales/en.js';
import he from './locales/he.js';

export const DICTIONARIES = { en, he };
export const LOCALES = Object.keys(DICTIONARIES);
export const RTL_LOCALES = ['he'];

export function dirForLocale(locale) {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node && node[part] != null ? node[part] : undefined), dict);
}

/**
 * Resolve a dotted key for a locale with interpolation.
 * Fallback chain: requested locale -> English -> the raw key (so missing strings
 * are obvious in the UI rather than blank).
 */
export function translate(locale, key, vars) {
  let str = lookup(DICTIONARIES[locale], key);
  if (str == null) str = lookup(DICTIONARIES.en, key);
  if (str == null) return key;
  if (vars) {
    str = str.replace(/\{\{(\w+)\}\}/g, (_, name) => (vars[name] != null ? String(vars[name]) : ''));
  }
  return str;
}
