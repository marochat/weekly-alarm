import { invoke } from '@tauri-apps/api';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types, util } from './common';

import { globalTimer } from './application';
import { EditChimeDialog } from './editChimeDialog';
import { DeleteChimeDialog } from './deleteChimeDialog';
import { NewChimesDialog } from './newChimesDialog';

export const EditChimesDiv = ({sch, reload, hideFunc}: {sch:types.ScheduleItem, reload: () => void, hideFunc: () => void}) => {
    const [ chimesVal, setChimesVal ] = React.useState<types.Chimes[]>([]);
    const [ chimes, setChimes ] = React.useState<types.Chimes | null>(null);
    const [ selectedChimesId, setSelectedChimesId ] = React.useState<number>(sch.daily_chimes_id ?? 0);

    const [ newChimesDialog, setNewChimesDialog ] = React.useState<JSX.Element | null>(null);
    const [ chimeDialogs, setChimeDialogs ] = React.useState<(JSX.Element | null)[]>([]);
    const [ reloadFg, setReloadFg ] = React.useState<boolean>(false);
    const reload1 = () => setReloadFg(!reloadFg);

    const selectCtl = React.useRef<HTMLSelectElement>(null);

    console.log(sch);
    React.useEffect(() => {
        invoke('read_all_chimes').then(val => {
            setSelectedChimesId(sch.daily_chimes_id ?? 0);
            const cmsv: types.Chimes[] = val as types.Chimes[];
            setChimesVal(cmsv);
            const cms: types.Chimes = cmsv.find(v => v[0].id == sch.daily_chimes_id)!;
            cms && cms[1].sort((a, b) => a.invoke_time - b.invoke_time);
            setChimes(cms);
            const chimeNum: number = cms? cms[1].length + 1: 1;
            setChimeDialogs(Array(chimeNum).fill(null));
        });
        //selectCtl.current!.value = sch.daily_chimes_id?.toString() ?? '';
    }, [ reloadFg ]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId: number = parseInt(e.target.value);
        const selectedChime: types.Chimes | null = chimesVal.find((v, n) => v[0].id == selectedId) ?? null
        setSelectedChimesId(selectedId);
        if(selectedChime) {
            selectedChime[1].sort((a, b) => a.invoke_time - b.invoke_time);
        }
        setChimes(selectedChime);
        const chimeNum: number = selectedChime? selectedChime![1].length + 1: 1;
        setChimeDialogs(Array(chimeNum).fill(null));

        /** .NEED Invoke for backend database  */
        invoke('schedule_update',{id: sch.id, chimesId: selectedId}).then(() => {
            reload();
        }).catch(e => console.log(e));
        //reload();
    }

    const handleNewChimesButton = () => {
        setNewChimesDialog(<NewChimesDialog sch={sch} seltag={selectCtl.current} parentClose={ () => {setNewChimesDialog(null); reload1(); reload();} } />)
    }

    const editChime = async (idx?: number, chime?: types.ChimeData) => {
        // 要ダイアログリスト
        if (idx === undefined) {
            idx = chimeDialogs.length - 1;
        }
        setChimeDialogs(chimeDialogs.map((v, n) => (n == idx)? (
            // <ModalSample title='edit sample' parentClose={closeChimeDialog}></ModalSample>
            <EditChimeDialog chime={chime} dailyId={sch.daily_chimes_id!} parentClose={closeChimeDialog}></EditChimeDialog>
        ): null));
    }

    const deleteChime = async (idx: number, chime: types.ChimeData) => {
        setChimeDialogs(chimeDialogs.map((v, n) => (n == idx)? (
            <DeleteChimeDialog chime={chime} sch={sch} parentClose={closeChimeDialog}></DeleteChimeDialog>
        ): null));
    }

    const closeChimeDialog = () => {
        setChimeDialogs(chimeDialogs.map(v => null));
        reload();
        reload1();
    }
    return (
        <div className='position-relative w-100'>
            {/* ヘッダエリア */}
            <div className='d-flex flex-row align-items-center w-100 py-1'>
                <h6 className='my-0 mx-3'>アラームセット選択</h6>
                <span className='ms-4'>
                    { chimesVal.length != 0 &&
                    <select className='form-control'
                        ref={selectCtl}
                        aria-label='alarm-set select'
                        onChange={handleSelectChange}
                        //defaultValue={sch.daily_chimes_id ?? 0}
                        value={selectedChimesId}
                        // value={selectVal}
                    >
                        {/* {util.debugstr(initVal)} */}
                        { chimesVal.map((v, n) => (
                            <option key={n} value={v[0].id}>
                                {v[0].title}
                            </option>
                        ))}
                        { sch.id != 1 && (
                            <option value={0}></option>
                        )}
                        {/* <option>aaa</option> */}
                    </select>
                    }
                </span>
                <span className='ms-4'>
                    <Bsr.Button variant='primary' size='sm' onClick={handleNewChimesButton}>
                        新規作成
                    </Bsr.Button>
                </span>
            </div>
            {/* 閉じるボタン */}
            <div className='position-absolute top-0 end-0 my-1 mx-3'>
                <Bsr.CloseButton onClick={hideFunc} />
            </div>
            { newChimesDialog }
            {/* ボディ領域 */}
            <div className='d-flex w-100 justify-content-center'>
                <table className='table w-75'>
                    <thead>
                        <tr>
                            <th>イベント名</th>
                            <th>アラーム時刻</th>
                            <th>アラーム音</th>
                            <th/>
                        </tr>
                    </thead>
                    { chimes &&
                        <tbody>
                            { chimes[1].map((chime, n) => (
                                <tr key={n}>
                                    <td className='align-middle my-0 py-0'>
                                        <a className='btn link-primary my-0 py-0' onClick={() => editChime(n, chime)}>
                                          {chime.title}
                                        </a>
                                    </td>
                                    <td className='align-middle'>
                                        {globalTimer.get_timestring(chime.invoke_time)}
                                    </td>
                                    <td className='align-middle'>
                                        {chime.chime}
                                    </td>
                                    <td className='align-middle my-0 py-0'>
                                        <Bsr.Button
                                            variant='secondary'
                                            size='sm'
                                            className='h-100 my-0 py-1'
                                            onClick={() => deleteChime(n, chime)}
                                        >
                                            Delete
                                        </Bsr.Button>
                                        {chimeDialogs[n]}
                                    </td>
                                </tr>
                            )) }
                            { sch.daily_chimes_id && sch.daily_chimes_id > 1 &&
                                <tr>
                                    <td colSpan={4} className='align-middle my-0'>
                                        <a className='btn btn-sm link-primary my-0' onClick={() => editChime()}>
                                            アラーム追加
                                        </a>
                                        {chimeDialogs[chimeDialogs.length - 1]}
                                    </td>
                                </tr>

                            }
                        </tbody>
                    }
                </table>
            </div>
        </div>
    );
}