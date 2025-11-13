#[tauri::command]
#[specta::specta]
pub fn get_default_shell() -> String {
    // let shell_path = std::env::var("SHELL").unwrap_or_else(|_| {
    //     // The standard default shell path on recent macOS versions is Zsh
    //     "/bin/zsh".to_string()
    // });
    std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string())
}
