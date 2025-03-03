const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    maxAttendees: {
      type: Number,
      required: true,
    },
    rsvps: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    eventDateTime: {  // Combined date and time field
      type: Date,
      required: true,
    },
    ratings: [
      {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rating: { type: Number, min: 1, max: 5 },
          comment: String,
          createdAt: { type: Date, default: Date.now }
      }
    ],
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: { 
      type: Number,
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    eventImage: {
      type: String,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Event", eventSchema);
