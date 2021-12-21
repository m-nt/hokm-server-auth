const moongose = require("mongoose");

const vIP = new moongose.Schema({
  name: {
    type: String,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  expires: {
    type: Date,
    require: true,
  },
});

const VIP = moongose.model("VIP", vIP);
// const VIP_2_month = moongose.model("VIP2", vIP_2_month);
// const VIP_3_month = moongose.model("VIP3", vIP_3_month);

// module.exports = { VIP_1_month, VIP_2_month, VIP_3_month };
module.exports = VIP;
