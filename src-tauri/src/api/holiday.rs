use chrono::NaiveDate;
use crate::crud::public_holidays::{ create, delete, update, read_all_after };
use crate::app::datetime::Unixdays;
use crate::entities::public_holidays as entity;

use std::io::{BufReader};
use std::path::Path;
use std::fs::File;
use csv::{ReaderBuilder, Trim};


#[tauri::command]
pub async fn create_holiday(title: String, date: String) -> Result<i32, String> {
    let nd = match NaiveDate::parse_from_str(date.as_str(), "%Y/%m/%d") {
        Ok(d) => d,
        _ => return Err("NavieDate format error".into())
    };
    match create(title, Unixdays::from(&nd)).await {
        Ok(val) => Ok(val),
        _ => Err("create holiday error".into())
    }
}

#[tauri::command]
pub async fn update_holiday(id: i32, title: Option<String>, date: Option<String>) -> Result<(), String> {
    let nd = match date {
        Some(dt) =>
            match NaiveDate::parse_from_str(dt.as_str(), "%Y/%m/%d") {
                Ok(d) => Some(Unixdays::from(&d)),
                _ => return Err("NavieDate format error".into())        
            },
        _ => None
    };
    match update(id, title, nd).await {
        Ok(_) => Ok(()),
        _ => Err("update holiday error".into())
    }
}

#[tauri::command]
pub async fn delete_holiday(id: i32) -> Result<u64, String> {
    match delete(id).await {
        Ok(res) => Ok(res),
        _ => Err("delete holiday error".into())
    }
}

#[tauri::command]
pub async fn read_holidays(date: String) -> Result<Vec<entity::Model>, String> {
    let nd = match NaiveDate::parse_from_str(date.as_str(), "%Y/%m/%d") {
        Ok(d) => d,
        _ => return Err("NavieDate format error".into())
    };
    match read_all_after(Unixdays::from(&nd)).await {
        Ok(val) => Ok(val),
        _ => Err("read holiday error".into())
    }
}

#[tauri::command]
pub async fn read_holidays_from_file(path: String) -> Result<Vec<entity::Model>, String> {
    let p = Path::new(path.as_str());
    if p.is_file() {
        println!("Read from : {}", path);
        let fl = match File::open(p) {
            Ok(flok) => flok,
            _ => return Err("File Open Error".into())
        };
        let buf = BufReader::new(fl);
        let mut csv_buf = ReaderBuilder::new()
            .has_headers(false)
            .trim(Trim::All)
            .from_reader(buf);
        let mut retval = Vec::new();
        let mut rcd_no = 1;
        for rcd in csv_buf.records() {
            let linestr: String = rcd_no.to_string();
            println!("{:?}", rcd);
            let dat = match rcd {
                Ok(r) => {
                    let title = match r.get(1) {
                        Some(t) => {
                            let s = String::from(t);
                            if s.chars().count() > 0 {
                                s
                            } else {
                                return Err(linestr + " : Title string is empty.".into())
                            }
                        }, 
                        _ => return Err(linestr + " : CSV format error".into())
                    };
                    let date1: i32 = match r.get(0) {
                        Some(d) => {
                            match NaiveDate::parse_from_str(d, "%Y/%m/%d") {
                                Ok(d1) => Unixdays::from(&d1).into(),
                                _ => return Err(linestr + " : Date format parse error".into())
                            }
                        },
                        _ => return Err(linestr + " : CSV format error".into())
                    };
                    entity::Model { id: 0, title: title, date: date1, created_at: 0.0, updated_at: 0.0}
                },
                _ => return Err(linestr + " : CSV read error".into()) 
            };
            retval.push(dat);
            rcd_no += 1;
        }
        Ok(retval)
    } else {
        Err("File not found.".into())
    }
}
