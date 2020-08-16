const express = require("express");
const router = express.Router();

const Cliente = require("../models/cliente");
const nodemailer = require("nodemailer");

const sendMail = (mail, token) => {
  return new Promise(async (resolve, reject) => {
    const output = `
    <p>Este es tu token de validacion para el pago</p>
    <ul>  
      <li>Token: ${token}</li>
    </ul>
  `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "eduardoemailsender@gmail.com", // generated ethereal user
        pass: "Asdasd123123", // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: "eduardoemailsender@gmail.com", // sender address
      to: mail, // list of receivers
      subject: "Codigo validacion de pago", // Subject line
      text: token + "", // plain text body
      html: output, // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        reject();
      }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      resolve();
      // res.render("contact", { msg: "Email has been sent" });
    });
  });
};

//metodo GET
router.get("/api/getclientes", (req, res) => {
  Cliente.getClientes((err, clientes) => {
    if (err) {
      res.json({
        code: err.code,
        message: err.message,
      });
    }
    res.json(clientes);
  });
});

router.get("/api/getclientes/:_email", (req, res) => {
  Cliente.getClientByEmail(req.params._email, (err, client) => {
    if (err) {
      res.json({
        code: err.code,
        message: err.message,
      });
    }

    if (client === undefined || client.length == 0) {
      res.json({
        code: 400,
        message: "client not found.",
      });
    } else {
      res.json(client);
    }
  });
});

//metodo POST
router.post("/api/registerclient", (req, res) => {
  const cliente = req.body;
  Cliente.addCliente(cliente, (err, cliente) => {
    if (err) {
      let sms;
      if (err.code === 11000) sms = "Correo duplicado, usuario ya existe.";
      else sms = err.message;

      res.json({
        code: err.code,
        message: sms,
      });
    }
    res.json(cliente);
  });
});

// metodo PUT recarga
router.put("/api/recargaclientes", (req, res) => {
  const recarga = req.body;

  const numDoc = recarga.documento;
  const numCelular = recarga.celular;
  const monto = recarga.monto;
  const isMonto = typeof monto;

  if (
    !numDoc ||
    !numCelular ||
    !monto ||
    monto <= 0 ||
    numDoc === "" ||
    numCelular === "" ||
    !isMonto === "number"
  ) {
    let sms = "Bad request missing parameters.";
    if (monto <= 0) sms = "Monto invalido.";
    res.json({
      code: 401,
      message: sms,
    });
  } else {
    //GOT ALL PARAMETERS
    Cliente.rechargeClient(recarga, (err, client) => {
      if (err) {
        res.json({
          code: err.code,
          message: err.message,
        });
      }

      if (client === null || client === undefined || client.length == 0) {
        res.json({
          code: 600,
          message: "recarga fallida, cliente no valido.",
        });
      } else {
        //CLIENT FOUND
        res.json({
          code: 200,
          message: "recarga realizada con exito.",
        });
      }
    });
  }
});

// metodo PUT pagar
router.put("/api/pagos", async (req, res) => {
  const pago = req.body;

  const valor = pago.monto;
  const token = pago.token;
  const idSession = pago.idSession;
  const email = pago.email;
  const isMonto = typeof valor;

  if (
    !email ||
    !token ||
    !idSession ||
    !valor ||
    valor <= 0 ||
    email === "" ||
    token === "" ||
    idSession === "" ||
    !isMonto === "number"
  ) {
    let sms = "Bad request missing parameters.";
    if (valor <= 0) sms = "Monto invalido.";
    res.json({
      code: 401,
      message: sms,
    });
  } else {
    //GOT ALL PARAMETERS
    const mClient = await Cliente.find({
      email: pago.email,
    }).then((cliente) => {
      return cliente;
    });

    if (mClient === null || mClient === undefined || mClient.length == 0) {
      res.json({
        code: 600,
        message: "no se encontro cliente.",
      });
    } else {
      if (mClient[0].saldo - valor >= 0) {
        Cliente.chargeClient(pago, (err, client) => {
          if (err) {
            res.json({
              code: err.code,
              message: err.message,
            });
          }

          if (client === null || client === undefined || client.length == 0) {
            res.json({
              code: 600,
              message: "pago fallido, sesion no valida.",
            });
          } else {
            res.json({
              code: 200,
              message: "pago realizado con exito.",
            });
          }
        });
      } else {
        res.json({
          code: 800,
          message: "Cliente no cuenta con suficiente saldo.",
        });
      }
    }
  }
});

//metodo POST login
router.post("/api/loginclient", (req, res) => {
  const cliente = req.body;
  const documento = cliente.documento;
  const email = cliente.email;

  if (!email || !documento || email === "" || documento === "") {
    res.json({
      code: 401,
      message: "Bad request missing parameters.",
    });
  } else {
    //GOT ALL PARAMETERS
    Cliente.loginClient(cliente, (err, dataLog) => {
      if (err) {
        res.json({
          code: err.code,
          message: err.message,
        });
      }

      if (dataLog === null || dataLog === undefined || dataLog.length == 0) {
        res.json({
          code: 600,
          message: "login fallido, client no encontrado.",
        });
      } else {
        //CLIENT FOUND
        res.json(dataLog);
      }
    });
  }
});

//metodo POST login
router.post("/api/authpayment", async (req, res) => {
  const cliente = req.body;
  const documento = cliente.documento;
  const email = cliente.email;

  if (!email || !documento || email === "" || documento === "") {
    res.json({
      code: 401,
      message: "Bad request missing parameters.",
    });
  } else {
    //GOT ALL PARAMETERS
    const mClient = await Cliente.find({
      email: cliente.email,
      documento: cliente.documento,
    }).then((cliente) => {
      return cliente;
    });

    if (mClient === null || mClient === undefined || mClient.length == 0) {
      res.json({
        code: 600,
        message: "login fallido, client no encontrado.",
      });
    } else {
      //CLIENT FOUND

      const token = Math.floor(
        Math.pow(10, 5) +
          Math.random() * (Math.pow(10, 6) - Math.pow(10, 5) - 1)
      );

      Cliente.updateToken(email, token, async (err, dataLog) => {
        if (err) {
          res.json({
            code: err.code,
            message: err.message,
          });
        }
        await sendMail(email, token).catch((err) => {
          console.log(err);
          res.json({
            code: 1000,
            message: "Error enviando el email",
          });
        });
        res.json(dataLog);
      });
    }
  }
});

module.exports = router;