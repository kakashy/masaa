import { ref, computed } from 'vue'

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
        // Play completion sound
        playCompletionSound()
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
    // Use Web Audio API for a gentle completion tone
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      osc.type = 'sine'
      gain.gain.value = 0.3
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
      osc.stop(ctx.currentTime + 1.5)
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
