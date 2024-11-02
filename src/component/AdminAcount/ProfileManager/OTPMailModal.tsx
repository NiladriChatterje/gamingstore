import React, { KeyboardEventHandler, useRef } from 'react';
import styles from './OTPMailModal.module.css';

const OTPMailModal = (_: any, mailRef: React.Ref<HTMLDialogElement> | any) => {

    const otpBlockRef = useRef<HTMLInputElement[]>([]);

    function VerifyOTPPhone() {

    }

    return (
        <dialog id={styles['phone-number-verification-modal']} ref={mailRef}>
            <section id={styles['otp-block-container']}>
                <input onKeyDown={(e) => {
                    console.log(e.keyCode)
                }} ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
                <input ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
                <input ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
                <input ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
                <input ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
                <input ref={(el: HTMLInputElement) => { otpBlockRef?.current?.push(el) }} min={0} max={9} maxLength={1} type='number' className={styles['otp-block']} />
            </section>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button id={styles['verify']} onClick={() => { }}>Verify</button>
                <button id={styles['verify']} onClick={() => { mailRef?.current?.close() }}>Close</button>
            </div>
        </dialog>
    )
}

export default React.forwardRef<HTMLDialogElement>(OTPMailModal)