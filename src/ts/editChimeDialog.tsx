import { invoke } from '@tauri-apps/api';
import { ask, open as fileOpen } from '@tauri-apps/api/dialog';
import { basename } from '@tauri-apps/api/path';

import React from 'react';
import * as Bsr from 'react-bootstrap';

import { types } from './common';
import { params, WebAudioAPI } from './application';

import { Modal } from './ModalDialog';
import { globalTimer } from './application';

export const EditChimeDialog = (
    {
        chime,
        dailyId,
        parentClose,
    }: {
        chime?: types.ChimeData | null,
        dailyId: number,
        parentClose: () => void},
) => {
    // cpmponent values
    const title = (chime === undefined || chime === null)? 'アラームデータ新規作成': 'アラームデータ編集';
    const okLabel = (chime === undefined || chime === null)? '追加': '更新';
    const cancelLabel = 'キャンセル';

    // state values
    const [ eventName, setEventName ] = React.useState<string | null>(chime?.title ?? null);
    const [ invokeTime, setInvokeTime ] = React.useState<string | null>(chime?.invoke_time? globalTimer.get_timestring(chime.invoke_time): null);
    const [ soundName, setSoundName ] = React.useState<string | null>(chime?.chime ?? params.sound[0].name);
    const [ playLabel, setPlayLabel ] = React.useState<string>('PLAY');

    const audioRef = React.useRef(new WebAudioAPI());

    const handleAppendSound = async () => {
        const fname = await fileOpen({filters:[{name: 'Audio', extensions: ['mp3']}]});
        const fn = await basename(fname as string);
        params.sound.push({name: fn, path: fname as string});
    }

    const samplePlay = (sname: string | null) => {
        if(playLabel == 'PLAY') {
            console.log(soundName);
            setPlayLabel('STOP');
            if(sname) {
                const snd = params.sound.find(v => v.name == sname);
                snd && audioRef.current.play(snd.value || snd.path || '');    
            }    
        } else {
            audioRef.current.stop();
            setPlayLabel('PLAY');
        }
    }

    const makeBody = (): JSX.Element => {
        return (
            <div>
                <Bsr.Form.Label htmlFor='chimeTitleId'>
                    アラームイベント名
                </Bsr.Form.Label>
                <Bsr.Form.Control
                    type='text'
                    id='chimeTitleId'
                    defaultValue={chime?.title? chime.title: ''}
                    placeholder={chime?.title? '': 'イベント名を入力'}
                    onChange={(e) => setEventName(e.target.value)}
                />
                <Bsr.Form.Label className='mt-2' htmlFor='chimeInvokeId'>
                    アラーム時刻
                </Bsr.Form.Label>
                <Bsr.Form.Control
                    type='time'
                    id='chimeInvokeId'
                    defaultValue={chime?.invoke_time? globalTimer.get_timestring(chime.invoke_time): ''}
                    onChange={(e) => setInvokeTime(e.target.value)}
                />
                <Bsr.Form.Label className='mt-2' htmlFor='chimeSoundId'>
                    アラーム音選択
                </Bsr.Form.Label>
                <div className='row d-flex align-items-center'>
                    <div className='col'>
                        <Bsr.Form.Select
                            id='chimeSoundId'
                            defaultValue={chime?.chime}
                            onChange={(e) => setSoundName(e.target.value)}
                        >
                            { params.sound.map((v, n) => 
                                <option key={n} value={v.name}>
                                    {v.name}
                                </option>
                             )}
                        </Bsr.Form.Select>
                    </div>
                    <div className='col-auto'>
                        <Bsr.Button variant='primary' size='sm' onClick={() => samplePlay(soundName)}>
                            { playLabel }
                        </Bsr.Button>
                    </div>
                    <div className='col-auto'>
                        <Bsr.Button variant='primary' size='sm' onClick={handleAppendSound}>
                            追加
                        </Bsr.Button>
                    </div>
                </div>

            </div>
        );
    }

    const okFunc = async (): Promise<boolean> => {
        if(eventName === null || eventName == '' || invokeTime === null || soundName === null) {
            return false;
        }
        const timeNum = invokeTime.split(':').map((v, idx) => parseInt(v) * [3600, 60, 1][idx]).reduce((p, v) => p + v, 0);
        if(chime === undefined || chime === null) {
            // create!
            const newid = await invoke('create_chime', {title: eventName, time: timeNum, chime:soundName, chimesid: dailyId})
            .catch(e => console.log(e));
        } else {
            // update
            const val = await invoke('update_chime', {id: chime.id, title: eventName, time: timeNum, chime: soundName, })
            .catch(e => console.log(e));
        }
        return true
    }

    React.useEffect(() => {
        return () => {
            // ダイアログを閉じるときにオーディオをクローズする
            audioRef.current.close();
        }
    }, []);

    return (
        <Modal
            title={title}
            body={makeBody()}
            okLabel={okLabel}
            closeLabel={cancelLabel}
            parentClose={parentClose}
            okFunc={okFunc}
        />
    )
}