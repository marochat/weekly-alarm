use std::{convert::From, ops::Div };
use chrono::{ DateTime, NaiveDate, Date, Utc, Local, TimeZone, NaiveTime, Duration, Timelike, Datelike, NaiveDateTime };

pub const ONE_DAY_SECONDS: i32 = 3600 * 24;

#[derive(Clone, Copy)]
pub struct Unixtime(pub i64);
#[derive(Clone, Copy)]
pub struct Unixdays(pub i32);
#[derive(Clone, Copy)]
pub struct Seconds(pub i32);
#[derive(Clone, Copy)]
pub struct MonthDay(pub i32);
#[derive(Clone, Copy)]
pub struct MonthAndDay(pub i32, pub i32);
#[derive(Clone, Copy)]
pub struct YearDate(pub i32, pub i32, pub i32);


impl From<Unixtime> for i64 {
    fn from(ut: Unixtime) -> i64 {
        ut.0
    }
}

impl From<Unixdays> for i32 {
    fn from(ud: Unixdays) -> Self {
        ud.0
    }
}

impl From<Seconds> for i32 {
    fn from(scd: Seconds) -> Self {
        scd.0
    }
}

impl From<&DateTime<Utc>> for Unixtime {
    fn from(&item: &DateTime<Utc>) -> Unixtime {
        Unixtime(item.timestamp())
    }
}

impl From<&NaiveDateTime> for Unixtime {
    fn from(ndt: &NaiveDateTime) -> Self {
        Unixtime(ndt.timestamp())
    }
}

impl From<Unixtime> for DateTime<Utc> {
    fn from(ut: Unixtime) -> DateTime<Utc> {
        Utc.timestamp(ut.into(), 0)
    }
}

impl From<Unixtime> for DateTime<Local> {
    fn from(ut: Unixtime) -> DateTime<Local> {
        Local.timestamp(ut.into(), 0)
    }
}

impl From<Unixtime> for NaiveDateTime {
    fn from(ut: Unixtime) -> Self {
        NaiveDateTime::from_timestamp(ut.into(), 0)
    }
}

impl From<&NaiveDate> for Unixdays {
    fn from(nd: &NaiveDate) -> Self {
        let tmstmp = nd.and_time(Seconds(0).into()).timestamp();
        let days = tmstmp / ONE_DAY_SECONDS as i64;
        Unixdays(days.try_into().unwrap())
    }
}

impl From<Unixdays> for NaiveDate {
    fn from(ud: Unixdays) -> Self {
        let ut = ud.0 as i64 * ONE_DAY_SECONDS as i64 + 1;
        NaiveDateTime::from_timestamp(ut, 0).date()
    }
}

impl From<&Date<Local>> for Unixdays {
    fn from(dt: &Date<Local>) -> Self {
        //let tmstmp = dt.and_time(NaiveTime::from_hms(0, 0, 0)).unwrap().timestamp();
        let tmstmp = dt.and_time(Seconds(0).into()).unwrap().timestamp();
        //println!("debug: {}",Local.timestamp(tmstmp, 0).to_string());
        let days: i64 = tmstmp.div(ONE_DAY_SECONDS as i64);
        Unixdays(days.try_into().unwrap())
    }
}

impl From<Unixdays> for Date<Local> {
    fn from(ud: Unixdays) -> Self {
        let unixtime = ud.0 as i64 * ONE_DAY_SECONDS as i64 + 1;
        Local.timestamp(unixtime, 0).date()
    }
}

impl From<Unixdays> for Date<Utc> {
    fn from(ud: Unixdays) -> Self {
        let unixtime = ud.0 as i64 * ONE_DAY_SECONDS as i64 + 1;
        Utc.timestamp(unixtime, 0).date()
    }
}

impl From<Seconds> for NaiveTime {
    fn from(sec: Seconds) -> Self {
        let secs = Duration::seconds(sec.0 as i64);
        let ret = NaiveTime::from_hms(0,0,0) + secs;
        ret
    }
}

impl From<&NaiveTime> for Seconds {
    fn from(nvt: &NaiveTime) -> Self {
        let secs = nvt.hour() * 3600 + nvt.minute() * 60 + nvt.second();
        let isec: i32 = secs.try_into().unwrap();
        Seconds(isec)
    }
}

impl From<MonthDay> for i32 {
    fn from(md: MonthDay) -> Self {
        md.0
    }
}

impl From<MonthAndDay> for i32 {
    fn from(mad: MonthAndDay) -> Self {
        mad.0 * 100 + mad.1
    }
}

impl From<MonthAndDay> for MonthDay {
    fn from(mad: MonthAndDay) -> Self {
        MonthDay(mad.0 + mad.1)
    }
}

impl From<MonthDay> for MonthAndDay {
    fn from(md: MonthDay) -> Self {
        MonthAndDay(md.0 / 100, md.0 % 100)
    }
}

impl From<&Date<Local>> for MonthAndDay {
    fn from(&dt: &Date<Local>) -> Self {
        MonthAndDay(dt.month() as i32, dt.day() as i32)
    }

}

impl From<&Date<Utc>> for MonthAndDay {
    fn from(&dt: &Date<Utc>) -> Self {
        MonthAndDay(dt.month() as i32, dt.day() as i32)
    }
}

impl From<YearDate> for NaiveDate {
    fn from(yd: YearDate) -> Self {
        NaiveDate::from_ymd_opt(yd.0, yd.1 as u32, yd.2 as u32).unwrap()
    }
}

impl From<YearDate> for Unixdays {
    fn from(yd: YearDate) -> Self {
        let nd = NaiveDate::from_ymd_opt(yd.0, yd.1 as u32, yd.2 as u32).unwrap();
        let ndt: NaiveDateTime = nd.and_time(Seconds(0).into());
        let tmstmp = ndt.timestamp();
        Unixdays((tmstmp / ONE_DAY_SECONDS as i64).try_into().unwrap())
    }
}

impl From<&NaiveDate> for YearDate {
    fn from(nd: &NaiveDate) -> Self {
        YearDate(nd.year(), nd.month() as i32, nd.day() as i32)
    }
} 

pub fn get_current_timestamp_f64() -> f64 {
    let date = Local::now().timestamp();
    date as f64
}

pub enum DateInfo {
    WeekDay,
    HoliDay,
    Monday,
    Tuseday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
    PublicHoliDay,
    ReservedDay,
}

impl From<DateInfo> for String {
    fn from(di: DateInfo) -> Self {
        match di {
            DateInfo::WeekDay => "WeekDay".into(),
            DateInfo::HoliDay => "HoliDay".into(),
            DateInfo::Monday => "Monday".into(),
            DateInfo::Tuseday => "Tuseday".into(),
            DateInfo::Wednesday => "Wednesday".into(),
            DateInfo::Thursday => "Thursday".into(),
            DateInfo::Friday => "Friday".into(),
            DateInfo::Saturday => "Saturday".into(),
            DateInfo::Sunday => "Sunday".into(),
            DateInfo::PublicHoliDay => "PublicHoliDay".into(),
            DateInfo::ReservedDay => "ReservedDay".into(),
        }
    }
}

impl From<&String> for DateInfo {
    fn from(st: &String) -> Self {
        match st.as_str() {
            "WeekDay" => DateInfo::WeekDay,
            "HoliDay" => DateInfo::HoliDay,
            "Monday" => DateInfo::Monday,
            "Tuseday" => DateInfo::Tuseday,
            "Wednesday" => DateInfo::Wednesday,
            "Thursday" => DateInfo::Thursday,
            "Friday" => DateInfo::Friday,
            "Saturday" => DateInfo::Saturday,
            "Sunday" => DateInfo::Sunday,
            "PublicHoliDay" => DateInfo::PublicHoliDay,
            "ReservedDay" => DateInfo::ReservedDay,
            _ => panic!("illeagal keyword.")
        }
    }
}