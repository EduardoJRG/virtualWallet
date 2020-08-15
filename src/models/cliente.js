const mongoose = require("mongoose");

//Cliente Schema
const clienteSchema = mongoose.Schema({
  documento: { type: String, default: "" },
  idSesion: { type: String, default: "" },
  nombres: { type: String, default: "" },
  celular: {
    type: String,
    default: "",
    index: true,
    unique: true,
    required: true,
  },
  saldo: { type: Number, default: 0 },
  codigo: { type: String, default: "" },
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
module.exports.getClientByEmail = (mail, callback) => {
  Cliente.find({ email: mail }, callback);
};

//recharge client by phone and document
module.exports.rechargeClient = (recarga, callback) => {
  const query = { celular: recarga.celular, documento: recarga.documento };
  Cliente.findOneAndUpdate( 
    query,
    { $inc: { saldo: recarga.monto } }, { new: true },
    callback
  );
};
