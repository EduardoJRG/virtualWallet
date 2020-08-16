const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

//Cliente Schema
const clienteSchema = mongoose.Schema({
  documento: { type: String, default: "" },
  nombres: { type: String, default: "" },
  celular: {
    type: String,
    default: "",
    index: true,
    unique: true,
    required: true,
  },
  saldo: { type: Number, default: 0 },
  token: { type: String, default: "" },
  idSession: { type: String, default: "" },
  email: {
    type: String,
    default: "",
    index: true,
    unique: true,
    required: true,
  },
});

const Cliente = (module.exports = mongoose.model("Cliente", clienteSchema));

//Add Cliente
module.exports.addCliente = (cliente, callback) => {
  Cliente.create(cliente, callback);
};

//Get Clientes
module.exports.getClientes = (callback, limit) => {
  Cliente.find(callback).limit(limit);
};

//Get a client by mail
module.exports.getClientByEmail = (email, callback) => {
  Cliente.find({ email: email }, callback);
};

//Get saldo
module.exports.getSaldoByParameters = (client, callback) => {
  Cliente.find(
    { documento: client.documento, celular: client.celular },
    callback
  );
};

//recharge client by phone and document
module.exports.rechargeClient = (recarga, callback) => {
  const query = { celular: recarga.celular, documento: recarga.documento };
  Cliente.findOneAndUpdate(
    query,
    { $inc: { saldo: recarga.monto } },
    { new: true },
    callback
  );
};

//charge client
module.exports.chargeClient = async (pago, callback) => {
  const query = {
    email: pago.email,
    token: pago.token,
    idSession: pago.idSession,
  };
  Cliente.findOneAndUpdate(
    query,
    { $inc: { saldo: -pago.monto } },
    { new: true },
    callback
  );
};

//login client
module.exports.loginClient = (client, callback) => {
  const query = { email: client.email, documento: client.documento };
  const idSession = uuidv4();
  Cliente.findOneAndUpdate(
    query,
    { $set: { idSession: idSession, token: "" } },
    { new: true },
    callback
  );
};

//update token
module.exports.updateToken = (email, token, callback) => {
  const query = { email: email };
  Cliente.findOneAndUpdate(
    query,
    { $set: { token: token } },
    { new: true },
    callback
  );
};