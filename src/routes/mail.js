
const nodemailer = require("nodemailer");
const fs = require("fs").promises;

const sendEmail =  async (req, res) => {
    const { subject, email, message } = req.body;
    const {path,originalname} = req.file;
  
    const reader = await fs.readFile(path);

    contentHTML = await fs.readFile(`presentacion.html`);
  
    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "r.k.villanueva.laurente@gmail.com",
        pass: "nhrzmbjbptbnwezg",
      },
    });
  
    var mailOptions = {
      from: '"Fotografia y Video De La Cruz" <r.k.villanueva.laurente@gmail.com>',
      to: email,
      subject: subject,
      text: message,
      html: contentHTML,
      attachments: [
        {
          filename: originalname,
          content: reader,
        },
      ],
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
        res.status(500).send(error.message);
      } else {
        console.log("Email enviado");
        fs.unlink(path);
        res.status(200).json(info);
      }
    });

    

  }

  module.exports = {sendEmail};