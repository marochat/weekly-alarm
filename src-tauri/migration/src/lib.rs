pub use sea_orm_migration::prelude::*;

mod m20220831_154955_create_app_config_table;
mod m20220831_221346_create_daily_chimes_table;
mod m20220901_222248_create_chime_data_table;
mod m20220901_230002_create_schedule_table;
mod m20220901_234143_create_public_holidays_table;
mod m20220916_170958_create_audio_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220831_154955_create_app_config_table::Migration),
            Box::new(m20220831_221346_create_daily_chimes_table::Migration),
            Box::new(m20220901_222248_create_chime_data_table::Migration),
            Box::new(m20220901_230002_create_schedule_table::Migration),
            Box::new(m20220901_234143_create_public_holidays_table::Migration),
            Box::new(m20220916_170958_create_audio_table::Migration),
        ]
    }
}
