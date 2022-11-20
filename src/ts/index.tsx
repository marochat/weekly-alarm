import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';

import { types } from './common';
import { globalTimer, params } from './application';

import '../scss/bootstrap-custom.scss';

// for audio
window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
// params.audioContext = new AudioContext();

appWindow.setSize(new LogicalSize(800, 600));
appWindow.setResizable(false);
Promise.all([
    new Promise<void>(resolv => window.onload = () => resolv()),
    params.init(),
])
.then(() => {
    const root: ReactDOM.Root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
        // <React.StrictMode>
            <App />
        // </React.StrictMode>
    );
    globalTimer.start();
    // params.init();
    let date = Date.now() - (new Date().getTimezoneOffset() * 60000);
    console.log(date);
    console.log(globalTimer.get_datestring(Math.floor(date / 1000) % (3600 * 24)));
    console.log(new Date());
});
