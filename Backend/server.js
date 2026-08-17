
// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

require("dotenv").config();


// ======================================================
// IMPORT PACKAGES
// ======================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================================================
// DATABASE
// ======================================================

const db = require("./database");


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

const authenticateToken =
    require("./middleware/authMiddleware");

const authorizeRole =
    require("./middleware/roleMiddleware");


// ======================================================
// CHECK JWT SECRET
// ======================================================

if (!process.env.JWT_SECRET) {

    console.error(
        "ERROR: JWT_SECRET is missing from .env"
    );

    process.exit(1);
}

const JWT_SECRET =
    process.env.JWT_SECRET;


// ======================================================
// CREATE EXPRESS APPLICATION
// ======================================================

const app = express();


// ======================================================
// SERVER CONFIGURATION
// ======================================================

const PORT = 5000;


// ======================================================
// BASIC MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// FRONTEND CONFIGURATION
// ======================================================

const frontendPath =
    path.resolve(
        __dirname,
        "..",
        "Frontend"
    );


console.log(
    "Frontend folder:",
    frontendPath
);


// ======================================================
// SERVE FRONTEND
// ======================================================

app.use(
    "/Frontend",
    express.static(frontendPath)
);


// ======================================================
// FRONTEND ROUTES
// ======================================================

app.get(
    "/Frontend/index.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );

    }
);


app.get(
    "/Frontend/resident/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "resident",
                "login.html"
            )
        );

    }
);


app.get(
    "/Frontend/resident/register.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "resident",
                "register.html"
            )
        );

    }
);


app.get(
    "/Frontend/resident/dashboard.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "resident",
                "dashboard.html"
            )
        );

    }
);


app.get(
    "/Frontend/staff/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "staff",
                "login.html"
            )
        );

    }
);


app.get(
    "/Frontend/staff/dashboard.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "staff",
                "dashboard.html"
            )
        );

    }
);


app.get(
    "/Frontend/admin/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "admin",
                "login.html"
            )
        );

    }
);


app.get(
    "/Frontend/admin/dashboard.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "admin",
                "dashboard.html"
            )
        );

    }
);


app.get(
    "/Frontend/admin/create-staff.html",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "admin",
                "create-staff.html"
            )
        );

    }
);


// ======================================================
// TEST API
// GET /
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            message:
                "PG Complaint Management API is running"

        });

    }
);


// ======================================================
// RESIDENT REGISTRATION
// POST /api/register
//
// PUBLIC REGISTRATION CAN ONLY CREATE RESIDENTS.
// ======================================================

app.post(
    "/api/register",
    (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Name, email, and password are required"

                });

            }


            // --------------------------------------------------
            // VALIDATE PASSWORD
            // --------------------------------------------------

            if (
                password.length < 6
            ) {

                return res.status(400).json({

                    message:
                        "Password must be at least 6 characters long"

                });

            }


            // --------------------------------------------------
            // CLEAN INPUT
            // --------------------------------------------------

            const cleanName =
                name.trim();

            const normalizedEmail =
                email.trim().toLowerCase();


            if (
                cleanName.length < 2
            ) {

                return res.status(400).json({

                    message:
                        "Please enter a valid name"

                });

            }


            // --------------------------------------------------
            // CHECK EMAIL
            // --------------------------------------------------

            const existingUser =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (existingUser) {

                return res.status(400).json({

                    message:
                        "Email is already registered"

                });

            }


            // --------------------------------------------------
            // HASH PASSWORD
            // --------------------------------------------------

            const hashedPassword =
                bcrypt.hashSync(
                    password,
                    10
                );


            // --------------------------------------------------
            // CREATE RESIDENT
            // --------------------------------------------------

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

                    cleanName,

                    normalizedEmail,

                    hashedPassword,

                    "resident"

                );


            return res.status(201).json({

                message:
                    "Resident registration successful",

                user_id:
                    result.lastInsertRowid,

                role:
                    "resident"

            });

        } catch (error) {

            console.error(
                "Resident registration error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to register resident"

            });

        }

    }
);


// ======================================================
// RESIDENT LOGIN
// POST /api/resident/login
// ======================================================

app.post(
    "/api/resident/login",
    (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Email and password are required"

                });

            }


            const normalizedEmail =
                email.trim().toLowerCase();


            const user =
                db.prepare(`
                    SELECT *
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (!user) {

                return res.status(401).json({

                    message:
                        "Invalid resident email or password"

                });

            }


            // --------------------------------------------------
            // RESIDENT ONLY
            // --------------------------------------------------

            if (
                user.role !== "resident"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. This login is only for residents"

                });

            }


            // --------------------------------------------------
            // PASSWORD CHECK
            // --------------------------------------------------

            const passwordMatches =
                bcrypt.compareSync(
                    password,
                    user.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    message:
                        "Invalid resident email or password"

                });

            }


            // --------------------------------------------------
            // JWT PAYLOAD
            // --------------------------------------------------

            const tokenData = {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    "resident"

            };


            // --------------------------------------------------
            // CREATE JWT
            // --------------------------------------------------

            const token =
                jwt.sign(
                    tokenData,
                    JWT_SECRET,
                    {
                        expiresIn: "2h"
                    }
                );


            return res.status(200).json({

                message:
                    "Resident login successful",

                token:
                    token,

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        "resident"

                }

            });

        } catch (error) {

            console.error(
                "Resident login error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to login"

            });

        }

    }
);


// ======================================================
// STAFF REGISTRATION
// POST /api/staff/register
//
// STAFF REGISTRATION REQUIRES ONE-TIME INVITE KEY.
// ======================================================

app.post(
    "/api/staff/register",
    (req, res) => {

        try {

            const {
                name,
                email,
                password,
                registration_key
            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !name ||
                !email ||
                !password ||
                !registration_key
            ) {

                return res.status(400).json({

                    message:
                        "Name, email, password, and registration key are required"

                });

            }


            const cleanName =
                name.trim();

            const normalizedEmail =
                email.trim().toLowerCase();

            const normalizedKey =
                registration_key.trim();


            // --------------------------------------------------
            // VALIDATE NAME
            // --------------------------------------------------

            if (
                cleanName.length < 2
            ) {

                return res.status(400).json({

                    message:
                        "Please enter a valid staff name"

                });

            }


            // --------------------------------------------------
            // VALIDATE PASSWORD
            // --------------------------------------------------

            if (
                password.length < 6
            ) {

                return res.status(400).json({

                    message:
                        "Password must be at least 6 characters long"

                });

            }


            // --------------------------------------------------
            // VALIDATE EMAIL
            // --------------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    normalizedEmail
                )
            ) {

                return res.status(400).json({

                    message:
                        "Please enter a valid email address"

                });

            }


            // --------------------------------------------------
            // CHECK EMAIL
            // --------------------------------------------------

            const existingUser =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (existingUser) {

                return res.status(400).json({

                    message:
                        "Email is already registered"

                });

            }


            // --------------------------------------------------
            // GET UNUSED INVITES
            // --------------------------------------------------

            const invites =
                db.prepare(`
                    SELECT *
                    FROM staff_invites
                    WHERE used = 0
                    ORDER BY id ASC
                `).all();


            let matchingInvite =
                null;


            // --------------------------------------------------
            // COMPARE REGISTRATION KEY
            // --------------------------------------------------

            for (
                const invite of invites
            ) {

                try {

                    const keyMatches =
                        bcrypt.compareSync(
                            normalizedKey,
                            invite.key_hash
                        );


                    if (
                        keyMatches
                    ) {

                        matchingInvite =
                            invite;

                        break;

                    }

                } catch (error) {

                    console.error(
                        "Invite key comparison error:",
                        error
                    );

                }

            }


            // --------------------------------------------------
            // INVALID KEY
            // --------------------------------------------------

            if (
                !matchingInvite
            ) {

                return res.status(403).json({

                    message:
                        "Invalid or already used staff registration key"

                });

            }


            // --------------------------------------------------
            // CHECK EXPIRATION
            // --------------------------------------------------

            if (
                matchingInvite.expires_at
            ) {

                const expirationTime =
                    new Date(
                        matchingInvite.expires_at
                    ).getTime();


                if (
                    !isNaN(expirationTime) &&
                    Date.now() > expirationTime
                ) {

                    return res.status(403).json({

                        message:
                            "This staff registration key has expired"

                    });

                }

            }


            // --------------------------------------------------
            // GENERATE STAFF ID
            // --------------------------------------------------

            const existingStaffIds =
                db.prepare(`
                    SELECT staff_id
                    FROM staff
                    WHERE staff_id LIKE 'STAFF%'
                `).all();


            let highestStaffNumber =
                0;


            for (
                const staff of existingStaffIds
            ) {

                const match =
                    String(
                        staff.staff_id
                    ).match(
                        /^STAFF(\d+)$/
                    );


                if (match) {

                    const number =
                        parseInt(
                            match[1],
                            10
                        );


                    if (
                        number > highestStaffNumber
                    ) {

                        highestStaffNumber =
                            number;

                    }

                }

            }


            const staffId =
                "STAFF" +
                String(
                    highestStaffNumber + 1
                ).padStart(
                    3,
                    "0"
                );


            // --------------------------------------------------
            // HASH PASSWORD
            // --------------------------------------------------

            const hashedPassword =
                bcrypt.hashSync(
                    password,
                    10
                );


            // --------------------------------------------------
            // TRANSACTION
            // --------------------------------------------------

            const createStaff =
                db.transaction(() => {

                    const userResult =
                        db.prepare(`
                            INSERT INTO users
                            (
                                name,
                                email,
                                password,
                                role,
                                staff_id
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `).run(

                            cleanName,

                            normalizedEmail,

                            hashedPassword,

                            "staff",

                            staffId

                        );


                    const userId =
                        userResult.lastInsertRowid;


                    db.prepare(`
                        INSERT INTO staff
                        (
                            staff_id,
                            user_id,
                            name,
                            email
                        )
                        VALUES (?, ?, ?, ?)
                    `).run(

                        staffId,

                        userId,

                        cleanName,

                        normalizedEmail

                    );


                    const inviteUpdate =
                        db.prepare(`
                            UPDATE staff_invites

                            SET
                                used = 1,
                                used_by = ?,
                                used_at = CURRENT_TIMESTAMP

                            WHERE id = ?
                              AND used = 0
                        `).run(

                            userId,

                            matchingInvite.id

                        );


                    if (
                        inviteUpdate.changes !== 1
                    ) {

                        throw new Error(
                            "Registration key could not be marked as used"
                        );

                    }


                    return userId;

                });


            const userId =
                createStaff();


            return res.status(201).json({

                message:
                    "Staff registration successful",

                staff_id:
                    staffId,

                user_id:
                    userId,

                role:
                    "staff"

            });

        } catch (error) {

            console.error(
                "Staff registration error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to create staff account"

            });

        }

    }
);


// ======================================================
// STAFF LOGIN
// POST /api/staff/login
// ======================================================

app.post(
    "/api/staff/login",
    (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Email and password are required"

                });

            }


            const normalizedEmail =
                email.trim().toLowerCase();


            const user =
                db.prepare(`
                    SELECT *
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (!user) {

                return res.status(401).json({

                    message:
                        "Invalid staff email or password"

                });

            }


            if (
                user.role !== "staff"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. This login is only for staff"

                });

            }


            const passwordMatches =
                bcrypt.compareSync(
                    password,
                    user.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    message:
                        "Invalid staff email or password"

                });

            }


            const staff =
                db.prepare(`
                    SELECT staff_id
                    FROM staff
                    WHERE user_id = ?
                `).get(
                    user.id
                );


            const staffId =
                staff
                    ? staff.staff_id
                    : user.staff_id;


            const tokenData = {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    "staff",

                staff_id:
                    staffId

            };


            const token =
                jwt.sign(
                    tokenData,
                    JWT_SECRET,
                    {
                        expiresIn: "2h"
                    }
                );


            return res.status(200).json({

                message:
                    "Staff login successful",

                token:
                    token,

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        "staff",

                    staff_id:
                        staffId

                }

            });

        } catch (error) {

            console.error(
                "Staff login error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to login"

            });

        }

    }
);


// ======================================================
// ADMIN LOGIN
// POST /api/admin/login
//
// ADMIN CANNOT BE CREATED THROUGH PUBLIC REGISTRATION.
// ======================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Email and password are required"

                });

            }


            // --------------------------------------------------
            // NORMALIZE EMAIL
            // --------------------------------------------------

            const normalizedEmail =
                email.trim().toLowerCase();


            // --------------------------------------------------
            // FIND ADMIN
            // --------------------------------------------------

            const admin =
                db.prepare(`
                    SELECT *
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (!admin) {

                return res.status(401).json({

                    message:
                        "Invalid admin email or password"

                });

            }


            // --------------------------------------------------
            // ADMIN ROLE CHECK
            // --------------------------------------------------

            if (
                admin.role !== "admin"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. This login is only for administrators"

                });

            }


            // --------------------------------------------------
            // PASSWORD CHECK
            // --------------------------------------------------

            const passwordMatches =
                bcrypt.compareSync(
                    password,
                    admin.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    message:
                        "Invalid admin email or password"

                });

            }


            // --------------------------------------------------
            // JWT PAYLOAD
            // --------------------------------------------------

            const tokenData = {

                id:
                    admin.id,

                name:
                    admin.name,

                email:
                    admin.email,

                role:
                    "admin"

            };


            // --------------------------------------------------
            // CREATE JWT
            // --------------------------------------------------

            const token =
                jwt.sign(
                    tokenData,
                    JWT_SECRET,
                    {
                        expiresIn: "2h"
                    }
                );


            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            return res.status(200).json({

                message:
                    "Admin login successful",

                token:
                    token,

                user: {

                    id:
                        admin.id,

                    name:
                        admin.name,

                    email:
                        admin.email,

                    role:
                        "admin"

                }

            });

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to process admin login"

            });

        }

    }
);


// ======================================================
// ADMIN AUTHENTICATION TEST
// GET /api/admin/me
//
// ONLY ADMIN
// ======================================================

app.get(
    "/api/admin/me",

    authenticateToken,

    authorizeRole("admin"),

    (req, res) => {

        return res.status(200).json({

            message:
                "Admin authentication successful",

            admin: {

                id:
                    req.user.id,

                name:
                    req.user.name,

                email:
                    req.user.email,

                role:
                    req.user.role

            }

        });

    }
);


// ======================================================
// ADMIN CREATE STAFF
// POST /api/admin/staff
//
// ONLY ADMIN
//
// This is the endpoint used by:
// admin/create-staff.html
//
// Admin can create staff directly.
// No registration key is required here.
// ======================================================

app.post(
    "/api/admin/staff",

    authenticateToken,

    authorizeRole("admin"),

    (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Name, email, and password are required"

                });

            }


            // --------------------------------------------------
            // CLEAN INPUT
            // --------------------------------------------------

            const cleanName =
                name.trim();

            const normalizedEmail =
                email.trim().toLowerCase();


            // --------------------------------------------------
            // VALIDATE NAME
            // --------------------------------------------------

            if (
                cleanName.length < 2
            ) {

                return res.status(400).json({

                    message:
                        "Please enter a valid staff name"

                });

            }


            // --------------------------------------------------
            // VALIDATE PASSWORD
            // --------------------------------------------------

            if (
                password.length < 6
            ) {

                return res.status(400).json({

                    message:
                        "Password must be at least 6 characters long"

                });

            }


            // --------------------------------------------------
            // VALIDATE EMAIL
            // --------------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    normalizedEmail
                )
            ) {

                return res.status(400).json({

                    message:
                        "Please enter a valid email address"

                });

            }


            // --------------------------------------------------
            // CHECK EXISTING EMAIL
            // --------------------------------------------------

            const existingUser =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                `).get(
                    normalizedEmail
                );


            if (existingUser) {

                return res.status(400).json({

                    message:
                        "Email is already registered"

                });

            }


            // --------------------------------------------------
            // CREATE STAFF ID
            // --------------------------------------------------

            const existingStaffIds =
                db.prepare(`
                    SELECT staff_id
                    FROM staff
                    WHERE staff_id LIKE 'STAFF%'
                `).all();


            let highestStaffNumber =
                0;


            for (
                const staff of existingStaffIds
            ) {

                const match =
                    String(
                        staff.staff_id
                    ).match(
                        /^STAFF(\d+)$/
                    );


                if (match) {

                    const number =
                        parseInt(
                            match[1],
                            10
                        );


                    if (
                        number >
                        highestStaffNumber
                    ) {

                        highestStaffNumber =
                            number;

                    }

                }

            }


            const staffId =
                "STAFF" +
                String(
                    highestStaffNumber + 1
                ).padStart(
                    3,
                    "0"
                );


            // --------------------------------------------------
            // HASH PASSWORD
            // --------------------------------------------------

            const hashedPassword =
                bcrypt.hashSync(
                    password,
                    10
                );


            // --------------------------------------------------
            // CREATE USER + STAFF
            // IN ONE TRANSACTION
            // --------------------------------------------------

            const createStaff =
                db.transaction(() => {

                    // ------------------------------------------
                    // CREATE USER
                    // ------------------------------------------

                    const userResult =
                        db.prepare(`
                            INSERT INTO users
                            (
                                name,
                                email,
                                password,
                                role,
                                staff_id
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `).run(

                            cleanName,

                            normalizedEmail,

                            hashedPassword,

                            "staff",

                            staffId

                        );


                    const userId =
                        userResult.lastInsertRowid;


                    // ------------------------------------------
                    // CREATE STAFF RECORD
                    // ------------------------------------------

                    db.prepare(`
                        INSERT INTO staff
                        (
                            staff_id,
                            user_id,
                            name,
                            email
                        )
                        VALUES (?, ?, ?, ?)
                    `).run(

                        staffId,

                        userId,

                        cleanName,

                        normalizedEmail

                    );


                    return userId;

                });


            const userId =
                createStaff();


            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            return res.status(201).json({

                message:
                    "Staff account created successfully",

                staff_id:
                    staffId,

                user_id:
                    userId,

                role:
                    "staff"

            });

        } catch (error) {

            console.error(
                "Admin create staff error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to create staff account"

            });

        }

    }
);


// ======================================================
// CREATE COMPLAINT
// POST /api/complaints
//
// ONLY RESIDENTS
// ======================================================

app.post(
    "/api/complaints",

    authenticateToken,

    authorizeRole("resident"),

    (req, res) => {

        try {

            const {

                resident_name,
                room_number,
                contact,
                category,
                description,
                date,
                priority,
                additional_info

            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !resident_name ||
                !room_number ||
                !contact ||
                !category ||
                !description ||
                !date ||
                !priority
            ) {

                return res.status(400).json({

                    message:
                        "All required fields must be provided"

                });

            }


            // --------------------------------------------------
            // VALIDATE PRIORITY
            // --------------------------------------------------

            const allowedPriorities = [

                "Low",
                "Medium",
                "High"

            ];


            if (
                !allowedPriorities.includes(
                    priority
                )
            ) {

                return res.status(400).json({

                    message:
                        "Priority must be Low, Medium, or High"

                });

            }


            // --------------------------------------------------
            // INSERT COMPLAINT
            // --------------------------------------------------

            const result =
                db.prepare(`
                    INSERT INTO complaints
                    (
                        user_id,
                        resident_name,
                        room_number,
                        contact,
                        category,
                        description,
                        date,
                        priority,
                        status,
                        additional_info
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(

                    req.user.id,

                    resident_name.trim(),

                    room_number.trim(),

                    contact.trim(),

                    category.trim(),

                    description.trim(),

                    date,

                    priority,

                    "Pending",

                    additional_info
                        ? additional_info.trim()
                        : null

                );


            return res.status(201).json({

                message:
                    "Complaint submitted successfully",

                complaint_id:
                    result.lastInsertRowid,

                user_id:
                    req.user.id

            });

        } catch (error) {

            console.error(
                "Complaint creation error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to create complaint"

            });

        }

    }
);


// ======================================================
// GET ALL COMPLAINTS
// GET /api/complaints
//
// RESIDENT = OWN COMPLAINTS
// STAFF = ALL COMPLAINTS
// ADMIN = ALL COMPLAINTS
// ======================================================

app.get(
    "/api/complaints",

    authenticateToken,

    (req, res) => {

        try {

            const {
                status,
                priority,
                category
            } = req.query;


            let sql =
                "SELECT * FROM complaints";


            const conditions = [];

            const values = [];


            // --------------------------------------------------
            // RESIDENTS ONLY SEE THEIR OWN
            // --------------------------------------------------

            if (
                req.user.role === "resident"
            ) {

                conditions.push(
                    "user_id = ?"
                );

                values.push(
                    req.user.id
                );

            }


            // --------------------------------------------------
            // FILTER STATUS
            // --------------------------------------------------

            if (
                status
            ) {

                conditions.push(
                    "status = ?"
                );

                values.push(
                    status
                );

            }


            // --------------------------------------------------
            // FILTER PRIORITY
            // --------------------------------------------------

            if (
                priority
            ) {

                conditions.push(
                    "priority = ?"
                );

                values.push(
                    priority
                );

            }


            // --------------------------------------------------
            // FILTER CATEGORY
            // --------------------------------------------------

            if (
                category
            ) {

                conditions.push(
                    "category = ?"
                );

                values.push(
                    category
                );

            }


            // --------------------------------------------------
            // WHERE
            // --------------------------------------------------

            if (
                conditions.length > 0
            ) {

                sql +=
                    " WHERE " +
                    conditions.join(
                        " AND "
                    );

            }


            // --------------------------------------------------
            // NEWEST FIRST
            // --------------------------------------------------

            sql +=
                " ORDER BY id DESC";


            const complaints =
                db.prepare(
                    sql
                ).all(
                    ...values
                );


            return res.status(200).json(
                complaints
            );

        } catch (error) {

            console.error(
                "Get complaints error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to fetch complaints"

            });

        }

    }
);


// ======================================================
// GET ONE COMPLAINT
// GET /api/complaints/:id
//
// RESIDENT = OWN COMPLAINT
// STAFF/ADMIN = ANY COMPLAINT
// ======================================================

app.get(
    "/api/complaints/:id",

    authenticateToken,

    (req, res) => {

        try {

            const complaintId =
                req.params.id;


            const complaint =
                db.prepare(`  
                    SELECT *
                    FROM complaints
                    WHERE id = ?
                `).get(
                    complaintId
                );


            if (
                !complaint
            ) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            // --------------------------------------------------
            // RESIDENT OWNERSHIP CHECK
            // --------------------------------------------------

            if (

                req.user.role === "resident" &&

                complaint.user_id !== req.user.id

            ) {

                return res.status(403).json({

                    message:
                        "Access denied. You can only view your own complaints"

                });

            }


            return res.status(200).json(
                complaint
            );

        } catch (error) {

            console.error(
                "Get complaint error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to fetch complaint"

            });

        }

    }
);


// ======================================================
// UPDATE COMPLETE COMPLAINT
// PUT /api/complaints/:id
//
// ONLY STAFF
// ======================================================

app.put(
    "/api/complaints/:id",

    authenticateToken,

    authorizeRole("staff"),

    (req, res) => {

        try {

            const complaintId =
                req.params.id;


            const {

                resident_name,
                room_number,
                contact,
                category,
                description,
                date,
                priority,
                status,
                additional_info,
                staff_remarks

            } = req.body;


            // --------------------------------------------------
            // REQUIRED FIELDS
            // --------------------------------------------------

            if (
                !resident_name ||
                !room_number ||
                !contact ||
                !category ||
                !description ||
                !date ||
                !priority ||
                !status
            ) {

                return res.status(400).json({

                    message:
                        "All required fields must be provided"

                });

            }


            // --------------------------------------------------
            // VALID VALUES
            // --------------------------------------------------

            const allowedPriorities = [

                "Low",
                "Medium",
                "High"

            ];


            const allowedStatuses = [

                "Pending",
                "In Progress",
                "Resolved"

            ];


            if (
                !allowedPriorities.includes(
                    priority
                )
            ) {

                return res.status(400).json({

                    message:
                        "Priority must be Low, Medium, or High"

                });

            }


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Status must be Pending, In Progress, or Resolved"

                });

            }


            // --------------------------------------------------
            // UPDATE
            // --------------------------------------------------

            const result =
                db.prepare(` 
                    UPDATE complaints

                    SET
                        resident_name = ?,
                        room_number = ?,
                        contact = ?,
                        category = ?,
                        description = ?,
                        date = ?,
                        priority = ?,
                        status = ?,
                        additional_info = ?,
                        staff_remarks = ?

                    WHERE id = ?
                `).run(

                    resident_name.trim(),

                    room_number.trim(),

                    contact.trim(),

                    category.trim(),

                    description.trim(),

                    date,

                    priority,

                    status,

                    additional_info
                        ? additional_info.trim()
                        : null,

                    staff_remarks
                        ? staff_remarks.trim()
                        : null,

                    complaintId

                );


            if (
                result.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            return res.status(200).json({

                message:
                    "Complaint updated successfully",

                complaint_id:
                    complaintId

            });

        } catch (error) {

            console.error(
                "Update complaint error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to update complaint"

            });

        }

    }
);


// ======================================================
// UPDATE COMPLAINT STATUS
// PUT /api/complaints/:id/status
//
// ONLY STAFF
// ======================================================

app.put(
    "/api/complaints/:id/status",

    authenticateToken,

    authorizeRole("staff"),

    (req, res) => {

        try {

            const complaintId =
                req.params.id;


            const {
                status
            } = req.body;


            const allowedStatuses = [

                "Pending",
                "In Progress",
                "Resolved"

            ];


            if (
                !status
            ) {

                return res.status(400).json({

                    message:
                        "Status is required"

                });

            }


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Status must be Pending, In Progress, or Resolved"

                });

            }


            const result =
                db.prepare(` 
                    UPDATE complaints

                    SET status = ?

                    WHERE id = ?
                `).run(

                    status,

                    complaintId

                );


            if (
                result.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            return res.status(200).json({

                message:
                    "Complaint status updated successfully",

                complaint_id:
                    complaintId,

                status:
                    status

            });

        } catch (error) {

            console.error(
                "Update status error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to update complaint status"

            });

        }

    }
);


// ======================================================
// DELETE COMPLAINT
// DELETE /api/complaints/:id
//
// ONLY STAFF
// ======================================================

app.delete(
    "/api/complaints/:id",

    authenticateToken,

    authorizeRole("staff"),

    (req, res) => {

        try {

            const complaintId =
                req.params.id;


            const result =
                db.prepare(` 
                    DELETE FROM complaints
                    WHERE id = ?
                `).run(
                    complaintId
                );


            if (
                result.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Complaint not found"

                });

            }


            return res.status(200).json({

                message:
                    "Complaint deleted successfully",

                complaint_id:
                    complaintId

            });

        } catch (error) {

            console.error(
                "Delete complaint error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to delete complaint"

            });

        }

    }
);


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

            message:
                "API route not found"

        });

    }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            error
        );


        return res.status(500).json({

            message:
                "Internal server error"

        });

    }
);


// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server is running on http://localhost:${PORT}`
        );

        console.log(
            "JWT authentication is using the .env secret"
        );

    }
);

