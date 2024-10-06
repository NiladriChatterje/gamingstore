import styles from './Modal2.module.css';
import { TiTick } from 'react-icons/ti'
import { FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router'
import React from 'react';

const Modal2 = ({ setModal2, emailVerified }: {
    setModal2: (prev: boolean) => void;
    emailVerified: React.LegacyRef<HTMLInputElement> | any
}) => {
    const navigate = useNavigate();


    return <div id={styles['modal-container']}>
        <div id={styles['modal2']}>
            <FaEdit
                onClick={() => {
                    if (emailVerified !== null)
                        emailVerified.current = false;
                    setModal2(false);
                }}
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