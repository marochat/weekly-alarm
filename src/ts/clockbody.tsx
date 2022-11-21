/**
 * ClockBody component
 */
import React from 'react';

import * as Bsr from 'react-bootstrap';

import { TBI, FullFrame, types, util } from './common';
import { params, globalTimer, getAudioSource } from './application';
import { invoke } from '@tauri-apps/api/tauri';
import sevenSeg from '../inlinesvg/7Segment5.SVG';
import colonSvg from '../inlinesvg/colon.SVG';

/**
 * 7セグ表示エリアに指定した時刻を表示する
 * @param divs 時刻表示用の6個の7セグSVG配列
 * @param colons 時刻表示用コロンSVG配列
 * @param data 時刻情報文字列 hh:mm:ss
 */
 export const sevenSegArray = (divs: HTMLDivElement[], colons: HTMLDivElement[], data: string) => {
    const digs = [
        [1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 1],
        [1, 1, 0, 1, 1, 0, 1],
        [1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 1],
    ]
    data = data.replace(/:/g, '');
    if(data.length == 6){
        for(let [index, div] of divs.entries()) {
            const num = parseInt(data.charAt(index));
            const svgpaths = div.querySelectorAll('path');
            svgpaths.forEach((value, key) => {
                const dig = digs[num][key];
                if(dig == 1) value.setAttribute('style', 'fill:red');
                if(dig == 0) value.removeAttribute('style');
            });
        }
    }
    for(let div of colons) {
        const svgpaths = div.querySelectorAll('circle');
        svgpaths.forEach(value => {
            value.setAttribute('style', 'fill:red');
            util.timeout(500).then(() => { value.removeAttribute('style') });
        });
    }
}

/**
 * ClockBodyコンポーネント生成関数
 * @returns <ClockBody />
 */
export const ClockBody = () => {
    const [ head_txt, setHead ] = React.useState<string | JSX.Element>('');
    const [ foot_txt, setFoot ] = React.useState<string | JSX.Element>('');
    const [ clock_head, setClockHead ] = React.useState<string | JSX.Element>('');
    const [ clock_footer, setClockFooter ] = React.useState<string | JSX.Element>('');

    const wait_time = React.useRef<number | null>(null);
    const next_sound = React.useRef<types.ChimeData | null>(null);

    const timeDiv = React.useRef<HTMLDivElement>(null)

    const sevensRef = Array.from(Array(6)).map(_ => React.useRef<HTMLDivElement>(null));
    const colonsRef = Array.from(Array(2)).map(_ => React.useRef<HTMLDivElement>(null));
    // const audioRef = React.useRef(new WebAudioAPI());
    const audioCtx = React.useRef<AudioContext | null>(null);
    const audioSrc = React.useRef<AudioBufferSourceNode | null>(null);

    /**
     * コンポーネント初期化処理
     */

    React.useEffect(() => {
        // const greens = require('../audio/greensleeves.mp3');
        // const path = '/Users/mamiyan/work/src/tauri/react/weekly-alarm/src/audio/greensleeves.mp3'
        // audioRef.current.play(path);
        globalTimer.timeDiv = timeDiv.current;
        const sevenSegs = sevensRef.map(v => v.current!);
        const colonSegs = colonsRef.map(v => v.current!);
        globalTimer.prev_day = 0;
        timeDiv.current!.addEventListener('second', async (e) => {
            // console.log((e as CustomEvent).detail.date);
            let date: number = (e as CustomEvent).detail.date;
            sevenSegArray(sevenSegs, colonSegs, globalTimer.get_timestring(date));
            const snd = params.sound.find(x => x.name == next_sound.current?.chime);
            // console.log(`${wait_time.current} : ${date} : ${snd!.value} : ${snd}`);
            if(wait_time.current && wait_time.current == date) {
                const snd = params.sound.find(x => x.name == next_sound.current?.chime);
                if(next_sound.current !== null && snd !== undefined && next_sound.current.enabled) {
                    // audioRef.current.play(snd.value || snd.path || '', () => setFoot(''));
                    audioCtx.current = new AudioContext();
                    audioSrc.current = await getAudioSource(audioCtx.current, snd.value || snd.path || '');
                    if (audioSrc.current) {
                        console.log(`alarm invoked. : ${snd.value || snd.path}`)
                        audioSrc.current.onended = () => setFoot('');
                        audioSrc.current.start(0);
                    }
                    snd.copyright && setFoot(<div className='marquee w-100'>{snd.copyright}</div>)
                }
                util.timeout(1000).then(() => {
                    const ev = new CustomEvent('schedule');
                    timeDiv.current!.dispatchEvent(ev);
                });
            }
        });

        timeDiv.current!.addEventListener('schedule', (e) => {
            console.log('sch: ' + globalTimer.schedule![0].title);
            setHead(
                <div style={{textAlign: 'center'}}>
                    {globalTimer.schedule![0].title + '  [ ' + globalTimer.schedule![1].title + ' ]'}
                </div>
            );
            globalTimer.get_recent().then(value => {
                if(value) {
                    if(value[0] !== null) {
                        const invoke_time = value[0].invoke_time;
                        let prev = globalTimer.get_timestring(invoke_time);
                        setClockHead(
                            <div className='d-flex flex-row'>
                                <div className='mx-2'>{value[0]!.title}</div>
                                <div className='mx-2'>
                                    {prev}{(invoke_time < 0) && ' (昨日)'}
                                </div>
                            </div>
                        )
                    } else {
                        setClockHead(
                            <div className='mx-2'>休止中</div>
                        );
                    }
                    if(value[1] !== null) {
                        const invoke_time = value[1].invoke_time;
                        wait_time.current = invoke_time;
                        next_sound.current = value[1];
                        let next = globalTimer.get_timestring(invoke_time);
                        setClockFooter(
                            <div className='d-flex flex-row'>
                                <div className='mx-2'>{value[1]!.title}</div>
                                <div className='mx-2'>
                                    {next}{invoke_time > 3600 * 24 && ' (明日)'}
                                </div>
                            </div>
                        );
                    } else {
                        setClockFooter(
                            <div className='mx-2'>休止予定</div>
                        );
                    }
                }
            });
        });
        // setFoot(<div className='marquee w-100'>AAAAAAAAAAAAAA</div>)
        return () => {
            console.log('audioRef closed')
            // audioRef.current.close();
            audioSrc.current?.stop();
            audioCtx.current?.close();
        }
    }, []);

    return (
        <div ref={timeDiv} className='d-flex flex-column shadow rounded w-60 h-80'>
            {/* 時計エリアヘッダ */}
            <div className='d-flex align-items-center justify-content-center px-2 w-100 h-15' style={{backgroundColor: 'wheat'}}>
                <h4>{head_txt}</h4>
            </div>
            {/* 時計エリアメイン */}
            <div className='d-flex flex-column align-items-center justify-content-center w-100 h-70' style={{backgroundColor: 'white'}}>
                {/* clock head */}
                <div className='d-flex flex-row bg-primary w-90 px-3 py-1'>
                    {clock_head}
                </div>
                {/* clock body */}
                <div className='bg-dark text-light w-90 text-center clock-disp' style={{fontSize: '32px', fontWeight: '800'}}>
                    <div ref={sevensRef[0]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                    <div ref={sevensRef[1]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                    <div ref={colonsRef[0]} className='colon' dangerouslySetInnerHTML={{ __html: colonSvg }} />
                    <div ref={sevensRef[2]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                    <div ref={sevensRef[3]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                    <div ref={colonsRef[1]} className='colon' dangerouslySetInnerHTML={{ __html: colonSvg }} />
                    <div ref={sevensRef[4]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                    <div ref={sevensRef[5]} dangerouslySetInnerHTML={{ __html: sevenSeg }} />
                </div>
                {/* clock footer */}
                <div className='d-flex flex-row bg-primary w-90 px-3 py-1'>
                    {clock_footer}
                </div>
            </div>
            {/* 時計エリアフッタ */}
            <div className='d-flex align-items-center flex-row px-2 w-100 h-15' style={{backgroundColor: 'wheat', overflow: 'hidden'}}>
                {foot_txt}
            </div>
        </div>
    );
}