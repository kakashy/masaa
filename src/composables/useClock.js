import { ref, onMounted, onUnmounted } from 'vue'

export function useClock(format24 = true) {
  const now = ref(new Date())
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const milliseconds = ref(0)
  const date = ref('')
  const dayOfWeek = ref('')
  const formattedTime = ref('')
  const formattedDate = ref('')

  let intervalId = null

  function update() {
    const d = new Date()
    now.value = d
    hours.value = d.getHours()
    minutes.value = d.getMinutes()
    seconds.value = d.getSeconds()
    milliseconds.value = d.getMilliseconds()

    const h12 = d.getHours() % 12 || 12
    const h24 = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM'

    if (format24) {
      formattedTime.value = `${String(h24).padStart(2, '0')}:${m}:${s}`
    } else {
      formattedTime.value = `${h12}:${m}:${s} ${ampm}`
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    formattedDate.value = d.toLocaleDateString(undefined, options)
    date.value = d.toLocaleDateString()
    dayOfWeek.value = d.toLocaleDateString(undefined, { weekday: 'long' })
  }

  onMounted(() => {
    update()
    intervalId = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    now,
    hours,
    minutes,
    seconds,
    milliseconds,
    date,
    dayOfWeek,
    formattedTime,
    formattedDate,
  }
}
