import { invoke } from '@tauri-apps/api/tauri';
import { getMatches } from '@tauri-apps/api/cli';
import { platform } from '@tauri-apps/api/os';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { message, ask, open as fileOpen } from '@tauri-apps/api/dialog';
import { basename, join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/api/fs';

import { ajax, util, types, assertIsDefined, assertIsInstanceOf, assertNonNullabl } from './common';

import school from '../audio/Japanese_School_Bell05-15.mp3';
// import greens from '../audio/greensleeves.mp3';

// const path = require('path');
/**
 * アプリケーションのグローバルデータを保管する名前空間
 */
export namespace params {
    // export let sound: { [x: string]: HTMLSourceElement; };
    // チャイム音源のリスト
    export let sound: { name: string, value?: string, copyright?: string, path?: string, org?: boolean }[] = [];
    export let nosoundMode = false;

    /**
     * paramsの初期化
     */
    export const init = async () => {
        sound.push({name: 'school', value: school, copyright: 'BGM by OtoLogic(CC BY 4.0)', org: true});
        // sound.push({name: 'greensleeves', value: greens, org: true});
        //sound.push({name: 'buzz', path: '/Users/mamiyan/work/music/Opening_Buzzer02-1.mp3'});
        //sound.push({name: 'door', path: '/Users/mamiyan/work/music/Doorbell-Melody01-1.mp3'});
        // sound['school'] = school;
        const snds: any[] = await invoke('read_all_sound_data');
        for (let snd of snds) {
            sound.push({name: snd.title, path: snd.path});
        }
        getMatches().then((matches) => {
            console.log(matches.args.nosound.value)
            nosoundMode = matches.args.nosound.value as boolean;
            console.log(matches.args.dbpath.value)
        })
        
    }

    export const reload_sound = async () => {
        sound = sound.filter(v => v.org == true);
        const snds: any[] = await invoke('read_all_sound_data');
        for (let snd of snds) {
            sound.push({name: snd.title, path: snd.path});
        } 
    }
    // export let audioContext: AudioContext;
    // export let audioSource: AudioBufferSourceNode;
}

/**
 * タイマー関連の名前空間
 */
export namespace globalTimer {
    // 最小単位
    let  tick: number = 100;
    // 前回更新時の秒数
    let prev_time = 0;
    // 前回更新時の日数
    export let prev_day = 0;
    // インターバルタイマーオブジェクト
    let timer: NodeJS.Timer | undefined;

    // 現在のスケジュール構造体
    export let schedule: types.Schedule | null = null;

    // 時計表示を行うHTMLエレメント − 更新秒ごとにsecondイベントを送信する
    export let timeDiv: HTMLElement | null = null;

    /**
     * インターバルタイマー実装＆スタート
     */
    export const start = () => {
        timer = setInterval(() => {
            const ndate = Date.now() - (new Date().getTimezoneOffset()) * 60000;
            const now = Math.floor(ndate / 1000);
            if(now != prev_time) {
                prev_time = now;
                const nDate = new Date(Date.now());
                const today = Math.floor(now / (3600 * 24));
                // 秒ごとにtimeDivにカスタムイベントを送信
                if(timeDiv !== null) {
                    let ev = new CustomEvent('second', {detail: { date: now % (3600 * 24)}});
                    // console.log( get_timestring(now % (3600 * 24)))
                    timeDiv.dispatchEvent(ev);
                }
                // 日付が変わったらスケジュールを更新
                if(today != prev_day) {
                    prev_day = today;
                    console.log('schedule fetch')
                    schedule_fetch(nDate).then(() => {});
                }
                //console.log("1s");
            }
        }, tick);
    }

    /**
     * タイマーストップ：まぁ使わないでしょう
     */
    export const stop = () => {
        if(timer !== undefined) {
            clearInterval(timer);
        }
    }

    /**
     * 現在の日付からスケジュールを得る：globalTimer変数に格納
     * @param nDate 
     */
    export const schedule_fetch = async (nDate: Date) => {
        const date_str = nDate.getFullYear() + '/' + (nDate.getMonth() + 1) + '/' + nDate.getDate();
        console.log(date_str)
        await invoke('inquiry_schedule', { date: date_str })
            .then(value => {
                schedule = value as types.Schedule;
                if(timeDiv !== null) {
                    console.log("timeDiv OK!!!")
                    schedule[2] = schedule[2].sort((a, b) => a.invoke_time - b.invoke_time)
                    schedule[2].map(value => value.enabled = true); // set additional parametar
                    // console.log(schedule)
                    let ev = new CustomEvent('schedule');
                    timeDiv.dispatchEvent(ev);
                }
            })
            .catch(err => console.log(err + " : invoke error."));
    }

    /**
     * 次のアラーム情報と現在(処理済)のアラーム情報を得る
     * @returns [prev , next]
     */
    export const get_recent = async (): Promise<[types.ChimeData | null , types.ChimeData | null]> => {
        if(schedule){
            let chimeDatas = schedule[2];
            let nowm = Date.now() - (new Date().getTimezoneOffset()) * 60000; // msec
            let nowtm = nowm % (3600 * 24 * 1000); // Time Only msec
            let nowt = Math.floor(nowtm / 1000); // Time Only sec
            // console.log(get_timedatas(nowt));
            let prev = [...chimeDatas].reverse().find( n => n.invoke_time < nowt) ?? null;
            let next = chimeDatas.find( n => n.invoke_time >= nowt) ?? null;
            // console.log(chimeDatas);
            // console.log([prev, next])
            if(prev === null) {
                let nDate = new Date(Date.now());
                nDate.setDate(nDate.getDate() - 1);
                const date_str = nDate.getFullYear() + '/' + (nDate.getMonth() + 1) + '/' + nDate.getDate();
                const value: types.Schedule = await invoke('inquiry_schedule', { date: date_str });
                const sche: types.Schedule = value;
                sche[2].sort((a, b) => a.invoke_time - b.invoke_time)
                chimeDatas = sche[2];
                // console.log(chimeDatas);
                if(chimeDatas.length > 0) chimeDatas[chimeDatas.length - 1].invoke_time -= 3600 * 24;
                prev = chimeDatas[chimeDatas.length - 1] ?? null;
                //console.log(nDate);
            }
            if(next === null) {
                let nDate = new Date(Date.now());
                nDate.setDate(nDate.getDate() + 1);
                const date_str = nDate.getFullYear() + '/' + (nDate.getMonth() + 1) + '/' + nDate.getDate();
                const value: types.Schedule = await invoke('inquiry_schedule', { date: date_str });
                schedule = value;
                schedule[2].sort((a, b) => a.invoke_time - b.invoke_time)
                schedule[2].map(value => value.enabled = true);
                //await schedule_fetch(nDate);
                chimeDatas = schedule[2];
                // console.log(chimeDatas);
                if(chimeDatas[0]) chimeDatas[0].invoke_time += 3600 * 24;
                next = chimeDatas[0] ?? null;
            }
            return [prev, next];
        }
        return [null, null];
    }

    /**
     * 現在時刻を表す秒数を時分秒の配列にして返す
     * @param seconds 現在時刻の秒数
     * @returns [時,分,秒]
     */
    export const get_timedatas = (seconds: number):[number, number, number] => {
        seconds %= (3600 * 24);
        if(seconds < 0) {
            seconds += 3600 * 24;
        }
        const sec = seconds % 60;
        const minutes = Math.floor(seconds / 60);
        const minute = minutes % 60;
        const hour = Math.floor(minutes / 60);
        return [hour, minute, sec];
    }
    /**
     * 現在時刻を表す秒数を時刻文字列として返す
     * @param seconds 現在時刻の秒数
     * @returns 時刻文字列 hh:mm:ss
     */
    export const get_timestring = (seconds: number): string => {
        let datas = get_timedatas(seconds);
        return ('00' + datas[0]).slice(-2) + ':' + ('00' + datas[1]).slice(-2) + ':' + ('00' + datas[2]).slice(-2);
    }

    export const get_datestring = (udate: number): string => {
        let ndate = new Date(udate * 24 * 3600 * 1000);
        return ndate.getFullYear() + '/' + ('00' + (ndate.getMonth() + 1)).slice(-2) + '/' + ('00' + ndate.getDate()).slice(-2);
    }

    export const get_todaystring = (): string => {
        let ndate = new Date();
        return ndate.getFullYear() + '/' + ('00' + (ndate.getMonth() + 1)).slice(-2) + '/' + ('00' + ndate.getDate()).slice(-2);
    }

    export const get_datestring_hyfun = (udate: number): string => {
        let ndate = new Date(udate * 24 * 3600 * 1000);
        return ndate.getFullYear() + '-' + ('00' + (ndate.getMonth() + 1)).slice(-2) + '-' + ('00' + ndate.getDate()).slice(-2);
    }

}

const WebAudioAPI = class {
    private audioContext?: AudioContext;
    private audioSource?: AudioBufferSourceNode;
    constructor() {
    }

    public play = async (snd: string, onEnded?: () => void) => {
        let aryb: ArrayBuffer;
        try {
            const res = await fetch(snd);
            if(res.status !== 200) {
                throw Error;
            }
            aryb = await res.arrayBuffer();
        } catch(error) {
            //console.log(`err : ${error}`);
            const val = await invoke('get_file_obj', { path: snd })
            .catch(e => console.log(e));
            const val1 = new Uint8Array(val as Array<number>);
            aryb = val1.buffer;

        }
        console.log('api play')
        await invoke('logging');
        this.audioContext = new AudioContext();
        const audiob = await this.audioContext.decodeAudioData(aryb);
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = audiob;
        const res = this.audioSource.connect(this.audioContext.destination);
        this.audioSource.start(0);
        if(onEnded){
            this.audioSource.onended = onEnded;
        }
    }

    public stop = () => {
        this.audioSource && this.audioSource.stop();
        this.audioContext && this.audioContext.close();
        this.audioContext = undefined;
        this.audioSource = undefined;
    }

    public close = () => {
        console.log('audio close!')
        this.audioContext && this.audioContext.close();
    }
}

export const getAudioSource = async (ctx: AudioContext, url: string): Promise<AudioBufferSourceNode | null> => {
    if (params.nosoundMode) {
        return null;
    }
    const src: AudioBufferSourceNode = ctx.createBufferSource();
    // const res = await fetch(url); //.then(res => res.arrayBuffer())
    let aryb: ArrayBuffer;
    //const isPath: boolean = await exists(url) as unknown as boolean;
    if (url.match(/^(http|tauri):.*/)) {
        const res = await fetch(url);
        // if(res.status !== 200) {
        //     console.log('fetch error!')
        //     throw Error;
        // }
        aryb = await res.arrayBuffer();
    } else {
        //console.log(`err : ${error}`);
        if (!url.match(/^\/.*/)){
            const dpath = await invoke('get_db_path') as string;
            url = await join(dpath, url);
        }
        const val = await invoke('get_file_obj', { path: url })
        .catch(e => console.log(e));
        const val1 = new Uint8Array(val as Array<number>);
        aryb = val1.buffer;
    }
    // const arryb = await res.arrayBuffer();
    const abuf = await ctx.decodeAudioData(aryb);
    if(abuf !== undefined){
        src.buffer = abuf;
        src.connect(ctx.destination);
    }
    return src
}