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
    rsvps: {
        type: Number,
        required: true,
        default: 0,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
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