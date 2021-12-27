const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multipart = require("multer");
const upload = multipart();
const mongoose = require("mongoose");
const User = require("../models/User");
//const { VIP_1_month, VIP_2_month, VIP_3_month } = require("../models/vipticket");
const VIP = require("../models/vipticket");
const FriendListModel = require("../models/friendlist");
const Report = require("../models/reports");

const router = express.Router();
const { IsAuthenticated } = require("../config/Auth");

router.post("/register", upload.single("Avatar"), (req, res) => {
  const { Username, Password, CPassword, DeviceInfo } = req.body;
  deviceInfo = DeviceInfo ? DeviceInfo : "";
  avatar = req.file ? req.file.buffer : Buffer.alloc(0);
  if (!Username || !Password || !CPassword) {
    return res.send({ message: "please fill in all the required fields !", code: "nok" });
  }
  if (Password != CPassword) {
    return res.send({ message: "Passwords doesn't match !", code: "nok" });
  }
  if (Password.length < 6) {
    return res.send({ message: "Password must be greater than 6 character !", code: "nok" });
  }

  User.findOne({ Username: Username })
    .then((user) => {
      if (user) {
        res.send({ message: "This Username is taken, try another one!", code: "nok" });
      } else {
        const NewUser = new User({
          Username,
          Password,
          Avatar: {
            data: avatar,
            contentType: "image/jpg",
          },
          DeviceInfo: deviceInfo,
        });
        bcrypt
          .genSalt(15)
          .then((salt) => {
            bcrypt
              .hash(NewUser.Password, salt)
              .then((hash) => {
                NewUser.Password = hash;
                NewUser.save()
                  .then((_user) => {
                    res.send({ message: "register successfully done", code: "ok", user: _user });
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      res.send({ message: err.message, code: "nok" });
    });
});

router.post("/loggin", upload.none(), passport.authenticate("local"), (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "connect.sid=" + req.cookies["connect.sid"] })
    .then((user) => {})
    .catch((err) => {
      console.log(err);
    });
  VIP.findOne({ user_pk: req.user._id })
    .then((_vip) => {
      if (_vip) {
        res.send({ message: "You are logged in ! with vip", code: "ok", user: req.user, vip: _vip });
      } else {
        res.send({ message: "You are logged in ! without vip", code: "ok", user: req.user });
      }
    })
    .catch((err) => {
      res.send({ message: err.message, code: "nok" });
    });
});
router.post("/stelthloggin", upload.none(), passport.authenticate("local"), (req, res) => {
  res.send({ message: "You are logged in !", code: "ok" });
});
router.post("/checkloggin", upload.none(), IsAuthenticated, (req, res) => {
  VIP.findOne({ user_pk: req.user._id })
    .then((_vip) => {
      if (_vip) {
        res.send({ message: "You are logged in !", code: "ok", user: req.user, vip: _vip });
      } else {
        res.send({ message: "You are logged in !", code: "ok", user: req.user });
      }
    })
    .catch((err) => {
      res.send({ message: err.message, code: "nok" });
    });
});
router.post("/loggout", upload.none(), (req, res) => {
  req.logout();
  res.send({ message: "You are logged out !", code: "ok" });
});
router.post("/leaderboard", upload.none(), IsAuthenticated, (req, res) => {
  limit = 30;
  if (req.body.limit) {
    lim = parseInt(req.body.limit);
    if (lim) {
      limit = lim;
    } else {
      limit = 30;
    }
  }
  User.find({})
    .sort({ Curency: -1 })
    .limit(limit)
    .then((result) => {
      res.send({ message: "Users found seccussfully", users: result, code: "ok" });
    })
    .catch((err) => {
      if (err) res.send({ message: "failed to retrieve players !", code: "nok" });
    });
});
router.post("/viptest", upload.none(), IsAuthenticated, (req, res) => {
  User.findOne({ Username: req.user.Username })
    .then((user) => {
      date = new Date(req.body.expires);
      const vip = new VIP({
        name: req.body.name,
        user_pk: user._id,
        expires: date,
      });
      vip.save();
      res.send({ vip });
    })
    .catch((err) => {
      res.send(err);
    });
});
router.post("/updateuser", upload.single("Avatar"), IsAuthenticated, (req, res) => {
  avatar = req.file ? req.file.buffer : req.user.Avatar;
  let password = "";
  if (req.body.Password) {
    password = req.body.Password;
  }
  const name =
    req.body.Username && req.body.Username.length > 0 && req.body.Username != req.user.Username
      ? req.body.Username
      : "";
  const curency = req.body.Curency ? req.body.Curency : req.user.Curency;
  const deckofcard = req.body.DeckOfCard ? req.body.DeckOfCard : req.user.DeckOfCard;
  const background = req.body.Background ? req.body.Background : req.user.Background;
  User.findOne({ Username: name })
    .then((user) => {
      if (user) {
        res.send({ message: "this username already taken!", code: "nok" });
      } else {
        User.findOneAndUpdate(
          { Username: req.user.Username },
          {
            Username: name.length > 0 ? name : req.user.Username,
            Avatar: {
              data: avatar,
              contentType: "image/jpg",
            },
            Curency: curency,
            DeckOfCard: deckofcard,
            Background: background,
          }
        )
          .then((user) => {
            User.findOne({ Username: name.length > 0 ? name : req.user.Username })
              .then((loser) => {
                if (password.length > 0) {
                  bcrypt
                    .compare(password, loser.Password)
                    .then((res) => {
                      if (!res) {
                        bcrypt
                          .genSalt(15)
                          .then((salt) => {
                            bcrypt
                              .hash(password, salt)
                              .then((hash) => {
                                loser.Password = hash;
                                loser.save();
                              })
                              .catch((err) => {});
                          })
                          .catch((err) => {});
                      }
                    })
                    .catch((err) => {});
                }
                VIP.findOne({ user_pk: req.user._id })
                  .then((_vip) => {
                    if (_vip) {
                      res.send({ message: "User seccussfully updated !", code: "ok", user: loser, vip: _vip });
                    } else {
                      res.send({ message: "User seccussfully updated !", code: "ok", user: loser });
                    }
                  })
                  .catch((err) => {
                    res.send({ message: err.message, code: "nok" });
                  });
              })
              .catch((err) => {
                res.send({ message: err.message, code: "nok" });
              });
          })
          .catch((err) => {
            res.send({ message: err.message, code: "nok" });
          });
      }
    })
    .catch((err) => {
      res.send({ message: err.message, code: "nok" });
    });
});
router.post("/updatecurency", upload.none(), IsAuthenticated, (req, res) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user) {
        user.Curency += user.Debt;
        user.Debt = 0;
        user.save();
        res.send({ message: "user seccussfuly updated", code: "ok", user: user });
      } else {
        res.send({ message: "user didn't find", code: "nok" });
      }
    })
    .catch((err) => {
      res.send({ message: "have a problem to get the user", code: "nok", error: err });
    });
});
router.post("/verifyvip", upload.none(), IsAuthenticated, (req, res) => {
  VIP.findOne({ user_pk: req.user._id }).then((vip) => {
    if (vip) {
      res.send({ message: "VIP founded for this user", code: "ok", vip: vip });
    } else {
      res.send({ message: "VIP NOT founded for this user", code: "nok" });
    }
  });
});
router.post("/getuserbyid", upload.none(), IsAuthenticated, (req, res) => {
  let result = {};
  if (!req.body.id) {
    return res.send({ message: "id field is not set as value", code: "nok" });
  }
  VIP.findOne({ user_pk: req.body.id }).then((vip) => {
    if (vip) {
      result["VIP"] = vip.name;
    }
  });
  User.findOne({ _id: req.body.id }, (err, user) => {
    if (!user) {
      res.send({ message: "user with this id doesnt exist", code: "nok" });
    } else {
      result["Curency"] = user.Curency;
      result["Avatar"] = user.Avatar;
      res.send({ message: "user seccussfuly find", code: "ok", user: result });
    }
  });
});
router.post("/friendrequest", upload.none(), IsAuthenticated, (req, res) => {
  if (!req.body.id) {
    return res.status(400).send({ message: "player id is required!", code: "nok", err: "id not found" });
  } else if (req.body.id == req.user._id) {
    res.status(400).send({ message: "you can't send friend request to yourself :/", code: "nok", err: "" });
  } else {
    FriendListModel.findOne({
      $or: [
        { $and: [{ user_pk_sender: req.user._id }, { user_pk_reciver: req.body.id }] },
        { $and: [{ user_pk_sender: req.body.id }, { user_pk_reciver: req.user._id }] },
      ],
    })
      .then((user) => {
        if (!user) {
          const Freq = new FriendListModel({
            user_pk_sender: req.user._id,
            user_pk_reciver: req.body.id,
          });
          Freq.save();
          res.status(200).send({ message: "request seccessfuly sended!", code: "ok", err: "" });
        } else {
          res.status(400).send({ message: "request already sended!", code: "nok", err: "similar request" });
        }
      })
      .catch((err) => {
        res.status(400).send({ message: "request failed to sended!", code: "nok", err: err.message });
      });
  }
});
router.post("/pendingrequests", upload.none(), IsAuthenticated, (req, res) => {
  FriendListModel.find({ $and: [{ user_pk_reciver: req.user._id }, { status: "PENDING" }] })
    .then((lists) => {
      if (lists.length > 0) {
        //return users instead of lists
        let result = [];
        lists.forEach((list) => {
          result.push(list.user_pk_sender);
        });
        User.find({ _id: { $in: result } })
          .then((users) => {
            res.status(200).send({ message: "pending friend request finded", code: "ok", err: "", users: users });
          })
          .catch((err) => {
            res.status(400).send({ message: "wtf happend :(", code: "nok", err: err.message });
          });
      } else {
        res.status(200).send({ message: "there is no pending requests", code: "nok", err: "" });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: "request failed to proccess!", code: "nok", err: err.message });
    });
});
router.post("/accept-reject", upload.none(), IsAuthenticated, (req, res) => {
  if (!req.body.id) {
    return res.status(400).send({ message: "id doesn't set", code: "nok", err: "id not found" });
  }
  if (req.body.accrej == "ACCEPTED" || req.body.accrej == "REJECTED") {
    FriendListModel.findOne({
      $and: [{ user_pk_sender: req.body.id }, { user_pk_reciver: req.user._id }, { status: "PENDING" }],
    })
      .then((list) => {
        if (list) {
          list.status = req.body.accrej;
          list.save();
          res.status(200).send({ message: "request set accordingly ", code: "ok", err: "" });
        } else {
          res.status(200).send({ message: "friendship already set ", code: "nok", err: "" });
        }
      })
      .catch((err) => {
        res.status(400).send({ message: "request failed to proccess!", code: "nok", err: err.message });
      });
  } else {
    res.status(400).send({ message: "accrej doesn't set accordingly", code: "nok", err: "" });
  }
});
router.post("/getfriends", upload.none(), IsAuthenticated, (req, res) => {
  FriendListModel.find({
    $and: [{ $or: [{ user_pk_sender: req.user._id }, { user_pk_reciver: req.user._id }] }, { status: "ACCEPTED" }],
  })
    .then((lists) => {
      let result = [];
      lists.forEach((list) => {
        result.push(list.user_pk_sender.equals(req.user._id) ? list.user_pk_reciver : list.user_pk_sender);
      });
      User.find({ _id: { $in: result } })
        .then((users) => {
          res.status(200).send({ message: "friendlist found ", code: "ok", users: users });
        })
        .catch((err) => {
          res.status(400).send({ message: "wtf happend :(", code: "nok", err: err.message });
        });
    })
    .catch((err) => {});
});
router.post("/changestatus", upload.none(), IsAuthenticated, (req, res) => {
  if (!req.body.status) {
    res.status(400).send({ message: "status is required in body", code: "nok", err: "" });
  } else if (req.body.status == "OFFLINE" || req.body.status == "ONLINE" || req.body.status == "AWAIT") {
    User.findOne({ _id: req.user._id })
      .then((user) => {
        user.Status = req.body.status;
        user.save();
        res.status(200).send({ message: "status seccessfuly changed", code: "ok", user: user });
      })
      .catch((err) => {
        res.status(400).send({ message: "wtf happend :(", code: "nok", err: err.message });
      });
  } else {
    res.status(400).send({ message: "status doesn't set accordingly", code: "nok", err: "" });
  }
});
router.post("/setreport", upload.none(), IsAuthenticated, (req, res) => {
  if (!req.body.type || !req.body.id) {
    return res.status(400).send({ message: "type/id of report is required", code: "nok", err: "type/id is not set" });
  }
  const report = new Report({
    type: req.body.type,
    user_pk: req.body.id,
    user_pk_sender: req.user._id,
    message: req.body.message ? req.body.message : "None",
  });
  report.save();
  res.status(200).send({ message: "report seccussfuly saved", code: "ok", err: "" });
});
router.post("/getreports", upload.none(), IsAuthenticated, (req, res) => {
  Report.find({ $and: [{ user_pk: req.user._id }, { issued: false }] })
    .then((reports) => {
      if (reports.length > 0) {
        reports.forEach((report) => {
          report.issued = true;
          report.save();
        });
        res.status(200).send({ message: "result of reports for this user", code: "ok", reports: reports, err: "" });
      } else {
        res.status(400).send({ message: "there is no reports for this user", code: "nok", err: "" });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: "error acquired during reports extraction", code: "nok", err: err.message });
    });
});
router.post("/getuser", upload.none(), IsAuthenticated, (req, res) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user) {
        res.status(200).send({ message: "user retrived seccussfuly", code: "ok", user: user, err: "" });
      } else {
        res.status(400).send({ message: "didn't find the user", code: "nok" });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: "had a problem with data base", code: "nok", err: err });
    });
});
module.exports = router;
