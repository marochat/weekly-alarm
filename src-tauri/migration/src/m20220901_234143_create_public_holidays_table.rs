use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PublicHolidays::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PublicHolidays::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(PublicHolidays::Title).string().not_null())
                    .col(ColumnDef::new(PublicHolidays::Date).integer().unique_key().not_null())
                    .col(ColumnDef::new(PublicHolidays::CreatedAt).decimal().not_null())
                    .col(ColumnDef::new(PublicHolidays::UpdatedAt).decimal().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PublicHolidays::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum PublicHolidays {
    Table,
    Id,
    Title,
    Date, /* Month * 100 + Day ----> Unixdays */
    CreatedAt,
    UpdatedAt,
}
