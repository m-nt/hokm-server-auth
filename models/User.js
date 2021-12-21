const mongoose = require("mongoose");
const firendList = require("./friendlist.js");

const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Avatar: {
    type: Buffer,
    required: false,
  },
  Curency: {
    type: Number,
    required: true,
    default: 100,
  },
  DeviceInfo: {
    type: String,
    required: false,
  },
  DeckOfCard: {
    type: Number,
    required: true,
    default: 0,
  },
  Background: {
    type: Number,
    required: true,
    default: 404,
  },
  Status: {
    type: String,
    enum: ["OFFLINE", "ONLINE", "AWAIT"],
    default: "OFFLINE",
  },
  Debt: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
