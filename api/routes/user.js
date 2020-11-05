const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");

const user = require("../models/user");

/**
 * Create a new user
 */
router.post("/register", (req, res, next) => {
  user
    .find({
      $or: [
        { email: req.body.email },
        { username: req.body.username },
        { phone: req.body.phone },
      ],
    })
    .exec()
    .then((resUser) => {
      if (resUser.length >= 1) {
        return res.status(409).json({
          message: "An user already exists with these details",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err.error,
            });
          } else {
            new user({
              _id: new mongoose.Types.ObjectId(),
              email: String(req.body.email).toLowerCase(),
              password: hash,
              username: req.body.username,
              fname: req.body.fname,
              lname: req.body.lname,
              phone: req.body.phone,
              lastLoc: { coordinates: [0, 0] },
            })
              .save()
              .then((result) => {
                res.status(200).json(result);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

/**
 * Login a new user
 */
router.post("/login", (req, res, next) => {
  user
    .find({
      username: req.body.username,
    })
    .exec()
    .then((resUser) => {
      if (resUser.length < 1) {
        return res.status(401).json({
          message: "No account with this username",
        });
      }
      bcrypt.compare(req.body.password, resUser[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Wrong password...",
          });
        }
        if (result) {
          const token = jwtUtils.generateToken(resUser[0], false);
          return res.status(200).json({
            message: "Welcome !",
            userID: resUser[0]._id,
            role: resUser[0].role,
            token: token,
          });
        }
        res.status(500).json({
          message: "An error was thrown during the login...",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/city/:range", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    const range = req.params.range * 1000;
    user
      .findOne({ _id: jwtUtils.getUserId(req.headers["authorization"]) })
      .exec()
      .then((admin) => {
        user
          .find({
            _id: { $nin: [jwtUtils.getUserId(req.headers["authorization"])] },
            lastLoc: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    admin.lastLoc.coordinates[0],
                    admin.lastLoc.coordinates[1],
                  ],
                },
                $maxDistance: range,
              },
            },
          })
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

router.get("/user", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    user
      .findOne({ _id: jwtUtils.getUserId(req.headers["authorization"]) })
      .exec()
      .then((result) => {
        res.json(result).status(200);
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

router.delete("/:id", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    user
      .findOneAndDelete({ _id: req.params.id })
      .exec()
      .then((result) => {
        res.json("User deleted").status(200);
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

router.patch("/association", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    user
      .findOneAndUpdate(
        { _id: jwtUtils.getUserId(req.headers["authorization"]) },
        { $set: { association: req.body.association } }
      )
      .exec()
      .then((result) => {
        res.json("User updated").status(200);
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

router.patch("/localisation", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    user
      .findOneAndUpdate(
        { _id: jwtUtils.getUserId(req.headers["authorization"]) },
        {
          lastLoc: { type: "Point", coordinates: [req.body.lng, req.body.lat] },
        }
      )
      .exec()
      .then((result) => {
        res.json("User updated").status(200);
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

module.exports = router;
