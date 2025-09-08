
const nodemailer = require("nodemailer");
const fs = require("fs").promises;

const validacionCorreo = async (req , res) => {
    const { email, fechaActual } = req.body;
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
        subject: "",
        text: "TU CODIGO DE VALIDACION ES 888888",
        html: ``,
        attachments: [
          {
            filename: originalname,
            content: reader,
          },
        ],
      };
}

module.exports = { validacionCorreo }

