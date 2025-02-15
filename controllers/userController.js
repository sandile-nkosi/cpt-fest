const User = require("../models/User");

async function getEvents(req, res) { 
    const userId = req.session.user.uid;  // Ensure session contains user ID

    if (!userId) {
        return res.redirect("/auth/user/signin");
    }

    const user = await User.findById(userId).exec();   

    if (!user) {
        return res.redirect("/auth/user/signin");
    }

    res.locals.user = user; // Now available in all views

    res.render("user/events", { user }); // Passing explicitly for events as well
}

module.exports = { getEvents };