import React, { KeyboardEvent, useRef } from 'react';
import styles from './OTPModal.module.css';
import toast from 'react-hot-toast';

let index = 0
const OTPMailModal = ({ OTP }: { OTP: number | undefined }, mailRef: React.Ref<HTMLDialogElement> | any) => {
    const otpBlockRef = useRef<HTMLInputElement[]>([]);

    async function fetchOTP() {
        try {

            let OTPInput: number = 0;
            for (let i = 0; i < 6; i++)
                OTPInput = 10 * OTPInput + parseInt(otpBlockRef.current[i].value);

            if (OTPInput === OTP) {
                toast.success('verified')
                mailRef.current.close();
            }
            else
                throw new Error('wrong OTP!')
        } catch (error: Error | any) {
            toast.error(error.message);
        }


    }

    function VerifyOTP(e: KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode === 8) {
            otpBlockRef?.current[index].focus();
            if (!(index <= 0)) {
                otpBlockRef.current[index].value = '';
                index--;
            }
        }
        else if (e.keyCode >= 96 && e.keyCode <= 105) {
            otpBlockRef?.current[index].focus();
            otpBlockRef.current[index].value = '';
            if (!(index >= 5)) {
                index++;
            }

        }
    }

    return (
        <dialog id={styles['phone-number-verification-modal']} ref={mailRef}>
            <section id={styles['otp-block-container']}>
                <input onClick={() => { index = 0 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 1 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 2 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 3 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 4 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 5 }} onKeyDown={VerifyOTP} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
            </section>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button id={styles['verify']} onClick={fetchOTP}>Verify</button>
                <button id={styles['verify']} onClick={() => { mailRef?.current?.close() }}>Close</button>
            </div>
        </dialog>
    )
}

export default React.forwardRef<HTMLDialogElement, { OTP: number | undefined }>(OTPMailModal)