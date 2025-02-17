const Admin = require("../models/Admin");
const Event = require("../models/Event");
const axios = require("axios");

async function getDashboard(req, res) {
  const adminId = req.session.admin.uid; // Ensure session contains admin ID
  const events = await Event.find()
    .populate("rsvps", "fullName email")
    .populate("ratings.user", "fullName email");

  if (!adminId) {
    return res.redirect("/auth/admin/signin");
  }

  const admin = await Admin.findById(adminId).exec();

  if (!admin) {
    return res.redirect("/auth/admin/signin");
  }

  

  res.locals.admin = admin; // Now available in all views

  res.render("admin/dashboard", { admin, events }); // Passing explicitly for dashboard as well
}

//admin gets

async function getAllEvents(req, res) {
  const EVENTS_PER_PAGE = 10; // Adjust the number of events per page
  const page = parseInt(req.query.page) || 1; // Get the current page from query string, default to page 1

  const adminId = req.session.admin.uid; // Ensure session contains admin ID

  if (!adminId) {
    return res.redirect("/auth/admin/signin");
  }

  const admin = await Admin.findById(adminId).exec();

  // Calculate skip and limit based on page
  const skip = (page - 1) * EVENTS_PER_PAGE;

  try {
    // Fetch events with pagination
    const events = await Event.find({})
      .skip(skip)
      .limit(EVENTS_PER_PAGE)
      .exec();

    // Modify each event to include a formatted date
    events.forEach((event) => {
      event.formattedDate = new Date(event.eventDate).toDateString();
    });

    // Get total number of events for pagination calculation
    const totalEvents = await Event.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);

    // Render the view with the events, pagination info, and admin details
    res.render("admin/admin-events", {
      events,
      admin,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching events');
  }
}

async function getAddEvent(req, res) {
  const adminId = req.session.admin?.uid; // Safely check if the admin ID exists in session

  if (!adminId) {
    return res.redirect("/"); // Redirect to the home page if not logged in
  }

  const admin = await Admin.findById(adminId).exec();
  res.render("admin/new-event", { admin });
}


async function getEditEvent(req, res) {
  const { id } = req.params;
  const event = await Event.findById(id);
  const adminId = req.session.admin.uid; // Ensure session contains admin ID

  if (!adminId) {
    return res.redirect("/auth/admin/signin");
  }

  const admin = await Admin.findById(adminId).exec();

  res.render("admin/edit-event", { event, admin });
}

//add event

async function addEvent(req, res, next) {
  try {
    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Event image is required." });
    }

    const { title, description, maxAttendees, eventDate, eventTime, location } =
      req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const eventImage = req.file.filename;
    const imagePath = `public/event-data/images/${eventImage}`;
    const imageUrl = `/events/assets/images/${eventImage}`;

    // Declare lat and lng outside the try block
    let lat = null;
    let lng = null;

    try {
      // Fetch latitude & longitude from Google Geocoding API
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: location,
            key: apiKey,
          },
        }
      );

      if (geoResponse.data.status === "OK") {
        lat = geoResponse.data.results[0].geometry.location.lat;
        lng = geoResponse.data.results[0].geometry.location.lng;
      } else {
        return res.status(400).json({ error: "Invalid location" });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return res.status(500).json({ error: "Failed to fetch location" });
    }

    const event = await Event.create({
      title,
      description,
      maxAttendees,
      eventDate,
      eventTime,
      location,
      longitude: lng,
      latitude: lat,
      eventImage,
      imagePath,
      imageUrl,
    });

    if (event) {
      res.status(201).redirect("/admin/events/all");
    } else {
      res.status(400).json({ error: "Failed to create event" });
    }
  } catch (error) {
    next(error);
  }
}

//edit event
async function editEvent(req, res, next) {
  try {
    const { id } = req.params; // Get event ID from URL
    const { title, description, maxAttendees, eventDate, eventTime, location } =
      req.body;

    // Find existing event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Handle image update if a new file is uploaded
    let eventImage = event.eventImage; // Keep existing image by default
    let imagePath = event.imagePath;
    let imageUrl = event.imageUrl;

    if (req.file) {
      eventImage = req.file.filename;
      imagePath = `public/event-data/images/${eventImage}`;
      imageUrl = `/events/assets/images/${eventImage}`;
    }

    // Update event details
    event.title = title || event.title;
    event.description = description || event.description;
    event.maxAttendees = maxAttendees || event.maxAttendees;
    event.eventDate = eventDate || event.eventDate;
    event.eventTime = eventTime || event.eventTime;
    event.location = location || event.location;
    event.eventImage = eventImage;
    event.imagePath = imagePath;
    event.imageUrl = imageUrl;

    // Save updated event
    await event.save();

    res.status(200).redirect("/admin/events/all");
  } catch (error) {
    next(error);
  }
}

async function archiveEvent(req, res, next) {
  console.log("archive event");
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).redirect("/admin/events/all");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getAllEvents,
  getAddEvent,
  addEvent,
  getEditEvent,
  editEvent,
  archiveEvent,
};
