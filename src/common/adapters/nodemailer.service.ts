import nodemailer from 'nodemailer'
import {SETTINGS} from '../../settings';

export const nodemailerService = {
    async sendEmailConfirmation(email: string, confirmationCode: string) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: SETTINGS.MAIL_LOGIN,
                pass: SETTINGS.MAIL_PASS
            },

        })
        const message = {
            from: `Account verification <${SETTINGS.MAIL_LOGIN}>`,
            to: email,
            subject: 'Account verification',
            html: `
<h1>Thanks for your registration</h1>
<p>To finish registration please follow the link below:
<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
</p>
`
        }

        const info = await transporter.sendMail(message)

        // console.log(info)
        return
    },

    async sendRecoveryPasswordCode(email: string, recoveryCode: string) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: SETTINGS.MAIL_LOGIN,
                pass: SETTINGS.MAIL_PASS
            },

        })
        const message = {
            from: `Account verification <${SETTINGS.MAIL_LOGIN}>`,
            to: email,
            subject: 'Recovery password',
            html: `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
<a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
</p>
`
        }

        const info = await transporter.sendMail(message)

        // console.log(info)
        return
    }
}