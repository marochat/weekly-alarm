use chrono::{ NaiveDate, NaiveTime };
use crate::app::datetime::{ Unixdays, Seconds, DateInfo };
use crate::entities::{ chime_data, daily_chimes, schedule };
use crate::crud::schedule::{ read_by_date, read_all, update as sch_update, create as sch_create, delete as sch_delete };
use crate::crud::daily_chimes::read_all_related as read_all_daily_chimes ;
use crate::crud::daily_chimes::find_id_in_schedule as find_chimes_in_schedule;
use crate::crud::daily_chimes::{ create as dairy_chimes_create, delete as daily_chimes_delete };
use crate::crud::chime_data::{create as chime_create, update as chime_update, delete as chime_delete};

#[tauri::command]
/**
 * 日付によるスケジュールの問い合わせ
 */
pub async fn inquiry_schedule(date: String) -> Result<(schedule::Model, daily_chimes::Model, Vec<chime_data::Model>), String> {
    let nd = match NaiveDate::parse_from_str(date.as_str(), "%Y/%m/%d") {
        Ok(d) => d,
        _ => return Err("NavieDate format error".into())
    };
    match read_by_date(i32::from(Unixdays::from(Unixdays::from(&nd)))).await {
        Ok(value) => Ok(value),
        _ => Err("err".into())
    }
}

#[tauri::command]
pub async fn read_all_schedules() -> Result<Vec<schedule::Model>, String> {
    match read_all().await {
        Ok(value) => Ok(value),
        _ => Err("dataabase errot".into())
    }
}

#[tauri::command]
/**
 * DailyChimesタイマーグループをリレーションリスト付きで返すAPI
 */
pub async fn read_all_chimes() -> Result<Vec<(daily_chimes::Model, Vec<chime_data::Model>)>, String> {
    match read_all_daily_chimes().await {
        Ok(value) => Ok(value),
        _ => Err("database error".into())
    }
}

#[tauri::command]
/**
 * 指定したタイマーグループがスケジュールに使われているかどうかを返すAPI
 */
pub async fn is_chimes_in_schedule(id: i32) -> Result<bool, String> {
    match find_chimes_in_schedule(id).await {
        Err(_) => Err("database error".into()),
        Ok(opt) => match opt {
            Some(val) => match val.1.len() {
                0 => Ok(false),
                _ => Ok(true)
            },
            _ => Err("id error???".into())
        }
    }
}

#[tauri::command]
/**
 * 指定したタイマーグループを使用しているスケジュールのリストを得るAPI
 */
pub async fn get_schedules_for_chimes_id(id: i32) -> Result<Vec<schedule::Model>, String> {
    match find_chimes_in_schedule(id).await {
        Err(_) => Err("datebase error".into()),
        Ok(opt) => match opt {
            Some(val) => Ok(val.1),
            _ => Err("id error???".into())
        }
    }
}

#[tauri::command]
/**
 * スケジュールのアップデート
 */
pub async fn schedule_update(id: i32, title: Option<String>, date: Option<Option<i32>>, chimes_id: Option<Option<i32>>) -> Result<schedule::Model, String> {
    let date1 = match date {
        Some(Some(0)) => Some(None),
        _ => date
    };
    let cid = match chimes_id {
        Some(Some(0)) => Some(None),
        _ => chimes_id
    };
    match sch_update(Some(id), title, date1, cid).await {
        Err(_) => Err("database error".into()),
        Ok(model) => Ok(model)
    }
}

#[tauri::command]
pub async fn schedule_create_rsvd(title: String, date: i32) -> Result<i32, String> {
    match sch_create(title, DateInfo::ReservedDay, Some(date), None).await {
        Ok(val) => Ok(val),
        _ => Err("database error".into())
    }
}

#[tauri::command]
pub async fn schedule_delete(id: i32) -> Result<u64, String> {
    match sch_delete(id).await {
        Ok(val) => Ok(val),
        _ => Err("database error".into())
    }
}

#[tauri::command]
pub async fn create_chimes(title: String) -> Result<i32, String> {
    match dairy_chimes_create(title).await {
        Ok(retval) => Ok(retval),
        _ => Err("create recorde error.".into())
    }
}

#[tauri::command]
pub async fn delete_chimes(id: i32) -> Result<u64, String> {
    match daily_chimes_delete(id).await {
        Ok(retval) => Ok(retval),
        _ => Err("delete record error. maybe not empty".into())
    }
}

#[tauri::command]
pub async fn create_chime(title: String, time: i32, chime: String, chimesid: i32) -> Result<i32, String> {
    match chime_create(title, NaiveTime::from(Seconds(time)), Some(chime), chimesid).await {
        Ok(retval) => Ok(retval),
        _ => Err("create record error.".into())
    }
}

#[tauri::command]
pub async fn update_chime(id: i32, title: Option<String>, time: Option<i32>, chime: Option<String>, chimesid: Option<i32>) -> Result<chime_data::Model, String> {
    let invoketime_opt = match time {
        Some(time) => Some(NaiveTime::from(Seconds(time))),
        _ => None
    };
    match chime_update(Some(id), title, invoketime_opt, Some(chime), chimesid).await {
        Ok(retval) => Ok(retval),
        _ => Err("update record error.".into())
    }
}

#[tauri::command]
pub async fn delete_chime(id: i32) -> Result<u64, String> {
    match chime_delete(id).await {
        Err(_) => Err("delete ercord error.".into()),
        Ok(retval) => Ok(retval)
    }
}