/**
 * AppConfigテーブルへのCRUD処理モジュール
 */
use sea_orm::{ DbErr, EntityTrait, ActiveModelTrait };
use sea_orm::*;

use crate::entities::prelude::AppConfig as Entity;
use crate::entities::app_config as entity;

#[allow(dead_code)]
pub async fn create(data: entity::Model) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let record = entity::ActiveModel {
        param: sea_orm::ActiveValue::Set(data.param),
        value: sea_orm::ActiveValue::Set(data.value),
        ..Default::default()
    };
    let res = Entity::insert(record).exec(&conn).await?;
    Ok(res.last_insert_id)
}

pub async fn setparam(param: String, value: Option<String>) -> Result<i32, DbErr> {
    let conn = super::common::get_connection().await?;
    let param1 = param.clone();
    match Entity::find().filter(entity::Column::Param.eq(param)).one(&conn).await? {
        Some(data) => {
            let target = entity::ActiveModel {
                id: sea_orm::ActiveValue::Set(data.id),
                param: sea_orm::ActiveValue::NotSet,
                value: sea_orm::ActiveValue::Set(data.value),
            };
            let _ = target.update(&conn).await?;
            Ok(data.id)
        },
        _ => {
            let target = entity::ActiveModel {
                param: sea_orm::ActiveValue::Set(param1),
                value: sea_orm::ActiveValue::Set(value),
                ..Default::default()
            };
            Ok(Entity::insert(target).exec(&conn).await?.last_insert_id)
        }
    }
}

#[allow(dead_code)]
pub async fn read_all() -> Result<Vec<entity::Model>, DbErr> {
    let conn = super::common::get_connection().await?;
    Ok(Entity::find().all(&conn).await?)
}

pub async fn read_value(param: String) -> Result<Option<String>, DbErr> {
    let conn = super::common::get_connection().await?;
    match Entity::find().filter(entity::Column::Param.eq(param)).one(&conn).await? {
        Some(data) => {
            match data.value {
                Some(val) => Ok(Some(val)),
                _ => Ok(Some("".into()))
            }
        },
        _ => Ok(None)
    }
    
}

#[allow(dead_code)]
pub async fn delete(id: i32) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    let target = entity::ActiveModel {
        id: sea_orm::ActiveValue::Set(id),
        ..Default::default()
    };
    Ok(target.delete(&conn).await?.rows_affected.into())
}

pub async fn delete_param(param: String) -> Result<u64, DbErr> {
    let conn = super::common::get_connection().await?;
    match Entity::find().filter(entity::Column::Param.eq(param)).one(&conn).await? {
        Some(data) => {
            let target = entity::ActiveModel {
                id: sea_orm::ActiveValue::Set(data.id),
                ..Default::default()
            };
            Ok(target.delete(&conn).await?.rows_affected.into())
        }
        _ => Ok(0)
    }
    /*
    let target: = entity::ActiveModel {
        param: ActiveValue::Set(param),
        ..Default::default()
    };
    Ok(target.delete(&conn).await?.rows_affected.into())
    */
}

