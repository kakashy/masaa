import { ref, computed, onUnmounted } from 'vue'

export function useStopwatch() {
  const isRunning = ref(false)
  const startTime = ref(0)
  const elapsed = ref(0)
  const laps = ref([])
  let rafId = null
  let intervalId = null

  const formattedTime = computed(() => formatMs(elapsed.value))

  const lapTimes = computed(() =>
    laps.value.map((lap, i) => {
      const prev = i === 0 ? 0 : laps.value[i - 1].total
      return {
        number: i + 1,
        split: formatMs(lap.total - prev),
        total: formatMs(lap.total),
      }
    })
  )

  function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    const cs = Math.floor((ms % 1000) / 10)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
  }

  function tick() {
    elapsed.value = performance.now() - startTime.value
    if (isRunning.value) {
      rafId = requestAnimationFrame(tick)
    }
  }

  function start() {
    if (isRunning.value) return
    startTime.value = performance.now() - elapsed.value
    isRunning.value = true
    rafId = requestAnimationFrame(tick)
  }

  function pause() {
    isRunning.value = false
    if (rafId) cancelAnimationFrame(rafId)
  }

  function reset() {
    isRunning.value = false
    if (rafId) cancelAnimationFrame(rafId)
    elapsed.value = 0
    startTime.value = 0
    laps.value = []
  }

  function lap() {
    if (!isRunning.value) return
    laps.value.push({ total: elapsed.value })
  }

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    if (intervalId) clearInterval(intervalId)
  })

  return {
    isRunning,
    elapsed,
    formattedTime,
    lapTimes,
    laps,
    start,
    pause,
    reset,
    lap,
  }
}
