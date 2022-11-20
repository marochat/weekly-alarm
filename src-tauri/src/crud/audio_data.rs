/**
 * AudioData テーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::AudioData as Entity;
use crate::entities::audio_data as entity;

pub async fn create(title: String, path: String) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let rcd = entity::ActiveModel {
        title: ActiveValue::Set(title),
        path: ActiveValue::Set(path),
        ..Default::default()
    };
    Ok(Entity::insert(rcd).exec(&conn).await?.last_insert_id)
}

pub async fn update_name(title: String, new_title: String) -> Result<entity::Model, DbErr> {
    let conn = super::common::get_connection().await?;
    let id = match Entity::find().filter(entity::Column::Title.eq(title)).one(&conn).await? {
        Some(model) => model.id,
        _ => return Err(DbErr::RecordNotFound("Recort Error".into()))
    };
    let rcd = entity::ActiveModel {
        id: ActiveValue::Set(id),
        title: ActiveValue::Set(new_title),
        path: ActiveValue::NotSet,
    };
    Ok(rcd.update(&conn).await?)
}

pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let tgt = entity::ActiveModel {
        id: ActiveValue::Set(id),
        ..Default::default()
    };
    Ok(tgt.delete(&conn).await?.rows_affected)
}

pub async fn delete_name(title: String) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    match Entity::find().filter(entity::Column::Title.eq(title)).one(&conn).await? {
        Some(model) => {
            let tgt = entity::ActiveModel {
                id: ActiveValue::Set(model.id),
                ..Default::default()
            };
            Ok(tgt.delete(&conn).await?.rows_affected)
        },
        _ => Err(DbErr::RecordNotFound("Record Error".into()))
    }
}

pub async fn read_all() -> Result<Vec<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

