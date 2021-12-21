const mongoose = require("mongoose");

const FriendList = mongoose.Schema({
  status: {
    type: String,
    enum: ["ACCEPTED", "PENDING", "REJECTED"],
    default: "PENDING",
  },
  user_pk_sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user_pk_reciver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const FriendListModel = mongoose.model("Deleted-FriendList", FriendList);

module.exports = FriendListModel;
