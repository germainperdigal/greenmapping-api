const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");

const pin = require("../models/pin");
const user = require("../models/user");

/**
 * Create a new pin on map
 *
 * @param string req.body.title - The pin title
 * @param ObjectId req.body.category - The category id
 * @param string req.body.comment - The pin comment
 * @param string req.body.lat - The latitude
 * @param string req.body.long - The longitude
 */
router.post("/", (req, res, next) => {
  new pin({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    comment: req.body.comment,
    location: { coordinates: [req.body.lng, req.body.lat] },
    user: jwtUtils.getUserId(req.headers["authorization"]),
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
});

/**
 * Get all pins
 */
router.get("/", (req, res, next) => {
  pin
    .find()
    .populate("user")
    .populate("category")
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

/**
 * Get all pins around a precise location
 */
router.get("/:range", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    const range = req.params.range * 1000;
    user
      .findOne({ _id: jwtUtils.getUserId(req.headers["authorization"]) })
      .exec()
      .then((admin) => {
        pin
          .find({
            location: {
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
          .populate("user")
          .populate("category")
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

router.delete("/:id", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    pin
      .findOneAndDelete({ _id: req.params.id })
      .exec()
      .then((dPin) => {
        res.status(200).json("Pin deleted !");
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

/* Route POST qui permet la réaction positive sur un pin, retourne un message de succès ou d'erreur */
router.post("/up/:id", (req, res, next) => {
  if (jwtUtils.getUserId(req.headers["authorization"]) != -1) {
    pin
      .findOne({ _id: req.params.id })
      .exec()
      .then((tPin) => {
        if (
          !tPin.likes.includes(jwtUtils.getUserId(req.headers["authorization"]))
        ) {
          pin
            .updateOne(
              { _id: req.params.id },
              {
                $push: {
                  likes: jwtUtils.getUserId(req.headers["authorization"]),
                },
              }
            )
            .exec()
            .then((pPin) => {
              res.status(200).json("Like added");
            })
            .catch((error) => {
              res.status(500).json("An error was thrown");
            });
        } else {
          pin
            .updateOne(
              { _id: req.params.id },
              {
                $pull: {
                  likes: jwtUtils.getUserId(req.headers["authorization"]),
                },
              }
            )
            .exec()
            .then((pPin) => {
              res.status(200).json("Like removed");
            });
        }
      });
  } else {
    res.status(401).json({
      error: "Authentication required",
    });
  }
});

module.exports = router;
