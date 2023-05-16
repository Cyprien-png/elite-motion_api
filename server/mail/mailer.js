import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config()

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "elite-motion@outlook.com",
        pass: process.env.MAIL_PASSWORD
    }
});

export const sendingEmail = () => {

    const mailOptions = {
        from: 'elite-motion@outlook.com',
        to: 'cyprien.jaquier@hotmail.com',
        subject: 'Ne ratez pas votre entrainement demain !',
        text: 'Bonjour, \n\n Selon votre programme demain vous travaillerez .... \n Bonne séance ! \n\n Cordialement, l\'équipe Elite motion.'
    };

    //send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erreur lors de l\'envoi de l\'e-mail :', error);
        } else {
            console.log('E-mail envoyé avec succès :', info.response);
        }
    });
}

