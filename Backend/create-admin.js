require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./database");


// ======================================================
// ADMIN DETAILS
// ======================================================
//
// IMPORTANT:
// Change these values before running the script.
//
// After the admin is created, DO NOT expose the
// password anywhere in frontend files.
//
// ======================================================

const ADMIN_NAME = "PG Administrator";

const ADMIN_EMAIL = "admin@pg.com";

const ADMIN_PASSWORD = "Admin@PG2026";


// ======================================================
// CHECK PASSWORD
// ======================================================

if (
    !ADMIN_PASSWORD ||
    ADMIN_PASSWORD.length < 8
) {

    console.error(
        "Admin password must contain at least 8 characters."
    );

    process.exit(1);

}


// ======================================================
// NORMALIZE EMAIL
// ======================================================

const normalizedEmail =
    ADMIN_EMAIL.trim().toLowerCase();


// ======================================================
// CHECK WHETHER ADMIN ALREADY EXISTS
// ======================================================

const existingAdmin =
    db.prepare(`
        SELECT id, name, email, role
        FROM users
        WHERE email = ?
    `).get(
        normalizedEmail
    );


if (existingAdmin) {

    console.log(
        "An account already exists with this email."
    );

    console.log(
        existingAdmin
    );

    process.exit(0);

}


// ======================================================
// HASH ADMIN PASSWORD
// ======================================================

const hashedPassword =
    bcrypt.hashSync(
        ADMIN_PASSWORD,
        12
    );


// ======================================================
// CREATE ADMIN
// ======================================================

const result =
    db.prepare(`
        INSERT INTO users
        (
            name,
            email,
            password,
            role
        )
        VALUES (?, ?, ?, ?)
    `).run(

        ADMIN_NAME,

        normalizedEmail,

        hashedPassword,

        "admin"

    );


// ======================================================
// SUCCESS
// ======================================================

console.log("");
console.log("========================================");
console.log("ADMIN ACCOUNT CREATED SUCCESSFULLY");
console.log("========================================");
console.log("");

console.log(
    "Admin ID:",
    result.lastInsertRowid
);

console.log(
    "Admin Name:",
    ADMIN_NAME
);

console.log(
    "Admin Email:",
    normalizedEmail
);

console.log(
    "Role: admin"
);

console.log("");

console.log(
    "IMPORTANT: Keep the admin password private."
);

console.log("");