const User = require("../models/User");
const Event = require("../models/Event");
const RSVP = require("../models/RSVPs");
const mongoose = require("mongoose");

async function getAllEvents(req, res) {
    const userId = req.session.user.uid;  // Ensure session contains user ID
    const events = await Event.find({});

    if (!userId) {
        return res.redirect("/auth/user/signin");
    }

    const user = await User.findById(userId).exec();   

    if (!user) {
        return res.redirect("/auth/user/signin");
    }

    res.locals.user = user; // Now available in all views

    // Modify each event to include a formatted date and calculate open spaces
    events.forEach(event => {
        event.formattedDate = new Date(event.eventDate).toDateString();

        // Calculate open spaces
        event.openSpaces = event.maxAttendees - event.rsvps.length;
    });

    // Render the page and pass events along with user and openSpaces
    res.render("user/events", { user, events });
}

async function getEvent(req, res) {
    const userId = req.session.user.uid;  // Ensure session contains user ID
    const eventId = req.params.eventId;   // Get eventId from the request parameters

    if (!userId) {
        return res.redirect("/auth/user/signin");
    }

    const user = await User.findById(userId).exec();   

    if (!user) {
        return res.redirect("/auth/user/signin");
    }

    res.locals.user = user; // Now available in all views

    const event = await Event.findById(eventId).exec();  // Fetch the event by ID

    if (!event) {
        return res.status(404).send("Event not found");  // Handle event not found scenario
    }

    event.formattedDate = new Date(event.eventDate).toDateString();  // Format the event date

    res.render("user/event-details", { user, event });  // Passing the event to the view
}

async function rsvpToEvent(req, res) {
    const userId = req.session.user.uid;  // Ensure user is logged in
    const eventId = req.params.eventId;  // Get event ID from the params of the request


    if (!userId) {
        return res.status(400).send("User must be logged in to RSVP");
    }

    // Start a session to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the event
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Check if the user is already RSVP'd for the event
        if (event.rsvps.includes(userId)) {
            return res.status(400).send("You have already RSVP'd to this event");
        }

        // Add the userId to the event's rsvps array
        event.rsvps.push(userId);
        await event.save({ session });

        // Create a new RSVP document in the RSVP collection
        const newRsvp = new RSVP({
            userId,
            eventId
        });
        await newRsvp.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).send("Successfully RSVP'd to the event");
    } catch (error) {
        // If any error occurs, abort the transaction and roll back
        await session.abortTransaction();
        res.status(500).send("An error occurred while processing your RSVP");
    } finally {
        // End the session
        session.endSession();
    }
}

module.exports = { getAllEvents, getEvent, rsvpToEvent };  // Exporting the functions to be used in routes