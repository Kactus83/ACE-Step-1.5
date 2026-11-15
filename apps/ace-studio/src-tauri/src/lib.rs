//! ACE Studio native host.
//!
//! The music backend runs independently; this crate intentionally exposes no
//! file-system or shell commands to untrusted webview code.

/// Launch the shared Angular frontend within a restricted Tauri 2 webview.
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("ACE Studio desktop runtime failed");
}
