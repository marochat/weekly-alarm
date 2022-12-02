import React from 'react';
import * as Bsr from 'react-bootstrap';
import { confirm, open as fileOpen } from '@tauri-apps/api/dialog';
import { basename } from '@tauri-apps/api/path';

import { FullFrame, TBI, types } from './common';
import { Modal } from './ModalDialog';
import { invoke } from '@tauri-apps/api/tauri';
import { globalTimer, params, getAudioSource } from './application';

const EditHoliday = ({holiday, parentClose}: {holiday?:{id: number, title: string, date: number}, parentClose: () => void}) => {
    const title: string = holiday? '祝日データ編集': '祝日データ追加';
    const okLabel: string = holiday? '更新': '追加';
    const cancelLabel: string = 'キャンセル';

    const [ holidayTitle, setHolidayTitle ] = React.useState<string>(holiday? holiday.title: '');
    const [ holidayDate, setHolidayDate ] = React.useState<string>(holiday? globalTimer.get_datestring(holiday.date).replace(/\//g, '-'): globalTimer.get_todaystring().replace(/\//g, '-'));

    const okFunc = async () => {
        if (holiday) {
            // update
            try {
                const datestr = holidayDate.replace(/-/g, '/')
                const res = await invoke('update_holiday', {id: holiday.id, title: holidayTitle, date: datestr});
                return true;
            } catch(e) {
                console.log(e);
                return false;
            }
            return true;
        } else {
            // create
            try {
                const datestr = holidayDate.replace(/-/g, '/')
                const res: number = await invoke('create_holiday', {title: holidayTitle, date: datestr});
                return true;

            } catch(e) {
                console.log(e);
                return false;
            }
        }
    }

    return (
        <Modal
            title={title}
            body={(
                <div>
                    <label className='form-label' htmlFor='titleId'>
                        祝祭日名称
                    </label>
                    <input
                        className='form-control'
                        id='titleId'
                        type='text'
                        placeholder='祝祭日の名称を入力'
                        value={holidayTitle}
                        onChange={(e) => setHolidayTitle(e.target.value)}
                    />
                    <label className='form-label' htmlFor='dateId'>
                        日付
                    </label>
                    <input
                        className='form-control'
                        id='dateId'
                        type='date'
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                    />
                </div>
            )}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentClose={parentClose}
            okFunc={okFunc}
        />

    );
}

const AppendHolidays = ({ holidays, parentClose }: {holidays: {title: string, date: number}[], parentClose: () => void}) => {
    const dlgTitle: string = '祝祭日一括登録 - 確認';
    const okLabel: string = '一括追加';
    const cancelLabel: string = 'キャンセル';

    const okFunc = async () => {
        for (let hd of holidays) {
            const datestr = globalTimer.get_datestring(hd.date);
            try {
                const res: number = await invoke('create_holiday', {title: hd.title, date: datestr});
            } catch (e) {
                console.log(`create error : ${e}`);
            }
        }
        return true;
    }

    return (
        <Modal
            title={dlgTitle}
            body = {(
                <>
                <div>
                    <h6>以下の祝祭日情報を一括登録します。よろしいですか？</h6>
                </div>
                <hr/>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>日付</th>
                            <th>祝祭日名</th>
                        </tr>
                    </thead>
                    <tbody>
                        { holidays.map((v, idx) => (
                            <tr key={idx}>
                                <td>{idx}</td>
                                <td>{globalTimer.get_datestring(v.date)}</td>
                                <td>{v.title}</td>
                            </tr>
                        )) }
                    </tbody>
                </table>
                </>
            )}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentClose={parentClose}
            okFunc={okFunc}
        />
    )
}

export const HolidayConf =  ({closeFunc}: {closeFunc: () => void}) => {
    const [ holidaysData, setHolidaysData ] = React.useState<{id: number, title: string, date: number}[]>([]);
    const [ dialog, setDialog ] = React.useState<JSX.Element | null>(null);
    const updateHolidaysData = () => {
        const today: string = globalTimer.get_todaystring();
        invoke('read_holidays', {date: today}).then(val => {
            setHolidaysData(val as {id: number, title: string, date: number}[]);
        })
    }

    const handleFileRead = async () => {
        // const holidays: {id: number, title: string, date: number}[] = await invoke('read_holidays', {date: '2022/11/29'});
        // console.log(holidaysData.map(v => `${globalTimer.get_datestring(v.date)}  ${v.title}`));
        const fn = await fileOpen({title: 'CSV祝祭日ファイル読み込み', filters: [{extensions:['csv'], name: 'CSV file'}], multiple: false}) as null | string;
        if (fn) {
            try {
                const val = await invoke('read_holidays_from_file', {path: fn}) as {title: string, date: number}[];
                for (let v of val) {
                    console.log(`${globalTimer.get_datestring(v.date)} : ${v.title}`);
                }
                setDialog(<AppendHolidays holidays={val} parentClose={closeHolidayDialog}></AppendHolidays>)
            } catch (e) {
                alert(`CSVファイル読み込みエラー ${e}`);
            }
        }
    }

    const closeHolidayDialog = () => {
        setDialog(null);
        updateHolidaysData();
    }
    const handleAddHoliday = () => {
        setDialog(<EditHoliday parentClose={closeHolidayDialog}></EditHoliday>);
    }
    const handleEditHoliday = (val: {id: number, title: string, date: number}) => {
        setDialog(<EditHoliday holiday={val} parentClose={closeHolidayDialog}></EditHoliday>);
    }

    const handleDeleteHoliday = async (val: {id: number, title: string, date: number}) => {
        const datestr = globalTimer.get_datestring(val.date);
        const ans = await confirm(`祝祭日情報 ${val.title} (${datestr}) を削除します。`, { title: '確認', type: 'warning'});
        if (ans) {
            try {
                const ret = await invoke('delete_holiday', {id: val.id});
            } catch (e) {
                console.log(e);
            }
            updateHolidaysData();
        }
    }

    React.useEffect(() => {
        updateHolidaysData();
    }, []);

    return (
        <FullFrame className='position-absolute top-0 start-0 bg-light'>
            <div className='position-relative w-100 h-100'>
                {/* ヘッダ */}
                <div className='d-flex position-relative w-100 align-items-center justify-content-center'>
                    <h3 className='my-2'>祝日管理</h3>
                    <div className='position-absolute top-0 start-0 d-flex w-10 h-100 align-items-center justify-content-center'>
                        <button type='button' className='btn-close' aria-label='Close' onClick={closeFunc} />
                    </div>
                </div>
                <div className='d-flex justify-content-center'>
                    <hr className='my-0 w-90' />
                </div>
                {/* ボディ */}
                <div className='d-flex w-100 h-80 justify-content-center' style={{overflow: 'auto'}}>
                    <Bsr.Table className='w-75'>
                        <thead>
                            <tr>
                                <th style={{width: '10%'}}>#</th>
                                <th className='text-center' style={{width: '25%'}}>日付</th>
                                <th style={{width: 'auto'}}>名称</th>
                                <th className='text-center' style={{width: '180px'}}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            { holidaysData.length > 0 &&
                                holidaysData.map((val, idx) => (
                                    <tr key={idx} className='my-0 py-0'>
                                        <td>{idx}</td>
                                        <td className='text-center'>{globalTimer.get_datestring(val.date)}</td>
                                        <td>{val.title}</td>
                                        <td className='py-0 align-middle'>
                                            <Bsr.Button className='mx-1 my-0' variant='primary' size='sm' style={{width: '70px'}} onClick={() => handleEditHoliday(val)}>
                                                Edit
                                            </Bsr.Button>
                                            <Bsr.Button className='mx-1 my-0' variant='primary' size='sm' style={{width: '70px'}} onClick={() => handleDeleteHoliday(val)}>
                                                Delete
                                            </Bsr.Button>
                                        </td>
                                    </tr>
                                ))
                             }
                        </tbody>
                    </Bsr.Table>
                </div>
                {/* フッタ */}
                <div className='fixed-bottom w-100 h-10 bg-light border-top'>
                    <div className='d-flex w-80 h-100 align-items-center justify-content-center'>
                        <Bsr.Button id='holidayAdd' className='mx-3' variant='primary' onClick={handleAddHoliday}>
                            祝日追加
                        </Bsr.Button>
                        <Bsr.Button id='holidayFile' className='mx-3' variant='primary' onClick={handleFileRead}
                            >ファイル読み込み
                        </Bsr.Button>
                        <Bsr.Form.Label htmlFor='holidayFile'>CSVファイルから一括で祝日情報を読み込みます</Bsr.Form.Label>
                    </div>
                </div>
            </div>
            { dialog }
        </FullFrame>        
    );
}