require('dotenv').config();
const nodemailer = require("nodemailer");

async function sendMail(mailOptions) {
  try {

    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,     
      },
    });
    

    const result = await transporter.sendMail(mailOptions);
    return result;
    

  } catch (err) {
    return err;
  }

}



module.exports = sendMail;