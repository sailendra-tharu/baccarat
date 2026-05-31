use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Maps a logical image name to a file name
fn image_filename(name: &str) -> &'static str {
    match name {
        "baccarat" => "baccarat.png",
        _ => "",
    }
}

const EDITABLE_IMAGES: &[&str] = &["baccarat"];
const LEGACY_IMAGE_FILES: &[&str] = &[
    "banker.png",
    "bankerpair.png",
    "player.png",
    "playerpair.png",
    "super6.png",
    "tie.png",
];

/// Returns (and creates if needed) the AppData images directory
fn images_dir(_app: &tauri::AppHandle) -> Result<PathBuf, String> {
    // Get the directory where the .exe is running
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = exe_path
        .parent()
        .ok_or_else(|| "Failed to get exe directory".to_string())?;
    let dir = exe_dir.join("images");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(dir)
}

/// On first run: copy bundled default images → AppData/images (skip if already there)
fn seed_images(app: &tauri::AppHandle) {
    let Ok(dir) = images_dir(app) else { return };

    for filename in LEGACY_IMAGE_FILES {
        let _ = fs::remove_file(dir.join(filename));
    }

    for name in EDITABLE_IMAGES {
        let filename = image_filename(name);
        let dest = dir.join(filename);
        if dest.exists() {
            continue; // client may have replaced it — never overwrite
        }
        // Try to resolve the bundled resource path
        if let Ok(src) = app.path().resolve(
            format!("images/{filename}"),
            tauri::path::BaseDirectory::Resource,
        ) {
            if src.exists() {
                let _ = fs::copy(&src, &dest);
            }
        }
    }
}

/// Tauri command: read an image from AppData and return it as a base64 string.
/// Returns "" if the file is not yet present (React falls back to bundled asset).
#[tauri::command]
async fn get_image_base64(app: tauri::AppHandle, name: String) -> Result<String, String> {
    println!("[Rust] get_image_base64 called with name: {}", name);
    let filename = image_filename(&name);
    if filename.is_empty() {
        println!("[Rust] Unknown image name: {}", name);
        return Err(format!("Unknown image name: {name}"));
    }
    let dir = images_dir(&app)?;
    let path = dir.join(filename);
    println!("[Rust] Reading image path: {:?}", path);
    if !path.exists() {
        println!("[Rust] Path does not exist: {:?}", path);
        return Ok(String::new());
    }
    match fs::read(&path) {
        Ok(bytes) => {
            println!("[Rust] Read {} bytes successfully from {:?}", bytes.len(), path);
            Ok(base64_encode(&bytes))
        }
        Err(e) => {
            println!("[Rust] Failed to read file {:?}: {}", path, e);
            Err(e.to_string())
        }
    }
}

/// Minimal inline base64 encoder — avoids adding an extra crate
fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 { chunk[1] as usize } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as usize } else { 0 };
        out.push(CHARS[b0 >> 2] as char);
        out.push(CHARS[((b0 & 3) << 4) | (b1 >> 4)] as char);
        if chunk.len() > 1 {
            out.push(CHARS[((b1 & 0xf) << 2) | (b2 >> 6)] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(CHARS[b2 & 0x3f] as char);
        } else {
            out.push('=');
        }
    }
    out
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Seed default images into AppData on first run
            seed_images(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_image_base64])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
