const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      set: (value) => value.toLowerCase(),
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", adminSchema);