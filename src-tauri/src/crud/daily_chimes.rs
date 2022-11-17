/**
 * DailyChimeテーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::DailyChimes as Entity;
use crate::entities::daily_chimes as entity;

use crate::entities::prelude::ChimeData;
use crate::entities::chime_data;

use crate::entities::prelude::Schedule;
use crate::entities::schedule;

use crate::app::datetime::{ get_current_timestamp_f64 };

pub async fn create(title: String) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        title: sea_orm::ActiveValue::Set(title),
        created_at: sea_orm::ActiveValue::Set(get_current_timestamp_f64()),
        updated_at: sea_orm::ActiveValue::Set(get_current_timestamp_f64()),
        ..Default::default()
    };
    let res = Entity::insert(rcd).exec(&conn).await?;
    Ok(res.last_insert_id)
}

#[allow(dead_code)]
pub async fn update(id: i32, title: String) -> Result<(), DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        id: ActiveValue::Set(id),
        title: ActiveValue::Set(title),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::Set(get_current_timestamp_f64()),
    };
    rcd.update(&conn).await?;
    Ok(())
}

#[allow(dead_code)]
pub async fn read_all() -> Result<Vec<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

pub async fn read_all_related() -> Result<Vec<(entity::Model, Vec<chime_data::Model>)>, DbErr> {
    let conn = super::common::get_connection().await?;
    let ret = Entity::find().find_with_related(ChimeData).all(&conn).await?;
    Ok(ret)
}

pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let tgt = entity::ActiveModel {
        id: ActiveValue::set(id),
        ..Default::default()
    };
    Ok(tgt.delete(&conn).await?.rows_affected)
}

pub async fn read_count() -> Result<usize, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().count(&conn).await?)
}

#[allow(dead_code)]
pub async fn find_title(title: String) -> Result<Option<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().filter(entity::Column::Title.eq(title)).one(&conn).await?)
}

#[allow(dead_code)]
pub async fn find_title_related(title: String) -> Result<Option<(entity::Model, Vec<chime_data::Model>)>, DbErr> {
    let conn = super::common::get_connection().await?;
    let val = Entity::find().filter(entity::Column::Title.eq(title)).find_with_related(ChimeData).all(&conn).await?;
    match val.len() {
        0 => Ok(None),
        _ => Ok(Some(val[0].clone()))
    }
}

#[allow(dead_code)]
pub async fn find_id_related(id: i32) -> Result<Option<(entity::Model, Vec<chime_data::Model>)>, DbErr> {
    let conn = super::common::get_connection().await?;
    let val = Entity::find_by_id(id).find_with_related(ChimeData).all(&conn).await?;
    match val.len() {
        0 => Ok(None),
        _ => Ok(Some(val[0].clone()))
    }
}

pub async fn find_id_in_schedule(id: i32) -> Result<Option<(entity::Model, Vec<schedule::Model>)>, DbErr> {
    let conn = super::common::get_connection().await?;
    let val = Entity::find_by_id(id).find_with_related(Schedule).all(&conn).await?;
    match val.len() {
        0 => Ok(None),
        _ => Ok(Some(val[0].clone()))
    }
}
