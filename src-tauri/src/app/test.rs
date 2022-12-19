use crate::crud;
// use std::{convert::From};
// use chrono::{ DateTime, Date, Utc, Local, NaiveTime };
// use super::datetime::{ Unixtime, Unixdays, Seconds };
// use tauri;
//pub struct Holiday(i32, i32, &'static str);

//pub const PUBLIC_HILIDAYS: [Holiday; 1] = [
//
//];

pub async fn app_test() {
    let db_url = super::path::get_database_url();
    println!("{}", db_url);

    //crud::common::up().await.unwrap();
    let param = "xdata";
    let value = "xvalue";
    match crud::app_config::read_value(param.into()).await.unwrap() {
        Some(_s) => {
            println!("DB file found!");
        },
        _ => {
            println!("DB file not found data. and create");
            crud::app_config::setparam(param.into(), Some(value.into())).await.unwrap();
        }
    }

    // println!("{}", info::TEST_GLOBAL);
    // let dt = Utc::now();
    // let lt: DateTime<Local> = dt.into();
    // let ut: i64 = Unixtime::from(&dt).into();
    // let lut: DateTime<Local> = Unixtime(ut).into();
    // println!("Utc {}", &dt);
    // println!("local {}", &lt);
    // println!("conv local {}", &lut);
    // let dd = Local::now().date();
    // let udd: i32 = Unixdays::from(&dd).into();
    // let udd1: Date<Local> = Unixdays(udd).into();
    // println!("Date<loal>: {}", dd.to_string());
    // println!("i32->Date:  {}", udd1.to_string());

    // let time = Local::now().time();
    // println!("nativetime: {}", &time);
    // let time1 = NaiveTime::from(Seconds(1235983));
    // println!("maked naive: {}", &time1);
    // let sec = Seconds::from(&time).0;
    // let time2 = NaiveTime::from(Seconds(sec));
    // println!("return value: {}", &time2);
    // let time0 = NaiveTime::fro
    //let ddt1 = ddt;
    super::init::init_db().await;
}
