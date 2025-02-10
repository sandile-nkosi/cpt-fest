const mongoose = require("mongoose");

//connect db
async function connectToDatabase() {
  mongoose
    .connect(process.env.MONGOOSE_URI)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = connectToDatabase;
