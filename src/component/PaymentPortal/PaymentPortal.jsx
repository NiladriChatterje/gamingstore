import React, { useEffect, useMemo, useRef, useState } from 'react'
import './PaymentPortal.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from './Modal';
import Modal2 from './Modal2';
import axios from 'axios';
import { useStateContext } from '../../StateContext';

const PaymentPortal = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [emailVerified, setEmailVerified] = useState(JSON.parse(localStorage.getItem('verfiedEmail')) || false);
    const [email, setEmail] = useState('');
    const [confirmation, setConfirmation] = useState(() => 0);
    const { navRef } = useStateContext();

    const nameRef = useRef();
    const emailRef = useRef();
    const numberRef = useRef();

    useEffect(() => {
        if (Object.getOwnPropertyNames(user).length !== 0 && emailVerified) {
            setModal2(true);
            localStorage.setItem('verfiedEmail', emailVerified);
        }
        if (!emailVerified) localStorage.setItem('verfiedEmail', emailVerified);
    }, [emailVerified]);

    useEffect(() => {
        sendEmail(email, confirmation);
    }, [confirmation])

    function sendEmail(recipient, confirmation) {
        const stringifiedConfirmation = JSON.stringify(confirmation);
        if (recipient && confirmation) {
            axios.post('https://gamingstore-with-backend-niladri.onrender.com/send_email', {
                recipient: recipient,
                confirmation: stringifiedConfirmation
            }).then(() => toast('Email Sent')).catch(() => toast("Something Went Wrong"));
            return;
        }
    }

    useMemo(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user.email]);

    useEffect(() => {
        if (modal)
            navRef.current.style.display = 'none'
        else
            navRef.current.style.display = 'flex'
    }, [modal])

    function handleClient(e) {
        e.preventDefault();
        toast(emailRef.current.value);
        toast(numberRef.current.value);
        toast(nameRef.current.value);
        setEmail(emailRef.current.value);

        setUser({ name: nameRef.current.value, phone: numberRef.current.value, email: emailRef.current.value });
        let random;
        while (true) {
            random = parseInt(Math.random() * 1000000);
            if (random.toString().length === 6)
                break;
        }

        setConfirmation(random);
        setModal(true);
    }

    return <>
        <div id={'form_container'}>
            {modal && <Modal confirmation={confirmation} setModal={setModal} setEmailVerified={setEmailVerified} />}
            {modal2 && <Modal2 setModal2={setModal2} setEmailVerified={setEmailVerified} />}
            <Toaster />
            <form method="POST" onSubmit={handleClient}>
                <input ref={nameRef} name='name' type='text' maxLength={90} placeholder={'NAME'} required />
                <input ref={numberRef} name='telephone' type='tel' maxLength={10} minLength={10} placeholder='MOBILE' required />
                <input ref={emailRef} name='email' type='email' placeholder='EMAIL' required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />
                <input type='submit' />
            </form>
        </div>
    </>
}
export default PaymentPortal;
