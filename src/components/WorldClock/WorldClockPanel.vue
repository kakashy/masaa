<template>
  <div class="world-clock-panel">
    <div class="panel-header panel-enter">
      <h2>World Clock</h2>
      <button class="neu-btn neu-btn-icon" @click="showPicker = !showPicker" :class="{ 'active-toggle': showPicker }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>

    <!-- City Picker -->
    <Transition name="slide">
      <div v-if="showPicker" class="city-picker neu-card">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            class="neu-input search-input"
            placeholder="Search city or timezone..."
          />
        </div>
        <div class="city-list">
          <button
            v-for="city in filteredCities"
            :key="city.tz"
            class="city-option"
            @click="addCity(city.tz)"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-tz">{{ city.tz }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- World Clock Entries -->
    <div class="clock-entries stagger-children">
      <div
        v-for="clock in worldClocks"
        :key="clock.tz"
        class="clock-entry neu-card"
      >
        <div class="entry-header">
          <span class="entry-abbr">{{ clock.abbr }}</span>
          <button class="remove-btn" @click="removeZone(clock.tz)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="entry-time">{{ clock.time }}</div>
        <div class="entry-meta">
          <span class="entry-date">{{ clock.date }}</span>
          <span class="entry-offset">UTC{{ clock.offset }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="worldClocks.length === 0 && !showPicker" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <p class="empty-title">No world clocks</p>
      <p class="hint">Add cities to track time across zones</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTimezone } from '../../composables/useTimezone'

const { worldClocks, searchQuery, filteredCities, addZone, removeZone } = useTimezone()
const showPicker = ref(false)

function addCity(tz) {
  addZone(tz)
  showPicker.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
.world-clock-panel {
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

.city-picker {
  margin-bottom: var(--space-lg);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 36px;
}

.city-list {
  max-height: 220px;
  overflow-y: auto;
  margin-top: var(--space-sm);
}

.city-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--neu-radius-sm);
  color: var(--color-text);
  font-family: var(--font-display);
  transition: all var(--transition-fast);
}

.city-option:hover {
  background: var(--color-primary);
  color: white;
  transform: translateX(2px);
}

.city-name {
  font-weight: 500;
  font-size: var(--text-sm);
}

.city-tz {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.city-option:hover .city-tz {
  color: rgba(255,255,255,0.7);
}

.clock-entries {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.clock-entry {
  padding: var(--space-md);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.entry-abbr {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-primary);
  letter-spacing: 0.05em;
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

.entry-time {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
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
