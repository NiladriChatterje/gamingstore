import styles from './ProfileUpdateUser.module.css';
import { useRef, useState } from 'react';
import { MdEdit } from "react-icons/md";
import { FaPhone, FaUser } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { useUser } from '@clerk/clerk-react';
import { MdOutlineMarkEmailUnread, MdSignpost } from "react-icons/md";
import axios from 'axios';
import toast from 'react-hot-toast';
import OTPModal from "./OTPModal";
import { FaCity } from "react-icons/fa";
import { SiFreelancermap } from 'react-icons/si';
import { RiLandscapeFill } from 'react-icons/ri';
import { useUserStateContext } from '../UserStateContext';

const ProfileUpdateUser = () => {

    const { userData } = useUserStateContext();
    const { user } = useUser();

    console.log('user =>', userData)

    const [disable, setDisable] = useState<boolean>(true);
    const [toggleCountryCode, setToggleCountryCode] = useState<boolean>(false);
    const [username, setUsername] = useState<string>(userData?.username ?? '');
    const [pincode, setpinCode] = useState<string | undefined>(userData?.address?.pincode);
    const [country, setCountry] = useState<string | undefined>(userData?.address?.country);
    const [state, setState] = useState<string | undefined>(userData?.address?.state);
    const [county, setCounty] = useState<string | undefined>(userData?.address?.county);
    const [email, setEmail] = useState<string | null | undefined>(userData?.email);
    const [phone, setPhone] = useState<undefined | string>(userData?.phone);
    const [OTP, setOTP] = useState<number>(0);
    const modalRef = useRef<HTMLDialogElement>(null);




    async function onClickMailVerify() {
        try {
            const { data }: { data: { OTP: number } } = await axios.post('http://localhost:5000/fetch-mail-otp', {
                recipient: phone
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
        try {
            const { data }: { data: { OTP: number } } = await axios.post('http://localhost:5000/fetch-phone-otp', {
                recipient: phone
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

    async function handleUpdate() {
        /*
        await fetch("http://localhost:5004/user/:id",{
        method:"PUT",
        body:JSON.stringify({userId:userData.id, documentId:userData._id,
        
        })
        })
        */


        // const result = await sanityClient?.patch(userData._id).set({
        //     gstin, AddressObjectType: {
        //         pincode,
        //         county, country, state
        //     }, email, phone: Number(phone)
        // }).commit();
        // // e.preventDefault();
        // console.log(result)
        // toast.success('new records updated!');
        setDisable(true)
    }

    return (
        <div >
            <form onSubmit={handleUpdate}
                id={styles['form-container']}>
                <div id={styles['form-input-field-container']}>
                    <div
                        style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
                        id={styles['username-input']}>
                        <FaUser />
                        <input name={'username'} value={username} onChange={e => { setUsername(e.target.value) }} placeholder={user?.firstName ?? ''}
                            disabled={disable} />
                    </div>
                    <section>
                        <OTPModal
                            OTP={OTP}
                            ref={modalRef} />
                        <div
                            style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
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
                            <input value={phone}
                                onChange={e => { setPhone(e.target.value) }}
                                name={'phone'} placeholder={userData?.phone || 'xxx-xxx-xxxx'} type='tel'
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
                            style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
                            id={styles['mail-input']}>
                            <MdOutlineMarkEmailUnread />
                            <input value={email ?? ''}
                                onChange={e => { setEmail(e.target.value) }}
                                name={'email'}
                                disabled={disable}
                                placeholder={userData?.email ?? 'example@domain.com'} />
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
                    <section data-label="address">
                        <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <legend>Address</legend>
                            <section>
                                <div
                                    style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
                                    id={styles['phone-input']}>
                                    <MdSignpost />
                                    <input
                                        value={pincode}
                                        onChange={e => setpinCode(e.target.value)}
                                        name={'pincode'} placeholder={userData?.address?.pincode ?? 'PIN code'}
                                        maxLength={6} minLength={6}
                                        type='text' disabled={disable} />
                                </div>
                            </section>
                            <section>
                                <div
                                    style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
                                    id={styles['phone-input']}>
                                    <FaCity />
                                    <input
                                        value={county}
                                        onChange={e => { setCounty(e.target.value) }}
                                        name={'county'} placeholder={userData?.address?.county ?? 'county'} type='text' disabled={disable} />
                                </div>
                            </section>
                            <section>
                                <div
                                    style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255, 1)' }}
                                    id={styles['phone-input']}>
                                    <SiFreelancermap />
                                    <input
                                        value={country}
                                        onChange={e => {
                                            setCountry(e.target.value)
                                        }}
                                        name={'country'} placeholder={userData?.address?.country ?? 'country'} type='text'
                                        disabled={disable} />
                                </div>
                            </section>
                            <section>
                                <div
                                    style={{ backgroundColor: disable ? 'rgba(255, 255, 255, 0.863)' : 'rgba(255, 255, 255)' }}
                                    id={styles['phone-input']}>
                                    <RiLandscapeFill />
                                    <input value={state}
                                        onChange={e => {
                                            setState(e.target.value)
                                        }}
                                        name={'state'} placeholder={userData?.address?.state ?? 'state'} type='text'
                                        disabled={disable} />
                                </div>
                            </section>
                        </fieldset>
                    </section>
                </div>
                <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
                    <MdEdit
                        color='white'
                        cursor={'pointer'}
                        style={{
                            backgroundColor: 'rgb(52, 48, 105)',
                            borderRadius: 5, padding: '5px 10px'
                        }}
                        size={30}
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
                        size={30}
                        // type={'submit'}
                        onClick={() => {
                            if (!disable) {
                                toast('updating...')
                                handleUpdate()
                            }
                        }}
                    />
                </section>
            </form>
        </div>
    )
}

export default ProfileUpdateUser