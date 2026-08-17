const bcrypt = require("bcryptjs");
const db = require("./database");

// ======================================================
// ADMIN PASSWORD RESET
// ======================================================

// Admin account details
const adminEmail = "admin@pg.com";
const newPassword = "Admin@PG2026";

// ======================================================
// FIND ADMIN
// ======================================================

const admin = db.prepare(`
    SELECT *
    FROM users
    WHERE email = ?
      AND role = 'admin'
`).get(adminEmail);

if (!admin) {

    console.log("❌ Admin account not found.");

    console.log(
        `Make sure an admin exists with email: ${adminEmail}`
    );

    process.exit(1);
}

// ======================================================
// HASH NEW PASSWORD
// ======================================================

const hashedPassword = bcrypt.hashSync(
    newPassword,
    10
);

// ======================================================
// UPDATE PASSWORD
// ======================================================

const result = db.prepare(`
    UPDATE users
    SET password = ?
    WHERE id = ?
      AND role = 'admin'
`).run(
    hashedPassword,
    admin.id
);

// ======================================================
// RESULT
// ======================================================

if (result.changes === 1) {

    console.log("");
    console.log("======================================");
    console.log(" ADMIN PASSWORD RESET SUCCESSFUL");
    console.log("======================================");
    console.log("");
    console.log("Email    :", adminEmail);
    console.log("Password :", newPassword);
    console.log("");
    console.log("You can now use these credentials");
    console.log("on the Admin Login page.");
    console.log("");

} else {

    console.log("❌ Password was not updated.");

}