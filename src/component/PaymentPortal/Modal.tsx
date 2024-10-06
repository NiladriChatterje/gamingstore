import React, { FormEvent, useRef } from 'react';
import { toast } from 'react-hot-toast';
import styles from './Modal.module.css';

const Modal = ({ confirmation, setModal, emailVerified }: {
    confirmation: any; setModal: React.Dispatch<React.SetStateAction<boolean>>;
    emailVerified: React.MutableRefObject<boolean>;
}) => {
    const sixRef = useRef<HTMLInputElement | any>();

    function checkValidData(e: FormEvent) {
        e.preventDefault();
        console.log(confirmation)
        if (confirmation.current === parseInt(sixRef.current.value)) {

            emailVerified.current = true;
            setModal(false);
        } else toast('Email Not verified ❌');
    }

    return <div id={styles['modal-container']}>
        <form id={styles['modal-form']} onSubmit={checkValidData}>
            <input ref={sixRef} type='number' maxLength={6} />
            <input type={'submit'} />
        </form>
    </div>
}
export default Modal;