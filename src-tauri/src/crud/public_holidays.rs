use std::rc;

/**
 * 祝祭日マスターデータテーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::PublicHolidays as Entity;
use crate::entities::public_holidays as entity;

use crate::app::datetime::{ get_current_timestamp_f64, Unixdays };

pub async fn create(title: String, unix_date: Unixdays) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        title: ActiveValue::Set(title),
        date: ActiveValue::Set(unix_date.into()),
        created_at: ActiveValue::Set(get_current_timestamp_f64()),
        updated_at: ActiveValue::Set(get_current_timestamp_f64()),
        ..Default::default()
    };
    Ok(Entity::insert(rcd).exec(&conn).await?.last_insert_id)
}

pub async fn update(id: i32, title: Option<String>, mad: Option<Unixdays>) -> Result<(), DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        id: ActiveValue::Set(id),
        title: match title { Some(t) => ActiveValue::Set(t), _ => ActiveValue::NotSet },
        date: match mad { Some(d) => ActiveValue::Set(d.into()), _ => ActiveValue::NotSet },
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::Set(get_current_timestamp_f64())
    };
    let _ = rcd.update(&conn).await?;
    Ok(())
}

pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let tgt = entity::ActiveModel {
        id: ActiveValue::Set(id),
        ..Default::default()
    };
    Ok(tgt.delete(&conn).await?.rows_affected)
}

pub async fn read_all() -> Result<Vec<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

pub async fn check_holiday(mad: Unixdays) -> Result<Option<entity::Model> , DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().filter(entity::Column::Date.eq(i32::from(mad))).one(&conn).await?)
}

pub async fn read_title(title: String) -> Result<Option<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().filter(entity::Column::Title.eq(title)).one(&conn).await?)
}