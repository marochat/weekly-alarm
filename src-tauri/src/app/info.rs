/**
 * アプリケーション固有情報
 */
pub const PROJECT_NAME: &'static str = "weekly_timer";

#[cfg(debug_assertions)]
pub const DATABASE_NAME: &'static str = "app_debug.db";
#[cfg(not(debug_assertions))]
pub const DATABASE_NAME: &'static str = "app.db";

#[cfg(debug_assertions)]
pub const TEST_GLOBAL: &'static str = "debug flag";
#[cfg(not(debug_assertions))]
pub const TEST_GLOBAL: &'static str = "release flag";

/**
 * データベース関連
 */
pub const DAILYCHIMES_EMPTY: &'static str = "アラーム無し";
pub const DAILYCHIMES_SAMPLE: &'static str = "日常サンプル";
// pub const DAILYCHIMES_S2: &'static str = "sample2";
// pub const DAILYCHIMES_S3: &'static str = "sample3";
// pub const DAILYCHIMES_S4: &'static str = "sample4";
