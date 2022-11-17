use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(DailyChimes::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(DailyChimes::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(DailyChimes::Title).string().unique_key().not_null())
                    .col(ColumnDef::new(DailyChimes::CreatedAt).decimal().not_null())
                    .col(ColumnDef::new(DailyChimes::UpdatedAt).decimal().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(DailyChimes::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum DailyChimes {
    Table,
    Id,
    Title,
    CreatedAt,
    UpdatedAt
}
