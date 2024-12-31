import { FormEvent, useMemo, useRef, useState } from 'react';
import styles from './ProfileManager.module.css';
import { MdEdit } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { useUser } from '@clerk/clerk-react';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import axios from 'axios';
import toast from 'react-hot-toast';
import OTPModal from './OTPModal';
import { FaFileInvoiceDollar } from "react-icons/fa";


const ProfileManager = () => {
    const [disable, setDisable] = useState<boolean>(true);
    const [toggleCountryCode, setToggleCountryCode] = useState<boolean>(false);
    const [OTP, setOTP] = useState<number>(0);
    const { user } = useUser();
    const modalRef = useRef<HTMLDialogElement>(null);
    const mailInputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const GstinInputRef = useRef<HTMLInputElement>(null);

    function alertInputFields() {
        if (!mailInputRef?.current?.value || user?.emailAddresses[0]?.emailAddress) {
            if (mailInputRef?.current?.style)
                mailInputRef.current.style.border = '1px solid red';
        } else {
            if (mailInputRef?.current?.value || user?.emailAddresses[0]?.emailAddress) {
                if (mailInputRef?.current?.style)
                    mailInputRef.current.style.border = '1px solid green';
                if (!mailInputRef?.current?.value)
                    mailInputRef.current.value = user?.emailAddresses[0]?.emailAddress || '';
            }
        }
    }
    useMemo(() => {
        alertInputFields();
    }, [disable])

    async function onClickMailVerify() {
        console.log(mailInputRef?.current?.value)
        try {
            const { data }: { data: { OTP: number } } = await axios.post('http://localhost:5000/fetch-mail-otp', {
                recipient: mailInputRef?.current?.value
            }
            );
            if (data.OTP === -1)
                throw new Error('Resend!');
            setOTP(data.OTP);
            toast('OTP sent')
        }
        catch (e: Error | any) {
            toast.error(e.message)
        }
    }

    async function onClickPhoneVerify() {
        console.log(phoneInputRef?.current?.value)
        try {
            const { data }: { data: { OTP: number } } = await axios.post('http://localhost:5000/fetch-mail-otp', {
                recipient: phoneInputRef?.current?.value
            }
            );
            if (data.OTP === -1)
                throw new Error('Resend!');
            setOTP(data.OTP);
            toast('OTP sent')
        }
        catch (e: Error | any) {
            toast.error(e.message)
        }
    }

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();


    }

    return (
        <div >
            <form onSubmit={handleUpdate}
                id={styles['form-container']}>
                <div
                    style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.563)' : 'rgba(255, 255, 255, 0.963)' }}
                    id={styles['username-input']}>
                    <FaUser />
                    <input name={'username'} ref={usernameInputRef} placeholder={user?.firstName ?? ''}
                        disabled={disable} />
                </div>
                <section>
                    <div
                        style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.563)' : 'rgba(255, 255, 255, 0.963)' }}
                        id={styles['phone-input']}>
                        <FaFileInvoiceDollar />
                        <input ref={GstinInputRef} name={'gstin'} placeholder={'GSTIN'} type='number'
                            maxLength={10} minLength={10}
                            disabled={disable} />
                    </div>
                </section>
                <section>
                    <OTPModal
                        OTP={OTP}
                        ref={modalRef} />
                    <div
                        style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.563)' : 'rgba(255, 255, 255, 0.963)' }}
                        id={styles['phone-input']}>
                        <div id={styles['phone-country-code']}>
                            <FaPhone
                                cursor={'pointer'}
                                onClick={() => {
                                    if (!disable)
                                        setToggleCountryCode(prev => !prev)
                                }}
                            />
                            {!disable && <section className={`${toggleCountryCode ? '' : styles['country-code-list']}`}>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+91)IN</dl>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+144)US</dl>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+92)PAK</dl>
                            </section>}
                        </div>
                        <input ref={phoneInputRef} name={'phone'} placeholder={'phone'} type='tel'
                            maxLength={10} minLength={10}
                            disabled={disable} />
                    </div>
                    <div
                        id={styles['verify-span-btn']}
                    ><span onClick={() => {
                        if (!disable) {
                            onClickPhoneVerify();
                            modalRef?.current?.showModal()
                        }
                    }}>Verify</span></div>
                </section>
                <section>
                    <OTPModal
                        OTP={OTP}
                        ref={modalRef} />
                    <div
                        style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.563)' : 'rgba(255, 255, 255, 0.963)' }}
                        id={styles['mail-input']}>
                        <MdOutlineMarkEmailUnread />
                        <input ref={mailInputRef} name={'email'} placeholder={user?.emailAddresses[0].emailAddress}
                            disabled={disable} />
                    </div>
                    <div
                        id={styles['verify-span-btn']}
                    ><span onClick={() => {
                        if (!disable) {
                            onClickMailVerify()
                            modalRef?.current?.showModal()
                        }
                    }}>Verify</span></div>
                </section>
                <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                    <MdEdit
                        color='white'
                        cursor={'pointer'}
                        style={{
                            backgroundColor: 'rgb(52, 48, 105)',
                            borderRadius: 5, padding: '5px 10px'
                        }}
                        size={25}
                        onClick={() => {
                            setDisable(prev => !prev)
                        }}
                    />
                    <IoIosPersonAdd
                        color='white'
                        cursor={'pointer'}
                        style={{
                            backgroundColor: 'rgb(52, 48, 105)',
                            borderRadius: 5, padding: '5px 10px'
                        }}
                        size={25}
                        onClick={() => { }}
                    />
                </section>
            </form>
        </div>
    )
}

export default ProfileManager