import { ref, computed } from 'vue'

export function useAlarm() {
  const storageKey = 'masaa_alarms'
  const saved = localStorage.getItem(storageKey)
  const alarms = ref(saved ? JSON.parse(saved) : [])
  const activeAlarm = ref(null)

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify(alarms.value))
  }

  function addAlarm(config) {
    const alarm = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      hour: config.hour || 0,
      minute: config.minute || 0,
      enabled: true,
      label: config.label || 'Alarm',
      repeat: config.repeat || 'once',
      customDays: config.customDays || [],
      tone: config.tone || 'gentle-rise',
      volume: config.volume ?? 0.8,
      snoozeMinutes: config.snoozeMinutes || 5,
    }
    alarms.value.push(alarm)
    persist()
    return alarm
  }

  function updateAlarm(id, updates) {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      Object.assign(alarm, updates)
      persist()
    }
  }

  function removeAlarm(id) {
    alarms.value = alarms.value.filter(a => a.id !== id)
    persist()
  }

  function toggleAlarm(id) {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      alarm.enabled = !alarm.enabled
      persist()
    }
  }

  function checkAlarms() {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentDay = now.getDay()

    for (const alarm of alarms.value) {
      if (!alarm.enabled) continue
      if (alarm.hour !== currentHour || alarm.minute !== currentMinute) continue

      // Check repeat days
      if (alarm.repeat === 'weekdays' && (currentDay === 0 || currentDay === 6)) continue
      if (alarm.repeat === 'weekends' && currentDay >= 1 && currentDay <= 5) continue
      if (alarm.repeat === 'custom' && !alarm.customDays.includes(currentDay)) continue

      triggerAlarm(alarm)
      break
    }
  }

  function triggerAlarm(alarm) {
    activeAlarm.value = { ...alarm, triggeredAt: new Date() }
  }

  function dismissAlarm() {
    activeAlarm.value = null
  }

  function snoozeAlarm() {
    if (!activeAlarm.value) return
    const snoozeMin = activeAlarm.value.snoozeMinutes
    const newTime = new Date()
    newTime.setMinutes(newTime.getMinutes() + snoozeMin)

    addAlarm({
      hour: newTime.getHours(),
      minute: newTime.getMinutes(),
      label: `${activeAlarm.value.label} (Snoozed)`,
      tone: activeAlarm.value.tone,
      volume: activeAlarm.value.volume,
      repeat: 'once',
    })
    activeAlarm.value = null
  }

  return {
    alarms,
    activeAlarm,
    addAlarm,
    updateAlarm,
    removeAlarm,
    toggleAlarm,
    checkAlarms,
    triggerAlarm,
    dismissAlarm,
    snoozeAlarm,
  }
}
