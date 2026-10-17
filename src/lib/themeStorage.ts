export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'menu_semanal_theme_v1'

export function loadTheme(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'dark' || raw === 'light') {
      return raw
    }
    return 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignorar errores de almacenamiento si el navegador restringe localStorage
  }
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
