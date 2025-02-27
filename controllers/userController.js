const User = require("../models/User");
const Event = require("../models/Event");
const RSVP = require("../models/RSVPs");
const mongoose = require("mongoose");
const sendMail = require("../middleware/mailer");
const axios = require("axios");

async function getAllEvents(req, res) {
  const userId = req.session.user ? req.session.user.uid : null; // Check if user is logged in

  // Pagination logic
  const page = parseInt(req.query.page) || 1; // Get the current page from the query string (default to 1)
  const limit = 6; // Number of events per page (updated to 6)
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  // Find events where isArchived is false, with pagination
  const events = await Event.find({ isArchived: false })
    .skip(skip)
    .limit(limit)
    .exec();

  // Count the total number of events (for pagination)
  const totalEvents = await Event.countDocuments({ isArchived: false });
  const totalPages = Math.ceil(totalEvents / limit); // Calculate total pages

  const user = userId ? await User.findById(userId).exec() : null; // Only fetch user if logged in

  res.locals.user = user; // Available in all views

  // Modify each event to include a formatted date and calculate open spaces
  events.forEach((event) => {
    // Format the date and time
    event.formattedDate = new Date(event.eventDateTime).toLocaleString("en-ZA", {
      weekday: "long", // e.g. "Monday"
      year: "numeric", // e.g. "2025"
      month: "long", // e.g. "February"
      day: "numeric", // e.g. "19"
      hour: "2-digit", // e.g. "02"
      minute: "2-digit", // e.g. "30"
      hour12: false, // 24-hour format
    });

    // Calculate open spaces
    event.openSpaces = event.maxAttendees - event.rsvps.length;
  });

  // Render the page and pass events, pagination data, and user
  res.render("user/events", {
    user,
    events,
    currentPage: page,
    totalPages,
  });
}

async function getEvent(req, res) {
  try {
    const userId = req.session.user ? req.session.user.uid : null; // Check if user is logged in
    const eventId = req.params.eventId; // Get eventId from the request parameters

    // Fetch user if logged in
    const user = userId ? await User.findById(userId).exec() : null;
    res.locals.user = user; // Make user available in all views

    // Fetch the event by ID and populate ratings.user
    const event = await Event.findById(eventId).populate("ratings.user").exec();
    if (!event) return res.status(404).send("Event not found");

    // Format the event date
    event.formattedDate = new Date(event.eventDate).toDateString();

    // Calculate average rating (1 decimal place)
    const calculateAverageRating = (ratings) => {
      if (!ratings.length) return 0;
      const sum = ratings.reduce((total, r) => total + r.rating, 0);
      return (sum / ratings.length).toFixed(1);
    };
    event.averageRating = calculateAverageRating(event.ratings);

    // Add ISO-formatted timestamps for dynamic "time ago"
    event.ratings.forEach((rating) => {
      rating.createdAtISO = rating.createdAt.toISOString();
    });

    // Check if user has RSVP'd
    const isRSVPed = user ? event.rsvps.includes(userId) : false;

    // Fetch future weather forecast (if coordinates exist)
    let weatherDetails = null;
    if (event.latitude && event.longitude) {
      const weatherApiKey = process.env.OPENWEATHER_API_KEY;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${event.latitude}&lon=${event.longitude}&units=metric&appid=${weatherApiKey}`;

      try {
        const response = await axios.get(weatherUrl);
        const forecastData = response.data.list;

        // Match forecast closest to event time
        const eventDateTime = new Date(`${event.eventDate}T${event.eventTime}`).getTime();
        const closestForecast = forecastData.reduce((closest, forecast) => {
          let forecastTime = new Date(forecast.dt * 1000).getTime();
          return Math.abs(forecastTime - eventDateTime) < Math.abs(new Date(closest.dt * 1000).getTime() - eventDateTime)
            ? forecast
            : closest;
        }, forecastData[0]);

        // Extract weather details
        weatherDetails = {
          temperature: `${closestForecast.main.temp}°C`,
          condition: closestForecast.weather[0].description,
          windSpeed: `${closestForecast.wind.speed} m/s`,
          humidity: `${closestForecast.main.humidity}%`,
          icon: `https://openweathermap.org/img/wn/${closestForecast.weather[0].icon}.png`,
        };
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    // Render event details with weather
    res.render("user/event-details", {
      user,
      event,
      isRSVPed,
      weatherDetails, // Pass weather details to the view
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).send("Internal Server Error");
  }
}


async function toggleRSVP(req, res) {
  const userId = req.session.user ? req.session.user.uid : null;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const user = userId ? await User.findById(userId).exec() : null; // Only fetch user if logged in
  const eventId = req.params.eventId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Event not found" });
    }

    // Prevent RSVP changes if event has started
    const eventStartTime = new Date(event.eventDate);
    if (new Date() >= eventStartTime) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "RSVP changes are not allowed after the event starts" });
    }


    const hasRSVPed = event.rsvps.includes(userId);

    if (hasRSVPed) {
      // Cancel RSVP (atomic)
      const updateResult = await Event.findOneAndUpdate(
        { _id: eventId },
        { $pull: { rsvps: userId } },
        { new: true, session }
      );

      // Ensure the user was actually removed
      if (!updateResult.rsvps.includes(userId)) {
        await RSVP.deleteOne({ userId, eventId }, { session });

        await session.commitTransaction();
        session.endSession();

        const mailOptions = {
            from: "One City Event Company <sankosi.uct@gmail.com>",
            to: req.session.user.email,
            subject: `🚫 RSVP Cancelled for ${event.title}`,
            text: "Test",
            html: `
              <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; text-align: center; border: 1px solid #ddd;">
          
                <h2 style="color: #d9534f;">RSVP Cancelled</h2>
          
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  Hi ${user.fullName},<br>
                  You have successfully cancelled your RSVP for <strong>${event.title}</strong>. We're sorry you won’t be able to join us this time.
                </p>
          
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                  📅 🕒 <strong>Event Date and Time:</strong> ${event.eventDateTime} <br>
                  📍 <strong>Location:</strong> ${event.location}
                </p>
          
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  If this was a mistake or you change your mind, you can RSVP again while spots are still available.
                </p>
          
                <a href="https://cpt-fest.onrender.com/user/events/${eventId}" style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 10px;">
                  RSVP Again
                </a>
          
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
                <p style="font-size: 14px; color: #777;">
                  One City Event Company<br>
                  &copy; 2025 One City Event Company. All rights reserved.
                </p>
          
              </div>
            `,
          };
          
          sendMail(mailOptions);          

        return res.json({
          message: "RSVP cancelled successfully",
          isRSVPed: false,
        });
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ error: "Failed to cancel RSVP" });
      }
    } else {
      // Prevent RSVP if event is full
      if (event.rsvps.length >= event.maxAttendees) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Event is full" });
      }

      // Add RSVP (atomic)
      await Event.findOneAndUpdate(
        { _id: eventId },
        { $push: { rsvps: userId } },
        { session }
      );
      await RSVP.create([{ userId, eventId }], { session });

      await session.commitTransaction();
      session.endSession();

      const mailOptions = {
        from: "One City Event Company <sankosi.uct@gmail.com>",
        to: req.session.user.email,
        subject: `🎉 You're RSVP'd for ${event.title}!`,
        text: "Test",
        html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; text-align: center; border: 1px solid #ddd;">
  
        <h2 style="color: #007bff;">You're in! 🎟️</h2>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${user.fullName},<br>
            You have successfully RSVP'd for <strong>${event.title}</strong>. We're excited to have you join us!
        </p>

        <p style="font-size: 16px; color: #555; line-height: 1.6;">
            📅 🕒 <strong>Date and Time:</strong> ${event.eventDateTime} <br>
            📍 <strong>Location:</strong> ${event.location}
        </p>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            If you have any questions, feel free to reply to this email.
        </p>

        <a href="https://cpt-fest.onrender.com/user/events/${eventId}" style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 10px;">
            View Event Details
        </a>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #777;">
            One City Event Company<br>
            &copy; 2025 One City Event Company. All rights reserved.
        </p>

        </div>
        `,
      };

      sendMail(mailOptions);

      return res.json({
        message: "RSVP confirmed successfully",
        isRSVPed: true,
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("RSVP Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function eventRating(req, res) {
  const userId = req.session.user?.uid; // Ensure user is logged in
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  const { rating, comment } = req.body;
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Check if the user has already rated and commented on the event
    const existingRating = event.ratings.find(
      (r) => r.user.toString() === userId
    );
    if (existingRating) {
      return res
        .status(400)
        .json({ error: "You have already rated and commented on this event" });
    }

    // If no existing rating, push the new rating and comment
    event.ratings.push({ user: userId, rating, comment });
    await event.save();

    res.status(201).redirect("/user/events/own");
  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserRSVPs(req, res) {
  try {
    const userId = req.session.user ? req.session.user.uid : null;

    if (!userId) {
      return res.redirect("/auth/user/signin");
    }

    // Fetch events where user has RSVP'd
    let rsvpEvents = await Event.find({ rsvps: userId })
      .populate("rsvps", "fullName email")
      .populate("ratings.user", "fullName email");

    // Add a `hasRating` boolean to each event
    rsvpEvents = await Promise.all(
      rsvpEvents.map(async (event) => {
        const hasRating = await Event.exists({ _id: event._id, "ratings.user": userId });
        return { ...event.toObject(), hasRating: !!hasRating }; // Ensure boolean return
      })
    );

    res.render("user/user-events", { events: rsvpEvents });
  } catch (error) {
    console.error("Error fetching RSVP'd events:", error);
    res.status(500).send("Error fetching your RSVP'd events.");
  }
}


module.exports = {
  getAllEvents,
  getEvent,
  toggleRSVP,
  eventRating,
  getUserRSVPs,
}; // Exporting the functions to be used in routes
