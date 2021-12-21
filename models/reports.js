const moongose = require("mongoose");

const ReportSchema = new moongose.Schema({
  type: {
    type: Number,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  user_pk_sender: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    default: "None",
  },
  issued: {
    type: Boolean,
    default: false,
  },
});

const Report = moongose.model("Reports", ReportSchema);
module.exports = Report;
