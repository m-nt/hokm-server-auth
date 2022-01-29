const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const { merchant_id, callback_url, metadata, PaymentURLs } = require("../conf.json");
const Pay = require("../models/Payments");
const { IsAuthenticated } = require("../config/Auth");
const User = require("../models/User");
const VIP = require("../models/vipticket");

router.post("/init", IsAuthenticated, (req, res) => {
  const { amount, description, authority } = req.body;

  if (!amount || !description || !authority) {
    return res.send({ message: "amount or description of payment is not set !", code: "nok" });
  }

  if (description == "1M" || description == "2M" || description == "3M") {
    VIP.findOne({ user_pk: req.user._id })
      .then((vip) => {
        if (vip) {
          return res.send({ message: "player already has vip", code: "nok" });
        }
      })
      .catch((err) => {
        return res.send({ message: "error with db", code: "nok", error: err });
      });
  }
  Pay.findOne({ authority: authority })
    .then((pay) => {
      if (pay) {
        return res.send({ message: "payment already generated", code: "nok" });
      } else {
        const paym = new Pay({ amount: amount, description: description, authority: authority, user_pk: req.user._id });
        paym.save();
        return res.send({ message: "Payment seccussfuly generated", code: "ok" });
      }
    })
    .catch((err) => {
      return res.send({ message: "we have problem to access db", code: "nok", error: err });
    });
});
router.get("/callback", (req, res) => {
  Authority = req.query.Authority;
  Status = req.query.Status;
  let Ref_id = "";
  if (Authority == "") {
    return res.sendFile("views/unseccesful.html", { root: __dirname });
  }

  if (Status === "OK") {
    Pay.findOne({ authority: Authority }).then((pay) => {
      console.log("pay found");
      axios
        .post(
          PaymentURLs.verify,
          {
            merchant_id: merchant_id,
            amount: pay.amount,
            authority: pay.authority,
          },
          {
            headrs: {
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        )
        .then((resp) => {
          //console.log("verify returned");
          let data = resp.data.data;
          //console.log(data);
          if (data.code == 100 || data.code == 101) {
            // This is the place to activate the purchase
            //console.log("verify accepted");
            pay.code = data.code;
            pay.message = data.message;
            pay.card_pan = data.card_pan;
            pay.card_hash = data.card_hash;
            pay.ref_id = data.ref_id;
            Ref_id = data.ref_id;
            pay.save();
            switch (pay.description) {
              case "1M":
                //console.log(pay.description);
                date1 = new Date(Date.now());
                date1.setMonth(date1.getMonth() + 1);
                const vip1 = new VIP({
                  name: "1M",
                  user_pk: pay.user_pk,
                  expires: new Date(date1.toJSON().replace(/\..*Z/g, "")),
                });
                vip1.save();
                break;
              case "2M":
                //console.log(pay.description);
                date2 = new Date(Date.now());
                date2.setMonth(date2.getMonth() + 2);
                const vip2 = new VIP({
                  name: "2M",
                  user_pk: pay.user_pk,
                  expires: new Date(date2.toJSON().replace(/\..*Z/g, "")),
                });
                vip2.save();
                break;
              case "3M":
                //console.log(pay.description);
                date3 = new Date(Date.now());
                date3.setMonth(date3.getMonth() + 3);
                const vip3 = new VIP({
                  name: "3M",
                  user_pk: pay.user_pk,
                  expires: new Date(date3.toJSON().replace(/\..*Z/g, "")),
                });
                vip3.save();
                break;
              default:
                //console.log(pay.description);
                User.findOne({ _id: pay.user_pk })
                  .then((user) => {
                    if (user) {
                      user.Curency += Number(pay.description);
                      user.save();
                    } else {
                      //console.log("User Didn't found");
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
                break;
            }
            res.send(require("./views/seccesful")(data.ref_id));
            //res.sendFile("views/seccesful.html", { root: __dirname });
          } else {
            res.send(require("./views/unseccesful")(data.ref_id));
            //res.sendFile("views/unseccesful.html", { root: __dirname });
          }
        })
        .catch((err) => {
          res.send(require("./views/unseccesful")(data.ref_id));
          //res.sendFile("views/unseccesful.html", { root: __dirname });
        });
    });
  } else if (Status === "NOK") {
    res.send(require("./views/unseccesful")(Ref_id));
    //res.sendFile("views/unseccesful.html", { root: __dirname });
  } else {
    res.send(require("./views/unseccesful")(Ref_id));
    //res.sendFile("views/unseccesful.html", { root: __dirname });
  }
});
module.exports = router;
