const db = require("./database");
const bcrypt = require("bcryptjs");


// ======================================================
// STAFF ACCOUNT DETAILS
// CHANGE THESE VALUES BEFORE RUNNING
// ======================================================

const name = "New PG Staff";
const email = "newstaff@pg.com";
const password = "Staff@12345";


// ======================================================
// CHECK WHETHER EMAIL ALREADY EXISTS
// ======================================================

const existingUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);


if (existingUser) {

    console.log("❌ A user with this email already exists.");

    console.log("Existing account:");
    console.log({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
    });

    process.exit(1);
}


// ======================================================
// HASH PASSWORD
// ======================================================

const hashedPassword = bcrypt.hashSync(
    password,
    10
);


// ======================================================
// CREATE STAFF ACCOUNT
// ======================================================

const result = db.prepare(`
    INSERT INTO users
    (
        name,
        email,
        password,
        role
    )
    VALUES (?, ?, ?, ?)
`).run(
    name,
    email,
    hashedPassword,
    "staff"
);


// ======================================================
// SUCCESS MESSAGE
// ======================================================

console.log("");
console.log("========================================");
console.log(" STAFF ACCOUNT CREATED SUCCESSFULLY");
console.log("========================================");

console.log("ID:", result.lastInsertRowid);
console.log("Name:", name);
console.log("Email:", email);
console.log("Role: staff");

console.log("");
console.log("Login credentials:");
console.log("Email:", email);
console.log("Password:", password);

console.log("");
console.log("⚠️ Keep this password secure.");
console.log("========================================");