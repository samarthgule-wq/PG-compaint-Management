const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const db = require("./database");

// ======================================================
// CREATE SECURE STAFF REGISTRATION KEY
// ======================================================

// Generate a random registration key
const registrationKey =
    "PG-" +
    crypto.randomBytes(12).toString("hex").toUpperCase();

// Hash the key before storing it in the database
const keyHash =
    bcrypt.hashSync(registrationKey, 10);

// Key will expire after 24 hours
const expiresAt =
    new Date(
        Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();


// ======================================================
// SAVE KEY HASH
// ======================================================

db.prepare(`
    INSERT INTO staff_invites
    (
        key_hash,
        used,
        expires_at
    )
    VALUES (?, 0, ?)
`).run(
    keyHash,
    expiresAt
);


// ======================================================
// SHOW KEY
// ======================================================

console.log("");
console.log("==========================================");
console.log(" STAFF REGISTRATION KEY CREATED");
console.log("==========================================");

console.log("");
console.log("Registration Key:");
console.log(registrationKey);

console.log("");
console.log("Expires:");
console.log(expiresAt);

console.log("");
console.log("IMPORTANT:");
console.log("Give this key only to the staff member.");
console.log("The key can be used only once.");
console.log("The database stores only a hashed version.");
console.log("");

console.log("==========================================");