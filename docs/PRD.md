# Masaa — Product Requirements Document

## Overview

Masaa is a Linux-native desktop clock application built with Tauri and Vue 3. It provides quick time preview, world timezone comparison, smart daylight adjustments, alarms with custom tones, a timer, and a stopwatch — all wrapped in a beautiful Neumorphic Soft UI.

---

## Goals

1. Provide an instant, glanceable local clock on the Linux desktop
2. Allow users to monitor multiple timezones simultaneously
3. Automatically adjust UI theme and brightness based on daylight cycle
4. Deliver a fully-featured alarm system with bundled and custom tones
5. Offer reliable timer and stopwatch functionality
6. Ship as a lightweight, native-feeling Linux desktop app

---

## Target Audience

- Linux desktop users (GNOME, KDE, XFCE, i3, etc.)
- Remote workers tracking multiple timezones
- Developers, travelers, and anyone who works across timezones
- Users who want a beautiful, distraction-free clock

---

## Features

### 1. Local Clock Display

- Large, prominent analog/digital time display
- Shows: hours, minutes, seconds
- Smooth second-by-second animation
- Displays current date, day of week
- 12h/24h format toggle

### 2. World Clock / Timezone Preview

- Add/remove world clock entries
- Each entry shows: city name, local time, UTC offset, date
- Preset list of major world cities
- Search/filter by city or timezone string
- Persistent storage of configured timezones (localStorage)

### 3. Alarm System

- Create, edit, and delete alarms
- Recurring alarms (daily, weekday, weekend, custom)
- Pre-bundled alarm tones (6-8 default sounds)
- Custom tone import via file picker (MP3, WAV, OGG)
- Volume control per alarm
- Snooze support (configurable: 5/10/15 min)
- Visual + audio notification on trigger

### 4. Timer

- Countdown timer with hours/minutes/seconds input
- Start, pause, resume, reset controls
- Audio notification on completion
- Visual countdown display with progress ring
- Multiple concurrent timers (up to 3)

### 5. Stopwatch

- Start, pause, resume, reset
- Lap tracking with lap times
- Millisecond precision display
- Export lap times (text format)

### 6. Automatic Daylight Adjustments

- **Theme switching**: Auto-toggle between light and dark themes based on sunrise/sunset at user's location
- **Brightness/transparency**: Subtly adjust window transparency or UI brightness throughout the day
- Location detection via system timezone (no GPS needed)
- Configurable: auto, always light, always dark

### 7. General UI/UX

- Neumorphic / Soft UI design language
- Smooth transitions and micro-interactions
- System tray integration (minimize to tray)
- Global keyboard shortcuts (optional)
- Persistent settings via localStorage/Tauri store

---

## Technical Requirements

| Component        | Technology                                                       |
| ---------------- | ---------------------------------------------------------------- |
| Desktop runtime  | Tauri 2                                                          |
| Frontend         | Vue 3 + Vite                                                     |
| Language         | TypeScript (composables), Rust (Tauri backend)                   |
| State management | Pinia (or reactive composables)                                  |
| Date/time        | `chrono` (Rust), `date-fns` or native `Intl.DateTimeFormat` (JS) |
| Audio playback   | `@tauri-apps/api` or HTML5 Audio API                             |
| Packaging        | deb + AppImage                                                   |

---

## Success Metrics

- App launches in under 2 seconds
- Clock updates without visible lag
- Alarm triggers within 1 second of scheduled time
- Memory usage under 100MB in idle state
- Bundle size under 15MB (deb/AppImage)

---

## Out of Scope (v1)

- Mobile platforms (iOS/Android)
- Cloud sync / account system
- Weather integration
- Multiple monitor clock widgets
- Plugin system
