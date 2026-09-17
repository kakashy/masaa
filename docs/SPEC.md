# Masaa — Product Specification

## 1. Application Architecture

```
masaa/
├── src/                    # Vue 3 frontend
│   ├── App.vue            # Root layout, navigation, daylight provider
│   ├── main.js            # Vue app bootstrap
│   ├── components/
│   │   ├── Clock/
│   │   │   ├── AnalogClock.vue      # Analog clock face
│   │   │   ├── DigitalClock.vue     # Large digital time display
│   │   │   └── DateDisplay.vue      # Current date/day display
│   │   ├── WorldClock/
│   │   │   ├── WorldClockPanel.vue  # World clock list container
│   │   │   ├── CityEntry.vue        # Individual timezone entry
│   │   │   └── CityPicker.vue       # Search/select timezone
│   │   ├── Alarm/
│   │   │   ├── AlarmPanel.vue       # Alarm list + controls
│   │   │   ├── AlarmEditor.vue      # Create/edit alarm modal
│   │   │   └── AlarmTrigger.vue     # Active alarm notification
│   │   ├── Timer/
│   │   │   ├── TimerPanel.vue       # Timer display + controls
│   │   │   └── TimerInput.vue       # Duration input component
│   │   ├── Stopwatch/
│   │   │   ├── StopwatchPanel.vue   # Stopwatch display
│   │   │   └── LapList.vue          # Lap times list
│   │   └── Settings/
│   │       └── SettingsPanel.vue    # App settings
│   ├── composables/
│   │   ├── useClock.js              # Reactive clock state
│   │   ├── useTimezone.js           # Timezone utilities
│   │   ├── useAlarm.js              # Alarm state + logic
│   │   ├── useTimer.js              # Timer state + logic
│   │   ├── useStopwatch.js          # Stopwatch state + logic
│   │   ├── useDaylight.js           # Daylight detection + theme
│   │   └── useStorage.js            # Persistent localStorage wrapper
│   ├── styles/
│   │   ├── neumorphic.css           # Neumorphic design tokens + utilities
│   │   └── themes/
│   │       ├── light.css            # Light neumorphic theme
│   │       └── dark.css             # Dark neumorphic theme
│   └── assets/
│       └── sounds/                  # Bundled alarm tones
│           ├── gentle-rise.mp3
│           ├── morning-birds.mp3
│           ├── soft-chime.mp3
│           ├── digital-beep.mp3
│           ├── calm-wave.mp3
│           └── alert-pulse.mp3
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs         # Tauri commands (time, timezone)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── public/
├── docs/                   # Documentation
│   ├── PRD.md
│   └── SPEC.md
└── package.json
```

## 2. Navigation Model

The app uses a **single-window, tabbed layout** with four primary views:

| Tab | Icon | View |
|---|---|---|
| Clock | clock | Local time + world clocks |
| Alarm | bell | Alarm management |
| Timer | hourglass | Timer + stopwatch |
| Settings | gear | App preferences |

Navigation is persistent at the bottom of the window (mobile-style bottom bar adapted for desktop). The current tab is highlighted with a neumorphic active state.

## 3. Neumorphic Design System

### Design Tokens

```css
/* Base Neumorphic Surface */
--neu-bg: #e0e5ec;              /* Light mode base */
--neu-shadow-light: #ffffff;    /* Upper-left highlight */
--neu-shadow-dark: #a3b1c6;     /* Lower-right shadow */
--neu-radius: 16px;

/* Elevation Levels */
--neu-flat: 6px 6px 12px var(--neu-shadow-dark),
            -6px -6px 12px var(--neu-shadow-light);
--neu-pressed: inset 4px 4px 8px var(--neu-shadow-dark),
               inset -4px -4px 8px var(--neu-shadow-light);
--neu-convex: var(--neu-flat),
              linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.05));

/* Typography */
--font-display: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Colors */
--color-primary: #6c63ff;
--color-accent: #ff6b6b;
--color-success: #51cf66;
--color-warning: #ffd43b;
--color-surface: var(--neu-bg);
```

### Dark Mode

```css
--neu-bg: #2d3436;
--neu-shadow-light: #3d4446;
--neu-shadow-dark: #1d2426;
--color-primary: #a29bfe;
--color-accent: #ff7675;
```

### Component Patterns

**Neumorphic Button**
```
Rest:    box-shadow: var(--neu-flat)
Pressed: box-shadow: var(--neu-pressed)
Hover:   box-shadow: var(--neu-convex)
```

**Neumorphic Card**
```
Background: var(--neu-bg)
Border-radius: var(--neu-radius)
Box-shadow: var(--neu-convex)
Padding: 24px
```

**Neumorphic Input**
```
Background: var(--neu-bg)
Box-shadow: var(--neu-pressed)  (inset)
Border: none
Border-radius: 12px
```

## 4. Feature Specifications

### 4.1 Local Clock

- **Analog clock**: SVG-based, smooth CSS transitions for hour/minute/second hands. Neumorphic face with subtle depth.
- **Digital clock**: Large monospace digits, colon blinks gently at 1Hz. Supports 12h/24h toggle.
- **Date display**: Day of week, month, day number, year. Locale-aware formatting.
- **Update frequency**: 1-second interval via `setInterval`. Pauses when tab is hidden (Page Visibility API).

### 4.2 World Clock

- **Default timezones**: UTC, New York, London, Tokyo, Sydney, Dubai (6 presets)
- **Add timezone**: Search by city name or IANA timezone string (e.g., `Asia/Kolkata`)
- **Entry display**: City abbreviation, local time (HH:MM), UTC offset (+5:30), current date
- **Reorder**: Drag-and-drop reordering (optional for v2)
- **Storage**: Saved to `localStorage` as JSON array of timezone strings

### 4.3 Alarm

- **Data model**:
  ```
  {
    id: string (uuid)
    hour: number (0-23)
    minute: number (0-59)
    enabled: boolean
    label: string
    repeat: 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom'
    customDays: number[]  // 0=Sun, 6=Sat
    tone: string          // bundled key or file path
    volume: number        // 0.0 - 1.0
    snoozeMinutes: number // default 5
  }
  ```
- **Alarm check**: Run every 10 seconds, trigger when current time matches enabled alarm
- **Trigger behavior**:
  - Play selected tone (loop until dismissed)
  - Show modal overlay with alarm info
  - Dismiss / Snooze buttons
  - System notification via Tauri notification plugin
- **Custom tones**: File picker accepts .mp3, .wav, .ogg. Stored as file path in alarm config.

### 4.4 Timer

- **Input**: Three neumorphic dial inputs for hours, minutes, seconds
- **Display**: Circular progress ring with countdown in center
- **Controls**: Start (play), Pause (pause), Reset (rotate-ccw) icons
- **Audio**: Play completion tone when timer reaches 00:00:00
- **Multiple timers**: Up to 3 concurrent timers, shown as stacked cards

### 4.5 Stopwatch

- **Display**: Large monospace digits (HH:MM:SS.ms)
- **Lap tracking**: Lap button captures current time, adds to lap list
- **Lap list**: Scrollable list with lap number, lap time, and total time
- **Controls**: Start/Pause, Reset, Lap

### 4.6 Daylight Auto-Adjustment

- **Sunrise/sunset calculation**: Use `sunrise-sunset.org` API or local algorithm (NOAA Solar Calculator)
- **Theme switching**: If current time is between sunrise and sunset, use light theme; otherwise dark
- **Brightness mode**: Optional window opacity adjustment (0.9 light / 1.0 dark)
- **User override**: Settings allow pinning to always-light, always-dark, or auto
- **Location source**: Derive from system timezone offset (no GPS). Approximate latitude from timezone.

## 5. State Management

Use Vue 3 composables (no Pinia needed for this scale):

```js
// Shared reactive state modules
useClock()        // { time, date, formattedTime, formattedDate }
useTimezone()     // { zones[], addZone(), removeZone() }
useAlarm()        // { alarms[], addAlarm(), removeAlarm(), checkAlarms() }
useTimer()        // { timers[], createTimer(), removeTimer() }
useStopwatch()    // { isRunning, elapsed, laps[], start(), stop(), lap() }
useDaylight()     // { theme, isAuto, sunrise, sunset, update() }
useStorage()      // Generic localStorage sync wrapper
```

## 6. Audio Assets

### Bundled Alarm Tones

| Key | Name | Duration | Description |
|---|---|---|---|
| `gentle-rise` | Gentle Rise | 30s | Soft ascending piano melody |
| `morning-birds` | Morning Birds | 45s | Nature sounds, bird chirping |
| `soft-chime` | Soft Chime | 20s | Gentle bell chimes |
| `digital-beep` | Digital Beep | 15s | Classic digital alarm beep |
| `calm-wave` | Calm Wave | 60s | Ocean wave sounds |
| `alert-pulse` | Alert Pulse | 25s | Rhythmic pulsing alert |

Place placeholder `.mp3` files in `src/assets/sounds/`.

## 7. Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `clockFormat` | enum | `24h` | 12h or 24h time display |
| `themeMode` | enum | `auto` | `light`, `dark`, or `auto` |
| `brightnessMode` | boolean | `true` | Auto-adjust window brightness |
| `defaultAlarmTone` | string | `gentle-rise` | Default alarm sound |
| `snoozeDuration` | number | `5` | Default snooze minutes |
| `showSeconds` | boolean | `true` | Show seconds on main clock |
| `systemTray` | boolean | `true` | Minimize to system tray |

## 8. Build & Packaging

### Development

```bash
npm run tauri:dev    # Start Vite dev server + Tauri window
```

### Production Build

```bash
npm run tauri:build  # Build for current platform
```

### Output

- `src-tauri/target/release/bundle/deb/masaa_0.1.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/masaa_0.1.0_amd64.AppImage`

## 9. Milestones

| Milestone | Scope |
|---|---|
| **M1 — Foundation** | Tauri + Vue scaffold, neumorphic design system, local clock |
| **M2 — World Clock** | Timezone list, add/remove, persistent storage |
| **M3 — Timer & Stopwatch** | Countdown timer, stopwatch with laps |
| **M4 — Alarms** | Alarm CRUD, bundled tones, trigger + notification |
| **M5 — Daylight** | Theme auto-switching, brightness adjustment, settings |
| **M6 — Polish** | Animations, tray integration, edge cases, packaging |
