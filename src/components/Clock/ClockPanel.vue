<template>
  <div class="clock-panel panel-enter">
    <div class="clock-main">
      <!-- Time of day greeting -->
      <div class="greeting">{{ greeting }}</div>

      <div class="digital-clock">
        <div class="time-display">
          <span class="time">{{ formattedTime }}</span>
        </div>
        <div class="date-display">{{ formattedDate }}</div>
      </div>

      <div class="analog-clock" @mousemove="handleParallax" @mouseleave="resetParallax">
        <svg viewBox="0 0 200 200" class="clock-face" :style="parallaxStyle">
          <!-- Ambient glow -->
          <defs>
            <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.06" />
              <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
            </radialGradient>
            <filter id="handShadow">
              <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.2)" />
            </filter>
          </defs>

          <!-- Clock face -->
          <circle cx="100" cy="100" r="92" class="face-outer" />
          <circle cx="100" cy="100" r="88" class="face-ring" />
          <circle cx="100" cy="100" r="85" class="face-inner" />
          <circle cx="100" cy="100" r="85" fill="url(#faceGlow)" />

          <!-- Hour markers -->
          <g v-for="i in 12" :key="i">
            <line
              :x1="100 + 70 * Math.sin((i * 30 * Math.PI) / 180)"
              :y1="100 - 70 * Math.cos((i * 30 * Math.PI) / 180)"
              :x2="100 + 78 * Math.sin((i * 30 * Math.PI) / 180)"
              :y2="100 - 78 * Math.cos((i * 30 * Math.PI) / 180)"
              class="hour-marker"
            />
          </g>

          <!-- Minute markers -->
          <g v-for="i in 60" :key="'m' + i">
            <line
              v-if="i % 5 !== 0"
              :x1="100 + 76 * Math.sin((i * 6 * Math.PI) / 180)"
              :y1="100 - 76 * Math.cos((i * 6 * Math.PI) / 180)"
              :x2="100 + 80 * Math.sin((i * 6 * Math.PI) / 180)"
              :y2="100 - 80 * Math.cos((i * 6 * Math.PI) / 180)"
              class="minute-marker"
            />
          </g>

          <!-- Hour hand -->
          <line
            :x1="100"
            :y1="100"
            :x2="100 + 40 * Math.sin((hourAngle * Math.PI) / 180)"
            :y2="100 - 40 * Math.cos((hourAngle * Math.PI) / 180)"
            class="hour-hand"
            filter="url(#handShadow)"
          />

          <!-- Minute hand -->
          <line
            :x1="100"
            :y1="100"
            :x2="100 + 60 * Math.sin((minuteAngle * Math.PI) / 180)"
            :y2="100 - 60 * Math.cos((minuteAngle * Math.PI) / 180)"
            class="minute-hand"
            filter="url(#handShadow)"
          />

          <!-- Second hand — GPU-accelerated smooth rotation -->
          <g class="second-hand-group" :style="{ transform: `rotate(${secondAngle}deg)` }">
            <line x1="100" y1="108" x2="100" y2="32" class="second-hand" />
            <circle cx="100" cy="100" r="3" class="second-counterweight" />
          </g>

          <!-- Center cap -->
          <circle cx="100" cy="100" r="5" class="center-dot" />
          <circle cx="100" cy="100" r="2.5" class="center-highlight" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useClock } from '../../composables/useClock'

const { hours, minutes, seconds, formattedTime, formattedDate } = useClock()

const hourAngle = computed(() => (hours.value % 12) * 30 + minutes.value * 0.5)
const minuteAngle = computed(() => minutes.value * 6 + seconds.value * 0.1)
const secondAngle = computed(() => seconds.value * 6)

// Time-of-day greeting
const greeting = computed(() => {
  const h = hours.value
  if (h < 6) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
})

// Parallax effect on analog clock
const parallaxX = ref(0)
const parallaxY = ref(0)

function handleParallax(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  parallaxX.value = x * 6
  parallaxY.value = y * 6
}

function resetParallax() {
  parallaxX.value = 0
  parallaxY.value = 0
}

const parallaxStyle = computed(() => ({
  transform: `perspective(400px) rotateY(${parallaxX.value}deg) rotateX(${-parallaxY.value}deg)`,
  transition: 'transform 0.15s ease-out',
}))
</script>

<style scoped>
.clock-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--space-lg);
}

.clock-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.greeting {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out-expo) 0.1s both;
}

.digital-clock {
  text-align: center;
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out-expo) 0.15s both;
}

.time-display {
  font-family: var(--font-mono);
  font-size: clamp(2.5rem, 8vw, var(--text-4xl));
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text);
  text-shadow: 2px 2px 4px var(--neu-shadow-dark);
  font-variant-numeric: tabular-nums;
}

.date-display {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
  font-weight: 400;
  letter-spacing: 0.02em;
}

.analog-clock {
  width: clamp(180px, 40vw, 240px);
  height: clamp(180px, 40vw, 240px);
  cursor: crosshair;
  opacity: 0;
  animation: scaleIn 0.7s var(--ease-out-expo) 0.25s both;
}

.clock-face {
  width: 100%;
  height: 100%;
  filter: drop-shadow(4px 4px 8px var(--neu-shadow-dark))
          drop-shadow(-4px -4px 8px var(--neu-shadow-light));
}

.face-outer {
  fill: none;
  stroke: var(--color-text-muted);
  stroke-width: 0.5;
  opacity: 0.3;
}

.face-ring {
  fill: var(--neu-bg);
  stroke: var(--color-text-muted);
  stroke-width: 1.5;
}

.face-inner {
  fill: var(--neu-bg);
}

.hour-marker {
  stroke: var(--color-text);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.minute-marker {
  stroke: var(--color-text-muted);
  stroke-width: 1;
  stroke-linecap: round;
  opacity: 0.6;
}

.hour-hand {
  stroke: var(--color-text);
  stroke-width: 4;
  stroke-linecap: round;
  transition: d 0.3s var(--ease-out-quart);
}

.minute-hand {
  stroke: var(--color-text);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: d 0.3s var(--ease-out-quart);
}

.second-hand-group {
  transform-origin: 100px 100px;
  will-change: transform;
  transition: transform 0.1s linear;
}

.second-hand {
  stroke: var(--color-primary);
  stroke-width: 1.5;
  stroke-linecap: round;
}

.second-counterweight {
  fill: var(--color-primary);
  opacity: 0.5;
}

.center-dot {
  fill: var(--color-primary);
  filter: url(#handShadow);
}

.center-highlight {
  fill: white;
  opacity: 0.6;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
