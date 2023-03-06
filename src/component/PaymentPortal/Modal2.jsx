import React, { useEffect } from 'react';
import './Modal2.css';
import toast, { Toaster } from 'react-hot-toast'
import { TiTick } from 'react-icons/ti'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router'

const Modal2 = ({ setModal2, setEmailVerified }) => {
    const navigate = useNavigate();

    useEffect(() => { toast(`Already an User : ${JSON.parse(localStorage.getItem('user'))?.name}`); }, [])

    return <div id={'modal-container'}>
        <Toaster />
        <div id={'modal2'}>
            <FaEdit
                onClick={() => {
                    setEmailVerified(false);
                    setModal2(false);
                }}
                style={{ position: 'fixed', right: 10, top: 10, cursor: 'pointer' }} />
            <span style={{ color: 'black' }}>Now an User <TiTick /></span>
            <button onClick={() => navigate(`/Checkout`)}>
                Redirect to Payment Page
            </button>
        </div>
    </div>
}
export default Modal2;