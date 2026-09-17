<template>
  <div class="alarm-panel">
    <div class="panel-header panel-enter">
      <h2>Alarms</h2>
      <button class="neu-btn neu-btn-icon" @click="showEditor = !showEditor" :class="{ 'active-toggle': showEditor }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>

    <!-- Alarm Editor -->
    <Transition name="slide">
      <div v-if="showEditor" class="alarm-editor neu-card">
        <div class="editor-row">
          <label>Time</label>
          <div class="time-inputs">
            <input
              v-model.number="newHour"
              type="number"
              min="0"
              max="23"
              class="neu-input time-input"
            />
            <span class="time-sep">:</span>
            <input
              v-model.number="newMinute"
              type="number"
              min="0"
              max="59"
              class="neu-input time-input"
            />
          </div>
        </div>
        <div class="editor-row">
          <label>Label</label>
          <input
            v-model="newLabel"
            class="neu-input"
            placeholder="Wake up"
          />
        </div>
        <div class="editor-row">
          <label>Repeat</label>
          <select v-model="newRepeat" class="neu-input">
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
          </select>
        </div>
        <div class="editor-row">
          <label>Tone</label>
          <select v-model="newTone" class="neu-input">
            <option v-for="tone in tones" :key="tone.key" :value="tone.key">{{ tone.name }}</option>
            <option value="custom">Custom file...</option>
          </select>
        </div>
        <div v-if="newTone === 'custom'" class="editor-row">
          <label>File</label>
          <input
            type="file"
            accept=".mp3,.wav,.ogg"
            class="neu-input"
            @change="handleCustomTone"
          />
        </div>
        <div class="editor-row">
          <label>Volume</label>
          <div class="volume-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="volume-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>
            <input
              v-model.number="newVolume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="volume-slider"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="volume-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
        </div>
        <button class="neu-btn primary" @click="saveAlarm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Save Alarm
        </button>
      </div>
    </Transition>

    <!-- Alarm List -->
    <div class="alarm-list stagger-children">
      <div
        v-for="alarm in alarms"
        :key="alarm.id"
        class="alarm-item neu-card"
        :class="{ disabled: !alarm.enabled }"
      >
        <div class="alarm-main">
          <div class="alarm-time">
            <span class="alarm-hour">{{ String(alarm.hour).padStart(2, '0') }}</span>
            <span class="alarm-sep" :class="{ paused: !alarm.enabled }">:</span>
            <span class="alarm-minute">{{ String(alarm.minute).padStart(2, '0') }}</span>
          </div>
          <div class="alarm-info">
            <span class="alarm-label">{{ alarm.label }}</span>
            <span class="alarm-repeat">{{ repeatLabel(alarm.repeat) }}</span>
          </div>
        </div>
        <div class="alarm-actions">
          <button
            class="toggle-btn"
            :class="{ active: alarm.enabled }"
            @click="toggleAlarm(alarm.id)"
          >
            <div class="toggle-track">
              <div class="toggle-thumb" />
            </div>
          </button>
          <button class="remove-btn" @click="removeAlarm(alarm.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="alarms.length === 0 && !showEditor" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <p class="empty-title">No alarms set</p>
      <p class="hint">Create one to never oversleep again</p>
    </div>

    <!-- Active Alarm Trigger -->
    <Transition name="trigger">
      <div v-if="activeAlarm" class="alarm-trigger-overlay" @click.self="dismissAlarm">
        <div class="alarm-trigger-card neu-card">
          <div class="trigger-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div class="trigger-time">
            {{ String(activeAlarm.hour).padStart(2, '0') }}:{{ String(activeAlarm.minute).padStart(2, '0') }}
          </div>
          <div class="trigger-label">{{ activeAlarm.label }}</div>
          <div class="trigger-actions">
            <button class="neu-btn snooze-btn" @click="snoozeAlarm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Snooze
            </button>
            <button class="neu-btn primary dismiss-btn" @click="dismissAlarm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAlarm } from '../../composables/useAlarm'

const {
  alarms, activeAlarm,
  addAlarm, removeAlarm, toggleAlarm,
  dismissAlarm, snoozeAlarm,
} = useAlarm()

const showEditor = ref(false)
const newHour = ref(7)
const newMinute = ref(0)
const newLabel = ref('Alarm')
const newRepeat = ref('once')
const newTone = ref('gentle-rise')
const newVolume = ref(0.8)

const tones = [
  { key: 'gentle-rise', name: 'Gentle Rise' },
  { key: 'morning-birds', name: 'Morning Birds' },
  { key: 'soft-chime', name: 'Soft Chime' },
  { key: 'digital-beep', name: 'Digital Beep' },
  { key: 'calm-wave', name: 'Calm Wave' },
  { key: 'alert-pulse', name: 'Alert Pulse' },
]

function repeatLabel(r) {
  return { once: 'Once', daily: 'Daily', weekdays: 'Weekdays', weekends: 'Weekends' }[r] || r
}

function saveAlarm() {
  addAlarm({
    hour: newHour.value,
    minute: newMinute.value,
    label: newLabel.value,
    repeat: newRepeat.value,
    tone: newTone.value,
    volume: newVolume.value,
  })
  showEditor.value = false
}

function handleCustomTone(e) {
  const file = e.target.files[0]
  if (file) {
    newTone.value = file.path || file.name
  }
}
</script>

<style scoped>
.alarm-panel {
  padding: var(--space-lg);
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.panel-header h2 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.active-toggle {
  box-shadow: var(--neu-pressed);
  color: var(--color-primary);
}

/* Slide transition */
.slide-enter-active {
  animation: slideDown 0.3s var(--ease-out-expo);
}
.slide-leave-active {
  animation: slideDown 0.2s var(--ease-out-quart) reverse;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alarm-editor {
  margin-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.editor-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.editor-row label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.time-input {
  width: 64px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
}

.time-sep {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-muted);
}

.volume-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.volume-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.volume-slider {
  flex: 1;
  accent-color: var(--color-primary);
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  transition: opacity var(--transition-fast), box-shadow var(--transition-fast);
}

.alarm-item.disabled {
  opacity: 0.45;
}

.alarm-main {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.alarm-time {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.alarm-sep {
  animation: blink 1s ease-in-out infinite;
}

.alarm-sep.paused {
  animation: none;
  opacity: 0.4;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.alarm-info {
  display: flex;
  flex-direction: column;
}

.alarm-label {
  font-weight: 500;
  font-size: var(--text-sm);
}

.alarm-repeat {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* Toggle Switch */
.toggle-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--neu-shadow-dark);
  position: relative;
  transition: background var(--transition-normal), box-shadow var(--transition-normal);
}

.toggle-btn.active .toggle-track {
  background: var(--color-primary);
  box-shadow: 0 0 12px var(--color-primary-glow);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s var(--ease-out-expo);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-btn.active .toggle-thumb {
  transform: translateX(20px);
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.remove-btn:hover {
  color: var(--color-accent);
  transform: rotate(90deg);
}

/* Alarm Trigger Overlay */
.alarm-trigger-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.trigger-enter-active {
  animation: triggerIn 0.4s var(--ease-out-expo);
}
.trigger-leave-active {
  animation: triggerIn 0.25s var(--ease-out-quart) reverse;
}
@keyframes triggerIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.alarm-trigger-card {
  text-align: center;
  padding: var(--space-2xl);
  min-width: 300px;
  animation: triggerCardIn 0.5s var(--ease-out-expo) 0.1s both;
}

@keyframes triggerCardIn {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.trigger-icon {
  color: var(--color-accent);
  animation: ring 0.5s ease-in-out infinite alternate;
  margin-bottom: var(--space-lg);
}

@keyframes ring {
  from { transform: rotate(-12deg); }
  to { transform: rotate(12deg); }
}

.trigger-time {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: 600;
  margin-bottom: var(--space-sm);
  font-variant-numeric: tabular-nums;
}

.trigger-label {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.trigger-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.snooze-btn {
  color: var(--color-text-secondary);
}

.dismiss-btn {
  min-width: 120px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: var(--space-md);
  animation: float 3s ease-in-out infinite;
  opacity: 0.4;
}

.empty-title {
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.hint {
  font-size: var(--text-sm);
}
</style>
