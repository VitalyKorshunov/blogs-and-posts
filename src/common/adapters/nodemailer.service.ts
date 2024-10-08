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
            html: `<p>https://some-front.com/confirm-registration?code=${confirmationCode}</p>`
        }

        const info = await transporter.sendMail(message)

        console.log(info)
    }
}