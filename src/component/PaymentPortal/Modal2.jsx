import React from 'react';
import './Modal2.css';
import { TiTick } from 'react-icons/ti'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router'

const Modal2 = ({ setModal2, emailVerified }) => {
    const navigate = useNavigate();


    return <div id={'modal-container'}>
        <div id={'modal2'}>
            <FaEdit
                onClick={() => { emailVerified.current = false; setModal2(false); }}
                style={{ position: 'fixed', right: 10, top: 10, cursor: 'pointer' }} />
            <span style={{ color: 'black' }}>Now an User <TiTick /></span>
            <button onClick={() => {
                setModal2(false);
                navigate(`/Checkout`)
            }}>
                Redirect to Payment Page
            </button>
        </div>
    </div>
}
export default Modal2;