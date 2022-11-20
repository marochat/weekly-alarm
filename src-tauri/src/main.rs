#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app;
mod crud;
mod entities;
mod api;

use api::config;
use api::chimes;
use api::test;
use api::sound;


#[tokio::main]
async fn main() {
  // データベース初期化
  crud::common::up().await.unwrap();
  // テスト関数
  app::test::app_test().await;
  // ディスパッチャ起動
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      config::test_cmd,
      config::set_config_param,
      config::get_config_param,
      config::delete_param,
      config::create_audio_data,
      config::delete_audio_data,
      config::read_all_audio_data,
      chimes::inquiry_schedule,
      chimes::read_all_schedules,
      chimes::read_all_chimes,
      chimes::is_chimes_in_schedule,
      chimes::get_schedules_for_chimes_id,
      chimes::schedule_update,
      chimes::schedule_create_rsvd,
      chimes::schedule_delete,
      chimes::create_chimes,
      chimes::delete_chimes,
      chimes::create_chime,
      chimes::update_chime,
      chimes::delete_chime,
      sound::create_sound,
      sound::update_sound_title,
      sound::delete_sound_data,
      sound::read_all_sound_data,
      test::get_tuple,
      test::get_file_obj,

    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
