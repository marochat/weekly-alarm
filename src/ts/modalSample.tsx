import React from 'react';
import ReactDOM from 'react-dom/client';

import  * as Bsr from 'react-bootstrap';
import { Modal } from './ModalDialog';

export const ModalSample = ({
    title,
    body,
    parentShow,
    parentClose,
}:{
    title?: string,
    body?: string | JSX.Element,
    parentShow?:(para:(JSX.Element|null)) => void,
    parentClose?: () => void,
}) => {
    const okFunc = async () => {
        //const ret = window.confirm('dialog ok button');
        const ret = false;
        return ret;
    }

    //console.log(otherprops);
    return (
        <>
            {/* <Bsr.Button size='sm' variant='secondary' onClick={ () => setShow(true) }>
                Dialog Sample
            </Bsr.Button> */}
            <Modal
                title={title}
                body={body}
                parentShow={parentShow}
                parentClose={parentClose}
                okFunc={okFunc}
                okFocus={true}
                {...{centered: true, size: 'sm'}} />
        </>
    )
}