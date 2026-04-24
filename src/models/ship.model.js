const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  speed: Number,
  heading: Number,
  timestamp: Number
}, { _id: false });

const shipSchema = new mongoose.Schema({
  shipId: { type: String, required: true, unique: true },
  name: String,
  lat: Number,
  lng: Number,
  heading: Number,
  speed: Number,
  timestamp: Number,

  distanceTraveled: {
    type: Number,
    default: 0
  },

  history: {
    type: [historySchema],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);