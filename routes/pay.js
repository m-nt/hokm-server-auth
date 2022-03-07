const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const url = require("url");
const { merchant_id, callback_url, metadata, PaymentURLs, BazzarPay } = require("../conf.json");
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
            headers: {
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

router.post("/bazzarpay", IsAuthenticated, (req, res) => {
  const { product_id, purchase_token } = req.body;
  if (!product_id || !purchase_token) {
    return res.send({ message: "Product detail is needed", code: "nok" });
  }
  access_token_res = getAccessToken();
  if (access_token_res == null) return res.send({ message: "Failed to retrive access_token", code: "nok" });
  if (access_token_res.status != 200) {
    return res.send({ message: access_token_res.statusText, code: "nok" });
  }
  verify_purchase_res = verifyPurchase(product_id, purchase_token, access_token_res.access_token);
  if (verify_purchase_res == null) return res.send({ message: "Failed to retrive purchase info", code: "nok" });
  if (verify_purchase_res.status != 200) {
    return res.send({ message: verify_purchase_res.statusText, code: "nok" });
  }
  if (verify_purchase_res.data.purchaseState == 1) {
    return res.send({ message: "Product is refunded", code: "nok" });
  }
  if (verify_purchase_res.data.consumptionState == 0) {
    return res.send({ message: "Product is already consumed", code: "nok" });
  }
  consumeProduct(product_id, req.user._id);
  return res.send({ message: "Product is seccussfuly consumed", code: "ok" });
});

function getAccessToken() {
  result = null;
  const data = new url.URLSearchParams({
    grant_type: "refresh_token",
    client_id: BazzarPay.client_id,
    client_secret: BazzarPay.client_secret,
    refresh_token: BazzarPay.refresh_token,
  });
  axios
    .post(BazzarPay.get_access_token, data.toString(), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Host: "pardakht.cafebazaar.ir",
      },
    })
    .then((res) => {
      console.log("getAcessToken");
      console.log(res.status);
      console.log(res.statusText);
      console.log(res);
      result = res;
    })
    .catch((err) => {
      console.log("getAcessToken");
      console.log(err.message);
      console.log(err.response.data);
    });
  return result;
}
function verifyPurchase(product_id, purchase_token, access_token) {
  result = null;
  axios
    .get(BazzarPay.verify_purchase + product_id + "/purchases/" + purchase_token + "/", {
      headers: {
        Accept: "application/json",
        Host: "pardakht.cafebazaar.ir",
        Authorization: access_token,
      },
    })
    .then((res) => {
      console.log("verifyPurchase");
      console.log(res.status);
      console.log(res.statusText);
      result = res;
    })
    .catch((err) => {
      console.log("verifyPurchase");
      console.log(err.message);
      console.log(err.response.data);
    });
  return result;
}
function consumeProduct(product_id, User_pk) {
  switch (product_id) {
    case "1MM":
      //console.log(pay.description);
      date1 = new Date(Date.now());
      date1.setMonth(date1.getMonth() + 1);
      const vip1 = new VIP({
        name: "1M",
        user_pk: User_pk,
        expires: new Date(date1.toJSON().replace(/\..*Z/g, "")),
      });
      vip1.save();
      break;
    case "2MM":
      //console.log(pay.description);
      date2 = new Date(Date.now());
      date2.setMonth(date2.getMonth() + 2);
      const vip2 = new VIP({
        name: "2M",
        user_pk: User_pk,
        expires: new Date(date2.toJSON().replace(/\..*Z/g, "")),
      });
      vip2.save();
      break;
    case "3MM":
      //console.log(pay.description);
      date3 = new Date(Date.now());
      date3.setMonth(date3.getMonth() + 3);
      const vip3 = new VIP({
        name: "3M",
        user_pk: User_pk,
        expires: new Date(date3.toJSON().replace(/\..*Z/g, "")),
      });
      vip3.save();
      break;
    default:
      //console.log(pay.description);
      amount = Number(product_id.slice(0, -1));
      User.findOne({ _id: User_pk })
        .then((user) => {
          if (user) {
            user.Curency += amount;
            user.save();
          } else {
            console.log("User Didn't found");
          }
        })
        .catch((err) => {
          console.log(err);
        });
      break;
  }
}

module.exports = router;
