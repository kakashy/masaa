use chrono::{Local, Timelike, Utc};
use chrono_tz::Tz;
use serde::{Deserialize, Serialize};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    Window,
};
use tauri_plugin_autostart::MacosLauncher;

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
        is_dst: false,
    }
}

#[tauri::command]
fn get_world_time(timezone: String) -> Option<WorldClockEntry> {
    let tz: Tz = timezone.parse().ok()?;
    let now = Utc::now().with_timezone(&tz);
    Some(WorldClockEntry {
        name: tz.name().to_string(),
        timezone: timezone,
        offset_hours: 0.0,
        time: now.format("%H:%M:%S").to_string(),
        date: now.format("%Y-%m-%d").to_string(),
        is_dst: false,
    })
}

#[tauri::command]
fn get_available_timezones() -> Vec<String> {
    chrono_tz::TZ_VARIANTS
        .iter()
        .map(|tz| tz.name().to_string())
        .collect()
}

#[tauri::command]
fn send_notification(window: Window, title: String, body: String) -> Result<(), String> {
    tauri::api::notification::Notification::new(&window.config().tauri.bundle.identifier)
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show" => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        },
        #[cfg(target_os = "linux")]
        SystemTrayEvent::LeftClick { .. } => {
            if let Some(window) = app.get_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        _ => {}
    }
}

pub fn run() {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show", "Show Masaa"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(handle_system_tray_event)
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|_app| {
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_local_time,
            get_world_time,
            get_available_timezones,
            send_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
