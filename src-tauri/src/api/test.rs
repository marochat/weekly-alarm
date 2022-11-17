use tauri;
use std::io::Read;
use std::path::Path;
use std::fs::File;


#[tauri::command]
pub async fn get_tuple() -> (String, String) {
    ("String1".into(), "String2".into())
}

#[tauri::command]
pub async fn get_file_obj(path: String) -> Result<Vec<u8>, String> {
    let p = Path::new(path.as_str());
    let _pn = p.as_os_str();
    let _n = p.file_name().unwrap();
    if p.is_file() {
        let mut fl = File::open(p).unwrap();
        let mut buf: Vec<u8> = Vec::new();
        let _ = fl.read_to_end(&mut buf);
        Ok(buf)
    } else {
        Err("file not exist".into())
    }
}