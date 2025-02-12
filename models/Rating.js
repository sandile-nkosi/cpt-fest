const mongoose = require("mongoose");

const ratings = [
    1,
    2,
    3,
    4,
    5,
]

const ratingSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      enum: ratings,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Rating", ratingSchema);