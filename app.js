const clienteRoutes = require("./src/routes/clienteRoutes");

const express = require("express");
const morgan = require("morgan");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const connectDB = require("./configs/db");

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(morgan("dev"));

app.use(clienteRoutes);

connectDB();

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
