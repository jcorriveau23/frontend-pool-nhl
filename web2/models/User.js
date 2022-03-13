const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    addr: {
      type: String,
    },

    pool_list: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
