const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  billing: { amount: { type: Number, required: false }, end: { type: Date, required: false } },
  association: { type: String, required: false },
  phone: { type: Number, required: false },
  role: { type: String, enum: ['user', 'admin', 'administrative'], default: 'user' },
  lastLog: { type: Date, required: false },
  lastLoc: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  signDate: { type: Date, default: Date.now },
});

userSchema.index({ lastLoc: '2dsphere' });
module.exports = mongoose.model("user", userSchema);
