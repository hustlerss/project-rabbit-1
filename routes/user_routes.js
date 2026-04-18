var express = require("express");
var exe = require("./../connection");
var router = express.Router();
router.use("/uploads", express.static("public/uploads"));
router.use(express.urlencoded({ extended: true }));


// Route for home page (index.ejs)
router.get("/", async function (req, res) {
    try {
        var sql = `SELECT * FROM categories`;
        var categories = await exe(sql);
        res.render("user/index.ejs", { categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.render("user/index.ejs", { categories: [] });
    }
});

router.get("/about", async function (req, res) {
    res.render("user/about.ejs");
});

router.get("/contact", async function (req, res) {
    res.render("user/contact.ejs");
});

router.get("/cart", async function (req, res) {
    res.render("user/cart.ejs");
});

router.get("/checkout", async function (req, res) {
    res.render("user/checkout.ejs", {
        razorpay_key: process.env.RAZORPAY_KEY_ID || ""
    });
});

router.get("/project_details", async function (req, res) {
    res.render("user/project_details.ejs");
});

router.get("/blogs", async function (req, res) {
    res.render("user/blogs.ejs");
});

router.get("/blog-details", async function (req, res) {
    res.render("user/blog-details.ejs");
});

router.get("/ready-project-details", async function (req, res) {
    var sql = `SELECT * FROM ready_projects`;
    var ready_projects = await exe(sql);
    res.render("user/ready-project-details.ejs", { ready_projects });
});

router.get("/single-project-details/:id", async function (req, res) {
    var sql = `SELECT * FROM ready_projects WHERE ProjectID = ?`;
    var result = await exe(sql, [req.params.id]);
    res.render("user/single-project-details.ejs", { single_ready_projects: result[0] });
});

router.get("/mini-project-details", async function (req, res) {
    var sql = `SELECT * FROM mini_projects`;
    var mini_projects = await exe(sql);
    res.render("user/mini-project-details.ejs", { mini_projects });
});

router.get("/mini-singlepage-project-details/:id", async function (req, res) {
    var sql = `SELECT * FROM mini_projects WHERE ProjectID = ?`;
    var result = await exe(sql, [req.params.id]);
    res.render("user/mini-singlepage-project-details.ejs", { single_mini_project: result[0] });
});

router.get("/bundle-project-details", async function (req, res) {
    var sql = `SELECT * FROM bundle_projects`;
    var bundle_projects = await exe(sql);
    res.render("user/bundle-project-details.ejs", { bundle_projects });
});

router.get("/bundle-singlepage-project-details/:id", async function (req, res) {
    var sql = `SELECT * FROM bundle_projects WHERE ProjectID = ?`;
    var result = await exe(sql, [req.params.id]);
    res.render("user/bundle-singlepage-project-details.ejs", { single_bundle_project: result[0] });
});

router.get("/customized-project-details", async function (req, res) {
    res.render("user/customized-project-details.ejs");
});

router.get("/customized-singlepage-project-details", async function (req, res) {
    res.render("user/customized-singlepage-project-details.ejs");
});

router.get("/languages", async function (req, res) {
    res.render("user/languages.ejs");
});

// Handle Form Submission - Customized Project
router.post("/submit_project", async function (req, res) {
    try {
        var d = req.body;
        var sql = `INSERT INTO customized_projects (name, email, phone, technology, description) 
                   VALUES (?, ?, ?, ?, ?)`;
        await exe(sql, [d.name, d.email, d.phone, d.technology, d.description]);
        res.redirect("/customized-project-details");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Database error");
    }
});

// Contact form submission
router.post("/submit-comment", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        }

        const sql = `INSERT INTO comments (name, email, message) VALUES (?, ?, ?)`;
        await exe(sql, [name, email, message]);

        res.json({ success: true, message: "Thank you for contacting us! Our representative will contact you soon." });
    } catch (err) {
        console.error("Error inserting comment:", err);
        res.status(500).json({ success: false, message: "An error occurred while processing your request" });
    }
});

router.get('/roadmaps', async (req, res) => {
    try {
        const query = 'SELECT title, short_description, image, category, duration FROM roadmaps';
        const results = await exe(query);
        res.render('user/roadmaps', { roadmaps: results });
    } catch (err) {
        console.error('Error fetching roadmaps:', err);
        res.status(500).send('Database error');
    }
});

router.get("/roadmaps-indetail", async function (req, res) {
    res.render("user/roadmaps-indetail.ejs");
});

// =============================================
// RAZORPAY PAYMENT INTEGRATION
// =============================================

const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        const { amount, currency, projectTitle, projectId, projectType } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const options = {
            amount: Math.round(parseFloat(amount) * 100), // Convert to paise
            currency: currency || "INR",
            receipt: `order_${Date.now()}`,
            notes: {
                projectTitle: projectTitle || "",
                projectId: projectId || "",
                projectType: projectType || ""
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ success: false, message: "Payment initiation failed: " + err.message });
    }
});

// Verify Razorpay Payment & Save Order
router.post("/verify-payment", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            projectId,
            projectType,
            projectTitle,
            amount,
            buyerName,
            buyerEmail,
            buyerPhone
        } = req.body;

        // Verify payment signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed! Invalid signature." });
        }

        // Save order to database
        const sql = `INSERT INTO orders 
            (order_id, payment_id, project_id, project_type, project_title, amount, buyer_name, buyer_email, buyer_phone, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())`;

        await exe(sql, [
            razorpay_order_id,
            razorpay_payment_id,
            projectId,
            projectType,
            projectTitle,
            amount,
            buyerName,
            buyerEmail,
            buyerPhone
        ]);

        res.json({
            success: true,
            message: "Payment verified successfully!",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
        });
    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ success: false, message: "Error processing payment verification: " + err.message });
    }
});

// Download project after successful payment
router.get("/download/:paymentId/:projectType/:projectId", async (req, res) => {
    try {
        const { paymentId, projectType, projectId } = req.params;

        // Verify the payment exists and is valid
        const orderCheck = await exe(
            "SELECT * FROM orders WHERE payment_id = ? AND project_id = ? AND project_type = ? AND status = 'PAID'",
            [paymentId, projectId, projectType]
        );

        if (!orderCheck || orderCheck.length === 0) {
            return res.status(403).send("Access denied. Valid payment required to download this project.");
        }

        const tableMap = {
            "ready": "ready_projects",
            "mini": "mini_projects",
            "bundle": "bundle_projects",
            "ecommerce": "ecommerce_projects",
            "web": "web_development_projects",
            "fullstack": "fullstack_projects",
            "mobile": "mobile_projects",
            "ai": "ai_projects",
            "ds": "ds_projects",
            "gaming": "gaming_projects",
            "cyber": "cyber_projects",
            "blockchain": "blockchain_projects",
            "cloud": "cloud_projects",
            "elearning": "elearning_projects"
        };

        const tableName = tableMap[projectType];
        if (!tableName) return res.status(400).send("Invalid project type.");

        const projectData = await exe(`SELECT ProjectZIPFile FROM ${tableName} WHERE ProjectID = ?`, [projectId]);

        if (!projectData || projectData.length === 0) {
            return res.status(404).send("Project not found.");
        }

        const path = require("path");
        const fs = require("fs");
        const zipFileName = projectData[0].ProjectZIPFile;
        const zipPath = path.join(__dirname, "../public/uploads", zipFileName);

        if (!fs.existsSync(zipPath)) {
            return res.status(404).send("Project file not found on server. Please contact support.");
        }

        res.download(zipPath, zipFileName);
    } catch (err) {
        console.error("Error during download:", err);
        res.status(500).send("Download failed. Please contact support.");
    }
});

// View payment history (by email)
router.get("/my-orders", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.render("user/my-orders.ejs", { orders: [], email: "" });

    try {
        const orders = await exe(
            "SELECT * FROM orders WHERE buyer_email = ? ORDER BY created_at DESC",
            [email]
        );
        res.render("user/my-orders.ejs", { orders, email });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.render("user/my-orders.ejs", { orders: [], email });
    }
});


// =============================================
// E-LEARNING PROJECTS USER ROUTES
// =============================================

router.get("/elearning-projects", async function (req, res) {
    var sql = `SELECT * FROM elearning_projects`;
    var elearning_projects = await exe(sql);
    res.render("user/elearning-projects.ejs", { elearning_projects });
});

router.get("/single-elearning-project/:id", async function (req, res) {
    var sql = `SELECT * FROM elearning_projects WHERE ProjectID = ?`;
    var result = await exe(sql, [req.params.id]);
    res.render("user/single-elearning-project.ejs", { single_elearning_project: result[0] });
});

// =============================================
// CLOUD & DEVOPS PROJECTS USER ROUTES
// =============================================

router.get("/cloud-projects", async function (req, res) {
    var sql = `SELECT * FROM cloud_projects`;
    var cloud_projects = await exe(sql);
    res.render("user/cloud-projects.ejs", { cloud_projects });
});

router.get("/single-cloud-project/:id", async function (req, res) {
    var sql = `SELECT * FROM cloud_projects WHERE ProjectID = ?`;
    var result = await exe(sql, [req.params.id]);
    res.render("user/single-cloud-project.ejs", { single_cloud_project: result[0] });
});

// MUST be at the end
module.exports = router;
