import { ref } from 'vue'

export const ACCENT_THEME_STORAGE_KEY = 'kickweb_accent_theme'

export type AccentThemeSwatch = {
  name: string
  color: string
  swatchClass: string
}

/** Order matches the vertical rail; Gold is a distinct warm accent. */
export const accentThemeSwatches: AccentThemeSwatch[] = [
  { name: 'Amber', color: '#f59e0b', swatchClass: 'bg-amber-500' },
  { name: 'Gold', color: '#d4af37', swatchClass: 'bg-[#d4af37]' },
  { name: 'Indigo', color: '#6366f1', swatchClass: 'bg-indigo-500' },
  { name: 'Rose', color: '#f43f5e', swatchClass: 'bg-rose-500' },
  { name: 'Emerald', color: '#10b981', swatchClass: 'bg-emerald-500' },
  { name: 'Sky', color: '#0ea5e9', swatchClass: 'bg-sky-500' },
  { name: 'Violet', color: '#8b5cf6', swatchClass: 'bg-violet-500' },
  { name: 'Orange', color: '#f97316', swatchClass: 'bg-orange-500' },
  { name: 'Fuchsia', color: '#d946ef', swatchClass: 'bg-fuchsia-500' },
  { name: 'Cyan', color: '#06b6d4', swatchClass: 'bg-cyan-500' },
  { name: 'Lime', color: '#84cc16', swatchClass: 'bg-lime-500' },
  { name: 'Red', color: '#ef4444', swatchClass: 'bg-red-500' },
  { name: 'Teal', color: '#14b8a6', swatchClass: 'bg-teal-500' },
  { name: 'Pink', color: '#ec4899', swatchClass: 'bg-pink-500' }
]

export const currentAccentThemeName = ref('Amber')
export const isAccentThemeRailOpen = ref(true)

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Maps site “amber / yellow / orange” accents to the selected primary (site-wide). */
function buildAccentThemeStyleSheet(hex: string): string {
  const rgb = hexToRgb(hex)
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`

  return `
    :root {
      --primary-theme: ${hex};
      --primary-theme-rgb: ${rgbStr};
    }
    .text-amber-400 { color: color-mix(in srgb, ${hex} 78%, white) !important; }
    .text-amber-500 { color: ${hex} !important; }
    .text-amber-600 { color: color-mix(in srgb, ${hex} 75%, black) !important; }
    .bg-amber-400 { background-color: color-mix(in srgb, ${hex} 85%, white) !important; }
    .bg-amber-500 { background-color: ${hex} !important; }
    .bg-amber-600 { background-color: color-mix(in srgb, ${hex} 82%, black) !important; }
    .bg-amber-500\\/5 { background-color: ${rgba(hex, 0.05)} !important; }
    .bg-amber-500\\/10 { background-color: ${rgba(hex, 0.1)} !important; }
    .bg-amber-500\\/20 { background-color: ${rgba(hex, 0.2)} !important; }
    .bg-amber-500\\/30 { background-color: ${rgba(hex, 0.3)} !important; }
    .bg-amber-500\\/40 { background-color: ${rgba(hex, 0.4)} !important; }
    .bg-amber-600\\/5 { background-color: ${rgba(hex, 0.05)} !important; }
    .bg-amber-600\\/20 { background-color: ${rgba(hex, 0.2)} !important; }
    .border-amber-300\\/40 { border-color: ${rgba(hex, 0.45)} !important; }
    .border-amber-500 { border-color: ${hex} !important; }
    .border-amber-500\\/20 { border-color: ${rgba(hex, 0.2)} !important; }
    .border-amber-500\\/30 { border-color: ${rgba(hex, 0.3)} !important; }
    .border-amber-500\\/40 { border-color: ${rgba(hex, 0.4)} !important; }
    .ring-amber-500\\/50 { --tw-ring-color: ${rgba(hex, 0.5)} !important; }
    .shadow-amber-500\\/20 { --tw-shadow-color: ${rgba(hex, 0.2)} !important; }
    .shadow-amber-500\\/30 { --tw-shadow-color: ${rgba(hex, 0.3)} !important; }
    .from-amber-400 { --tw-gradient-from: ${hex} !important; }
    .via-amber-500 { --tw-gradient-via: ${hex} !important; }
    .via-amber-600 { --tw-gradient-via: color-mix(in srgb, ${hex} 80%, black) !important; }
    .to-amber-600 { --tw-gradient-to: ${hex} !important; }
    .from-amber-500\\/20 { --tw-gradient-from: ${rgba(hex, 0.2)} !important; }
    .via-yellow-500\\/20 { --tw-gradient-via: ${rgba(hex, 0.2)} !important; }
    .to-orange-600\\/20 { --tw-gradient-to: ${rgba(hex, 0.2)} !important; }
    .text-yellow-500 { color: ${hex} !important; }
    .bg-yellow-400 { background-color: color-mix(in srgb, ${hex} 80%, white) !important; }
    .bg-yellow-500 { background-color: ${hex} !important; }
    .bg-yellow-500\\/5 { background-color: ${rgba(hex, 0.05)} !important; }
    .bg-yellow-500\\/20 { background-color: ${rgba(hex, 0.2)} !important; }
    .bg-yellow-500\\/30 { background-color: ${rgba(hex, 0.3)} !important; }
    .border-yellow-500\\/30 { border-color: ${rgba(hex, 0.3)} !important; }
    .border-t-amber-500 { border-top-color: ${hex} !important; }
    .group:hover .group-hover\\:border-amber-500\\/30 { border-color: ${rgba(hex, 0.3)} !important; }
    .from-amber-500 { --tw-gradient-from: ${hex} !important; }
    .from-amber-600 { --tw-gradient-from: ${hex} !important; }
    .from-yellow-400 { --tw-gradient-from: ${hex} !important; }
    .from-yellow-500 { --tw-gradient-from: ${hex} !important; }
    .via-yellow-500 { --tw-gradient-via: ${hex} !important; }
    .to-yellow-500 { --tw-gradient-to: ${hex} !important; }
    .to-orange-600 { --tw-gradient-to: color-mix(in srgb, ${hex} 88%, black) !important; }
    .bg-orange-600\\/5 { background-color: ${rgba(hex, 0.05)} !important; }
    .from-amber-50 { --tw-gradient-from: ${rgba(hex, 0.12)} !important; }
    .hover\\:bg-amber-50:hover { background-color: ${rgba(hex, 0.1)} !important; }
    .hover\\:bg-amber-500\\/10:hover { background-color: ${rgba(hex, 0.1)} !important; }
    .hover\\:border-amber-500\\/40:hover { border-color: ${rgba(hex, 0.4)} !important; }
    .hover\\:text-amber-500:hover { color: ${hex} !important; }
    .group:hover .group-hover\\:text-amber-500 { color: ${hex} !important; }
    .focus\\:ring-amber-500\\/50:focus { --tw-ring-color: ${rgba(hex, 0.5)} !important; }
  `.trim()
}

export function applyAccentThemeHex(hex: string) {
  if (typeof document === 'undefined') return
  let styleEl = document.getElementById('dynamic-theme')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'dynamic-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = buildAccentThemeStyleSheet(hex)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', hex)
}

export function applyAccentThemeByName(name: string) {
  const swatch =
    accentThemeSwatches.find(t => t.name === name) ?? accentThemeSwatches[0]
  if (!swatch) return
  currentAccentThemeName.value = swatch.name
  applyAccentThemeHex(swatch.color)
}

export function setAccentTheme(name: string) {
  applyAccentThemeByName(name)
  try {
    localStorage.setItem(ACCENT_THEME_STORAGE_KEY, name)
  } catch {
    /* ignore */
  }
}

export function initAccentThemeFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(ACCENT_THEME_STORAGE_KEY)
    if (stored && accentThemeSwatches.some(t => t.name === stored)) {
      applyAccentThemeByName(stored)
      return
    }
  } catch {
    /* ignore */
  }
  applyAccentThemeByName('Amber')
}
