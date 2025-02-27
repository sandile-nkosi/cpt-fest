const Event = require("../models/Event");

async function getIndex(req, res) {
  try {
    // Find all active events
    const events = await Event.find({ isArchived: false });

    // Get the latest event
    const singleEvent = await Event.findOne({ isArchived: false }).sort({ createdAt: -1 });

    // Get the latest 3 events
    const limitedEvents = await Event.find({ isArchived: false }).limit(3);

    limitedEvents.forEach(limitedEvent => {
      limitedEvent.formattedDate = new Date(limitedEvent.eventDate).toDateString();
    });

    // Find top 3 events with the highest average rating and most comments
    const topEvents = await Event.aggregate([
      { $match: { isArchived: false } }, // Only active events
      {
        $addFields: {
          avgRating: { $avg: "$ratings.rating" }, // Average rating
          commentCount: { $size: "$ratings" } // Total comments
        }
      },
      { $sort: { avgRating: -1, commentCount: -1 } }, // Sort by rating, then comments
      { $limit: 3 } // Get top 3
    ]);

    res.render("index", { events, limitedEvents, singleEvent, topEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Error fetching events");
  }
}

module.exports = {
  getIndex
};


