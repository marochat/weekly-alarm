import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { TBI } from './common';
import * as bsm from 'bootstrap';

export const modalSample = ({parent}: {parent: HTMLElement}) => {
    const child = parent.appendChild(document.createElement('div'));
    const tes = React.createElement('div');
    tes.props = {};
    const dialogRoot = ReactDOM.createRoot(child);

    const Dialog = () => {
        const childRef = React.useRef<HTMLDivElement>(null);
        const modalRef = React.useRef<bsm.Modal | null>(null);
        const removeThis = () => {
            parent.removeChild(child!);
        }
    
        const handleClose = () => {
            removeThis();
        }
    
        React.useEffect(() => {
            modalRef.current = new bsm.Modal(childRef.current!); 
            modalRef.current.show();
        }, []);
        return (
            <div id='tes' ref={childRef} className='modal-dialog' data-keyboard={true}>
            <form className='modal-content' method='POST' action='' onSubmit={() => false}>
                {/* modal header */}
                <div className='modal-header'>
                    <h5 className='modal-title' id='modalDialogLabel'>サンプルダイアログ</h5>
                    <input type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' onClick={handleClose} />
                </div>
                {/* modal body */}
                <div className='modal-body'>
                    <TBI mes='モーダルダイアログボディ' />
                </div>
                {/* modal footer */}
                <div className='modal-footer'>
                    <button className='btn btn-secondary' id='modalDialogCloseButton' tabIndex={2} data-bs-dismiss='modal' onClick={handleClose}>
                        Close
                    </button>
                </div>
            </form>
            </div>
        );
    }

    dialogRoot.render(
        <Dialog />
    );
}