/**
 * DailyChimeテーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::Schedule as Entity;
use crate::entities::{schedule as entity, chime_data};
use crate::entities::daily_chimes;
use crate::entities::public_holidays;
use crate::entities::prelude::{PublicHolidays, DailyChimes, ChimeData };

use chrono::{ NaiveDate, Datelike, Weekday };
use crate::app::datetime::{ get_current_timestamp_f64, DateInfo, Unixdays };

pub async fn create(title: String, info: DateInfo, date: Option<i32>, chimes_id: Option<i32>) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        title: ActiveValue::Set(title),
        date_info: ActiveValue::Set(info.into()),
        date: ActiveValue::Set(date),
        daily_chimes_id: ActiveValue::Set(chimes_id),
        created_at: ActiveValue::Set(get_current_timestamp_f64()),
        updated_at: ActiveValue::Set(get_current_timestamp_f64()),
        ..Default::default()
    };
    Ok(Entity::insert(rcd).exec(&conn).await?.last_insert_id)
}

pub async fn update(id_opt: Option<i32>, title_opt: Option<String>, date_opt: Option<Option<i32>>, chimes_id_opt: Option<Option<i32>>) -> Result<entity::Model, DbErr> {
    let conn = super::common::get_connection().await?;
    let id: i32 = match id_opt {
        Some(id) => id,
        _ => {
            let title1 = title_opt.clone();
            match title1 {
                Some(title) => {
                    let model = Entity::find().filter(entity::Column::Title.eq(title)).one(&conn).await?;
                    if let Some(m) = model {
                        m.id
                    } else {
                        return Err(DbErr::RecordNotFound("指定のタイトルが見つかりませんでした".into()));
                    }
                }
                _ => panic!("required id or title.")
            }
        }
    };
    let rcd = entity::ActiveModel {
        id: ActiveValue::Set(id),
        title: match title_opt {
            Some(title) => ActiveValue::Set(title),
            _ => ActiveValue::NotSet
        },
        date_info: ActiveValue::NotSet,
        date: match date_opt {
            Some(date) => ActiveValue::Set(date),
            _ => ActiveValue::NotSet
        },
        daily_chimes_id: match chimes_id_opt {
            Some(chimes) => ActiveValue::Set(chimes),
            _ => ActiveValue::NotSet
        },
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::Set(get_current_timestamp_f64()),
    };
    Ok(rcd.update(&conn).await?)
}

pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let tgt = entity::ActiveModel { id : ActiveValue::Set(id), ..Default::default() };
    Ok(tgt.delete(&conn).await?.rows_affected)
}

pub async fn read_all() -> Result<Vec<entity::Model>, DbErr>{
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

pub async fn read(id: i32) -> Result<Vec<(entity::Model, Option<daily_chimes::Model>)>, DbErr> {
    let conn = super::common::get_connection().await?;
    let ret = Entity::find_by_id(id).find_also_related(daily_chimes::Entity).all(&conn).await?;
    Ok(ret)
}

pub async fn read_by_date(date: i32) -> Result<(entity::Model, daily_chimes::Model, Vec<chime_data::Model>), DbErr> {
    let conn = super::common::get_connection().await?;
    let nd: NaiveDate = Unixdays(date).into();
    let suledule_model: entity::Model = 
        match Entity::find().filter(entity::Column::Date.eq(date)).one(&conn).await? {
            Some(model) => model,
            _ => {
                let model_opt = match Entity::find().filter(entity::Column::DateInfo.eq(String::from(DateInfo::PublicHoliDay))).one(&conn).await? {
                    Some(model) => {
                        match model.daily_chimes_id {
                            Some(_) => match PublicHolidays::find().filter(public_holidays::Column::Date.eq(date)).one(&conn).await? {
                                Some(_) => Some(model),
                                _ => None
                            }
                            _ => None
                        }
                    },
                    _ => None
                };
                match model_opt {
                    Some(model) => model, // 祝祭日モデルがあればコレを採用
                    _ => {
                        let weekday = match nd.weekday() {
                            Weekday::Mon => DateInfo::Monday,
                            Weekday::Tue => DateInfo::Tuseday,
                            Weekday::Wed => DateInfo::Wednesday,
                            Weekday::Thu => DateInfo::Thursday,
                            Weekday::Fri => DateInfo::Friday,
                            Weekday::Sat => DateInfo::Saturday,
                            Weekday::Sun => DateInfo::Sunday
                        };
                        let opt = match Entity::find().filter(entity::Column::DateInfo.eq(String::from(weekday))).one(&conn).await? {
                            Some(model) => match model.daily_chimes_id {
                                Some(_) => Some(model),
                                _ => None
                            },
                            _ => None
                        };
                        match opt {
                            Some(model) => model, // 当日の曜日モデルが存在すればそれを採用
                            _ => {
                                let weekday = 
                                match nd.weekday() {
                                    Weekday::Mon |
                                    Weekday::Tue |
                                    Weekday::Wed |
                                    Weekday::Thu |
                                    Weekday::Fri => DateInfo::WeekDay,
                                    _ => DateInfo::HoliDay
                                };
                                let opt = match Entity::find().filter(entity::Column::DateInfo.eq(String::from(weekday))).one(&conn).await? {
                                    Some(model) => match model.daily_chimes_id {
                                        Some(_) => Some(model),
                                        _ => None
                                    },
                                    _ => None
                                };
                                match opt {
                                    Some(model) => model, // 休日予定が無い場合は Noneになるので、下で平日予定扱い
                                    _ => Entity::find().filter(entity::Column::DateInfo.eq(String::from(DateInfo::WeekDay))).one(&conn).await?.unwrap()
                                }
                            }
                        }
                    }
                }
            }
        };
    let id = suledule_model.id;
    let model = Entity::find_by_id(id).find_also_related(daily_chimes::Entity).all(&conn).await?;
    let len = model.len();
    match len {
        0 => Err(DbErr::RecordNotFound("schedule not found".into())),
        _ => {
            let schedule_model = model[0].0.clone();
            let dailychimes_model_opt = model[0].1.clone();
            match dailychimes_model_opt {
                Some(dailychimes_model) => {
                    let chimes = DailyChimes::find_by_id(dailychimes_model.id).find_with_related(chime_data::Entity).all(&conn).await?;
                    match chimes.len() {
                        0 => panic!("something error"),
                        _ => Ok((schedule_model, dailychimes_model, chimes[0].1.clone()))
                    }
                }
                _ => Err(DbErr::RecordNotFound("daily_chime data not linked".into()))
            }
        }
    }
}