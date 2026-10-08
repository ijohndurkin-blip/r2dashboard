/**
 * The portal's two looks.
 *
 * "classic" is the original ledger-paper design and the default. "glass" is the opt-in
 * frosted look, modelled on the partner dashboard: translucent panels over a soft blue
 * gradient. Every glass rule in globals.css is scoped to html[data-theme="glass"], so
 * classic renders exactly as it did before themes existed.
 *
 * The choice is per browser (localStorage), like the hired-workers list.
 */
export type Theme = "classic" | "glass";

export const THEME_STORAGE_KEY = "r2dashboard:theme";

/**
 * Runs in <head> before the first paint, so a saved "glass" choice never flashes the
 * classic look first. Only the one known value is honoured; anything else stays classic.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="glass")document.documentElement.setAttribute("data-theme","glass")}catch(e){}})()`;
