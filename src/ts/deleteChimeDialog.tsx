import { invoke } from '@tauri-apps/api';
import { ask, open as fileOpen } from '@tauri-apps/api/dialog';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';

import { Modal } from './ModalDialog';
import { globalTimer } from './application';

export const DeleteChimeDialog = (
    {
        chime,
        sch,
        parentClose,
    }: {
        chime: types.ChimeData,
        sch: types.ScheduleItem,
        parentClose: () => void},
) => {
    // cpmponent values
    const title = 'このアラームを削除します';
    const okLabel = '削除';
    const cancelLabel = 'キャンセル';

    // state values

    const okFunc = async (): Promise<boolean> => {
        await invoke('delete_chime', {id: chime.id}).then(() => {}).catch(e => console.log(e));
        // 削除した結果アラームセットが空になったら削除が可能
        const chimeses: types.Chimes[] = await invoke('read_all_chimes');
        const chimes = chimeses.find(chms => chms[0].id == sch.daily_chimes_id);
        if(chimes && chimes[1].length == 0){
            //let schedules: types.ScheduleItem[] = await invoke('read_all_schedules');
            // 他のスケジュールで使用されていないかを確認 Todo: create api
            const val = await invoke('get_schedules_for_chimes_id', {id: sch.daily_chimes_id}).catch(e => console.log(e));
            //console.log(val);
            const schs = val as types.ScheduleItem[];
            if(schs.length == 1 && schs[0].daily_chimes_id == sch.daily_chimes_id) {
                const ans = await ask(`アラームセット ”${chimes[0].title}” は空になりました。削除しますか？`);
                if(ans) {
                    const newId = (sch.id == 1)? 1 : 0;
                    await invoke('schedule_update', {id: sch.id, chimesId: newId});
                    await invoke('delete_chimes', {id: chimes[0].id}).catch(e => console.log(e));
                    sch.daily_chimes_id = newId;
                }
            }
        }
        return true;
    }

    return (
        <Modal
            title={title}
            body={(
                <div>
                    <span>
                        { chime.title + ' ( ' + globalTimer.get_timestring(chime.invoke_time) + ' )' }
                        <br />
                        よろしいですか？
                    </span>
                </div>
            )}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentClose={parentClose}
            okFunc={okFunc}
        />
    )
}