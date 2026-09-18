import { ref, computed } from 'vue'

async function sendDesktopNotification(title, body) {
  try {
    const { invoke } = await import('@tauri-apps/api/tauri')
    await invoke('send_notification', { title, body })
  } catch {}
}

export function useTimer() {
  const storageKey = 'masaa_timers'
  const timers = ref([])

  function createTimer(hours = 0, minutes = 0, seconds = 0) {
    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000
    if (totalMs <= 0) return null

    const timer = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      totalMs,
      remainingMs: totalMs,
      isRunning: false,
      isFinished: false,
      intervalId: null,
    }
    timers.value.push(timer)
    return timer
  }

  function startTimer(id) {
    const timer = timers.value.find(t => t.id === id)
    if (!timer || timer.isRunning || timer.isFinished) return

    timer.isRunning = true
    timer.intervalId = setInterval(() => {
      timer.remainingMs -= 100
      if (timer.remainingMs <= 0) {
        timer.remainingMs = 0
        timer.isRunning = false
        timer.isFinished = true
        clearInterval(timer.intervalId)
        playCompletionSound()
        sendDesktopNotification('Masaa Timer', 'Your timer has finished!')
      }
    }, 100)
  }

  function pauseTimer(id) {
    const timer = timers.value.find(t => t.id === id)
    if (!timer || !timer.isRunning) return
    timer.isRunning = false
    clearInterval(timer.intervalId)
  }

  function resetTimer(id) {
    const timer = timers.value.find(t => t.id === id)
    if (!timer) return
    if (timer.intervalId) clearInterval(timer.intervalId)
    timer.remainingMs = timer.totalMs
    timer.isRunning = false
    timer.isFinished = false
  }

  function removeTimer(id) {
    const timer = timers.value.find(t => t.id === id)
    if (timer?.intervalId) clearInterval(timer.intervalId)
    timers.value = timers.value.filter(t => t.id !== id)
  }

  function playCompletionSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [800, 1000, 1200, 1000]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.2
        gain.gain.setValueAtTime(0.3, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
        osc.connect(gain).connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.25)
      })
    } catch {}
  }

  function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    const ms_display = Math.floor((ms % 1000) / 10)
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
      ms: String(ms_display).padStart(2, '0'),
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    }
  }

  return {
    timers,
    createTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    removeTimer,
    formatMs,
  }
}
