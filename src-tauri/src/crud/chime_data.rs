/**
 * DailyChimeテーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::ChimeData as Entity;
use crate::entities::chime_data as entity;

use chrono::NaiveTime;
use crate::app::datetime::{ get_current_timestamp_f64, Seconds };

pub async fn create(title: String, invoke_time: NaiveTime, chime: Option<String>, chimes_id: i32) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        title: ActiveValue::Set(title),
        invoke_time: ActiveValue::Set(Seconds::from(&invoke_time).into()),
        chime: ActiveValue::Set(chime),
        daily_chimes_id: ActiveValue::Set(chimes_id),
        created_at: ActiveValue::Set(get_current_timestamp_f64()),
        updated_at: ActiveValue::Set(get_current_timestamp_f64()),
        ..Default::default()
    };
    Ok(Entity::insert(rcd).exec(&conn).await?.last_insert_id)
}

pub async fn update(
    id_opt: Option<i32>, 
    title_opt: Option<String>,
    time_opt: Option<NaiveTime>, 
    chime_opt: Option<Option<String>>,
    chimes_id_opt: Option<i32>) -> Result<entity::Model, DbErr> {
    let conn = super::common::get_connection().await?;
    let id = match id_opt {
        Some(opt) => opt,
        _ => {
            match &title_opt {
                Some(title) => {
                    let t = title.clone();
                    let model = Entity::find().filter(entity::Column::Title.eq(t)).one(&conn).await?;
                    match model {
                        Some(m) => m.id,
                        _ => return Err(DbErr::RecordNotFound("Record Error".into()))
                    }
                },
                _ => panic!("IDまたはタイトルが無いと更新できません")
            }
        }
    };
    let rcd = entity::ActiveModel {
        id: ActiveValue::Set(id),
        title: match title_opt {
            Some(title) => ActiveValue::Set(title),
            _ => ActiveValue::NotSet
        },
        invoke_time: match time_opt {
            Some(time) => ActiveValue::Set(Seconds::from(&time).into()),
            _ => ActiveValue::NotSet
        },
        chime: match chime_opt {
            Some(chime) => ActiveValue::Set(chime),
            _ => ActiveValue::NotSet
        },
        daily_chimes_id: match chimes_id_opt {
            Some(chime_id) => ActiveValue::Set(chime_id),
            _ => ActiveValue::NotSet
        },
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::Set(get_current_timestamp_f64())
    };
    Ok(rcd.update(&conn).await?)
}

#[allow(dead_code)]
pub async fn read(id: i32) -> Result<Option<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find_by_id(id).one(&conn).await?)
}

#[allow(dead_code)]
pub async fn read_all() -> Result<Vec<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let tgt = entity::ActiveModel {
        id: ActiveValue::Set(id),
        ..Default::default()
    };
    Ok(tgt.delete(&conn).await?.rows_affected)
}

#[allow(dead_code)]
pub async fn read_count() -> Result<usize, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().count(&conn).await?)
}