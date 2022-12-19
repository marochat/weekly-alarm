use std::path::PathBuf;

/**
 * アプリケーション固有情報ーファイル関連
 */
use tauri::api::path;
use super::info;

use crate::DBPATH;

 /**
  * データベースファイル
  */
pub fn get_database_url() -> String {
    let cli_path = PathBuf::from(&*DBPATH.lock().unwrap());
    let mut data_dir = if cli_path.exists() {
        cli_path
    } else {
        match path::local_data_dir() {
            Some(pathbuf) => pathbuf,
            _ => match path::document_dir() {
                Some(pathbuf) => pathbuf,
                _ => panic!("cant find local data dir")
            }
        }    
    };
    let project_name = String::from(info::PROJECT_NAME);
    data_dir.push(project_name);
    if ! data_dir.as_path().is_dir() {
        println!("{:?} not exist, and try to create.", &data_dir);
        match std::fs::create_dir(data_dir.as_path()) {
            Ok(()) => (),
            _ => panic!("cant create database directory")
        }
    }
    data_dir.push(String::from(info::DATABASE_NAME));
    String::from("sqlite:") + data_dir.as_path().to_str().unwrap() + "?mode=rwc"
}

pub fn get_database_path() -> String {
    // let mut data_dir = match path::local_data_dir() {
    //     Some(pathbuf) => pathbuf,
    //     _ => match path::document_dir() {
    //         Some(pathbuf) => pathbuf,
    //         _ => panic!("cant find local data dir")
    //     }
    // };
    let cli_path = PathBuf::from(&*DBPATH.lock().unwrap());
    let mut data_dir = if cli_path.exists() {
        cli_path
    } else {
        match path::local_data_dir() {
            Some(pathbuf) => pathbuf,
            _ => match path::document_dir() {
                Some(pathbuf) => pathbuf,
                _ => panic!("cant find local data dir")
            }
        }    
    };
    let project_name = String::from(info::PROJECT_NAME);
    data_dir.push(project_name);
    if ! data_dir.as_path().is_dir() {
        println!("{:?} not exist, and try to create.", &data_dir);
        match std::fs::create_dir(data_dir.as_path()) {
            Ok(()) => (),
            _ => panic!("cant create database directory")
        }
    }
    // data_dir.push(String::from(info::DATABASE_NAME));
    String::from(data_dir.as_path().to_str().unwrap())
}