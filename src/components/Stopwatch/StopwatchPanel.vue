<template>
  <div class="stopwatch-panel">
    <div class="panel-header panel-enter">
      <h2>Stopwatch</h2>
    </div>

    <div class="stopwatch-display panel-enter" style="animation-delay: 0.05s">
      <div class="display-card neu-card">
        <div class="time-value" :class="{ running: isRunning }">{{ formattedTime }}</div>
        <div v-if="isRunning" class="running-indicator">
          <span class="dot" />
          LIVE
        </div>
      </div>
    </div>

    <div class="stopwatch-controls panel-enter" style="animation-delay: 0.1s">
      <button
        v-if="!isRunning"
        class="neu-btn primary control-btn"
        @click="start"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        Start
      </button>
      <button
        v-else
        class="neu-btn control-btn pause-btn"
        @click="pause"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
        </svg>
        Pause
      </button>
      <button
        class="neu-btn control-btn"
        :disabled="!isRunning && elapsed === 0"
        @click="lap"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Lap
      </button>
      <button
        class="neu-btn control-btn"
        :disabled="elapsed === 0"
        @click="reset"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Reset
      </button>
    </div>

    <!-- Laps -->
    <div v-if="lapTimes.length > 0" class="laps-section panel-enter" style="animation-delay: 0.15s">
      <div class="laps-header">
        <h3>Laps</h3>
        <span class="lap-count">{{ lapTimes.length }}</span>
      </div>
      <div class="lap-list">
        <TransitionGroup name="lap">
          <div
            v-for="lap in [...lapTimes].reverse()"
            :key="lap.number"
            class="lap-entry neu-card"
            :class="{ 'best-lap': isBestLap(lap), 'worst-lap': isWorstLap(lap) }"
          >
            <span class="lap-number">#{{ lap.number }}</span>
            <span class="lap-split">{{ lap.split }}</span>
            <span class="lap-total">{{ lap.total }}</span>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStopwatch } from '../../composables/useStopwatch'

const { isRunning, elapsed, formattedTime, lapTimes, start, pause, reset, lap } = useStopwatch()

const splitTimes = computed(() => lapTimes.value.map(l => {
  const parts = l.split.split(':').map(Number)
  return parts[0] * 60000 + parts[1] * 1000 + parts[2]
}))

function isBestLap(currentLap) {
  if (splitTimes.value.length < 2) return false
  const parts = currentLap.split.split(':').map(Number)
  const ms = parts[0] * 60000 + parts[1] * 1000 + parts[2]
  return ms === Math.min(...splitTimes.value)
}

function isWorstLap(currentLap) {
  if (splitTimes.value.length < 2) return false
  const parts = currentLap.split.split(':').map(Number)
  const ms = parts[0] * 60000 + parts[1] * 1000 + parts[2]
  return ms === Math.max(...splitTimes.value)
}
</script>

<style scoped>
.stopwatch-panel {
  padding: var(--space-lg);
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  margin-bottom: var(--space-lg);
}

.panel-header h2 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.stopwatch-display {
  margin-bottom: var(--space-lg);
}

.display-card {
  text-align: center;
  padding: var(--space-xl) var(--space-lg);
  position: relative;
}

.time-value {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 6vw, var(--text-3xl));
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-normal);
}

.time-value.running {
  color: var(--color-primary);
}

.running-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-success);
  text-transform: uppercase;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.stopwatch-controls {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.control-btn {
  min-width: 100px;
}

.pause-btn {
  color: var(--color-warning);
}

.laps-section {
  margin-top: var(--space-md);
}

.laps-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.laps-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.lap-count {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-glow);
  padding: 2px 8px;
  border-radius: 10px;
}

.lap-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.lap-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  transition: border-color var(--transition-fast);
}

.lap-entry.best-lap {
  background: var(--color-success-soft);
}

.lap-entry.worst-lap {
  background: var(--color-accent-soft);
}

.lap-number {
  font-weight: 600;
  color: var(--color-primary);
  font-size: var(--text-sm);
  min-width: 32px;
}

.lap-split {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}

.lap-total {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Lap TransitionGroup */
.lap-enter-active {
  animation: fadeInUp 0.3s var(--ease-out-expo);
}
.lap-leave-active {
  animation: fadeInUp 0.2s var(--ease-out-quart) reverse;
}
</style>
