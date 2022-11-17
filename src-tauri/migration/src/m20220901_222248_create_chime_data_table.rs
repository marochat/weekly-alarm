use sea_orm_migration::prelude::*;
use crate::m20220831_221346_create_daily_chimes_table::DailyChimes;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ChimeData::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ChimeData::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ChimeData::Title).string().not_null())
                    .col(ColumnDef::new(ChimeData::InvokeTime).integer().not_null())
                    .col(ColumnDef::new(ChimeData::Chime).string())
                    .col(ColumnDef::new(ChimeData::DailyChimesId).integer().not_null())
                    .col(ColumnDef::new(ChimeData::CreatedAt).decimal().not_null())
                    .col(ColumnDef::new(ChimeData::UpdatedAt).decimal().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_chime_data_daily_chimes_id")
                            .from(ChimeData::Table, ChimeData::DailyChimesId)
                            .to(DailyChimes::Table, DailyChimes::Id)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ChimeData::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum ChimeData {
    Table,
    Id,
    Title,
    InvokeTime,
    Chime,
    DailyChimesId,
    CreatedAt,
    UpdatedAt,
}
