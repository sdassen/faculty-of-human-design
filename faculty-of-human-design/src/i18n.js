// ─── I18N — Lightweight multilingual support ──────────────────────────────────
// No external libraries. LANG is set once from URL, t() for UI strings,
// tl() for REPORTS fields that are { nl: "...", en: "..." } objects.

import { useState, useEffect } from 'react';
import NL from './locales/nl.js';
import EN from './locales/en.js';

const TRANSLATIONS = { nl: NL, en: EN };

/** Active language, derived from URL path prefix once on module load */
export const LANG = (() => {
  if (typeof window === 'undefined') return 'nl';
  return window.location.pathname.startsWith('/en') ? 'en' : 'nl';
})();

/** React hook for reactive language detection — updates when URL changes */
export function useLang() {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'nl';
    return window.location.pathname.startsWith('/en') ? 'en' : 'nl';
  });

  useEffect(() => {
    // Update language when browser back/forward is used
    const handlePopState = () => {
      setLang(window.location.pathname.startsWith('/en') ? 'en' : 'nl');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return lang;
}

/** Translate a dot-notation UI key, with optional {var} interpolation */
export function createT(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.nl;
  return function t(key, vars = {}) {
    const keys = key.split('.');
    let val = keys.reduce((o, k) => o?.[k], dict);
    if (val === undefined) {
      // Fallback to Dutch
      val = keys.reduce((o, k) => o?.[k], TRANSLATIONS.nl) ?? key;
    }
    if (typeof val !== 'string') return key;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), val);
  };
}

/** Module-level t() — use this directly in components */
export const t = createT(LANG);

/**
 * Translate a REPORTS field that is either:
 * - a plain string (returned as-is)
 * - an object { nl: "...", en: "..." } (picks current lang, falls back to nl)
 */
export function tl(field) {
  if (!field || typeof field === 'string') return field;
  if (typeof field === 'object') return field[LANG] ?? field.nl ?? String(field);
  return field;
}

/** Navigate to a URL with correct language prefix */
export function switchLang(newLang) {
  if (newLang === LANG) return;
  const current = window.location.pathname;
  if (newLang === 'en') {
    const clean = current.replace(/^\/en/, '') || '/';
    window.location.href = '/en' + (clean === '/' ? '' : clean) + window.location.search;
  } else {
    const clean = current.replace(/^\/en/, '') || '/';
    window.location.href = (clean || '/') + window.location.search;
  }
}

/** Build a page path with the correct language prefix */
export function langPath(path, lang = LANG) {
  const prefix = lang === 'en' ? '/en' : '';
  if (!path || path === '/') return prefix + '/';
  return prefix + (path.startsWith('/') ? path : '/' + path);
}

/** Strip language prefix from a pathname and return clean path */
export function stripLangPrefix(pathname) {
  return pathname.replace(/^\/en/, '') || '/';
}
