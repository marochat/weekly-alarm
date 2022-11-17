import React from 'react';

import { FullFrame, TBI, types } from './common';
import { invoke } from '@tauri-apps/api/tauri';
import { globalTimer } from './application';

import { EditReservedayDialog } from './editReservedayDialog';
import { DeleteReservedayDialog } from './deleteReservedayDialog';
import { EditChimesDiv } from './editChimesDiv';
/**
 * 自身を削除出来るエレメントの追加関数サンプル
 * @param mainDiv 親となるエレメント
 * - 関数内で子エレメントを作成して親にアペンドした後にReactDOMでcreateRootする
 * - render()で内部を構築
 * - removeChildで自身を削除するハンドラを準備する
 * 
 * * Bootstrapのモーダルダイアログなどの用途に使用できるかも
 * 
 * --> State制御方式に変更
 */

export const ConfigDialog = ({closeFunc}: {closeFunc: () => void}) => {
    /** バックエンドデータ更新用ステート変数 */
    const [ scheduleItems, setScheduleItems ] = React.useState<types.ScheduleItem[]>([]);
    const [ chimes, setChimes ] = React.useState<types.Chimes[]>([]);
    const [ scheduleChimes, setScheduleChimes ] = React.useState<(types.Chimes | undefined)[]>([]);

    /** ダイアログボックス制御用ステート */
    const [ reservedayDialog, setReservedayDialog ] = React.useState<JSX.Element | null>(null);
    const [ deleteDialog, setDeleteDialog ] = React.useState<JSX.Element | null>(null);
    /** アラームセット編集領域表示制御用ステート */
    const [ editChimeDivs, setEditChimeDivs ] = React.useState<(JSX.Element | null)[]>([])

    /** リロード制御用ステート */
    const [ reloadFg, setReloadFg ] = React.useState<boolean>(false);
    const reload = () => {
        setReloadFg(!reloadFg);
    }

    /**
     * ステート初期化/更新
     *   更新タイミング：ダイアログを閉じたとき/リロード指示があった場合
     */
    React.useEffect(() => {
        let items: types.ScheduleItem[];
        let chms: types.Chimes[];
        if(deleteDialog === null && reservedayDialog === null) {
            invoke('read_all_schedules').then(res => {
                // console.log('get schedule!')
                items = res as types.ScheduleItem[];
                const n = items.length;
                const chimesDiv = editChimeDivs.findIndex(v => v !== null);
                setEditChimeDivs(Array(n).fill(null));
                setScheduleItems(items);
                if(chimesDiv > -1) {
                    handleEditChimesDiv(chimesDiv, items[chimesDiv], true)
                }
                return invoke('read_all_chimes');
            }).then(res => {
                // console.log('get chimes!')
                chms = res as types.Chimes[];
                setChimes(chms);
                setScheduleChimes(items.map(v => chms.find(val => val[0].id == v.daily_chimes_id)));
            })
        }
    }, [ deleteDialog, reservedayDialog, reloadFg ]);

    /**
     * スケジュールセット更新/追加
     * @param sch 対象スケジュール
     */
    const handleReservedayEdit = (sch: types.ScheduleItem | null) => {
        setReservedayDialog(
            <EditReservedayDialog parentShow={setReservedayDialog} sch={sch} />
        );
    }
    /**
     * スケジュールセット削除
     * @param sch 対象スケジュール
     */
    const handleDeleteDialog = (sch: types.ScheduleItem) => {
        setDeleteDialog(
            <DeleteReservedayDialog parentShow={setDeleteDialog} sch={sch} />
        );
    }

    /**
     * 対象スケジュールのアラームセット編集用領域を展開する
     * @param num スケジュールセットの表示番号(表示管理用ステートの添字と共通)
     * @param force true: 表示強制/ false: 表示トグル（デフォルト）
     */
    const handleEditChimesDiv = (num: number, sch: types.ScheduleItem, force: boolean = false) => {
        if(editChimeDivs[num] === null || force) {
            const editDiv = () => {
                return (
                    <tr className='p-0 m-0'>
                        <td colSpan={4} className='p-0 m-0'>
                            <EditChimesDiv sch={sch} reload={reload} hideFunc={clearEditChimesDivs} />
                        </td>
                    </tr>
                );
            }
            setEditChimeDivs(
                editChimeDivs.map((v,n) => (n == num)? editDiv(): null )
            );
        } else {
            setEditChimeDivs(editChimeDivs.map(v => null));
        }
    }
    /**
     * アラームセット編集用領域を閉じる/領域内から利用するために関数として準備
     */
    const clearEditChimesDivs = () => {
        setEditChimeDivs(editChimeDivs.map(v => null));
    }

    return (
        <FullFrame className='position-absolute top-0 start-0 bg-light'>
            <div className='position-relative w-100 h-100'>
                {/* ヘッダ */}
                <div className='sticky-top bg-light'>
                    <div className='d-flex position-relative w-100 align-items-center justify-content-center'>
                        <h3 className='my-2'>週間アラームスケジュール</h3>
                        <div className='position-absolute top-0 start-0 d-flex w-10 h-100 align-items-center justify-content-center'>
                            <button type='button' className='btn-close' aria-label='Close' onClick={closeFunc} />
                        </div>
                    </div>
                    <div className='d-flex justify-content-center'>
                        <hr className='my-0 w-75' />
                    </div>
                </div>
                {/* ボディ */}
                <div className='d-flex justify-content-center w-100'>
                    <table className='table w-75'>
                        <thead>
                            <tr>
                                <th>スケジュール名</th>
                                <th>日付または詳細</th>
                                <th>アラームセット</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleItems.map((sch, n) => (
                                <React.Fragment key={n}>
                                    <tr>
                                        <td className='align-middle my-0 py-0'>
                                            {
                                                (sch.date_info == types.DateInfo.ReservedDay && (
                                                    <a className='btn link-primary my-0 py-0 px-0' onClick={() => handleReservedayEdit(sch)}>
                                                        {sch.title}
                                                    </a>
                                                )) || sch.title
                                            }
                                        </td>
                                        <td className='align-middle'>
                                            {
                                                (sch.date_info == types.DateInfo.WeekDay && '月曜日〜金曜日') ||
                                                (sch.date_info == types.DateInfo.HoliDay && '土曜日&日曜日') ||
                                                ([types.DateInfo.Monday, types.DateInfo.Tuseday, types.DateInfo.Wednesday, types.DateInfo.Thursday, types.DateInfo.Friday, types.DateInfo.Saturday, types.DateInfo.Sunday].includes(sch.date_info) && '曜日個別設定') ||
                                                (sch.date_info == types.DateInfo.PublicHoliDay && '祝祭日設定') ||
                                                globalTimer.get_datestring(sch.date!)
                                            }
                                        </td>
                                        <td className='align-middle my-0 py-0'>
                                            <a className='btn link-primary my-0 py-0' onClick={() => handleEditChimesDiv(n, sch)}>
                                                {(
                                                    scheduleChimes[n] && scheduleChimes[n]![0].title
                                                ) || '未使用' }
                                            </a>
                                        </td>
                                        <td className='align-middle my-0 py-0'>
                                            {
                                                sch.date_info == types.DateInfo.ReservedDay && (
                                                    <input key={n} type='button' className='btn btn-sm btn-secondary' value='delete' onClick={() => handleDeleteDialog(sch)} />
                                                )
                                            }
                                        </td>
                                    </tr>
                                    {editChimeDivs[n]}
                                </React.Fragment>
                            ))}
                        </tbody>
                        <tfoot className='mb-5'>
                            <tr>
                                <td className='py-1'>
                                    <a className='btn link-primary px-0' onClick={() => handleReservedayEdit(null)} >
                                        スケジュール新規作成
                                    </a>
                                </td>
                                <td></td><td></td><td></td>
                            </tr>
                            <tr>
                                <td>
                                    <div style={{height: '50px'}}></div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* フッタ */}
                <div className='fixed-bottom w-100 h-10 bg-light align-items-center border-top'>
                    <TBI mes='conf window footer' />
                </div>
            </div>
            {/* {dialog} */}
            {reservedayDialog}
            {deleteDialog}
        </FullFrame>
    );
}