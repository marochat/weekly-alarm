import React from 'react';
import * as Bsr from 'react-bootstrap';
import { confirm, open as fileOpen } from '@tauri-apps/api/dialog';
import { basename } from '@tauri-apps/api/path';

import { FullFrame, TBI, types } from './common';
import { invoke } from '@tauri-apps/api/tauri';
import { globalTimer, params, getAudioSource } from './application';

import { EditSoundItemDialog } from './editSoundItemDialog';

export const AlarmSoundConf =  ({closeFunc}: {closeFunc: () => void}) => {
    const [ sound, setSound ] = React.useState(params.sound);
    const [ editDisabled, setEditDisabled ] = React.useState<boolean>(false);
    const [ playButtonMasks, setPlayButtonMasks ] = React.useState<boolean[]>([]);
    const [ dialog, setDialog ] = React.useState<JSX.Element | null>(null);

    // const audioRef = React.useRef(new WebAudioAPI());
    const audioCtx = React.useRef<AudioContext | null>(null);
    const audioSrc = React.useRef<AudioBufferSourceNode | null>(null);

    const [ playButtons, setPlayButtons ] = React.useReducer((state: string[], action: {idx: number, fg?: boolean}) => {
        if (action.fg === undefined) {
            action.fg = state[action.idx] == '▶'? false: true;
        }
        let ret = state.concat(); // 複製しないとStateが更新されない
        ret[action.idx] = action.fg? '▶': '⏹';
        return ret;
    }, [])

    React.useEffect(() => {
        setSound(params.sound.concat());    // グローバルのパラメタを複製してステートとする
        const len = params.sound.length;
        Array.from(Array(len).keys()).forEach(n => setPlayButtons({idx: n, fg: true}))
        setPlayButtonMasks(Array.from(Array(len).fill(false)));
        return () => {
            // audioRef.current.close();
            audioSrc.current?.stop();
            audioCtx.current?.close();
        }
    }, []);

    const setPlayButtonMask = (n: number) => {
        const masks = playButtonMasks.map((v, idx) => {
            if (idx == n) {
                return false;
            } else {
                return true;
            }
        })
        setPlayButtonMasks(masks);
    }
    const clearPlayButtonMask = () => {
        const len = playButtonMasks.length;
        setPlayButtonMasks(Array.from(Array(len).fill(false)));
    }

    const onPlayEnded = (n: number) => {
        setPlayButtons({idx: n, fg: true});
        audioCtx.current!.resume();
        setEditDisabled(false);
        clearPlayButtonMask();
    }

    const playSound = async (n: number) => {
        if (playButtons[n] == '▶') {
            setPlayButtons({idx:n});
            setEditDisabled(true);
            setPlayButtonMask(n);
            const snd = sound[n].value || sound[n].path || '';
            if (audioCtx.current === null) audioCtx.current = new AudioContext();
            audioSrc.current = await getAudioSource(audioCtx.current!, snd);
            if (audioSrc.current) {
                audioSrc.current.onended = () => onPlayEnded(n);
                audioSrc.current.start(0);
            }
            // audioRef.current.play(snd, () => onPlayEnded(n));
        } else {
            // audioRef.current.stop();
            audioSrc && audioSrc.current!.stop()
            clearPlayButtonMask();
            setEditDisabled(false);
            setPlayButtons({idx:n, fg: true});
        }
    }

    const deleteSound = async (n: number) => {
        const ans = await confirm(`${sound[n].name} を削除します。よろしいですか？ `, {title: '確認', type: 'warning'});
        if (ans) {
            // 要バックエンド操作
            await invoke('delete_sound_data', {title: sound[n].name});
            //params.sound = params.sound.filter((v) => v.name != sound[n].name);
            await params.reload_sound();
            setSound(params.sound.concat());
        }
    }

    const closeEditDialog = () => {
        setSound(params.sound.concat());
        setDialog(null)
    }
    const editSoundItem = (n: number) => {
        setDialog(
            <EditSoundItemDialog idx={n} parentClose={closeEditDialog} />
        )
    }
    const addSoundItem = async () => {
        const fn: string | null = await fileOpen(
            {filters: [{extensions:['mp3'], name: 'Audio'}], multiple: false, title: 'サウンドファイル選択'}
        ) as string | null
        if (fn) {
            // basename 第2引数で拡張子を削除しないパターン
            const name = await basename(fn, '')
            await invoke('create_sound', {title: name, path: fn});
            await params.reload_sound();
            //params.sound.push({name: name, path: fn});
            setSound(params.sound.concat());
            console.log(name);
        } else {
            console.log('no file selected');
        }
    }

    return (
        <FullFrame className='position-absolute top-0 start-0 bg-light'>
            <div className='position-relative w-100 h-100'>
                <div className='d-flex position-relative w-100 align-items-center justify-content-center'>
                    <h3 className='my-2'>アラームサウンド管理</h3>
                    <div className='position-absolute top-0 start-0 d-flex w-10 h-100 align-items-center justify-content-center'>
                        <button type='button' className='btn-close' aria-label='Close' onClick={closeFunc} />
                    </div>
                </div>
                <div className='d-flex justify-content-center'>
                    <hr className='my-0 w-75' />
                </div>
                <div className='h-80 py-3 px-4' style={{overflow: 'auto'}}>
                    <Bsr.Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Contentnt</th>
                                <th>{/** play menu */}</th>
                                <th>{/** delete menu */}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {(() => {console.log(playButtons); return null})()} */}
                            { sound.map((v, n) => (
                                <tr key={ n }>
                                    <td>{ n }</td>
                                    <td>{
                                        v.value? v.name:
                                        <a href={editDisabled? undefined: '#'} onClick={() => editSoundItem(n)}>
                                            {v.name}
                                        </a>
                                    }</td>
                                    <td>{
                                        v.value? '<< ' + v.copyright + ' >>': v.path? v.path: null
                                    }</td>
                                    <td className='px-0'>
                                        <Bsr.Button size='sm' onClick={() => playSound(n)} disabled={playButtonMasks[n]}>{playButtons[n]}</Bsr.Button>
                                    </td>
                                    {/* <td className='px-0'>
                                        { v.path && (
                                            <Bsr.Button variant='light' size='sm' data-bs-toggle='tooltip' title='ファイルから選ぶ'>
                                            📂
                                            </Bsr.Button>
                                        ) }
                                    </td> */}
                                    <td className='px-0'>
                                        { v.path && (
                                            <Bsr.Button variant='light' size='sm' onClick={() => deleteSound(n)} data-bs-toggle='tooltip' title='削除する' disabled={editDisabled}>
                                            🗑
                                            </Bsr.Button>                                
                                        ) }
                                    </td>
                                </tr>
                            )) }
                            <tr>
                                <td></td>
                                <td colSpan={4}>
                                    <Bsr.Button
                                        variant='info'
                                        size='sm'
                                        data-bs-toggle='tooltip' title='音源追加'
                                        disabled={editDisabled}
                                        onClick={addSoundItem}
                                    >
                                        アラームサウンド追加 📂
                                    </Bsr.Button>
                                </td>
                            </tr>
                        </tbody>
                    </Bsr.Table>
                </div>
                {/* ヘッダ */}
                {/* <div className='sticky-top bg-light'>
                </div> */}
                {/* ボディ */}
                {/* フッタ */}
                <div className='fixed-bottom w-100 h-10 bg-light align-items-center border-top'>
                    AAAA
                </div>
            </div>
            {dialog}
        </FullFrame>        
    );
}