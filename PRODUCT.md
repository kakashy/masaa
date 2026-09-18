# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive (Linux-native desktop app via Tauri, with web-technologies UI that adapts its design language to neumorphic soft UI)

## Users

Linux desktop users who need a reliable, beautiful clock application. Primary use cases:

- Remote workers tracking multiple timezones across teams
- Developers who need quick time reference during work
- Anyone wanting a glanceable desktop clock with alarm, timer, and stopwatch functionality

## Product Purpose

Masaa is a Linux-native desktop clock that provides instant time visibility, world timezone comparison, smart daylight-adaptive theming, alarm management with custom tones, and timing tools (timer + stopwatch). It replaces the need for multiple clock/timer apps with a single, beautifully designed tool.

Success means: the app launches fast (<2s), the clock updates smoothly, alarms trigger reliably, and the UI feels native and delightful on Linux.

## Positioning

Masaa combines a premium neumorphic soft UI with true Linux-native integration (system tray, notifications, lightweight footprint). Unlike generic clock apps, Masaa automatically adapts its theme and brightness to the daylight cycle, and supports both bundled and custom alarm tones — making it the most aesthetically refined and customizable clock for Linux.

## Operating Context

- Running as a standalone Linux desktop window (deb/AppImage)
- System tray integration for background operation
- Interacting with the system audio stack for alarm playback
- Using system timezone for daylight calculations (no GPS)
- Persisting user preferences and alarm configurations locally

## Capabilities and Constraints

- **Capabilities:** Local clock (analog + digital), world timezone management (add/remove/search), alarm CRUD with recurring schedules, countdown timer (up to 3 concurrent), stopwatch with laps, automatic daylight theme switching, custom alarm tone import (MP3/WAV/OGG), system tray integration
- **Constraints:** Linux-only distribution (deb + AppImage), no cloud sync, no mobile platforms in v1, no GPS-based location (uses timezone offset for daylight approximation)
- **Undecided:** Whether to include a full analog clock SVG or focus on digital-first; whether drag-and-drop reordering of world clocks is needed in v1

## Brand Commitments

- **Voice:** Calm, precise, unobtrusive — the app should feel like a quiet, reliable companion
- **Visual identity:** Neumorphic soft UI — soft shadows, subtle extrusion, rounded shapes, tactile feel
- **Design language:** Inspired by physical objects — buttons that feel pressable, surfaces that feel tangible

## Evidence on Hand

- PRD.md and SPEC.md with full feature specifications
- Project scaffold: Tauri 2 + Vue 3 + Vite
- Rust backend with chrono/chrono-tz for timezone handling
- No existing visual assets or brand assets yet (to be designed)

## Product Principles

1. **Glanceable** — time should be readable in under 1 second from any distance
2. **Tactile** — UI elements should feel physical and pressable through neumorphic design
3. **Adaptive** — the app should breathe with the day, adjusting theme and brightness naturally
4. **Reliable** — alarms trigger on time, timers count accurately, no lag or drift
5. **Lightweight** — fast startup, low memory, minimal footprint on the Linux desktop
