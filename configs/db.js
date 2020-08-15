const mongoose = require("mongoose");

const uri =
  "mongodb+srv://miya:asdasd@cluster0.shdnm.mongodb.net/epayco?retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false
    });

    console.log(`connecting to database successful: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
