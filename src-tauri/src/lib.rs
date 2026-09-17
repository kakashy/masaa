use chrono::{Local, Utc};
use chrono_tz::Tz;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeInfo {
    pub hour: u32,
    pub minute: u32,
    pub second: u32,
    pub timezone: String,
    pub formatted: String,
    pub is_dst: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorldClockEntry {
    pub name: String,
    pub timezone: String,
    pub offset_hours: f64,
    pub time: String,
    pub date: String,
    pub is_dst: bool,
}

#[tauri::command]
fn get_local_time() -> TimeInfo {
    let now = Local::now();
    TimeInfo {
        hour: now.hour(),
        minute: now.minute(),
        second: now.second(),
        timezone: now.format("%Z").to_string(),
        formatted: now.format("%H:%M:%S").to_string(),
        is_dst: now.offset().local_minus_utc() != 0,
    }
}

#[tauri::command]
fn get_world_time(timezone: String) -> Option<WorldClockEntry> {
    let tz: Tz = timezone.parse().ok()?;
    let now = Utc::now().with_timezone(&tz);
    Some(WorldClockEntry {
        name: tz.name().to_string(),
        timezone: timezone,
        offset_hours: now.offset().local_minus_utc() as f64 / 3600.0,
        time: now.format("%H:%M:%S").to_string(),
        date: now.format("%Y-%m-%d").to_string(),
        is_dst: false,
    })
}

#[tauri::command]
fn get_available_timezones() -> Vec<String> {
    chrono_tz::TZ_VARIANTS.iter().map(|tz| tz.name().to_string()).collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_local_time,
            get_world_time,
            get_available_timezones,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
