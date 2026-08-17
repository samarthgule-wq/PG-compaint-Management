const Database = require("better-sqlite3");
const path = require("path");


// ======================================================
// CONNECT TO SQLITE DATABASE
// ======================================================

const dbPath = path.join(__dirname, "complaints.db");
const db = new Database(dbPath);

console.log("SQLite database connected successfully");


// ======================================================
// CREATE COMPLAINTS TABLE
// ======================================================

const createComplaintsTable = `
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        resident_name TEXT NOT NULL,

        room_number TEXT NOT NULL,

        contact TEXT NOT NULL,

        category TEXT NOT NULL,

        description TEXT NOT NULL,

        date TEXT NOT NULL,

        priority TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'Pending',

        additional_info TEXT,

        staff_remarks TEXT,

        user_id INTEGER
    )
`;

db.prepare(createComplaintsTable).run();

console.log("Complaints table is ready");


// ======================================================
// ADD MISSING COMPLAINT COLUMNS
// ======================================================

const complaintColumns = db
    .prepare("PRAGMA table_info(complaints)")
    .all();


// ------------------------------------------------------
// staff_remarks
// ------------------------------------------------------

const hasStaffRemarks = complaintColumns.some(
    column => column.name === "staff_remarks"
);

if (!hasStaffRemarks) {

    db.prepare(
        "ALTER TABLE complaints ADD COLUMN staff_remarks TEXT"
    ).run();

    console.log("staff_remarks column added successfully");

} else {

    console.log("staff_remarks column already exists");

}


// ------------------------------------------------------
// user_id
// ------------------------------------------------------

const latestComplaintColumns = db
    .prepare("PRAGMA table_info(complaints)")
    .all();

const hasUserId = latestComplaintColumns.some(
    column => column.name === "user_id"
);

if (!hasUserId) {

    db.prepare(
        "ALTER TABLE complaints ADD COLUMN user_id INTEGER"
    ).run();

    console.log("user_id column added successfully");

} else {

    console.log("user_id column already exists");

}


// ======================================================
// CREATE USERS TABLE
// ======================================================

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        email TEXT NOT NULL UNIQUE,

        password TEXT NOT NULL,

        role TEXT NOT NULL DEFAULT 'resident',

        room_number TEXT,

        contact TEXT,

        staff_id TEXT

    )
`;

db.prepare(createUsersTable).run();

console.log("Users table is ready");


// ======================================================
// ADD MISSING USER COLUMNS
// ======================================================

let userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all();


// ------------------------------------------------------
// room_number
// ------------------------------------------------------

const hasRoomNumber = userColumns.some(
    column => column.name === "room_number"
);

if (!hasRoomNumber) {

    db.prepare(
        "ALTER TABLE users ADD COLUMN room_number TEXT"
    ).run();

    console.log("room_number column added successfully");

} else {

    console.log("room_number column already exists");

}


// ------------------------------------------------------
// contact
// ------------------------------------------------------

userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all();

const hasContact = userColumns.some(
    column => column.name === "contact"
);

if (!hasContact) {

    db.prepare(
        "ALTER TABLE users ADD COLUMN contact TEXT"
    ).run();

    console.log("contact column added successfully");

} else {

    console.log("contact column already exists");

}


// ------------------------------------------------------
// staff_id
// ------------------------------------------------------

userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all();

const hasStaffId = userColumns.some(
    column => column.name === "staff_id"
);

if (!hasStaffId) {

    db.prepare(
        "ALTER TABLE users ADD COLUMN staff_id TEXT"
    ).run();

    console.log("staff_id column added successfully");

} else {

    console.log("staff_id column already exists");

}


// ======================================================
// CREATE STAFF TABLE
// ======================================================

const createStaffTable = `
    CREATE TABLE IF NOT EXISTS staff (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        staff_id TEXT NOT NULL UNIQUE,

        user_id INTEGER NOT NULL UNIQUE,

        name TEXT NOT NULL,

        email TEXT NOT NULL UNIQUE,

        FOREIGN KEY (user_id)
            REFERENCES users(id)

    )
`;

db.prepare(createStaffTable).run();

console.log("Staff table is ready");


// ======================================================
// CREATE STAFF INVITES TABLE
// ======================================================
//
// Registration keys are stored as bcrypt hashes.
// The original registration key is NEVER stored.
//
// ======================================================

const createStaffInvitesTable = `
    CREATE TABLE IF NOT EXISTS staff_invites (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        key_hash TEXT NOT NULL,

        created_by INTEGER,

        used INTEGER NOT NULL DEFAULT 0,

        used_by INTEGER,

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        expires_at TEXT,

        used_at TEXT

    )
`;

db.prepare(createStaffInvitesTable).run();

console.log("Staff invites table is ready");


// ======================================================
// CREATE STAFF INVITE INDEX
// ======================================================

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_staff_invites_used
    ON staff_invites(used)
`).run();

console.log("Staff invite index is ready");


// ======================================================
// CREATE STAFF ID INDEX
// ======================================================

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_staff_staff_id
    ON staff(staff_id)
`).run();

console.log("Staff ID index is ready");


// ======================================================
// CREATE USER ROLE INDEX
// ======================================================

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role)
`).run();

console.log("User role index is ready");


// ======================================================
// EXPORT DATABASE
// ======================================================

module.exports = db;