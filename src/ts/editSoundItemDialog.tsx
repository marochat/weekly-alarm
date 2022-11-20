import { invoke } from '@tauri-apps/api';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';

import { Modal } from './ModalDialog';
import { globalTimer, params } from './application';

export const EditSoundItemDialog = (
    {
        idx,
        parentClose,
    }: {
        idx: number
        parentClose: () => void},
) => {
    // cpmponent values
    const title = '音源データ編集';
    const okLabel = '更新';
    const cancelLabel = 'キャンセル';
    const orgName = params.sound[idx].name;

    // state values
    const [ itemTitle, setItemTitle] = React.useState<string>('');

    React.useEffect(() => {
        setItemTitle(params.sound[idx].name);
    }, []);

    const okFunc = async (): Promise<boolean> => {
        await invoke('update_sound_title', {title: orgName, newTitle: itemTitle});
        await params.reload_sound()
        //params.sound[idx].name = itemTitle;
        return true;
    }

    return (
        <Modal
            title={title}
            body={(
                <div>
                    <label className='form-label' htmlFor='titleId'>
                        サウンド名
                    </label>
                    <input
                        className='form-control'
                        id='titleId'
                        type='text'
                        placeholder='ファイル選択後に必要であれば変更してください'
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
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