var express = require("express");
var exe = require("./../connection");
var router = express.Router();
const prefix = "project-rabbit-";
router.use("/uploads", express.static("public/uploads"));
const path = require('path');
const fs = require('fs');

// =============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =============================================

function isAdminLoggedIn(req, res, next) {
    if (req.session && req.session.adminLoggedIn) {
        return next();
    }
    res.redirect("/admin/login");
}

// Admin Login Page (GET)
router.get("/login", function (req, res) {
    if (req.session && req.session.adminLoggedIn) {
        return res.redirect("/admin");
    }
    res.render("admin/login.ejs", { error: null });
});

// Admin Login (POST)
router.post("/login", function (req, res) {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "Admin@1234";

    if (username === adminUser && password === adminPass) {
        req.session.adminLoggedIn = true;
        req.session.adminUsername = username;
        return res.redirect("/admin");
    }
    res.render("admin/login.ejs", { error: "Invalid username or password!" });
});

// Admin Logout
router.get("/logout", function (req, res) {
    req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
        res.redirect("/admin/login");
    });
});

// Protected Admin Dashboard
router.get("/", isAdminLoggedIn, async function(req, res) {
    try {
        const [ordersResult] = await exe("SELECT COUNT(*) as count, IFNULL(SUM(amount),0) as revenue FROM orders WHERE status='PAID'");
        const [projectsResult] = await exe("SELECT (SELECT COUNT(*) FROM ready_projects) + (SELECT COUNT(*) FROM mini_projects) + (SELECT COUNT(*) FROM bundle_projects) as total");
        const [commentsResult] = await exe("SELECT COUNT(*) as count FROM comments");
        res.render("admin/index.ejs", {
            totalOrders: ordersResult.count || 0,
            totalRevenue: ordersResult.revenue || 0,
            totalProjects: projectsResult.total || 0,
            totalComments: commentsResult.count || 0
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.render("admin/index.ejs", { totalOrders: 0, totalRevenue: 0, totalProjects: 0, totalComments: 0 });
    }
});

router.get("/add-ready-projects", isAdminLoggedIn, async function(req,res){
    res.render("admin/add-ready-projects.ejs");
});

router.post("/save-ready-projects", isAdminLoggedIn, async function(req,res){
    if (req.files) {
        var image = prefix + req.files.image.name;
        req.files.image.mv("public/uploads/" + image);

        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : "";
        if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);

        var d = req.body;
        var sql = `INSERT INTO ready_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating) VALUES ('${d.title}','${d.category}','${d.description}','${image}','${zipFile}','${d.price}','${d.rating}')`;
        await exe(sql);
    }
    res.redirect("/admin/add-ready-projects");
});

// Route to list all projects
router.get("/ready-project-list", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM ready_projects");
        res.render("admin/ready-project-list", { projects });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// Route to display the edit form
router.get("/edit-ready-project/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM ready_projects WHERE ProjectID = ?", [req.params.id]);
        if (!projects.length) return res.status(404).send("Project not found");
        res.render("admin/edit-ready-project", { project: projects[0] });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// Route to update a project
router.post("/edit-ready-project/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var projectId = req.params.id;
    var image = d.oldImage;
    if (req.files && req.files.ProjectImage) {
        image = req.files.ProjectImage.name;
        req.files.ProjectImage.mv("public/" + image);
    }
    var sql = `UPDATE ready_projects SET ProjectTitle='${d.ProjectTitle}',ProjectCategory='${d.ProjectCategory}',ProjectDescription='${d.ProjectDescription}',Price='${d.Price}',ProjectImage='${image}' WHERE ProjectID='${projectId}'`;
    await exe(sql);
    res.redirect("/admin/ready-project-list");
});

// Route to delete a project
router.get("/delete-ready-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM ready_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/ready-project-list");
});

// =============================================
// MINI PROJECTS
// =============================================

router.get("/add-mini-project", isAdminLoggedIn, async function(req,res){
    res.render("admin/add-mini-project.ejs");
});

router.post("/save-mini-project", isAdminLoggedIn, async function(req,res){
    if (req.files) {
        var image = prefix + req.files.image.name;
        req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : "";
        if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        var sql = `INSERT INTO mini_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES ('${d.title}','${d.category}','${d.description}','${image}','${zipFile}','${d.price}','${d.rating}','${d.author}')`;
        await exe(sql);
    }
    res.redirect("/admin/add-mini-project");
});

router.get("/mini-project-list", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM mini_projects");
        res.render("admin/mini-project-list", { projects });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-mini-project/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM mini_projects WHERE ProjectID = ?", [req.params.id]);
        if (!projects.length) return res.status(404).send("Project not found");
        res.render("admin/edit-mini-project", { project: projects[0] });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-mini-project/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body;
    var projectId = req.params.id;
    var image = d.oldImage;
    var zipFile = d.oldZipFile;
    if (req.files && req.files.ProjectImage) { image = "uploads/" + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/" + image); }
    if (req.files && req.files.ProjectZIPFile) { zipFile = "uploads/" + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/" + zipFile); }
    var sql = `UPDATE mini_projects SET ProjectTitle='${d.ProjectTitle}',ProjectCategory='${d.ProjectCategory}',ProjectDescription='${d.ProjectDescription}',Price='${d.Price}',Rating='${d.Rating}',Author='${d.Author}',ProjectImage='${image}',ProjectZIPFile='${zipFile}' WHERE ProjectID='${projectId}'`;
    await exe(sql);
    res.redirect("/admin/mini-project-list");
});

router.get("/delete-mini-project/:id", isAdminLoggedIn, async function (req, res) {
    await exe(`DELETE FROM mini_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/mini-project-list");
});

// =============================================
// BUNDLE PROJECTS
// =============================================

router.get("/add-bundle-project", isAdminLoggedIn, async function (req, res) {
    res.render("admin/add-bundle-project.ejs");
});

router.post("/save-bundle-project", isAdminLoggedIn, async function (req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name;
        req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : "";
        if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var documentation = req.files?.documentation ? prefix + req.files.documentation.name : "";
        if (documentation) req.files.documentation.mv("public/uploads/" + documentation);
        var ppt = req.files?.ppt ? prefix + req.files.ppt.name : "";
        if (ppt) req.files.ppt.mv("public/uploads/" + ppt);
        var report = req.files?.report ? prefix + req.files.report.name : "";
        if (report) req.files.report.mv("public/uploads/" + report);
        var d = req.body;
        var sql = `INSERT INTO bundle_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Documentation,PPT,Report,Price,Rating,Author) VALUES ('${d.title}','${d.category}','${d.description}','${image}','${zipFile}','${documentation}','${ppt}','${report}','${d.price}','${d.rating}','${d.author}')`;
        await exe(sql);
    }
    res.redirect("/admin/add-bundle-project");
});

router.get("/bundle-project-list", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM bundle_projects");
        res.render("admin/bundle-project-list", { projects });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-bundle-project/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM bundle_projects WHERE ProjectID = ?", [req.params.id]);
        if (!projects.length) return res.status(404).send("Project not found");
        res.render("admin/edit-bundle-project", { project: projects[0] });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-bundle-project/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage, zipFile = d.oldZipFile, documentation = d.oldDocumentation, ppt = d.oldPPT, report = d.oldReport;
    if (req.files?.ProjectImage) { image = "uploads/" + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/" + image); }
    if (req.files?.ProjectZIPFile) { zipFile = "uploads/" + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/" + zipFile); }
    if (req.files?.Documentation) { documentation = "uploads/" + req.files.Documentation.name; req.files.Documentation.mv("public/" + documentation); }
    if (req.files?.PPT) { ppt = "uploads/" + req.files.PPT.name; req.files.PPT.mv("public/" + ppt); }
    if (req.files?.Report) { report = "uploads/" + req.files.Report.name; req.files.Report.mv("public/" + report); }
    var sql = `UPDATE bundle_projects SET ProjectTitle='${d.ProjectTitle}',ProjectCategory='${d.ProjectCategory}',ProjectDescription='${d.ProjectDescription}',Price='${d.Price}',Rating='${d.Rating}',Author='${d.Author}',ProjectImage='${image}',ProjectZIPFile='${zipFile}',Documentation='${documentation}',PPT='${ppt}',Report='${report}' WHERE ProjectID='${projectId}'`;
    await exe(sql);
    res.redirect("/admin/bundle-project-list");
});

router.get("/delete-bundle-project/:id", isAdminLoggedIn, async function (req, res) {
    await exe(`DELETE FROM bundle_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/bundle-project-list");
});

// =============================================
// CUSTOMIZED PROJECTS
// =============================================

router.get("/customized-project-list", isAdminLoggedIn, async (req, res) => {
    try {
        const projects = await exe("SELECT * FROM `customized_projects`");
        res.render("admin/customized-project-list", { projects });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.get("/delete-customized-project/:id", isAdminLoggedIn, async (req, res) => {
    await exe(`DELETE FROM customized_projects WHERE id = ?`, [req.params.id]);
    res.redirect("/admin/customized-project-list");
});

router.get("/edit-customized-project/:id", isAdminLoggedIn, async (req, res) => {
    const [project] = await exe(`SELECT * FROM customized_projects WHERE id = ?`, [req.params.id]);
    res.render("admin/edit-customized-project", { project });
});

router.post("/update-customized-project/:id", isAdminLoggedIn, async (req, res) => {
    let { name, email, phone, technology, description } = req.body;
    await exe(`UPDATE customized_projects SET name=?,email=?,phone=?,technology=?,description=? WHERE id=?`, [name, email, phone, technology, description, req.params.id]);
    res.redirect("/admin/customized-project-list");
});

// =============================================
// CATEGORIES
// =============================================

router.get("/add-category", isAdminLoggedIn, function (req, res) {
    res.render("admin/add-category");
});

router.post("/save-category", isAdminLoggedIn, async function (req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name;
        req.files.image.mv("public/uploads/" + image);
        var d = req.body;
        await exe(`INSERT INTO categories (name,image,price,description,link) VALUES (?,?,?,?,?)`, [d.name, image, d.price, d.description, d.link]);
    }
    res.redirect("/admin/add-category");
});

router.get("/view-categories", isAdminLoggedIn, async function (req, res) {
    var categories = await exe("SELECT * FROM categories");
    res.render("admin/view-categories", { categories });
});

router.get("/delete-category/:id", isAdminLoggedIn, async (req, res) => {
    await exe(`DELETE FROM categories WHERE id = ?`, [req.params.id]);
    res.redirect("/admin/view-categories");
});

router.get("/edit-category/:id", isAdminLoggedIn, async (req, res) => {
    const [category] = await exe(`SELECT * FROM categories WHERE id = ?`, [req.params.id]);
    res.render("admin/edit-category", { category });
});

router.post("/update-category/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { CategoryName, CategoryPrice, CategoryDescription, CategoryLink, OldImage } = req.body;
        let image = OldImage;
        if (req.files?.CategoryImage) {
            const file = req.files.CategoryImage;
            image = Date.now() + '-' + file.name.replace(/\s+/g, '-');
            await file.mv(path.join(__dirname, '../public/uploads', image));
            if (OldImage) { const oldPath = path.join(__dirname, '../public/uploads', OldImage); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
        }
        await exe(`UPDATE categories SET name=?,price=?,description=?,link=?,image=? WHERE id=?`, [CategoryName, CategoryPrice, CategoryDescription, CategoryLink, image, id]);
        res.redirect("/admin/view-categories");
    } catch (error) { res.status(500).send("Error updating category"); }
});

// =============================================
// CONTACT REQUESTS
// =============================================

router.get("/contact-request-list", isAdminLoggedIn, async (req, res) => {
    try {
        const comments = await exe("SELECT * FROM `comments`");
        res.render("admin/contact-request-list", { comments });
    } catch (error) { res.status(500).send("Internal Server Error"); }
});

router.get("/delete-contact/:id", isAdminLoggedIn, async (req, res) => {
    await exe("DELETE FROM comments WHERE id = ?", [req.params.id]);
    res.redirect("/admin/contact-request-list");
});

// =============================================
// ROADMAPS
// =============================================

router.get("/add-roadmap", isAdminLoggedIn, function (req, res) {
    res.render("admin/add-roadmap");
});

router.post("/save-roadmap", isAdminLoggedIn, async function (req, res) {
    if (req.files) {
        var image = Date.now() + "-" + req.files.image.name.replace(/\s+/g, "-");
        req.files.image.mv("public/uploads/" + image);
        var d = req.body;
        await exe(`INSERT INTO roadmaps (title,short_description,image,category,duration) VALUES (?,?,?,?,?)`, [d.title, d.short_description, image, d.category, d.duration]);
    }
    res.redirect("/admin/add-roadmap");
});

router.get("/view-roadmaps", isAdminLoggedIn, async function (req, res) {
    var roadmaps = await exe("SELECT * FROM roadmaps");
    res.render("admin/view-roadmaps", { roadmaps });
});

router.get("/delete-roadmap/:id", isAdminLoggedIn, async (req, res) => {
    await exe(`DELETE FROM roadmaps WHERE id = ?`, [req.params.id]);
    res.redirect("/admin/view-roadmaps");
});

router.get("/edit-roadmap/:id", isAdminLoggedIn, async (req, res) => {
    const [roadmap] = await exe(`SELECT * FROM roadmaps WHERE id = ?`, [req.params.id]);
    res.render("admin/edit-roadmap", { roadmap });
});

router.post("/update-roadmap/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, short_description, category, duration, OldImage } = req.body;
        let image = OldImage;
        if (req.files && req.files.image) {
            const file = req.files.image;
            image = Date.now() + "-" + file.name.replace(/\s+/g, "-");
            await file.mv(path.join(__dirname, "../public/uploads", image));
            if (OldImage) { const oldPath = path.join(__dirname, "../public/uploads", OldImage); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
        }
        await exe(`UPDATE roadmaps SET title=?,short_description=?,category=?,duration=?,image=? WHERE id=?`, [title, short_description, category, duration, image, id]);
        res.redirect("/admin/view-roadmaps");
    } catch (error) { res.status(500).send("Error updating roadmap"); }
});

// =============================================
// ECOMMERCE PROJECTS
// =============================================

router.get("/add-ecommerce-projects", isAdminLoggedIn, async function(req, res) { res.render("admin/add-ecommerce-projects.ejs"); });

router.post("/save-ecommerce-projects", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO ecommerce_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?,?)`, [d.title, d.category, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-ecommerce-projects");
});

router.get("/ecommerce-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ecommerce_projects"); res.render("admin/ecommerce-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-ecommerce-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ecommerce_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-ecommerce-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-ecommerce-project/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE ecommerce_projects SET ProjectTitle=?,ProjectCategory=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectCategory, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/ecommerce-project-list");
});

router.get("/delete-ecommerce-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM ecommerce_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/ecommerce-project-list");
});

// =============================================
// WEB DEVELOPMENT PROJECTS
// =============================================

router.get("/add-web-development-projects", isAdminLoggedIn, async function(req, res) { res.render("admin/add-web-development-projects.ejs"); });

router.post("/save-web-development-projects", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO web_development_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Technologies,Compatibility) VALUES (?,?,?,?,?,?,?,?,?)`, [d.title, d.category, d.description, image, zipFile, d.price, d.rating, d.technologies, d.compatibility]);
    }
    res.redirect("/admin/add-web-development-projects");
});

router.get("/web-development-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM web_development_projects"); res.render("admin/web-development-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-web-development-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM web_development_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-web-development-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-web-development-project/:id", isAdminLoggedIn, async function (req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE web_development_projects SET ProjectTitle=?,ProjectCategory=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Technologies=?,Compatibility=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectCategory, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Technologies, d.Compatibility, projectId]);
    res.redirect("/admin/web-development-project-list");
});

router.get("/delete-web-development-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM web_development_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/web-development-project-list");
});

// =============================================
// FULLSTACK PROJECTS
// =============================================

router.get("/add-fullstack-projects", isAdminLoggedIn, async (req, res) => { res.render("admin/add-fullstack-projects"); });

router.post("/save-fullstack-projects", isAdminLoggedIn, async (req, res) => {
    if (req.files) {
        const image = prefix + req.files.image.name; await req.files.image.mv("public/uploads/" + image);
        let zipFile = ""; if (req.files.zipFile) { zipFile = prefix + req.files.zipFile.name; await req.files.zipFile.mv("public/uploads/" + zipFile); }
        const { title, category, description, price, rating, author } = req.body;
        await exe(`INSERT INTO fullstack_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?,?)`, [title, category, description, image, zipFile, price, rating, author]);
    }
    res.redirect("/admin/add-fullstack-projects");
});

router.get("/fullstack-project-list", isAdminLoggedIn, async (req, res) => {
    const projects = await exe("SELECT * FROM fullstack_projects");
    res.render("admin/fullstack-project-list", { projects });
});

router.get("/edit-fullstack-project/:id", isAdminLoggedIn, async (req, res) => {
    const [project] = await exe("SELECT * FROM fullstack_projects WHERE ProjectID = ?", [req.params.id]);
    res.render("admin/edit-fullstack-project", { project });
});

router.post("/edit-fullstack-project/:id", isAdminLoggedIn, async (req, res) => {
    const { ProjectTitle, ProjectCategory, ProjectDescription, Price, Rating, Author, oldImage, oldZIPFile } = req.body;
    let image = oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; await req.files.ProjectImage.mv("public/uploads/" + image); }
    let zipFile = oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; await req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE fullstack_projects SET ProjectTitle=?,ProjectCategory=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [ProjectTitle, ProjectCategory, ProjectDescription, image, zipFile, Price, Rating, Author, req.params.id]);
    res.redirect("/admin/fullstack-project-list");
});

router.get("/delete-fullstack-project/:id", isAdminLoggedIn, async (req, res) => {
    await exe("DELETE FROM fullstack_projects WHERE ProjectID = ?", [req.params.id]);
    res.redirect("/admin/fullstack-project-list");
});

// =============================================
// MOBILE PROJECTS
// =============================================

router.get("/add-mobile-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-mobile-project.ejs"); });

router.post("/save-mobile-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO mobile_projects (ProjectTitle,ProjectCategory,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?,?)`, [d.title, d.category, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-mobile-project");
});

router.get("/mobile-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM mobile_projects"); res.render("admin/mobile-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-mobile-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM mobile_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-mobile-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-mobile-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE mobile_projects SET ProjectTitle=?,ProjectCategory=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectCategory, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/mobile-project-list");
});

router.get("/delete-mobile-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM mobile_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/mobile-project-list");
});

// =============================================
// AI / ML PROJECTS
// =============================================

router.get("/add-ai-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-ai-project.ejs"); });

router.post("/save-ai-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO ai_projects (ProjectTitle,ProjectType,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?,?)`, [d.title, d.type, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-ai-project");
});

router.get("/ai-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ai_projects"); res.render("admin/ai-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-ai-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ai_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-ai-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-ai-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE ai_projects SET ProjectTitle=?,ProjectType=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectType, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/ai-project-list");
});

router.get("/delete-ai-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM ai_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/ai-project-list");
});

// =============================================
// DATA SCIENCE PROJECTS
// =============================================

router.get("/add-ds-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-ds-project.ejs"); });

router.post("/save-ds-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO ds_projects (ProjectTitle,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?)`, [d.title, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-ds-project");
});

router.get("/ds-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ds_projects"); res.render("admin/ds-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-ds-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM ds_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-ds-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-ds-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE ds_projects SET ProjectTitle=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/ds-project-list");
});

router.get("/delete-ds-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM ds_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/ds-project-list");
});

// =============================================
// GAMING PROJECTS
// =============================================

router.get("/add-gaming-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-gaming-project.ejs"); });

router.post("/save-gaming-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO gaming_projects (ProjectTitle,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?)`, [d.title, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-gaming-project");
});

router.get("/gaming-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM gaming_projects"); res.render("admin/gaming-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-gaming-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM gaming_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-gaming-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-gaming-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE gaming_projects SET ProjectTitle=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/gaming-project-list");
});

router.get("/delete-gaming-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM gaming_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/gaming-project-list");
});

// =============================================
// CYBER SECURITY PROJECTS
// =============================================

router.get("/add-cyber-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-cyber-project.ejs"); });

router.post("/save-cyber-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO cyber_projects (ProjectTitle,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?)`, [d.title, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-cyber-project");
});

router.get("/cyber-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM cyber_projects"); res.render("admin/cyber-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-cyber-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM cyber_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-cyber-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-cyber-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE cyber_projects SET ProjectTitle=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/cyber-project-list");
});

router.get("/delete-cyber-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM cyber_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/cyber-project-list");
});

// =============================================
// BLOCKCHAIN PROJECTS
// =============================================

router.get("/add-blockchain-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-blockchain-project.ejs"); });

router.post("/save-blockchain-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO blockchain_projects (ProjectTitle,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?)`, [d.title, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-blockchain-project");
});

router.get("/blockchain-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM blockchain_projects"); res.render("admin/blockchain-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-blockchain-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM blockchain_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-blockchain-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-blockchain-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE blockchain_projects SET ProjectTitle=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/blockchain-project-list");
});

router.get("/delete-blockchain-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM blockchain_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/blockchain-project-list");
});

// =============================================
// CLOUD & DEVOPS PROJECTS
// =============================================

router.get("/add-cloud-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-cloud-project.ejs"); });

router.post("/save-cloud-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO cloud_projects (ProjectTitle,ProjectType,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?,?)`, [d.title, d.type, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-cloud-project");
});

router.get("/cloud-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM cloud_projects"); res.render("admin/cloud-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-cloud-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM cloud_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-cloud-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-cloud-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE cloud_projects SET ProjectTitle=?,ProjectType=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectType, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/cloud-project-list");
});

router.get("/delete-cloud-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM cloud_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/cloud-project-list");
});

// =============================================
// E-LEARNING PROJECTS
// =============================================

router.get("/add-elearning-project", isAdminLoggedIn, async function(req, res) { res.render("admin/add-elearning-project.ejs"); });

router.post("/save-elearning-project", isAdminLoggedIn, async function(req, res) {
    if (req.files) {
        var image = prefix + req.files.image.name; req.files.image.mv("public/uploads/" + image);
        var zipFile = req.files?.zipFile ? prefix + req.files.zipFile.name : ""; if (zipFile) req.files.zipFile.mv("public/uploads/" + zipFile);
        var d = req.body;
        await exe(`INSERT INTO elearning_projects (ProjectTitle,ProjectDescription,ProjectImage,ProjectZIPFile,Price,Rating,Author) VALUES (?,?,?,?,?,?,?)`, [d.title, d.description, image, zipFile, d.price, d.rating, d.author]);
    }
    res.redirect("/admin/add-elearning-project");
});

router.get("/elearning-project-list", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM elearning_projects"); res.render("admin/elearning-project-list", { projects }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.get("/edit-elearning-project/:id", isAdminLoggedIn, async (req, res) => {
    try { const projects = await exe("SELECT * FROM elearning_projects WHERE ProjectID = ?", [req.params.id]); if (!projects.length) return res.status(404).send("Not found"); res.render("admin/edit-elearning-project", { project: projects[0] }); }
    catch (error) { res.status(500).send("Server Error"); }
});

router.post("/edit-elearning-project/:id", isAdminLoggedIn, async function(req, res) {
    var d = req.body; var projectId = req.params.id;
    var image = d.oldImage; if (req.files?.ProjectImage) { image = prefix + req.files.ProjectImage.name; req.files.ProjectImage.mv("public/uploads/" + image); }
    var zipFile = d.oldZIPFile; if (req.files?.ProjectZIPFile) { zipFile = prefix + req.files.ProjectZIPFile.name; req.files.ProjectZIPFile.mv("public/uploads/" + zipFile); }
    await exe(`UPDATE elearning_projects SET ProjectTitle=?,ProjectDescription=?,ProjectImage=?,ProjectZIPFile=?,Price=?,Rating=?,Author=? WHERE ProjectID=?`, [d.ProjectTitle, d.ProjectDescription, image, zipFile, d.Price, d.Rating, d.Author, projectId]);
    res.redirect("/admin/elearning-project-list");
});

router.get("/delete-elearning-project/:id", isAdminLoggedIn, async function(req, res) {
    await exe(`DELETE FROM elearning_projects WHERE ProjectID = ?`, [req.params.id]);
    res.redirect("/admin/elearning-project-list");
});

// =============================================
// ORDERS / PAYMENT MANAGEMENT
// =============================================

router.get("/orders", isAdminLoggedIn, async (req, res) => {
    try {
        const orders = await exe("SELECT * FROM orders ORDER BY created_at DESC");
        res.render("admin/orders.ejs", { orders });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.get("/order-details/:id", isAdminLoggedIn, async (req, res) => {
    try {
        const orders = await exe("SELECT * FROM orders WHERE id = ?", [req.params.id]);
        if (!orders.length) return res.status(404).send("Order not found");
        res.render("admin/order-details.ejs", { order: orders[0] });
    } catch (error) { res.status(500).send("Server Error"); }
});

router.get("/delete-order/:id", isAdminLoggedIn, async (req, res) => {
    try {
        await exe("DELETE FROM orders WHERE id = ?", [req.params.id]);
        res.redirect("/admin/orders");
    } catch (error) { res.status(500).send("Server Error"); }
});

router.post("/update-order-status/:id", isAdminLoggedIn, async (req, res) => {
    try {
        await exe("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
        res.redirect("/admin/orders");
    } catch (error) { res.status(500).send("Server Error"); }
});

// =============================================
// API: PROJECT COUNTS FOR SIDEBAR
// =============================================

router.get("/api/project-counts", isAdminLoggedIn, async (req, res) => {
    try {
        const tables = [
            ['ready_projects', 'ready'], ['mini_projects', 'mini'],
            ['bundle_projects', 'bundle'], ['customized_projects', 'customized'],
            ['ecommerce_projects', 'ecommerce'], ['web_development_projects', 'web'],
            ['fullstack_projects', 'fullstack'], ['mobile_projects', 'mobile'],
            ['ai_projects', 'ai'], ['ds_projects', 'ds'],
            ['gaming_projects', 'gaming'], ['cyber_projects', 'cyber'],
            ['blockchain_projects', 'blockchain'], ['cloud_projects', 'cloud'],
            ['elearning_projects', 'elearning'],
        ];
        const counts = {};
        for (const [table, key] of tables) {
            try {
                const [r] = await exe(`SELECT COUNT(*) as count FROM \`${table}\``);
                counts[key] = r.count || 0;
            } catch { counts[key] = 0; }
        }
        const [orders] = await exe(`SELECT COUNT(*) as count FROM orders WHERE status='PAID'`);
        const [contacts] = await exe(`SELECT COUNT(*) as count FROM comments`);
        counts.orders = orders.count || 0;
        counts.contacts = contacts.count || 0;
        res.json(counts);
    } catch (err) { res.json({}); }
});

module.exports = router;

