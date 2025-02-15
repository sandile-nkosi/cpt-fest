const Admin = require("../models/Admin");
const Event = require("../models/Event");

async function getDashboard(req, res) { 
    const adminId = req.session.admin.uid;  // Ensure session contains admin ID

    if (!adminId) {
        return res.redirect("/auth/admin/signin");
    }

    const admin = await Admin.findById(adminId).exec();   

    if (!admin) {
        return res.redirect("/auth/admin/signin");
    }

    res.locals.admin = admin; // Now available in all views

    res.render("admin/dashboard", { admin }); // Passing explicitly for dashboard as well
}

//admin gets

async function getAllEvents(req, res) {
  const events = await Event.find({});
  const adminId = req.session.admin.uid;  // Ensure session contains admin ID

  if (!adminId) {
      return res.redirect("/auth/admin/signin");
  }

  const admin = await Admin.findById(adminId).exec();

  // Modify each event to include a formatted date
  events.forEach(event => {
    event.formattedDate = new Date(event.eventDate).toDateString();
  });

  res.render("admin/admin-events", { events, admin });

}

async function getAddEvent(req, res) {
    const adminId = req.session.admin.uid;  // Ensure session contains admin ID

    if (!adminId) {
        return res.redirect("/auth/admin/signin");
    }

    const admin = await Admin.findById(adminId).exec();
  res.render("admin/new-event", { admin });
}

async function getEditEvent(req, res) {
  const { id } = req.params;
  const event = await Event.findById(id);
  const adminId = req.session.admin.uid;  // Ensure session contains admin ID

  if (!adminId) {
      return res.redirect("/auth/admin/signin");
  }

  const admin = await Admin.findById(adminId).exec();


  res.render("admin/edit-event", { event, admin });
}

//add event 

async function addEvent(req, res, next) {  // Added next parameter
    try {
      // Ensure a file is uploaded
      if (!req.file) {
        return res.status(400).json({ error: "Event image is required." });
      }
  
      const { title, description, maxAttendees, eventDate, eventTime, location } = req.body;
      const eventImage = req.file.filename; // Corrected variable name
      const imagePath = `public/event-data/images/${eventImage}`;
      const imageUrl = `/events/assets/images/${eventImage}`;
  
      const event = await Event.create({
        title,
        description,
        maxAttendees,
        eventDate,
        eventTime,
        location,
        eventImage, // Corrected reference
        imagePath,
        imageUrl,
      });
  
      if (event) {
        res.status(201).redirect("/events/admin/all");
      } else {
        res.status(400).json({ error: "Failed to create event" });
      }
    } catch (error) {
      next(error); // Pass error to Express error handler
    }
  }
  
  //edit event
  async function editEvent(req, res, next) {
    try {
      const { id } = req.params; // Get event ID from URL
      const { title, description, maxAttendees, eventDate, eventTime, location } = req.body;
  
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
  
      res.status(200).redirect("/events/admin/all");
    } catch (error) {
      next(error);
    }
  }
  
  async function archiveEvent(req, res, next) {
    console.log("archive event");
    try {
      const { id } = req.params;
      const event = await Event.findByIdAndUpdate(id, { isArchived: true }, { new: true });
  
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      res.status(200).redirect("/events/admin/all");
    } catch (error) {
      next(error);
    }
  }


module.exports = { getDashboard, getAllEvents, getAddEvent, addEvent, getEditEvent, editEvent, archiveEvent };