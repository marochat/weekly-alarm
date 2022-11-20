use crate::crud::audio_data::{create, update_name, delete_name, read_all};
use crate::entities::audio_data;

#[tauri::command]
pub async fn create_sound(title: String, path: String) -> Result<i32, String> {
    match create(title, path).await {
        Ok(idx) => Ok(idx),
        _ => Err("Database Error (create sound file data)".into())
    }
}

#[tauri::command]
pub async fn update_sound_title(title: String, new_title: String) -> Result<audio_data::Model, String> {
    match update_name(title, new_title).await {
        Ok(res) => Ok(res),
        _ => Err("Database Error (update sound file title)".into())
    }
}

#[tauri::command]
pub async fn delete_sound_data(title: String) -> Result<u64, String> {
    match delete_name(title).await {
        Ok(num) => Ok(num),
        _ => Err("Database Error (delete sound file data)".into())
    }
}

#[tauri::command]
pub async fn read_all_sound_data() -> Result<Vec<audio_data::Model>, String> {
    match read_all().await {
        Ok(res) => Ok(res),
        _ => Err("Database Error".into())
    }
}