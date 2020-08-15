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
        message: "client not found",
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
      if (err.code === 11000) sms = "Correo duplicado, usuario ya existe";
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
    let sms = "Bad request missing parameters";
    if (monto <= 0) sms = "Monto invalido";
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
          message: "recarga fallida, cliente no valido",
        });
      } else {
        //CLIENT FOUND
        res.json({
          code: 200,
          message: "recarga realizada con exito",
        });
      }
    });
  }
});

// metodo PUT pagar
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
    let sms = "Bad request missing parameters";
    if (monto <= 0) sms = "Monto invalido";
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
          message: "recarga fallida, cliente no valido",
        });
      } else {
        //CLIENT FOUND
        res.json({
          code: 200,
          message: "recarga realizada con exito",
        });
      }
    });
  }
});

//metodo DELETE
// router.delete("/api/centroDeCostos/:_id", (req, res) => {
//   const id = req.params._id;
//   CentroDeCosto.deleteCentroDeCosto(id, (err, centroDeCosto) => {
//     if (err) {
//       throw err;
//     }
//     res.json(centroDeCosto);
//   });
// });

module.exports = router;
