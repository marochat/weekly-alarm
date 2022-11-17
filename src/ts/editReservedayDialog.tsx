import { invoke } from '@tauri-apps/api';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';

import { Modal } from './ModalDialog';
import { globalTimer } from './application';

export const EditReservedayDialog = (
    {
        sch,
        parentShow,
    }: {
        sch: types.ScheduleItem | null,
        parentShow: (para: JSX.Element | null) => void},
) => {
    // cpmponent values
    const title = (sch === undefined || sch === null)? 'アラームスケジュール新規作成': 'アラームスケジュール編集';
    const okLabel = (sch === undefined || sch === null)? '追加': '更新';
    const cancelLabel = 'キャンセル';


    // state values
    const [ schName, setSchName ] = React.useState<string>(sch ? sch.title: '');
    const [ schDate, setSchDate ] = React.useState<string>(sch?.date ? globalTimer.get_datestring_hyfun(sch.date!): '');
    // ref values
    const schRef = React.useRef<types.ScheduleItem | null>(sch);

    const makeBody = (): JSX.Element => {
        return (
            <div>
                <Bsr.Form.Label htmlFor='reservedayTitle'>
                    アラームスケジュール名称
                </Bsr.Form.Label>
                <Bsr.Form.Control
                    type='text'
                    id='reservedayTitle'
                    placeholder={sch === null || sch === undefined ? 'ここに名称を入力してください': undefined}
                    defaultValue={schName}
                    onChange={(e) => setSchName(e.target.value)}
                />
                <Bsr.Form.Label htmlFor='reserveDate' className='mt-2'>
                    指定日
                </Bsr.Form.Label>
                <Bsr.Form.Control
                    type='date'
                    id='reserveDate'
                    defaultValue={schDate}
                    onChange={(e) => setSchDate(e.target.value)}
                />
            </div>
        );
    }

    const okFunc = async (): Promise<boolean> => {
        console.log(`${schName}: ${schDate}`);
        if(schName == '') {
            window.alert('need title string');
            return false;
        }
        const nDate = Math.floor(Date.parse(schDate) / 1000 / 24 / 3600);
        if(schRef.current === undefined || schRef.current === null) {
            // create スケジュール
            await invoke('schedule_create_rsvd', {title: schName, date: nDate})
            .then(() => {})
            .catch(e => console.log(e));
            return true;

        } else {
            // update スケジュール
            await invoke('schedule_update',{id: schRef.current.id, title: schName, date: nDate})
            .then(() => {})
            .catch(err => (console.log(err)));    
            return true;
        }
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