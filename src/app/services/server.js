const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

const nodemailer = require('nodemailer');

const enviarCorreo = (correoElectronico, archivo) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'tu-correo-electronico@gmail.com',
      pass: 'tu-contraseña'
    }
  });

  const mailOptions = {
    from: 'tu-correo-electronico@gmail.com',
    to: correoElectronico,
    subject: 'Documento creado',
    text: 'Se ha creado un documento nuevo',
    attachments: [
      {
        filename: 'Camiones de Recepción.xlsx',
        content: archivo,
        encoding: 'base64'
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Correo electrónico enviado con éxito');
    }
  });

  
};

app.post('/enviar-correo', (req, res) => {
    const correoElectronico = req.body.correoElectronico;
    const archivo = req.body.archivo;
  
    enviarCorreo(correoElectronico, archivo);
  
    res.send({ message: 'Correo electrónico enviado con éxito' });
  });