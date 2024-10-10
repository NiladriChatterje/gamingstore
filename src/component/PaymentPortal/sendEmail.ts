import nodemailer from 'nodemailer';

export function sendEmail({ recipient, confirmation }: {
    recipient: string, confirmation: number
}) {
    return new Promise((resolve, reject) => {
        const transportObject = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: import.meta.env.VITE_MAIL_EMAIL,
                pass: import.meta.env.VITE_APP_KEY
            }
        });

        console.log(recipient);
        console.log(confirmation)

        const mailConfig = {
            from: 'ecartxvstore@gmail.com',
            to: recipient,
            subject: 'OTP Verification XVStore',
            text: `Do Not share the OTP \n The Confirmation OTP is : ${confirmation}\n\n\n Thanks for visiting.\nRegards`
        };

        transportObject.sendMail(mailConfig, (error, _) => {
            if (error)
                return reject(false)

            return resolve(true)
        })
    })
}
