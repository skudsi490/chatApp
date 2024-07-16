const mongoose = require("mongoose");
const colors = require("colors"); 

const connectDB  = async () => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${dbConnection.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`.red.bold);
    process.exit(1); 
  }
};

module.exports = connectDB;
