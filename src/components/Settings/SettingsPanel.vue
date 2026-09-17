<template>
  <div class="settings-panel">
    <div class="panel-header panel-enter">
      <h2>Settings</h2>
    </div>

    <div class="settings-list">
      <div class="setting-group panel-enter" style="animation-delay: 0.05s">
        <h3>Display</h3>
        <div class="setting-item neu-card">
          <div class="setting-label">
            <span class="setting-name">Time Format</span>
            <span class="setting-desc">Choose 12-hour or 24-hour display</span>
          </div>
          <select v-model="clockFormat" class="neu-input setting-select" @change="saveSetting('clockFormat', clockFormat)">
            <option value="24">24 Hour</option>
            <option value="12">12 Hour</option>
          </select>
        </div>
        <div class="setting-item neu-card">
          <div class="setting-label">
            <span class="setting-name">Show Seconds</span>
            <span class="setting-desc">Display seconds on the main clock</span>
          </div>
          <button
            class="toggle-btn"
            :class="{ active: showSeconds }"
            @click="showSeconds = !showSeconds; saveSetting('showSeconds', showSeconds)"
          >
            <div class="toggle-track">
              <div class="toggle-thumb" />
            </div>
          </button>
        </div>
      </div>

      <div class="setting-group panel-enter" style="animation-delay: 0.1s">
        <h3>Appearance</h3>
        <div class="setting-item neu-card">
          <div class="setting-label">
            <span class="setting-name">Theme</span>
            <span class="setting-desc">Auto switches based on daylight</span>
          </div>
          <select v-model="themeMode" class="neu-input setting-select" @change="setMode(themeMode)">
            <option value="auto">Auto (Daylight)</option>
            <option value="light">Always Light</option>
            <option value="dark">Always Dark</option>
          </select>
        </div>
        <div class="setting-item neu-card">
          <div class="setting-label">
            <span class="setting-name">Brightness Adjust</span>
            <span class="setting-desc">Subtle brightness changes throughout the day</span>
          </div>
          <button
            class="toggle-btn"
            :class="{ active: brightnessMode }"
            @click="brightnessMode = !brightnessMode; saveSetting('brightnessMode', brightnessMode)"
          >
            <div class="toggle-track">
              <div class="toggle-thumb" />
            </div>
          </button>
        </div>
      </div>

      <div class="setting-group panel-enter" style="animation-delay: 0.15s">
        <h3>Alarm</h3>
        <div class="setting-item neu-card">
          <div class="setting-label">
            <span class="setting-name">Default Snooze</span>
            <span class="setting-desc">Snooze duration in minutes</span>
          </div>
          <select v-model="snoozeDuration" class="neu-input setting-select" @change="saveSetting('snoozeDuration', snoozeDuration)">
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="15">15 min</option>
          </select>
        </div>
      </div>

      <div class="setting-group panel-enter" style="animation-delay: 0.2s">
        <h3>About</h3>
        <div class="setting-item neu-card about-card">
          <div class="about-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="about-name">Masaa</div>
          <div class="about-version">v0.1.0</div>
          <div class="about-desc">A beautiful desktop clock for Linux</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDaylight } from '../../composables/useDaylight'

const { mode: themeMode, brightnessMode, setMode } = useDaylight()

const clockFormat = ref(localStorage.getItem('masaa_clock_format') || '24')
const showSeconds = ref(localStorage.getItem('masaa_show_seconds') !== 'false')
const snoozeDuration = ref(localStorage.getItem('masaa_snooze_duration') || '5')

function saveSetting(key, value) {
  localStorage.setItem(`masaa_${key}`, value)
}
</script>

<style scoped>
.settings-panel {
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

.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.setting-group h3 {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-md);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
  transition: box-shadow var(--transition-fast);
}

.setting-item:hover {
  box-shadow: 8px 8px 16px var(--neu-shadow-dark),
              -8px -8px 16px var(--neu-shadow-light);
}

.setting-label {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-weight: 500;
  font-size: var(--text-sm);
}

.setting-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.setting-select {
  width: auto;
  min-width: 120px;
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

/* About Card */
.about-card {
  text-align: center;
  flex-direction: column;
  gap: var(--space-xs);
}

.about-logo {
  margin-bottom: var(--space-xs);
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.about-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.about-version {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.about-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>
