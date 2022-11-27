import { invoke } from '@tauri-apps/api';
import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';
import { Modal } from './ModalDialog';

export const NewChimesDialog = (
    {
        sch,
        seltag,
        parentClose,
    }: {
        sch: types.ScheduleItem,
        seltag: HTMLSelectElement | null,
        parentClose: () => void},
) => {
    // cpmponent values
    const title = 'アラームセット新規作成';
    const okLabel = '作成';
    const cancelLabel = 'キャンセル';

    const [ titleValue, setTitleValue ] = React.useState<string>('');

    const okFunc = async (): Promise<boolean> => {
        if(titleValue != '') {
            const chimes_id = await invoke('create_chimes', {title: titleValue}).catch(e => {
                window.alert('アラームセットが作成できませんでした。名前の重複かも知れません');
                return false;
            }) as number;
            await invoke('schedule_update',{id: sch.id, chimesId: chimes_id}).then(() => {}).catch(e => console.log(e));
            sch.daily_chimes_id = chimes_id;
            if (seltag) seltag.value = chimes_id.toString();
            return true;
        } else {
            return false;
        }
    }

    return (
        <Modal
            title={title}
            body={(
                <div>
                    <Bsr.Form.Label htmlFor='alarmSetTitle'>
                        アラームセット名
                    </Bsr.Form.Label>
                    <Bsr.Form.Control
                        type='text'
                        id='alarmSetTitle'
                        placeholder='アラームセット名を入力'
                        onChange={ (e) => setTitleValue(e.target.value) }
                    />
                </div>
            )}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentClose={parentClose}
            okFunc={okFunc}
        />
    )
}