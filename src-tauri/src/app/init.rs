use chrono::{ NaiveDate, NaiveTime };
use crate::crud::public_holidays::{ check_holiday, create };
use crate::crud::daily_chimes::{ read_count, create as chimes_create};
use crate::crud::chime_data;
use crate::crud::schedule;
use crate::app::datetime::DateInfo;

pub struct Holiday(&'static str, &'static str);

const PUBLIC_HOLIDAYS: [Holiday; 33] = [
    Holiday("2022/1/1", "元日"),
    Holiday("2022/1/10", "成人の日"), 
    Holiday("2022/2/11", "建国記念の日"),
    Holiday("2022/2/23", "天皇誕生日"),
    Holiday("2022/3/21", "春分の日"),
    Holiday("2022/4/29", "昭和の日"),
    Holiday("2022/5/3", "憲法記念日"),
    Holiday("2022/5/4", "みどりの日"),
    Holiday("2022/5/5", "こどもの日"),
    Holiday("2022/7/18", "海の日"),
    Holiday("2022/8/11", "山の日"),
    Holiday("2022/9/19", "敬老の日"),
    Holiday("2022/9/23", "秋分の日"),
    Holiday("2022/10/10", "スポーツの日"),
    Holiday("2022/11/3", "文化の日"),
    Holiday("2022/11/23", "勤労感謝の日"),
    Holiday("2023/1/1", "元日"),
    Holiday("2023/1/2", "休日"),
    Holiday("2023/1/9", "成人の日"),
    Holiday("2023/2/11", "建国記念の日"),
    Holiday("2023/2/23", "天皇誕生日"),
    Holiday("2023/3/21", "春分の日"),
    Holiday("2023/4/29", "昭和の日"),
    Holiday("2023/5/3", "憲法記念日"),
    Holiday("2023/5/4", "みどりの日"),
    Holiday("2023/5/5", "こどもの日"),
    Holiday("2023/7/17", "海の日"),
    Holiday("2023/8/11", "山の日"),
    Holiday("2023/9/18", "敬老の日"),
    Holiday("2023/9/23", "秋分の日"),
    Holiday("2023/10/9", "スポーツの日"),
    Holiday("2023/11/3", "文化の日"),
    Holiday("2023/11/23", "勤労感謝の日"),
];

// Title, InvekeTime, chime, target_group
struct RawChimeData(&'static str, &'static str, &'static str, &'static str);
const SAMPLE_CHIMEDATA: [RawChimeData; 11] = [
    RawChimeData("始業", "8:45:00", "school", "sample"),
    RawChimeData("午前休憩", "10:15:00", "school", "sample"),
    RawChimeData("午前2", "10:30:00", "school", "sample"),
    RawChimeData("昼休み", "12:00:00", "school", "sample"),
    RawChimeData("午後1", "13:00:00", "school", "sample"),
    RawChimeData("午後休憩1", "14:30:00", "school", "sample"),
    RawChimeData("午後2", "14:45:00", "school", "sample"),
    RawChimeData("午後休憩2", "16:15:00", "school", "sample"),
    RawChimeData("午後3", "16:30:00", "school", "sample"),
    RawChimeData("休息", "17:30:00", "school", "sample"),
    RawChimeData("終業", "18:00:00", "school", "sample"),
];

// const SAMPLE_CHIMEDATA2: [RawChimeData; 4] = [
//     RawChimeData("始業", "8:45:00", "school", "sample"),
//     RawChimeData("昼休み", "12:00:00", "school", "sample"),
//     RawChimeData("午後1", "13:00:00", "school", "sample"),
//     RawChimeData("終業", "18:00:00", "school", "sample"),
// ];

// const SAMPLE_CHIMEDATA3: [RawChimeData; 10] = [
//     RawChimeData("実験1", "10:55:00", "school", "sample"),
//     RawChimeData("実験2", "10:56:00", "school", "sample"),
//     RawChimeData("実験3", "10:57:00", "school", "sample"),
//     RawChimeData("実験4", "10:58:00", "school", "sample"),
//     RawChimeData("実験5", "10:59:00", "school", "sample"),
//     RawChimeData("実験6", "11:00:00", "school", "sample"),
//     RawChimeData("実験7", "23:46:00", "school", "sample"),
//     RawChimeData("実験8", "23:47:00", "school", "sample"),
//     RawChimeData("実験9", "23:48:00", "school", "sample"),
//     RawChimeData("実験10", "23:49:00", "school", "sample"),
// ];
/**
 * 祝祭日マスターデータ初期化（T.B.D：サーバーから最新データを取得する仕組みを検討）
 */
pub async fn init_db() {
    // Holiday マスターデータ
    for holi in PUBLIC_HOLIDAYS {
        let dt = NaiveDate::parse_from_str(holi.0, "%Y/%m/%d").unwrap();
        //println!("{:?}", dt);
        match check_holiday((&dt).into()).await.unwrap() {
            Some(_) => (),
            _ => {
                create(holi.1.into(), (&dt).into()).await.unwrap();
            }
        }
    }
    // let list: Vec<entity::Model> = read_all().await.unwrap();
    // for item in list {
    //     println!("Holiday: {} : {}", item.title, NaiveDate::from(Unixdays(item.date)));
    // }
    // DailyChimes 初期データ
    if let Ok(0) = read_count().await {
        // 休止日参照用データ作成 ”enpty” −−− 必須
        let empty_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_EMPTY.into()).await.unwrap();
        // サンプルデータ
        let sample_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_SAMPLE.into()).await.unwrap();
        for chime in SAMPLE_CHIMEDATA {
            chime_data::create(
                chime.0.into(),
                NaiveTime::parse_from_str(chime.1, "%H:%M:%S").unwrap(),
                Some(chime.2.into()),
                sample_chimes_id
            ).await.unwrap();
        }
        // let sample2_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_S2.into()).await.unwrap();
        // for chime in SAMPLE_CHIMEDATA2 {
        //     chime_data::create(
        //         chime.0.into(),
        //         NaiveTime::parse_from_str(chime.1, "%H:%M:%S").unwrap(),
        //         Some(chime.2.into()),
        //         sample2_chimes_id
        //     ).await.unwrap();
        // }
        // let sample3_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_S3.into()).await.unwrap();
        // for chime in SAMPLE_CHIMEDATA3 {
        //     chime_data::create(
        //         chime.0.into(),
        //         NaiveTime::parse_from_str(chime.1, "%H:%M:%S").unwrap(),
        //         Some(chime.2.into()),
        //         sample3_chimes_id
        //     ).await.unwrap();
        // }
        //let sample3_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_S3.into()).await.unwrap();
        //let sample4_chimes_id = chimes_create(crate::app::info::DAILYCHIMES_S4.into()).await.unwrap();
        // Schedule 初期登録
        schedule::create("平日".into(), DateInfo::WeekDay, None, Some(sample_chimes_id)).await.unwrap();
        schedule::create("休日".into(), DateInfo::HoliDay, None, Some(empty_chimes_id)).await.unwrap();
        schedule::create("月曜日".into(), DateInfo::Monday, None, None).await.unwrap();
        schedule::create("火曜日".into(), DateInfo::Tuseday, None, None).await.unwrap();
        schedule::create("水曜日".into(), DateInfo::Wednesday, None, None).await.unwrap();
        schedule::create("木曜日".into(), DateInfo::Thursday, None, None).await.unwrap();
        schedule::create("金曜日".into(), DateInfo::Friday, None, None).await.unwrap();
        schedule::create("土曜日".into(), DateInfo::Saturday, None, None).await.unwrap();
        schedule::create("日曜日".into(), DateInfo::Sunday, None, None).await.unwrap();
        schedule::create("祝祭日".into(), DateInfo::PublicHoliDay, None, Some(empty_chimes_id)).await.unwrap();
        // schedule::create("記念日".into(), DateInfo::ReservedDay, Some(Unixdays::from(&NaiveDate::from_ymd(2022,8,16)).into()), Some(sample2_chimes_id)).await.unwrap();
        // schedule::create("実験日".into(), DateInfo::ReservedDay, Some(Unixdays::from(&NaiveDate::from_ymd(2022,9,6)).into()), Some(sample3_chimes_id)).await.unwrap();
        // schedule::create("実験日2".into(), DateInfo::ReservedDay, Some(Unixdays::from(&NaiveDate::from_ymd(2022,9,5)).into()), Some(empty_chimes_id)).await.unwrap();
        // schedule::create("実験日3".into(), DateInfo::ReservedDay, Some(Unixdays::from(&NaiveDate::from_ymd(2022,9,7)).into()), Some(empty_chimes_id)).await.unwrap();
    }
    // let date = NaiveDate::from_ymd(2022, 8, 16);
    // let ret = schedule::read_by_date(Unixdays::from(&date).into()).await.unwrap();
    // println!("{:?}", ret);
}
