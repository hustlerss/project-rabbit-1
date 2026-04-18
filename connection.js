require("dotenv").config();
var mysql = require("mysql");
var util = require("util");

var conn = mysql.createConnection({
    "host": process.env.DB_HOST || "localhost",
    "user": process.env.DB_USER || "root",
    "password": process.env.DB_PASSWORD || "",
    "database": process.env.DB_NAME || "kanak_digifex_project_mart"
});

conn.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database:', process.env.DB_NAME);
});

// Handle disconnections gracefully
conn.on('error', function(err) {
    console.error('MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection lost. Please restart the app.');
    }
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;
