//! SeaORM Entity. Generated by sea-orm-codegen 0.9.2

use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, Serialize, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "schedule")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    pub date_info: String,
    pub date: Option<i32>,
    pub daily_chimes_id: Option<i32>,
    pub created_at: f64,
    pub updated_at: f64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::daily_chimes::Entity",
        from = "Column::DailyChimesId",
        to = "super::daily_chimes::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DailyChimes,
}

impl Related<super::daily_chimes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DailyChimes.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
