const express = require("express");
const cors = require("cors");
const mongose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 8080;
//MongoDB URL
const URL = require("./conf.json").MongoURL;
const Options = require("./conf.json").MongoOpt;
const VIP = require("./models/vipticket");
const DEL_VIP = require("./models/deletedvip");
const FriendListModel = require("./models/friendlist");
const DeletedFriendListModel = require("./models/deletedfrndlist");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
//passport config
require("./config/passport")(passport);
//mongose connection
mongose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));

//Body Parser
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());
//Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    store: MongoStore.create({ mongoUrl: URL, ttl: 30 * 24 * 60 * 60 }),
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
//passport midware
app.use(express.static("./Static"));
app.use(passport.initialize());
app.use(passport.session());

//Routes set up
app.use("/users", require("./routes/user"));
app.use("/pay", require("./routes/pay"));

// every two minutes check for vip expire time
setInterval(() => {
  VIP.findOneAndDelete({ expires: { $lt: Date.now() } })
    .then((vip) => {
      if (vip) {
        const del_vip = new DEL_VIP({
          name: vip.name,
          user_pk: vip.user_pk,
          expires: vip.expires,
        });
        del_vip.save();
      }
    })
    .catch((err) => {
      console.log(err);
    });
  FriendListModel.findOneAndDelete({ status: "REJECTED" })
    .then((list) => {
      if (list) {
        const del_frlst = new DeletedFriendListModel({
          status: list.status,
          user_pk_sender: list.user_pk_sender,
          user_pk_reciver: list.user_pk_reciver,
        });
        del_frlst.save();
      }
    })
    .catch((err) => {
      console.log(err);
    });
  User.find({ $or: [{ Debt: { $gt: 0 } }, { Debt: { $lt: 0 } }] })
    .then((users) => {
      if (users.length > 0) {
        users.forEach((user) => {
          user.Curency += user.Debt;
          user.Debt = 0;
          user.save();
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });

}, 60000);

app.listen(PORT, console.log(`app listening on port:${PORT}`));
