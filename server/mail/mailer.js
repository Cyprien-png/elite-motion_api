import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config()

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
    }
});

export const sendingEmail = (receiver, subject, content) => {

    const mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: receiver,
        subject: subject,
        text: content
    }

    //send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erreur lors de l\'envoi de l\'e-mail :', error);
        } else {
            console.log('E-mail envoyé avec succès :', info.response);
        }
    })
}

