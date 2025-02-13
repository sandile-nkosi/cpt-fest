const Admin = require("../models/Admin");

async function getDashboard(req, res) {
    const admin = await Admin.findById(res.locals.uid).exec();   
    if (!admin) {
        res.redirect("/auth/admin/signin");
        console.log("Admin not found");
        return;
    }
    res.render("admin/dashboard");
}

module.exports = { getDashboard };