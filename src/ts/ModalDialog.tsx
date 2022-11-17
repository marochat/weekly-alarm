import React from 'react';
import * as Bsr from 'react-bootstrap';

export const Modal = (
    {
        title = 'modal dialog component sample',
        header,
        body = 'ここにボディを記載',
        footer = '',
        okLabel = 'Accept',
        closeLabel = 'Close',
        okFocus = false,
        okFunc,
        closeFunc,
        parentShow,
        parentClose,
        ...otherProps
    }: {
        title?: string,
        header?: string | JSX.Element,
        body?: string | JSX.Element,
        footer?: string | JSX.Element,
        okLabel?: string,
        closeLabel?: string,
        okFocus?: boolean,
        okFunc?: () => Promise<boolean>,
        closeFunc?: () => void,
        parentShow?: (para:(JSX.Element | null)) => void,
        parentClose?: () => void,
        otherprops?: {}
    }
) => {
    const [ modalShow, setModalShow ] = React.useState<boolean>(true);

    const handleOnHide = () => {
        setModalShow(false);
    }

    const handleOkbutton = async () => {
        // 原因は分からないとConfirmなどの戻り値がPromiseになってしまっているのでawaitしておく
        const res: boolean = await okFunc!();
        if(res) setModalShow(false);
    }


    console.log(otherProps)
    return (
        <Bsr.Modal
            show={modalShow}
            onHide={handleOnHide}
            onExited={() => {
                parentShow && parentShow(null);
                parentClose && parentClose();
            }}
            {...otherProps}
        >
            {
                (title || header) && (
                    <Bsr.Modal.Header closeButton>
                        {header}
                        {
                            title && (
                                <Bsr.Modal.Title>
                                    {title}
                                </Bsr.Modal.Title>
                            )
                        }
                    </Bsr.Modal.Header>
                )
            }
            {
                body && (
                    <Bsr.Modal.Body>
                        {body}
                    </Bsr.Modal.Body>
                )
            }
            {
                (
                    <Bsr.Modal.Footer>
                        {footer}
                        { okFunc && (
                            <Bsr.Button variant='primary' onClick={handleOkbutton} type='submit' autoFocus={okFocus}>
                                {okLabel}
                            </Bsr.Button>
                        ) }
                        {
                            <Bsr.Button variant='secondary' onClick={handleOnHide}>
                                {closeLabel}
                            </Bsr.Button>
                        }
                    </Bsr.Modal.Footer>
                )
            }
        </Bsr.Modal>
    );
}
