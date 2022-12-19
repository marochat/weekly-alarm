#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app;
mod crud;
mod entities;
mod api;

use once_cell::sync::Lazy;
use std::sync::Mutex;

use api::config;
use api::chimes;
use api::test;
use api::sound;
use api::holiday;

pub static DBPATH: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(String::from("")));

// #[tokio::main] // Builder::setupで非同期関数を使用するために、main関数の非同期化を取りやめ
// setup内でtokio::runtimeを呼び出して非同期処理を行うこととした
fn main() {
  // let _args = Args::parse();
  // データベース初期化
  // crud::common::up().await.unwrap();
  // テスト関数
  // app::test::app_test().await;

  // ディスパッチャ起動
  tauri::Builder::default()
    .setup(move |app| {
      match app.get_cli_matches() {
        Ok(args) => {
          println!("{}", args.args["nosound"].value);
          println!("{}", args.args["dbpath"].value);
          let pth = &args.args["dbpath"].value;
          match pth.as_str() {
            Some(p) => *DBPATH.lock().unwrap() = String::from(p),
            _ => {}
          }
        },
        Err(_) => {}
      }
      // 非同期処理：CLI引数解釈のあとにデータベース初期処理を行うため
      // tokio::mainを取りやめて、ここでtokio::runtimeを使用する
      let tsk = async {
        // データベース初期化
        crud::common::up().await.unwrap();
        // テスト関数
        app::test::app_test().await;
        println!("tskkkkk");
      };
      tauri::async_runtime::block_on(tsk);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      config::logging,
      config::test_cmd,
      config::set_config_param,
      config::get_config_param,
      config::delete_param,
      config::create_audio_data,
      config::delete_audio_data,
      config::read_all_audio_data,
      config::get_db_path,
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
      holiday::create_holiday,
      holiday::update_holiday,
      holiday::delete_holiday,
      holiday::read_holidays,
      holiday::read_holidays_from_file,
      test::get_tuple,
      test::get_file_obj,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
