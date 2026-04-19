require("dotenv").config();
const express = require("express");
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var session = require("express-session");
var path = require("path");
var user_route = require("./routes/user_routes");
var admin_route = require("./routes/admin_routes");

const app = express();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use(express.static("public/"));
app.use(session({
    secret: process.env.SESSION_SECRET || "kanak_digifex_project_mart_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Routes
app.use("/", user_route);
app.use("/admin", admin_route);

// 404 handler
app.use((req, res) => {
    res.status(404).render("user/index.ejs", { categories: [] });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong! Please try again later.");
});

const PORT = process.env.PORT || 1000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📌 Admin Panel: http://localhost:${PORT}/admin`);
});
