<template>
  <div class="app" :data-theme="theme">
    <div class="app-content">
      <Transition name="panel" mode="out-in">
        <ClockPanel v-if="activeTab === 'clock'" key="clock" />
        <WorldClockPanel v-else-if="activeTab === 'world'" key="world" />
        <TimerPanel v-else-if="activeTab === 'timer'" key="timer" />
        <StopwatchPanel v-else-if="activeTab === 'stopwatch'" key="stopwatch" />
        <AlarmPanel v-else-if="activeTab === 'alarm'" key="alarm" />
        <SettingsPanel v-else-if="activeTab === 'settings'" key="settings" />
      </Transition>
    </div>

    <nav class="bottom-nav">
      <div class="nav-indicator" :style="indicatorStyle" />
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <div class="nav-icon" v-html="tab.icon" />
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ClockPanel from './components/Clock/ClockPanel.vue'
import WorldClockPanel from './components/WorldClock/WorldClockPanel.vue'
import TimerPanel from './components/Timer/TimerPanel.vue'
import StopwatchPanel from './components/Stopwatch/StopwatchPanel.vue'
import AlarmPanel from './components/Alarm/AlarmPanel.vue'
import SettingsPanel from './components/Settings/SettingsPanel.vue'
import { useDaylight } from './composables/useDaylight'
import { useAlarm } from './composables/useAlarm'

const { theme, initTheme } = useDaylight()
const { checkAlarms } = useAlarm()

const activeTab = ref('clock')

const tabs = [
  {
    id: 'clock',
    label: 'Clock',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
  {
    id: 'world',
    label: 'World',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  },
  {
    id: 'timer',
    label: 'Timer',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 10"/></svg>',
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="18" y1="6" x2="20" y2="8"/></svg>',
  },
  {
    id: 'alarm',
    label: 'Alarm',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  },
]

const activeIndex = computed(() => tabs.findIndex(t => t.id === activeTab.value))
const indicatorStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 100}%)`,
}))

function switchTab(id) {
  activeTab.value = id
}

let alarmInterval = null

onMounted(() => {
  initTheme()
  alarmInterval = setInterval(checkAlarms, 10000)
})

onUnmounted(() => {
  if (alarmInterval) clearInterval(alarmInterval)
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--neu-bg);
  transition: background var(--transition-slow);
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Panel transitions */
.panel-enter-active {
  animation: panelIn 0.35s var(--ease-out-expo) both;
}

.panel-leave-active {
  animation: panelOut 0.2s var(--ease-out-quart) both;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes panelOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.99);
  }
}

/* Bottom Navigation */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--neu-bg);
  box-shadow: 0 -2px 12px var(--neu-shadow-dark);
  border-top: 1px solid rgba(255,255,255,0.08);
  position: relative;
}

.nav-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% / 6);
  height: 2px;
  background: var(--color-primary);
  border-radius: 0 0 4px 4px;
  transition: transform 0.35s var(--ease-out-expo);
  box-shadow: 0 0 12px var(--color-primary-glow);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--neu-radius-sm);
  transition: all var(--transition-normal);
  min-width: 52px;
  position: relative;
}

.nav-item:hover {
  color: var(--color-text-secondary);
  transform: translateY(-1px);
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item.active .nav-icon {
  animation: navPop 0.3s var(--ease-out-expo);
}

@keyframes navPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.nav-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
