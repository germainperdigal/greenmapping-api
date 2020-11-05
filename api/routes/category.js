const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");

const category = require("../models/category");

/**
 * Create a new category
 * 
 * @param string req.body.label - The category label
 */
router.post("/", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    new category({
      _id: new mongoose.Types.ObjectId(),
      label: req.body.label,
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
});

module.exports = router;
