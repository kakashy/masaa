import { ref, computed } from 'vue'

const TONE_GENERATORS = {
  'gentle-rise': (ctx, gain, volume) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 1.0)
    gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 2.0)
  },
  'morning-birds': (ctx, gain, volume) => {
    const freqs = [1200, 1500, 1800, 1400, 1600]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.3
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(volume * 0.25, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  },
  'soft-chime': (ctx, gain, volume) => {
    const freqs = [523, 659, 784, 1047]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.4
      gain.gain.setValueAtTime(volume * 0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 1.0)
    })
  },
  'digital-beep': (ctx, gain, volume) => {
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 880
      const t = ctx.currentTime + i * 0.25
      gain.gain.setValueAtTime(volume * 0.15, t)
      gain.gain.setValueAtTime(0.001, t + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.15)
    }
  },
  'calm-wave': (ctx, gain, volume) => {
    const osc = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 3
    lfoGain.gain.value = 50
    lfo.connect(lfoGain).connect(osc.frequency)
    osc.type = 'sine'
    osc.frequency.value = 300
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    lfo.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 3.0)
    lfo.stop(ctx.currentTime + 3.0)
  },
  'alert-pulse': (ctx, gain, volume) => {
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 660
      const t = ctx.currentTime + i * 0.5
      gain.gain.setValueAtTime(volume * 0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    }
  },
}

let alarmAudioCtx = null
let alarmOscillators = []

function getAlarmAudioCtx() {
  if (!alarmAudioCtx || alarmAudioCtx.state === 'closed') {
    alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return alarmAudioCtx
}

function playAlarmSound(tone, volume = 0.8) {
  stopAlarmSound()
  const ctx = getAlarmAudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  const gain = ctx.createGain()
  const generator = TONE_GENERATORS[tone] || TONE_GENERATORS['gentle-rise']
  generator(ctx, gain, volume)
}

function stopAlarmSound() {
  alarmOscillators.forEach(osc => {
    try { osc.stop() } catch {}
  })
  alarmOscillators = []
  if (alarmAudioCtx && alarmAudioCtx.state !== 'closed') {
    alarmAudioCtx.suspend()
  }
}

async function sendDesktopNotification(title, body) {
  try {
    const { invoke } = await import('@tauri-apps/api/tauri')
    await invoke('send_notification', { title, body })
  } catch {}
}

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

      if (alarm.repeat === 'weekdays' && (currentDay === 0 || currentDay === 6)) continue
      if (alarm.repeat === 'weekends' && currentDay >= 1 && currentDay <= 5) continue
      if (alarm.repeat === 'custom' && !alarm.customDays.includes(currentDay)) continue

      triggerAlarm(alarm)
      break
    }
  }

  function triggerAlarm(alarm) {
    activeAlarm.value = { ...alarm, triggeredAt: new Date() }
    playAlarmSound(alarm.tone, alarm.volume)
    sendDesktopNotification(
      'Masaa Alarm',
      `${alarm.label} - ${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`
    )
  }

  function dismissAlarm() {
    stopAlarmSound()
    activeAlarm.value = null
  }

  function snoozeAlarm() {
    if (!activeAlarm.value) return
    stopAlarmSound()
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
