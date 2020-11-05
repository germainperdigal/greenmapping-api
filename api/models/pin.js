const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);

const pinSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
  comment: { type: String, required: true },
  location: {
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
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'user' },
  title: { type: String, required: true },
  created: { type: Date, default: Date.now },
});

pinSchema.index({ location: '2dsphere' });
module.exports = mongoose.model("pin", pinSchema);
