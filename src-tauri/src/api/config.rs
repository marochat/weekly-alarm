use std::path::Path;

use tauri;
use crate::crud::app_config;
use crate::crud::audio_data;
use crate::entities::audio_data as audio_data_entity;

#[tauri::command]
pub async fn test_cmd(val: String) -> String {
    println!("recieveed: {}", val);
    "Hello Tauri World".into()
}

#[tauri::command]
pub async fn set_config_param(param: String, value: Option<String>) -> Result<String, String> {
    match app_config::setparam(param, value).await {
        Ok(_) => Ok("Sccess".into()),
        _ => Err("Dabase Error".into())
    }
    
}

#[tauri::command]
pub async fn get_config_param(param: String) -> Result<Option<String>, String> {
    match app_config::read_value(param).await {
        Ok(value) => 
            match value {
                Some(val) => Ok(Some(val)),
                _ => Ok(None)
            },
        _ => Err("Dabase Error".into())
    }
}

#[tauri::command]
pub async fn delete_param(param: String) -> Result<u64, String> {
    match app_config::delete_param(param).await {
        Ok(num) => Ok(num),
        _ => Err("Database Error".into())
    }
}

#[tauri::command]
pub async fn create_audio_data(path: String) -> Result<i32, String> {
    let pn = Path::new(path.as_str());
    if pn.is_file() {
        let fname = pn.file_name().unwrap();
        match audio_data::create(fname.to_str().unwrap().into(), path.as_str().into()).await {
            Ok(val) => Ok(val),
            _ => Err("err".into())
        }
    } else {
        Err("file not exist.".into())
    }
}

#[tauri::command]
pub async fn delete_audio_data(id: Option<i32>, title: Option<String>) -> Result<u64, String> {
    match id {
        Some(idnum) => {
            match audio_data::delete(idnum).await {
                Ok(val) => Ok(val),
                _ => Err("id error.".into())
            }
        },
        _ => {
            if let Some(titlestr) = title {
                match audio_data::delete_name(titlestr).await {
                    Ok(val) => Ok(val),
                    _ => Err("title error.".into())
                }
            } else {
                Err("need title string.".into())
            }
        }
    }
}

#[tauri::command]
pub async fn read_all_audio_data() -> Result<Vec<audio_data_entity::Model>, String> {
    if let Ok(val) = audio_data::read_all().await {
        Ok(val)
    } else {
        Err("database error.".into())
    }
}
