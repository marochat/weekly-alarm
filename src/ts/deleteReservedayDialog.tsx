import { invoke } from '@tauri-apps/api';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';

import { Modal } from './ModalDialog';

export const DeleteReservedayDialog = (
    {
        sch,
        parentShow,
    }: {
        sch: types.ScheduleItem,
        parentShow: (para: JSX.Element | null) => void},
) => {
    // cpmponent values
    const title = 'スケジュール削除';
    const okLabel = '削除';
    const cancelLabel = 'キャンセル';

    const makeBody = (): JSX.Element => {
        return (
            <div>
                スケジュール"{sch.title}"を削除します<br/>
                よろしいですか？
            </div>
        );
    }

    const okFunc = async (): Promise<boolean> => {
        await invoke('schedule_delete', {id: sch.id}).catch(e => console.log(e));
        return true;
    }

    return (
        <Modal
            title={title}
            body={makeBody()}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentShow={parentShow}
            okFunc={okFunc}
        />
    )
}