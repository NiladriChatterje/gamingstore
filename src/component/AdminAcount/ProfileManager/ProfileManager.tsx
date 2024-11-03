import { FormEvent, useRef, useState } from 'react';
import styles from './ProfileManager.module.css';
import { MdEdit } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { useUser } from '@clerk/clerk-react';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import OTPMailModal from './OTPMailModal';


const ProfileManager = () => {
    const [disable, setDisable] = useState<boolean>(true);
    const [toggleCountryCode, setToggleCountryCode] = useState<boolean>(false);
    const { user } = useUser();
    const mailRef = useRef<HTMLDialogElement>(null);
    const phoneRef = useRef<HTMLDialogElement>(null);

    async function sendOTPToPhone() {

    }
    async function sendOTPToMail() {

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
                    <FaUser style={{ padding: '0 10px' }} />
                    <input name={'username'} placeholder={user?.firstName ?? ''}
                        disabled={disable} />
                </div>
                <section>
                    <OTPMailModal ref={mailRef} />
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
                                style={{ padding: '0 10px' }}
                            />
                            {!disable && <section className={`${toggleCountryCode ? '' : styles['country-code-list']}`}>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+91)IN</dl>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+144)US</dl>
                                <dl onClick={() => { setToggleCountryCode(false) }}>(+92)PAK</dl>
                            </section>}
                        </div>
                        <input name={'phone'} placeholder={'phone'} type='tel'
                            maxLength={10} minLength={10}
                            disabled={disable} />
                    </div>
                    <div
                        id={styles['verify-span-btn']}
                    ><span onClick={() => {
                        if (!disable) {
                            sendOTPToPhone();
                            phoneRef?.current?.showModal()
                        }
                    }}>Verify</span></div>
                </section>
                <section>
                    <div
                        style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.563)' : 'rgba(255, 255, 255, 0.963)' }}
                        id={styles['username-input']}>
                        <MdOutlineMarkEmailUnread style={{ padding: '0 10px' }} />
                        <input name={'email'} placeholder={user?.emailAddresses[0].emailAddress}
                            disabled={disable} />
                    </div>
                    <div
                        id={styles['verify-span-btn']}
                    ><span onClick={() => {
                        if (!disable) {
                            sendOTPToMail();
                            mailRef?.current?.showModal()
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
                        onClick={() => { setDisable(prev => !prev) }}
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