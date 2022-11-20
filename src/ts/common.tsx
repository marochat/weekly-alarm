//import i18next, { loadLanguages } from "i18next";
//import { Uint8BufferAttribute } from "three";
import React from 'react';

export const TBI = ({mes = ''}: {mes? : string}) => {
    console.log('%c To be Implemented ', 'color: white; background-color: red; font-weight: bold; padding: 2px; border-radius:3px', mes);
    return (
        <div>To be Implemented! : {mes}</div>
    );
}

export const FullFrame = ({className = '', children}: {className?: string, children?: React.ReactNode}) => {
    const width: string = window.innerWidth.toString() + 'px';
    const height: string = window.innerHeight.toString() + 'px';
    // const width: string = '100vw';
    // const height: string = '100%';
    return (
        <div className={className} style={{width: width, height: height, maxHeight: 'none', maxWidth: 'none' , margin: 0}}>
            {children}
        </div>
    )
}

/**
 * NULLセーフをアサートする関数：(any | nul)型などが対象
 * @param  {T} val
 * @returns assertsvalisNonNullable
 */

export function assertNonNullabl<T>(val: T) : NonNullable<T> {
    if(val === undefined || val === null) {
        throw new Error();
    }
    return val as NonNullable<T>;
}

export function assertIsDefined<T>(val: T) : asserts val is NonNullable<T> {
    if(val === undefined || val === null){
        throw new Error(
            `Expected 'val' to be defined, but received ${val}`
        );
    }
}
/**
 * val が指定のクラスのオブジェクトであることをアサートする関数
 * アップキャストで渡された引数を本来のクラスにダウンキャストする時に使用
 * @param  {any} val
 * @param  {new} cls
 * @returns assertsvalisT
 */
export function assertIsInstanceOf<T>(val: any, cls: new() => T) : asserts val is T {
    if(!(val instanceof cls)){
        throw new Error(`${val} is not instance of cls`);
    }
}


/**  ↓ DOM操作用追加インターフェース - React対応により鳴るべく使用しないように、、、使用する必要がなくなったら削除 */
/**
 * HTMLElementに自身を返すメソッドを追加するためのおまじない（メソッドチェイン実現用）
 * グローバルのインタフェースにメソッド追加
 * とくにexportしなくて良い？
 */
declare global {
    interface HTMLElement {
        appendElement<K extends keyof HTMLElementTagNameMap>(tag: K, func?: (elem: HTMLElementTagNameMap[K]) => void): HTMLElement
        editElement<T extends HTMLElement>(func: (elem: T) =>  void): T
        appendChain<T extends HTMLElement>(child: HTMLElement | string): T
        appendHtmlString<T extends HTMLElement>(html: string, param?: any): T
        clearElement<T extends HTMLElement>(): T
    }
    interface Document {
        createElementEdit<K extends keyof HTMLElementTagNameMap>(tag: K, func: (elem: HTMLElementTagNameMap[K]) => void): HTMLElementTagNameMap[K]
    }
}

/**
 * HTMLElementに自身を帰すメソッドを追加する
 * 　DOMでメソッドチェーンが可能になると思う
 * @param  {(elem: HTMLElement =>void} func
 * @returns HTMLElement
 */
HTMLElement.prototype.editElement = function<T extends HTMLElement>(func: (elem : T) => void) : T {
    //assertIsInstanceOf(this, T);
    //console.log("ElementType : " + this.constructor.name)
    func(this as T);
    return this as T;
}

/**
 * HTMLElement.append(Child)のメソッドチェーン用のラッパ
 * 引数はHTMLElementとstringを受け付ける
 * @param  {HTMLElement|string} child
 * @returns HTMLElement
 */
HTMLElement.prototype.appendChain = function<T extends HTMLElement>(child: HTMLElement | string) : T {
    //assertIsInstanceOf(this, HTMLElement);
    if(child instanceof HTMLElement){
        this.appendChild(child);
    } else if (typeof(child) === "string"){
        this.appendChild(document.createTextNode(child));
    } else {
        throw new TypeError("parameter node: must be string or HTMLElement.");
    }
    return this as T;
}

HTMLElement.prototype.appendElement = function<K extends keyof HTMLElementTagNameMap>(tag: K, func?: (elem: HTMLElementTagNameMap[K]) => void): HTMLElement {
    assertIsInstanceOf(this, HTMLElement);
    const elm : HTMLElementTagNameMap[K] = document.createElement(tag);
    if(func) {
        func(elm);
    }
    this.appendChild(elm);
    return this;
}

Document.prototype.createElementEdit = function<K extends keyof HTMLElementTagNameMap>(tag: K, func: (elem: HTMLElementTagNameMap[K]) => void): HTMLElementTagNameMap[K] {
    const elm : HTMLElementTagNameMap[K] = document.createElement(tag);
    func(elm);
    return elm;
}

/**
 * HTMLElementの内容をクリアして自身を返す。メソッドチェーン用
 * @returns HTMLElement
 */
HTMLElement.prototype.clearElement = function<T extends HTMLElement>() : T {
    assertIsInstanceOf(this, HTMLElement);
    this.innerHTML = "";
    return this as T;
}

HTMLElement.prototype.appendHtmlString = function<T extends HTMLElement>(html: string, param?: any) : T {
    if(param){
        html = html.replace(/{{([^{}]*)}}/g, (match, p1)=> {
            let val: string = p1.trim();
            try {
                val = eval('param.' + val).toString();
            } catch(e) {
                val = match;
            }
            return val;
        });    
    }
    // ’text/xml’でパースした場合CSSが正しく反映されないので、’text/html’でパースし、
    // body以下を切り取る（text/htmlパースだと上位のHTMLタグから作成されてしまうので）
    const doc: Document = new DOMParser().parseFromString(html, 'text/html');
    const childs = Array.from(doc.body.childNodes);
    for(let element of childs) {
        this.appendChild(element);
    }
    return this as T;
}
/** ↑ 以上 DOM操作用追加インターフェイス */

/**
 * Stringクラスへのカスタムメソッド追加のためのグローバルインターフェース
 */
declare global {
    interface String {
        capitalize(): string;
        wordCapitalize(): string;
    }
}

/**
 * 英字の一文字目を大文字にするキャピタライズメソッド
 */
String.prototype.capitalize = function (): string {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
}

/**
 * 各単語をキャピタライズするメソッド
 */
String.prototype.wordCapitalize = function (): string {
    return this.split(' ').map((value, index, array) => value.capitalize()).join(' ');
}

/**
 * ajax通信関数用名前空間
 */
export namespace ajax {
    export let token: types.Token | null;

    export const FormControl = {
        input: 'input',
        select: 'select',
    } as const;
    export type FormControl = typeof FormControl[keyof typeof FormControl];

    export const ResponseType = {
        text: 'text',
        json : 'json',
        blob : 'blob',
        arrayfbuffer : 'arraybuffer',
        formData : 'formData',
    }
    export type ResponseType = typeof ResponseType[keyof typeof ResponseType];

    /**
     * AJAX通信でJSON形式のデータを取得する（async関数）
     * @param  {string} url  : リクエストURL
     * @returns Promise<any> : JSONデータ
     */
    export const getJson = async (
        url: string,
        typ: ResponseType = ResponseType.json,
        progress_proc?: (loaded: number, total: number) => void,
    ) : Promise<any> => {
        try {
            let headers: any = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
            if(token){
                headers = {
                    ...headers,
                    Authorization: token.token_type + ' ' + token.access_token
                };
            }
            let response: any = await fetch(url, { headers: headers});
            //console.log(`total seize = ${total}`);
            // 進捗管理(Fetchでも一応出来るよというサンプル)
            // (進捗しながらデータも読み込んでしまうので、データ再構築が面倒ということで、暫定対応)
            // (普通にXHR版を使用した方が良いような)
            const total = Number.parseInt(response.headers.get('Content-Length'));
            if(total && progress_proc){
                let loaded = 0;
                let chunks = [];
                const reader = response.body.getReader();
                while(true){
                    const {done, value} = await reader.read();
                    if(done) {
                        break;
                    }
                    chunks.push(value);
                    loaded += value.length;
                    progress_proc(loaded, total);
                }
                let blob = new Blob(chunks);
                switch (typ) {
                    case ResponseType.blob:
                        return blob;
                    case ResponseType.arrayfbuffer:
                        let arry = await blob.arrayBuffer();
                        return arry;
                    case ResponseType.json:
                        arry = await blob.arrayBuffer();
                        let u8 = new Uint8Array(arry);
                        let txt = new TextDecoder('utf-8').decode(u8);
                        return JSON.parse(txt);
                    default:
                        return {'detail': 'the response type not support with progress download yet.'}
                }

                let arry = await blob.arrayBuffer();
                let u8 = new Uint8Array(arry);

                return blob;
            }
            if(response.ok){
                //console.log(response.headers.get('content-type'));
                switch(typ){
                    case ResponseType.text: return response.text();
                    case ResponseType.json: return response.json();
                    case ResponseType.blob: return response.blob();
                    case ResponseType.arrayfbuffer: return response.arraybuffer();
                    case ResponseType.formData: return response.formData();
                }
                return response.json();
            } else {
                throw {'type': 'Error', 'message': response.statusText, 'status': response.status};
            }
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * ajax get json (XMLHttpRequest API)
     * @param url 
     * @returns Promise<JSON>
     */
    export const getJsonNonFetch = async (
        url: string,
        responseType?: XMLHttpRequestResponseType,
        progress_proc?: (ev: ProgressEvent<EventTarget>) => void,
    ): Promise<any> => 
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('content-type', 'application/json');
            if(token){
                xhr.setRequestHeader('Authorization', token.token_type + ' ' + token.access_token);
            }
            // 進捗
            if(progress_proc) 
                xhr.onprogress = progress_proc;
            if(responseType)
                xhr.responseType = responseType;
            xhr.send();
    
            xhr.addEventListener('readystatechange', () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200) {
                        let typ = xhr.getResponseHeader('content-type');
                        //console.log(typ);
                        if(typ == 'application/json') {
                            resolve(JSON.parse(xhr.response));
                        } else {
                            resolve(new Blob([xhr.response]));
                            //resolve({'detail': 'recieved'});
                        }
                    } else
                        reject({'detail': 'http error'});
                }
            });
        });
    

    /**
     * AJAX通信でJSON形式のデータを取得する（async関数）
     * @param  {string} url  : リクエストURL
     * @returns Promise<any> : JSONデータ
     */
    export const postJson = async (url: string, jdat: JSON) : Promise<any> => {
        let headers: any = {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json'
        }
        if(token){
            headers = {
                ...headers,
                Authorization: token.token_type + ' ' + token.access_token
            };
        }
        try {
            let response: any = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(jdat),
            });
            if(response.ok){
                return response.json();
            } else {
                throw {'type': 'Error', 'message': response.statusText, 'status': response.status};
                //return request.json();
            }
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * AJAX通信でJSON形式のデータを取得する（async関数）
     * @param  {string} url  : リクエストURL
     * @returns Promise<any> : JSONデータ
     */
    export const postFormJson = async (url: string, fdat: FormData) : Promise<any> => {
        let headers: any = {
            'X-Requested-With': 'XMLHttpRequest',
            //'content-type': 'application/json'
        }
        if(token){
            headers = {
                ...headers,
                Authorization: token.token_type + ' ' + token.access_token
            };
        }
        try {
            let response: any = await fetch(url, {
                method: "POST",
                headers: headers,
                body: fdat,
            });
            if(response.ok){
                return response.json();
            } else {
                throw {'type': 'Error', 'message': response.statusText, 'status': response.status};
            }
        } catch (error: any) {
            //console.log(error);
            throw error;
        }
    }

    /**
     * ajax get json (XMLHttpRequest API)
     * @param url 
     * @returns Promise<JSON>
     */
    export const postFormJsonNonFetch = async (
            url: string,
            fdat: FormData,
            progress_proc?: (e: ProgressEvent<EventTarget>) => void,
        ): Promise<any> => 
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            //xhr.setRequestHeader('content-type', 'application/json');
            if(token){
                xhr.setRequestHeader('Authorization', token.token_type + ' ' + token.access_token);
            }
            //console.log(fdat.get('test1'));
            // upload用のプログレスイベントハンドラ
            // sendより前に設定しないと、有効にならない。（解決まで時間がかかってしまった・・・
            if (xhr.upload) {
                console.log('set progress?');
                if(progress_proc){
                    xhr.upload.onprogress = progress_proc;
                }
                xhr.onloadend = (e : ProgressEvent<EventTarget>) => {
                    console.log('all end');
                }
            }

            xhr.send(fdat);
    
            xhr.addEventListener('readystatechange', () => {
                if(xhr.readyState === 4){
                    if(xhr.status === 200) {
                        let typ = xhr.getResponseHeader('content-type');
                        console.log(typ);
                        if(typ == 'application/json') {
                            resolve(JSON.parse(xhr.response));
                        } else {
                            resolve({'detail': 'recieved'});
                        }
                    } else if(xhr.status === 401) {
                        reject({'type': 'Error', 'message': xhr.statusText, 'status': xhr.status})
                    } else {
                        reject({'detail': 'http error'});
                    }
                }
            });
        });

    /**
     * getJsonで期限切れのトークンを再取得する機構を組み込んだもの
     * 401が返ってきた場合は/token APIで再取得してリトライする
     * @param url API URL
     * @param typ レスポンスタイプ
     * @param progress_proc プログレス関数（使用しない？）
     * @returns APIの戻り値
     */
    export const getJsonWithRetryToken = async (
        url:string,
        typ: ResponseType = ResponseType.json,
        progress_proc?: (loaded: number, total: number) => void,): Promise<any> => {
        try {
            const value = await getJson(url, typ, progress_proc);
            return value;
        } catch(e: any) {
            if(e.status == 401){ //
                console.log('access token may be expired.')
                token = await getJson('/token');
                const value = await getJson(url, typ, progress_proc);
                return value;
            }
            throw e;
        }

    }

    /**
     * postJson 期限切れのトークンを再取得する機構を組み込んだもの
     * @param url 
     * @param jdat 
     * @returns 
     */
    export const postJsonWithRetryToken = async (url: string, jdat: JSON): Promise<any> => {
        try {
            const value = await postJson(url, jdat);
            return value;
        } catch(e: any) {
            if(e.status == 401) {
                console.log('access token may be expired.');
                token = await getJson('/token');
                const value = await postJson(url, jdat);
                return value;
            }
            return e;
        }
    }

    /**
     * 
     * @param url postFromJson
     * @param fdat 
     * @returns 
     */
    export const postFormJsonWithRetryToken = async (url: string, fdat: FormData) : Promise<any> => {
        try {
            const value = await postFormJson(url, fdat);
            return value;
        } catch(e: any) {
            if(e.status == 401) {
                console.log('access token may be expired.');
                token = await getJson('/token');
                const value = await postFormJson(url, fdat);
                return value;
            }
            return e;
        }
    }

    /**
     * postFormJsonNonFetch
     * @param url 
     * @param fdat 
     * @param progress_proc 
     * @returns 
     */
    export const postFormJsonNonFetchWithRetryToken = async (
        url: string,
        fdat: FormData,
        progress_proc?: (e: ProgressEvent<EventTarget>) => void,
    ): Promise<any> => {
        try {
            const value = await postFormJsonNonFetch(url, fdat, progress_proc);
            return value;
        } catch(e: any) {
            if(e.status == 401) {
                console.log('access token may be expired.');
                token = await getJson('/token');
                const value = await postFormJsonNonFetch(url, fdat, progress_proc);
                return value;
            }
            return e;
        }

    }

}

export namespace util {

    export const debugstr = (str: any) => {
        console.log(str);
        return null;
    }

    /**
     * async版timeout関数 Promise<void>を返すのでawaitする
     * @param  {number} ms
     * @returns Promise
     */
    export const timeout = async (ms: number) : Promise<void> =>  {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * ajaxでpythonから受信したDateオブジェクトは、もとがUTCにも関わらす、
     * JSTとして読み込んでしまうので、+9H補正して文字列で出力する
     * @param date : pythonから受信したDateオブジェクト
     * @returns 
     */
    export const dateUTCtoJSTString = (date: Date): Date => {
        let dat = new Date(date.toString());
        dat.setHours(dat.getHours() + 9);
        return dat;
        //return dat.toLocaleString('ja-JP', {timeZone: 'JST'});
    }
    /**
     * ES8(2017) async/await構文に対応しているかを判別して返す
     * @returns boolean
     * ------------------- WebPack化に際し削除
     */
    /*
    export const es2017Check = () : boolean => {
        let val: boolean = true;
        try {
            eval('async () => {}');
        } catch(e) {
            if (e instanceof SyntaxError) {
                val = false;
            } else {
                throw e;
            }
        }
        return val;
    }*/
    /**
     * 時刻情報をもとにユニークな文字列を返す（IDなど一時的に使用）
     */
    export const getUniqueStr = () => new Date().getTime().toString(16) + Math.floor(1000*Math.random()).toString(16)

    export const tagPattern: RegExp = /^\S{1,30}$/;
    export const passwordPatternRegexp: RegExp = /^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[a-z])(?=.*?[.?+/-;:@#$%&!])[0-9a-zA-Z.?+/-;:@#$%&!]{6,24}$/;
    export const emailPatternRegexp: RegExp = /^[A-Za-z0-9]{1}[A-Za-z0-9+_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
    export const usernamePatternRegexp: RegExp = /^[a-zA-z0-9_]{3,}$/;
    
}

/**
 * 型宣言用名前空間
 */
export namespace types {
    export type menuitems = {
        title: string
        path: string
        doc: string
    }[];

    export type authdata = {
        auth: boolean
        name: string
        group: string
    };
    export const isAuthData = (arg: unknown): arg is authdata =>
        typeof arg === 'object' && typeof arg !== null &&
        typeof (arg as authdata).auth === 'boolean' &&
        typeof (arg as authdata).name === 'string' &&
        typeof (arg as authdata).group === 'string'

    export type Token = {
        access_token: string
        token_type: string
        username: string
        group: string
    };

    /**
     * ユーザー方定義ガード for Token
     * @param arg 
     * @returns 
     */
    export const isToken = (arg: unknown): arg is Token =>
        typeof arg === 'object' && arg !== null &&
        typeof (arg as Token).access_token === 'string' &&
        typeof (arg as Token).token_type === 'string' &&
        typeof (arg as Token).username === 'string' &&
        typeof (arg as Token).group === 'string'

    /**
     * RSSフィードリクエストの戻り型
     */
    export type FeedResult = {
        feed: {
            title: string
        }
        entries: {
            title: string
            link: string
            summary: string
            author: string
            published: string
        }[]
    }

    /**
     * ユーザー型定義ガード
     * @param arg 
     * @returns 
     */
    export const isFeedResult = (arg: unknown): arg is FeedResult => 
        typeof arg === 'object' && arg !== null &&
        typeof (arg as FeedResult).feed === 'object' &&
        typeof (arg as FeedResult).entries === 'object'
    
    export type Captcha = {
        value: string
        data: string
    }
    export const isCaptcha = (arg: unknown): arg is Captcha =>
        typeof arg === 'object' && arg !== null &&
        typeof (arg as Captcha).value === 'string' &&
        typeof (arg as Captcha).data === 'string'

    export type BoolResult = {
        result: boolean
        detail: string
    }
    export const isBoolResult = (arg: unknown): arg is BoolResult =>
        typeof arg === 'object' && arg !== null &&
        typeof (arg as BoolResult).result === 'boolean' &&
        typeof (arg as BoolResult).detail === 'string'

    export const SortDir = {
        up: 'up',
        down: 'down',
    } as const;
    export type SortDir = typeof SortDir[keyof typeof SortDir];

    export type Point = {
        x: number
        y: number
    }

    export type TriAngle = {
        p1: Point
        p2: Point
        p3: Point
    }

    export type ChimeData = {
        id: number
        title: string
        invoke_time: number
        chime: string
        daily_chimes_id: number
        enabled: boolean // additional frontend parameter
        created_at: number
        updated_at: number
    }

    export type ScheduleItem = {
        id: number
        title: string
        date_info: string
        date: number | null
        daily_chimes_id: number | null
        created_at: number
        updated_at: number
    }

    export type DailyChimes = {
        id: number
        title: string
        created_at: number
        updated_at: number
    }

    export type Schedule = [
        ScheduleItem,
        DailyChimes,
        //{id: number, title: string, invoke_time: number, chime: string | null, daily_chimes_id: number, created_at: number, updated_at: number}[],
        ChimeData[],
    ]

    export type Chimes = [
        DailyChimes,
        ChimeData[],
    ]

    export const DateInfo = {
        WeekDay: 'WeekDay',
        HoliDay: 'HoliDay',
        Monday: 'Monday',
        Tuseday: 'Tuseday',
        Wednesday: 'Wednesday',
        Thursday: 'Thursday',
        Friday: 'Friday',
        Saturday: 'Saturday',
        Sunday: 'Sunday',
        PublicHoliDay: 'PublicHoliDay',
        ReservedDay: 'ReservedDay',
    }
    export type DateInfo = typeof DateInfo[keyof typeof DateInfo];

    export type teesstt = [number, number, number]
} /** end of types */
