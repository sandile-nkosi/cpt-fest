const Admin = require("../models/Admin");

async function getDashboard(req, res) {
    const adminId = req.session.admin.id;
    const admin = await Admin.findById(adminId).exec();   
    if (!admin) {
        res.redirect("/auth/admin/signin");
        return;
    }else 

    
    res.render("admin/dashboard", { admin });
}

module.exports = { getDashboard };