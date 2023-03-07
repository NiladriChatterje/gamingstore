import React, { useEffect, useRef } from 'react';
import './Modal.css';
import toast, { Toaster } from 'react-hot-toast'

const Modal = ({ confirmation, setModal, setEmailVerified }) => {
    const sixRef = useRef();
    useEffect(() => { toast('OTP sent to your specified Email') })
    function checkValidData(e) {
        e.preventDefault();
        if (confirmation === parseInt(sixRef.current.value)) {
            toast('Email Verified');
            setEmailVerified(true);
            setModal(false);
        }
        else {
            toast('Not Verified Email')
        }
    }

    return <div id={'modal-container'}>
        <form id={'modal-form'} onSubmit={checkValidData}>
            <input ref={sixRef} type='number' maxLength={6} />
            <input type={'submit'} />
        </form>
        <Toaster />
    </div>
}
export default Modal;