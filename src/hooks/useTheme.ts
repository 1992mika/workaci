import { useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'dark' | 'light'
export type AccentName = 'emerald' | 'ocean' | 'iris' | 'amber' | 'sakura'

const THEME_KEY = 'canvas-engine-theme'
const ACCENT_KEY = 'canvas-engine-accent'

const ACCENTS: AccentName[] = ['emerald', 'ocean', 'iris', 'amber', 'sakura']

function isTheme(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return isTheme(stored) ? stored : 'dark'
  } catch {
    return 'dark'
  }
}

function isAccent(value: string | null): value is AccentName {
  return value !== null && (ACCENTS as readonly string[]).includes(value)
}

function getInitialAccent(): AccentName {
  if (typeof window === 'undefined') return 'ocean'
  try {
    const stored = localStorage.getItem(ACCENT_KEY)
    return isAccent(stored) ? stored : 'ocean'
  } catch {
    return 'ocean'
  }
}

/** 主题与强调色管理：同步到 <html data-theme / data-accent> 与 localStorage */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)
  const [accent, setAccentState] = useState<AccentName>(getInitialAccent)

  // 初始同步一次（防止 SSR / 首次挂载时 <html> 还未带属性）
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.accent = accent
    document.documentElement.style.colorScheme = theme
  }, [theme, accent])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {}
      return next
    })
  }, [])

  const setAccent = useCallback((next: AccentName) => {
    setAccentState(next)
    try {
      localStorage.setItem(ACCENT_KEY, next)
    } catch {}
  }, [])

  return { theme, accent, toggleTheme, setAccent, accents: ACCENTS }
}
