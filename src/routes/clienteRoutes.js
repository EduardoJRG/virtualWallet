const express = require("express");
const router = express.Router();

const Cliente = require("../models/cliente");

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

module.exports = router;