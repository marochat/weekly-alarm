use sea_orm::{ DatabaseConnection, DbErr };
use migration::{Migrator, MigratorTrait};

/**
 * データベースへの接続を行い、コネクションオブジェクトを所有権ごと返す
 * DBファイルが無ければ作成
 */
pub async fn get_connection() -> Result<DatabaseConnection, DbErr> {
    let db_url = crate::app::path::get_database_url();
    let conn = sea_orm::Database::connect(&db_url).await?;
    Ok(conn)
}

/**
 * 初期マイグレート処理（Db）
 * テーブルデータが無ければ作成
 */
pub async fn up() -> Result<(), DbErr> {
    let conn = get_connection().await?;
    if let Err(_) = Migrator::up(&conn, None).await {
        Migrator::reset(&conn).await?;
        Migrator::refresh(&conn).await?;
    }
    Ok(())
}
