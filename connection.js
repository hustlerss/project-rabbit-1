require("dotenv").config();
var mysql = require("mysql2");
var util = require("util");

// 🔥 Detect environment
const isProduction = process.env.MYSQLHOST ? true : false;

var conn = mysql.createConnection({
    host: isProduction ? process.env.MYSQLHOST : process.env.DB_HOST || "localhost",
    user: isProduction ? process.env.MYSQLUSER : process.env.DB_USER || "root",
    password: isProduction ? process.env.MYSQLPASSWORD : process.env.DB_PASSWORD || "",
    database: isProduction ? process.env.MYSQL_DATABASE : process.env.DB_NAME || "kanak_digifex_project_mart",
    port: isProduction ? process.env.MYSQLPORT : 3306
});

conn.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
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