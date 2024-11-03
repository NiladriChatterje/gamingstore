import React, { KeyboardEvent, useRef } from 'react';
import styles from './OTPMailModal.module.css';

let index = 0
const OTPMailModal = (_: any, mailRef: React.Ref<HTMLDialogElement> | any) => {
    const otpBlockRef = useRef<HTMLInputElement[]>([]);

    function VerifyOTPPhone(e: KeyboardEvent<HTMLInputElement>) {

        if (e.keyCode === 8) {
            otpBlockRef?.current[index].focus();
            if (!(index === 0)) {
                otpBlockRef.current[index].value = '';
                index--;
            }
        }
        else if (e.keyCode >= 96 && e.keyCode <= 105) {
            otpBlockRef?.current[index].focus();
            if (!(index >= 5)) {
                otpBlockRef.current[index].value = '';
                index++;
            }

        }
    }

    return (
        <dialog id={styles['phone-number-verification-modal']} ref={mailRef}>
            <section id={styles['otp-block-container']}>
                <input onClick={() => { index = 0 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 1 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 2 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 3 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 4 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
                <input onClick={() => { index = 5 }} onKeyDown={VerifyOTPPhone} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} maxLength={1} type='text' className={styles['otp-block']} />
            </section>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button id={styles['verify']} onClick={() => { }}>Verify</button>
                <button id={styles['verify']} onClick={() => { mailRef?.current?.close() }}>Close</button>
            </div>
        </dialog>
    )
}

export default React.forwardRef<HTMLDialogElement>(OTPMailModal)