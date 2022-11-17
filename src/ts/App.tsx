import React from 'react';
import { TBI, FullFrame } from './common';
import { ConfigDialog } from './confdialog';
import { ClockBody } from './clockbody';
import { globalTimer } from './application';

import menuIcon from '../img/menu_FILL0_wght400_GRAD0_opsz48.svg'
//import chaim from '../audio/greensleeves.mp3';

export const App = () => {
    const [ configDlg, setConfigDlg ] = React.useState<JSX.Element | null>(null);
    const mainRef = React.useRef<HTMLElement>(null);


    /**
     * 設定画面を閉じる
     * 閉じた後に、日付保存定数をリセットして、アラームセットを再読み込み
     */
    const closeConf = () => {
        setConfigDlg(null);
        globalTimer.prev_day = 0;
    }

    /**
     * ハンバーガーメニューボタン：設定画面を開く
     * JSX.ElementのStateに設定画面を設定
     */
    const handleMenuBtn = () => {
        setConfigDlg(<ConfigDialog closeFunc={closeConf} />)
    }

    return (
        <main ref={mainRef} className='position-relative'>
            {configDlg}
            <FullFrame>
                {/* アプリケーションヘッダ */}
                <div className='d-flex w-100 bg-light' style={{height: '10%'}}>
                    <div className='position-absolute d-flex align-items-center justify-content-center w-10 h-10'>
                        <a type='button' href='#' onClick={handleMenuBtn}>
                            <img src={menuIcon} width={30} alt='flag change button'/>
                        </a>
                    </div>
                    <div className='d-flex align-items-center justify-content-center w-100'>
                        <h2>Weekly Alarm</h2>
                    </div>
                </div>
                {/* アプリケーションボディ */}
                <div className='d-flex flex-column align-items-center justify-content-center bg-primary h-80'>
                    <ClockBody />
                </div>
                {/* アプリケーションフッタ */}
                <div className='bg-light h-10'>
                    {/* <TBI /> */}
                </div>
            </FullFrame>
        </main>
    );
}
