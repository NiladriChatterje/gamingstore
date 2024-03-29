import React, { useEffect, useRef, useState } from 'react'
import './PaymentPortal.css';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Modal2 from './Modal2';
import axios from 'axios';


const PaymentPortal = () => {
    const emailVerified = useRef(localStorage.getItem('verfiedEmail') || false)
    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);

    let user = JSON.parse(localStorage.getItem('user')) || {};
    let confirmation = useRef(0);
    const nameRef = useRef();
    const emailRef = useRef();
    const numberRef = useRef();

    function sendEmail(recipient, confirmation) {
        if (recipient && confirmation) {
            axios.post('https://gamingstore-with-backend-niladri.onrender.com/send_email', {
                recipient: recipient,
                confirmation: JSON.stringify(confirmation)
            }).then(() => toast('OTP sent to your specified Email')).catch(() => toast("Check Your Email"));
        }
    }


    function localStorageOperationOnEmail(emailVerified) {
        if (Object.getOwnPropertyNames(user).length !== 0 && emailVerified)
            setModal2(true);
        localStorage.setItem('verfiedEmail', emailVerified);
    }

    useEffect(() => {
        if (!modal && emailVerified.current && modal2) toast('Email Verified  ✅');
        localStorageOperationOnEmail(emailVerified.current);
        if (modal && confirmation.current.toString().length === 6) sendEmail(user?.email, confirmation.current);
        if (modal2) toast(`Already an User : ${JSON.parse(localStorage.getItem('user'))?.name.toUpperCase()}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modal, modal2]);

    function handleClient(e) {
        e.preventDefault();
        toast(emailRef.current.value)
        toast(numberRef.current.value);
        toast(nameRef.current.value);
        user = { name: nameRef.current.value, phone: numberRef.current.value, email: emailRef.current.value };
        localStorage.setItem('user', JSON.stringify(user));
        while (true) {
            confirmation.current = parseInt(Math.random() * 1000000);
            if (confirmation.current.toString().length === 6)
                break;
        }
        setModal(true);
    }

    return <>
        <div id={'form_container'}>
            {modal && <Modal confirmation={confirmation} setModal={setModal} emailVerified={emailVerified} />}
            {modal2 && <Modal2 setModal2={setModal2} emailVerified={emailVerified} />}

            <form method="POST" onSubmit={handleClient}>
                <input ref={nameRef} name='name' type='text' maxLength={90} placeholder={'NAME'} required />
                <input ref={numberRef} name='telephone' type='tel' maxLength={10} minLength={10} placeholder='MOBILE' required />
                <input ref={emailRef} name='email' type='email' placeholder='EMAIL' required />
                <input type='submit' />
            </form>
        </div>
    </>
}
export default PaymentPortal;
