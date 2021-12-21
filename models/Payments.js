const mongoose = require("mongoose");

const PaySchema = mongoose.Schema({
  code: {
    type: Number,
    require: false,
    default: 0,
  },
  user_pk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  authority: {
    type: String,
    require: true,
  },
  ref_id: {
    type: Number,
    require: false,
    default: 0,
  },
  card_pan: {
    type: String,
    require: false,
    default: "",
  },
  card_hash: {
    type: String,
    require: false,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  message: {
    type: String,
    default: "Unpaid",
  },
});

const Pay = mongoose.model("Payes", PaySchema);
module.exports = Pay;
