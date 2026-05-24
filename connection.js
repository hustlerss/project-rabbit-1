require("dotenv").config();
const { Pool } = require("pg");

// 🔥 Connect using environment variables or fall back to local PostgreSQL defaults
const pool = new Pool({
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD !== undefined ? process.env.PGPASSWORD : "",
    database: process.env.PGDATABASE || "kanak_digifex_project_mart",
    port: parseInt(process.env.PGPORT || "5432", 10)
});

// Test connection at start
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Database connection failed:", err.stack);
        return;
    }
    console.log("✅ Connected to PostgreSQL database successfully");
    release();
});

/**
 * Executes a PostgreSQL database query.
 * Handles MySQL compatibility by:
 * 1. Converting MySQL-style '?' placeholders to PostgreSQL '$1', '$2', etc.
 * 2. Stripping MySQL backticks (`) from SQL identifiers.
 * 3. Returning the rows array directly to mimic MySQL's query callback structure.
 */
async function exe(sql, params = []) {
    // 1. Convert standard '?' placeholders to '$1, $2, ...'
    let paramIndex = 1;
    let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    // 2. Strip MySQL backticks (`) to make identifier queries PG-compliant
    pgSql = pgSql.replace(/`/g, "");

    try {
        const res = await pool.query(pgSql, params);
        return res.rows;
    } catch (err) {
        console.error("❌ Database query error:", err.message);
        console.error("Failed query:", pgSql);
        console.error("Parameters:", params);
        throw err;
    }
}

module.exports = exe;
console.log("DB NAME:", process.env.PGDATABASE || "kanak_digifex_project_mart");