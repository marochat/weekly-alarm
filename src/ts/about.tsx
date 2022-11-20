import { invoke } from '@tauri-apps/api';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';

import { Modal } from './ModalDialog';
import { globalTimer, params } from './application';

export const AboutDialog = (
    {
        parentClose,
    }: {
        parentClose: () => void},
) => {
    // cpmponent values
    const title = 'Weekly-Alarm について';
    const cancelLabel = '閉じる';

    return (
        <Modal
            title={title}
            body={(
                <div>
                    <p>
                        設定した週間スケジュールに沿って、指定時刻にアラーム(チャイム)を鳴らすスケジュール管理アプリ。
                        <br/>
                        Rust+Tauri/Typescirpt+React で作成しています。
                    </p>
                    <p className='small'>
                        &copy; marochat (mamiyanx@gmail.com) &nbsp;
                        <a href='https://www.marochanet.org/' target='_blank'>https://www.marochanet.org/</a>
                    </p>
                </div>
            )}
            closeLabel={cancelLabel}
            parentClose={parentClose}
        />
    )
}