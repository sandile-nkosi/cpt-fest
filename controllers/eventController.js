const Event = require("../models/Event");

async function getIndex(req, res) {
  try {
    // Find events where isArchived is false
    const events = await Event.find({ isArchived: false });
    const limitedEvents = await Event.find({ isArchived: false }).limit(3);
    const singleEvents = await Event.find({ isArchived: false }).limit(1);

    limitedEvents.forEach(limitedEvent => {
      limitedEvent.formattedDate = new Date(limitedEvent.eventDate).toDateString();

  });

    res.render("index", { events, limitedEvents, singleEvents }); // Pass events to EJS
  } catch (error) {
    res.status(500).send("Error fetching events");
  }
  }

module.exports = {
    getIndex
}

