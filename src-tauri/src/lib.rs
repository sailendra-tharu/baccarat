use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager;

const LICENSE_FILE_NAME: &str = "baccarat-license.json";
const LICENSE_PRODUCT: &str = "baccarat-desktop";
const LICENSE_SIGNING_SECRET: &str = "baccarat-license-v1-5f7c1f2e6d9a4b8c91e3a702d14f0c65";

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

#[derive(Debug, Deserialize, Serialize)]
struct PendriveLicense {
    product: String,
    key: String,
    license_signature: String,
    bound_machine: Option<String>,
    binding_signature: Option<String>,
}

#[derive(Debug, Serialize)]
struct PendriveLicenseStatus {
    unlocked: bool,
    message: String,
    license_path: Option<String>,
}

fn fnv1a64(input: &str) -> String {
    let mut hash = 0xcbf29ce484222325u64;
    for byte in input.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{hash:016x}")
}

fn license_signature(key: &str) -> String {
    fnv1a64(&format!(
        "{LICENSE_PRODUCT}|license|{}|{LICENSE_SIGNING_SECRET}",
        key.trim()
    ))
}

fn binding_signature(key: &str, machine_id: &str) -> String {
    fnv1a64(&format!(
        "{LICENSE_PRODUCT}|binding|{}|{}|{LICENSE_SIGNING_SECRET}",
        key.trim(),
        machine_id.trim()
    ))
}

fn command_output(command: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(command).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if text.is_empty() {
        None
    } else {
        Some(text)
    }
}

fn machine_id() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = command_output(
            "reg",
            &[
                "query",
                r"HKLM\SOFTWARE\Microsoft\Cryptography",
                "/v",
                "MachineGuid",
            ],
        )
        .ok_or_else(|| "Could not read Windows machine id".to_string())?;

        if let Some(value) = output.lines().find_map(|line| {
            if !line.contains("MachineGuid") {
                return None;
            }
            line.split_whitespace().last().map(str::to_string)
        }) {
            return Ok(fnv1a64(&value));
        }
        Err("Could not parse Windows machine id".to_string())
    }

    #[cfg(target_os = "linux")]
    {
        for path in ["/etc/machine-id", "/var/lib/dbus/machine-id"] {
            if let Ok(value) = fs::read_to_string(path) {
                let trimmed = value.trim();
                if !trimmed.is_empty() {
                    return Ok(fnv1a64(trimmed));
                }
            }
        }
        Err("Could not read Linux machine id".to_string())
    }

    #[cfg(target_os = "macos")]
    {
        let output = command_output("ioreg", &["-rd1", "-c", "IOPlatformExpertDevice"])
            .ok_or_else(|| "Could not read macOS machine id".to_string())?;
        if let Some(value) = output.lines().find_map(|line| {
            if !line.contains("IOPlatformUUID") {
                return None;
            }
            line.split('"').nth(3).map(str::to_string)
        }) {
            return Ok(fnv1a64(&value));
        }
        Err("Could not parse macOS machine id".to_string())
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Err("Unsupported operating system for pendrive licensing".to_string())
    }
}

fn removable_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();

    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::Storage::FileSystem::{
            GetDriveTypeW, GetLogicalDriveStringsW,
        };
        use windows_sys::Win32::System::Diagnostics::Debug::{
            SetErrorMode, SEM_FAILCRITICALERRORS, SEM_NOOPENFILEERRORBOX,
        };

        unsafe {
            SetErrorMode(SEM_FAILCRITICALERRORS | SEM_NOOPENFILEERRORBOX);
        }

        let mut buffer = vec![0u16; 512];
        let length = unsafe { GetLogicalDriveStringsW(buffer.len() as u32, buffer.as_mut_ptr()) };

        if length == 0 {
            return roots;
        }

        let mut start = 0usize;
        for index in 0..length as usize {
            if buffer[index] != 0 {
                continue;
            }

            if index > start {
                let root = String::from_utf16_lossy(&buffer[start..index]);
                let drive_type = unsafe { GetDriveTypeW(buffer[start..=index].as_ptr()) };
                if drive_type == 2 || drive_type == 3 {
                    roots.push(PathBuf::from(root));
                }
            }

            start = index + 1;
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Ok(user) = std::env::var("USER") {
            roots.push(PathBuf::from(format!("/media/{user}")));
            roots.push(PathBuf::from(format!("/run/media/{user}")));
        }
        roots.push(PathBuf::from("/mnt"));
        roots.push(PathBuf::from("/media"));
    }

    #[cfg(target_os = "macos")]
    {
        roots.push(PathBuf::from("/Volumes"));
    }

    roots
}

fn license_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    for root in removable_roots() {
        let direct = root.join(LICENSE_FILE_NAME);
        if direct.exists() {
            paths.push(direct);
        }

        let Ok(entries) = fs::read_dir(&root) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let candidate = path.join(LICENSE_FILE_NAME);
                if candidate.exists() {
                    paths.push(candidate);
                }
            }
        }
    }

    paths
}

fn read_license(path: &Path) -> Result<PendriveLicense, String> {
    let text = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&text).map_err(|e| format!("Invalid license JSON: {e}"))
}

fn write_license(path: &Path, license: &PendriveLicense) -> Result<(), String> {
    let text = serde_json::to_string_pretty(license).map_err(|e| e.to_string())?;
    fs::write(path, text).map_err(|e| format!("Could not bind license to this computer: {e}"))
}

#[cfg(target_os = "windows")]
fn wide_string(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

#[tauri::command]
fn show_pendrive_required_dialog(message: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            MessageBoxW, MB_ICONERROR, MB_OKCANCEL, MB_SETFOREGROUND, MB_TOPMOST,
        };

        let title = wide_string("Insert disk");
        let body = if message.starts_with("Insert a pendrive") {
            "Please insert a disk into USB Drive (D:).".to_string()
        } else {
            message
        };
        let body = wide_string(&body);

        unsafe {
            MessageBoxW(
                std::ptr::null_mut(),
                body.as_ptr(),
                title.as_ptr(),
                MB_ICONERROR | MB_OKCANCEL | MB_SETFOREGROUND | MB_TOPMOST,
            );
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        println!("Pendrive license required: {message}");
    }

    Ok(())
}

#[tauri::command]
async fn check_pendrive_license() -> Result<PendriveLicenseStatus, String> {
    let machine_id = machine_id()?;
    let paths = license_paths();

    if paths.is_empty() {
        return Ok(PendriveLicenseStatus {
            unlocked: false,
            message: format!("Insert a pendrive containing {LICENSE_FILE_NAME}."),
            license_path: None,
        });
    }

    let mut last_error = String::new();

    for path in paths {
        let mut license = match read_license(&path) {
            Ok(license) => license,
            Err(error) => {
                last_error = error;
                continue;
            }
        };

        if license.product != LICENSE_PRODUCT {
            last_error = "License is for a different product.".to_string();
            continue;
        }

        if license.license_signature != license_signature(&license.key) {
            last_error = "Pendrive secret key is not valid.".to_string();
            continue;
        }

        match license.bound_machine.as_deref() {
            Some(bound_machine) if bound_machine == machine_id => {
                let expected = binding_signature(&license.key, &machine_id);
                if license.binding_signature.as_deref() == Some(expected.as_str()) {
                    return Ok(PendriveLicenseStatus {
                        unlocked: true,
                        message: "Pendrive license verified.".to_string(),
                        license_path: Some(path.display().to_string()),
                    });
                }
                last_error = "Pendrive binding signature is invalid.".to_string();
            }
            Some(_) => {
                last_error = "This pendrive is already bound to another computer.".to_string();
            }
            None => {
                license.bound_machine = Some(machine_id.clone());
                license.binding_signature = Some(binding_signature(&license.key, &machine_id));
                write_license(&path, &license)?;

                return Ok(PendriveLicenseStatus {
                    unlocked: true,
                    message: "Pendrive license bound to this computer.".to_string(),
                    license_path: Some(path.display().to_string()),
                });
            }
        }
    }

    Ok(PendriveLicenseStatus {
        unlocked: false,
        message: if last_error.is_empty() {
            "No valid pendrive license found.".to_string()
        } else {
            last_error
        },
        license_path: None,
    })
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
        .invoke_handler(tauri::generate_handler![
            get_image_base64,
            check_pendrive_license,
            show_pendrive_required_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
