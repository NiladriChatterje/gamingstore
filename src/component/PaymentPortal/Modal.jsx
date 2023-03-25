import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import './Modal.css';

const Modal = ({ confirmation, setModal, emailVerified }) => {
    const sixRef = useRef();

    function checkValidData(e) {
        e.preventDefault();
        console.log(confirmation)
        if (confirmation.current === parseInt(sixRef.current.value)) {

            emailVerified.current = true;
            setModal(false);
        } else toast('Email Not verified ❌');
    }

    return <div id={'modal-container'}>
        <form id={'modal-form'} onSubmit={checkValidData}>
            <input ref={sixRef} type='number' maxLength={6} />
            <input type={'submit'} />
        </form>
    </div>
}
export default Modal;