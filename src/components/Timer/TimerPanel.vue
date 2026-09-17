<template>
  <div class="timer-panel">
    <div class="panel-header panel-enter">
      <h2>Timer</h2>
      <button class="neu-btn neu-btn-icon" @click="showInput = !showInput" :class="{ 'active-toggle': showInput }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>

    <!-- Timer Input -->
    <Transition name="slide">
      <div v-if="showInput" class="timer-input-card neu-card">
        <div class="time-inputs">
          <div class="input-group">
            <input
              v-model.number="inputHours"
              type="number"
              min="0"
              max="23"
              class="neu-input time-input"
              placeholder="00"
            />
            <span class="input-label">h</span>
          </div>
          <span class="input-separator">:</span>
          <div class="input-group">
            <input
              v-model.number="inputMinutes"
              type="number"
              min="0"
              max="59"
              class="neu-input time-input"
              placeholder="00"
            />
            <span class="input-label">m</span>
          </div>
          <span class="input-separator">:</span>
          <div class="input-group">
            <input
              v-model.number="inputSeconds"
              type="number"
              min="0"
              max="59"
              class="neu-input time-input"
              placeholder="00"
            />
            <span class="input-label">s</span>
          </div>
        </div>
        <button class="neu-btn primary" @click="addTimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Start Timer
        </button>
      </div>
    </Transition>

    <!-- Active Timers -->
    <div class="timer-list stagger-children">
      <TransitionGroup name="timer">
        <div
          v-for="timer in timers"
          :key="timer.id"
          class="timer-card neu-card"
          :class="{ finished: timer.isFinished }"
        >
          <div class="timer-display">
            <div class="progress-ring-container">
              <svg class="progress-ring" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--color-primary)" />
                    <stop offset="100%" stop-color="var(--color-info)" />
                  </linearGradient>
                </defs>
                <circle
                  cx="60" cy="60" r="54"
                  class="ring-bg"
                />
                <circle
                  cx="60" cy="60" r="54"
                  class="ring-progress"
                  :class="{ 'ring-finished': timer.isFinished }"
                  :style="{ strokeDashoffset: getProgress(timer) }"
                />
              </svg>
              <div class="timer-value" :class="{ 'timer-value-finished': timer.isFinished }">
                {{ formatMs(timer.remainingMs).formatted }}
              </div>
            </div>
          </div>
          <div class="timer-controls">
            <button
              v-if="!timer.isRunning && !timer.isFinished"
              class="neu-btn-icon neu-btn control-play"
              @click="startTimer(timer.id)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
            <button
              v-if="timer.isRunning"
              class="neu-btn-icon neu-btn control-pause"
              @click="pauseTimer(timer.id)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            </button>
            <button
              class="neu-btn-icon neu-btn"
              @click="resetTimer(timer.id)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button
              class="neu-btn-icon neu-btn remove-timer"
              @click="removeTimer(timer.id)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Delightful empty state -->
    <div v-if="timers.length === 0 && !showInput" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 8 10" />
        </svg>
      </div>
      <p class="empty-title">No active timers</p>
      <p class="hint">Create one to start counting down</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTimer } from '../../composables/useTimer'

const { timers, createTimer, startTimer, pauseTimer, resetTimer, removeTimer, formatMs } = useTimer()

const showInput = ref(false)
const inputHours = ref(0)
const inputMinutes = ref(5)
const inputSeconds = ref(0)

function addTimer() {
  const timer = createTimer(inputHours.value, inputMinutes.value, inputSeconds.value)
  if (timer) {
    startTimer(timer.id)
    showInput.value = false
    inputHours.value = 0
    inputMinutes.value = 5
    inputSeconds.value = 0
  }
}

function getProgress(timer) {
  const circumference = 2 * Math.PI * 54
  const progress = timer.remainingMs / timer.totalMs
  return circumference * (1 - progress)
}
</script>

<style scoped>
.timer-panel {
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

/* Slide transition for input */
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
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 300px;
  }
}

.timer-input-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  overflow: hidden;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-input {
  width: 64px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.input-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
  font-weight: 500;
}

.input-separator {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-top: -16px;
}

.timer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.timer-card {
  text-align: center;
  transition: box-shadow var(--transition-normal);
}

.timer-card.finished {
  animation: pulseGlow 2s ease-in-out infinite;
}

.timer-card.finished .timer-value {
  color: var(--color-success);
}

.progress-ring-container {
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto var(--space-md);
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--neu-shadow-dark);
  stroke-width: 5;
  opacity: 0.2;
}

.ring-progress {
  fill: none;
  stroke: url(#timerGrad);
  stroke: var(--color-primary);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 339.292;
  transition: stroke-dashoffset 0.1s linear;
}

.ring-finished {
  stroke: var(--color-success);
  filter: drop-shadow(0 0 6px var(--color-success));
}

.timer-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.timer-value-finished {
  animation: breathe 1.5s ease-in-out infinite;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}

.control-play {
  color: var(--color-success);
}

.control-pause {
  color: var(--color-warning);
}

.remove-timer {
  color: var(--color-accent);
}

/* Timer TransitionGroup */
.timer-enter-active {
  animation: scaleIn 0.3s var(--ease-out-expo);
}
.timer-leave-active {
  animation: scaleIn 0.2s var(--ease-out-quart) reverse;
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
