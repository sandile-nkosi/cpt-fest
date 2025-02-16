const Event = require("../models/Event");

async function getIndex(req, res) {
  try {
    const events = await Event.find(); // Fetch all events from DB
    const limitedEvents = await Event.find().limit(3);
    const singleEvents = await Event.find().limit(1);

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

