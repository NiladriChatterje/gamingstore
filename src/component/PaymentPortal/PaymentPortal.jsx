import React, {  useEffect, useMemo, useRef, useState } from 'react'
import './PaymentPortal.css';
import toast,{Toaster} from 'react-hot-toast';
import Modal from './Modal';
import Modal2 from './Modal2';
import axios from 'axios';

const PaymentPortal = ()=>{
    const [user,setUser] = useState(JSON.parse(localStorage.getItem('user'))||{});
    const [modal,setModal] = useState(false);
    const [modal2,setModal2] = useState(false);
    const [email,setEmail]=useState('');
    const [confirmation,setConfirmation] = useState(()=>0);
    
    const nameRef=useRef();
    const emailRef=useRef();
    const numberRef=useRef();

    useEffect(()=>{
            if(Object.getOwnPropertyNames(user).length!==0)
                setModal2(true);
        
    },[])

    useEffect(()=>{
        sendEmail(email,confirmation);
    },[confirmation])

    function sendEmail(recipient,confirmation){
        const stringifiedConfirmation = JSON.stringify(confirmation);
        if(recipient&&confirmation){
            axios.post('https://gamingstore-with-backend-niladri.onrender.com/send_email',{
                recipient: recipient,
                confirmation:  stringifiedConfirmation
            }).then(()=>toast('Email Sent')).catch(()=>toast("Something Went Wrong"));
            return;
        }
    }

    useMemo(()=>{
        localStorage.setItem('user',JSON.stringify(user));
    },[user?.phone,user?.email]);

    function handleClient(e){
        e.preventDefault();
        toast(emailRef.current.value);
        toast(numberRef.current.value);
        toast(nameRef.current.value);
        setEmail(emailRef.current.value);

        setUser({name:nameRef.current.value,phone:numberRef.current.value,email:emailRef.current.value});
        const random = parseInt(Math.random()*1000000);
        
        console.log(random)
        setModal(true);
        setConfirmation(random);
    }

    function emailRegex(){
        return "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
    }
    function numberRegex(){
        return '^([0|+[0-9]{1,5})?([7-9][0-9]{9})$';
    }

    return <>
    <div id={'form_container'}>
        {modal && <Modal confirmation={confirmation} setModal={setModal} />}
        {modal2 && <Modal2 setModal2={setModal2}/>}
        <Toaster />
        <form method="POST" onSubmit={handleClient}>
            <input ref={nameRef} name='name' type='text' maxLength={90} placeholder={'NAME'} required/>
            <input ref={numberRef} name='telephone' type='tel' maxLength={10} placeholder='MOBILE' required pattern={numberRegex} />
            <input ref={emailRef} name='email' type='email' placeholder='EMAIL' required pattern={emailRegex}/>
            <input type='submit' />
        </form>
    </div>
            </>
}
export default PaymentPortal;
