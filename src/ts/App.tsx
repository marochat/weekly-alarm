import React from 'react';
import * as Bsr from 'react-bootstrap';
import { TBI, FullFrame } from './common';
import { ConfigDialog } from './confdialog';
import { AlarmSoundConf } from './alarmSound';
import { ClockBody } from './clockbody';
import { AboutDialog } from './about';
import { globalTimer } from './application';

import { params } from './application';

import menuIcon from '../img/menu_FILL0_wght400_GRAD0_opsz48.svg'
//import chaim from '../audio/greensleeves.mp3';

export const App = () => {
    const [ configDlg, setConfigDlg ] = React.useState<JSX.Element | null>(null);
    const [ menuShow, setMenuShow ] = React.useState<boolean>(false);
    const [ dialogDiv, setDialogDiv ] = React.useState<JSX.Element | null>(null);
    const [ aboutDialog, setAboutDialog ] = React.useState<JSX.Element | null>(null);

    const handleMenuShow = () => setMenuShow(true);
    const handleMenuClose = () => setMenuShow(false);
    /**
     * 設定画面を閉じる
     * 閉じた後に、日付保存定数をリセットして、アラームセットを再読み込み
     */
    const closeConf = () => {
        setConfigDlg(null);
        // document.body.classList.remove('scroll-on');
        globalTimer.prev_day = 0;
    }

    /**
     * ハンバーガーメニューボタン：設定画面を開く
     * JSX.ElementのStateに設定画面を設定
     */
    const handleMenuBtn = () => {
        setMenuShow(false);
        // document.body.classList.add('scroll-on');
        setConfigDlg(<ConfigDialog closeFunc={closeConf} />);
    }

    const closeSoundConf = () => {
        setDialogDiv(null);
    }
    const handleSoundConf = () => {
        // setMenuShow(false);
        // setDialogDiv(
        //     <AlarmSoundDialog parentClose={() => setDialogDiv(null)} />
        // );
        setMenuShow(false);
        setDialogDiv(<AlarmSoundConf closeFunc={closeSoundConf} />);
    }

    const handleAbout = () => {
        setMenuShow(false);
        setAboutDialog(<AboutDialog parentClose={() => setAboutDialog(null)} />)
    }

    return (
        <React.Fragment>
            <FullFrame>
                {/* アプリケーションヘッダ */}
                <div className='d-flex w-100 bg-light' style={{height: '10%'}}>
                    <div className='position-absolute d-flex align-items-center justify-content-center w-10 h-10'>
                        <a type='button' href='#' onClick={handleMenuShow}>
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
            {/* Offcanvasサイドメニュー */}
            <Bsr.Offcanvas show={menuShow} onHide={handleMenuClose}>
                <Bsr.Offcanvas.Header closeButton>
                    <Bsr.Offcanvas.Title>サイドメニュー</Bsr.Offcanvas.Title>
                </Bsr.Offcanvas.Header>
                <Bsr.Offcanvas.Body>
                    <Bsr.ListGroup>
                        <Bsr.ListGroup.Item as='a' href='#' onClick={handleMenuBtn}>
                            アラーム設定
                        </Bsr.ListGroup.Item>
                        <Bsr.ListGroup.Item as='a' href='#' onClick={handleSoundConf}>
                            アラーム音管理
                        </Bsr.ListGroup.Item>
                        <Bsr.ListGroup.Item as='a' href='#' onClick={handleAbout}>
                            WeeklyAlarmについて
                        </Bsr.ListGroup.Item>
                    </Bsr.ListGroup>
                </Bsr.Offcanvas.Body>
            </Bsr.Offcanvas>
            {/* 設定画面 */}
            {configDlg}
            {dialogDiv}
            {aboutDialog}
        </React.Fragment>
    );
}
