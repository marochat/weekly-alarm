use sea_orm_migration::prelude::*;
use super::m20220831_221346_create_daily_chimes_table::DailyChimes;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Schedule::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Schedule::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Schedule::Title).string().unique_key().not_null())
                    .col(ColumnDef::new(Schedule::DateInfo).string().not_null())
                    .col(ColumnDef::new(Schedule::Date).integer().unique_key())
                    .col(ColumnDef::new(Schedule::DailyChimesId).integer())
                    .col(ColumnDef::new(Schedule::CreatedAt).decimal().not_null())
                    .col(ColumnDef::new(Schedule::UpdatedAt).decimal().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_schedule_daily_chimes_id")
                            .from(Schedule::Table, Schedule::DailyChimesId)
                            .to(DailyChimes::Table, DailyChimes::Id)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Schedule::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Schedule {
    Table,
    Id,
    Title,
    DateInfo,
    Date,
    DailyChimesId,
    CreatedAt,
    UpdatedAt,
}
