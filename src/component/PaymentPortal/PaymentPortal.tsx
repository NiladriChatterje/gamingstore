import { FormEvent, useEffect, useRef, useState } from 'react'
import styles from './PaymentPortal.module.css';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Modal2 from './Modal2';
import axios from 'axios';

type User = {
    name: string | undefined;
    email: string | undefined;
    phone: string | undefined;
}
const PaymentPortal = () => {
    const emailVerified = useRef<boolean>(localStorage.getItem('verfiedEmail') === 'true' ? true : false)
    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);

    let user: User = JSON.parse(localStorage.getItem('user') ?? '{}');
    let confirmation = useRef(0);
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const numberRef = useRef<HTMLInputElement>(null);

    function sendEmail(recipient: string, confirmation: number) {
        if (recipient && confirmation) {
            // https://gamingstore-with-backend-niladri.onrender.com/send_email
            axios.post('http://localhost:5000/send-email', {
                recipient: recipient,
                confirmation: confirmation
            }).then(() => toast('OTP sent to your specified Email')).catch(() => toast("Check Your Email"));
        }
    }


    function localStorageOperationOnEmail(emailVerified: boolean) {
        if (Object.getOwnPropertyNames(user).length !== 0 && emailVerified)
            setModal2(true);
        localStorage.setItem('verfiedEmail', emailVerified.toString());
    }

    useEffect(() => {
        if (!modal && emailVerified.current && modal2) toast('Email Verified  ✅');
        localStorageOperationOnEmail(emailVerified.current);
        if (modal && confirmation.current.toString().length === 6) sendEmail(user.email || '', confirmation.current);
        if (modal2) toast(`Already an User : ${JSON.parse(localStorage.getItem('user') ?? '{}')?.name.toUpperCase()}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modal, modal2]);

    function handleClient(e: FormEvent) {
        e.preventDefault();
        toast(emailRef.current ? emailRef.current.value : '')
        toast(numberRef.current ? numberRef.current.value : '');
        toast(nameRef.current ? nameRef.current.value : '');
        user = { name: nameRef.current?.value, phone: numberRef.current?.value, email: emailRef.current?.value };
        localStorage.setItem('user', JSON.stringify(user));
        while (true) {
            confirmation.current = Math.trunc(Math.random() * 1000000);
            if (confirmation.current.toString().length === 6)
                break;
        }
        setModal(true);
    }

    return <>
        <div id={styles['form_container']}>
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
