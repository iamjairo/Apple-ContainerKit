use std::io::{BufReader, Read};
use std::process::Stdio;
use std::{os::unix::process::ExitStatusExt, process::Command};
use tauri::Emitter;
use tokio::task;

#[tauri::command]
#[specta::specta]
pub async fn stream_container_command(args: Vec<String>, event_name: String) -> Result<(), String> {
    let container_cli = "container".to_string();

    let mut child = Command::new(&container_cli)
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    eprintln!(
        "DEBUG: Command successfully spawned. Child PID: {:?}",
        child.id()
    );

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    eprint!("DEBUG: out {:?}", stdout);
    eprint!("DEBUG: error {:?}", stderr);

    task::spawn(async move {
        let mut reader = BufReader::new(stdout);
        let mut buffer = [0u8; 1024];

        loop {
            let bytes_read = reader.read(&mut buffer).unwrap_or(0);
            let chunk = String::from_utf8_lossy(&buffer[..bytes_read]);

            eprintln!(
                "DEBUG (STDOUT CHUNK): Bytes Read: {}, Content: {:?}",
                bytes_read, chunk
            );

            if bytes_read == 0 {
                eprintln!("DEBUG: STDOUT stream closed.");
                break;
            }

            let chunk = String::from_utf8_lossy(&buffer[..bytes_read]);

            eprintln!(
                "DEBUG (STDOUT CHUNK): Bytes Read: {}, Content: {:?}",
                bytes_read, chunk
            );
        }
    });

    // tokio::spawn(async move {
    //     while let Some(event) = rx.recv().await {
    //         let result = match event {
    //             tauri::api::process::CommandEvent::Stdout(line) => {
    //                 window.emit(&format!("{}-stdout", event_name), Some(line))
    //             }
    //             tauri::api::process::CommandEvent::Stderr(line) => {
    //                 window.emit(&format!("{}-stderr", event_name), Some(line))
    //             }
    //             tauri::api::process::CommandEvent::Error(payload) => {
    //                 error!("Command '{}' error: {}", event_name, payload);
    //                 window.emit(&format!("{}-error", event_name), Some(payload))
    //             }
    //             tauri::api::process::CommandEvent::Terminated(payload) => {
    //                 info!(
    //                     "Command '{}' terminated with payload: {:?}",
    //                     event_name, payload
    //                 );
    //                 window.emit(&format!("{}-terminated", event_name), Some(payload))
    //             }
    //             _ => Ok(()), // Ignore other events
    //         };

    //         if let Err(e) = result {
    //             error!(
    //                 "Failed to emit event for command '{}' to window '{}': {}. Terminating task.",
    //                 event_name,
    //                 window.label(),
    //                 e
    //             );
    //             // Stop the task if the window is closed or another error occurs
    //             break;
    //         }
    //     }
    //     info!(
    //         "Event streaming task for command '{}' has finished.",
    //         event_name
    //     );
    // });

    Ok(())
}
