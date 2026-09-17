import { ref, computed } from 'vue'

export function useDaylight() {
  const storageKey = 'masaa_daylight_mode'
  const saved = localStorage.getItem(storageKey)
  const mode = ref(saved || 'auto') // 'auto' | 'light' | 'dark'
  const brightnessMode = ref(true)

  const theme = computed(() => {
    if (mode.value === 'light') return 'light'
    if (mode.value === 'dark') return 'dark'

    // Auto: use sunrise/sunset approximation based on timezone
    const now = new Date()
    const hour = now.getHours()
    // Rough approximation: sunrise ~6:30, sunset ~18:30
    // A real implementation would use NOAA algorithm or sunrise-sunset API
    const sunriseHour = 6.5
    const sunsetHour = 18.5
    const currentHour = hour + now.getMinutes() / 60

    return currentHour >= sunriseHour && currentHour < sunsetHour ? 'light' : 'dark'
  })

  const windowOpacity = computed(() => {
    if (!brightnessMode.value) return 1.0
    const now = new Date()
    const hour = now.getHours() + now.getMinutes() / 60

    // Fade from 0.92 (morning) to 1.0 (midday) to 0.95 (night)
    if (hour < 6) return 0.92
    if (hour < 12) return 0.92 + (hour - 6) * 0.013
    if (hour < 18) return 1.0
    return 1.0 - (hour - 18) * 0.025
  })

  function setMode(m) {
    mode.value = m
    localStorage.setItem(storageKey, m)
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function initTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    mode,
    theme,
    brightnessMode,
    windowOpacity,
    setMode,
    initTheme,
  }
}
