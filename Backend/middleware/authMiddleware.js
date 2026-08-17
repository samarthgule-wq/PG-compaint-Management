require("dotenv").config();

const jwt = require("jsonwebtoken");


// ======================================================
// JWT SECRET
// ======================================================

const JWT_SECRET = process.env.JWT_SECRET;


// ======================================================
// CHECK JWT SECRET
// ======================================================

if (!JWT_SECRET) {

    console.error(
        "ERROR: JWT_SECRET is missing from .env"
    );

    process.exit(1);

}


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers["authorization"];


    // --------------------------------------------------
    // CHECK AUTHORIZATION HEADER
    // --------------------------------------------------

    if (!authHeader) {

        return res.status(401).json({

            message:
                "Access denied. Authentication token is required"

        });

    }


    // --------------------------------------------------
    // CHECK BEARER FORMAT
    // --------------------------------------------------

    const parts =
        authHeader.split(" ");


    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        return res.status(401).json({

            message:
                "Invalid authorization format"

        });

    }


    const token =
        parts[1];


    if (!token) {

        return res.status(401).json({

            message:
                "Authentication token is missing"

        });

    }


    // --------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------

    try {

        const decodedUser =
            jwt.verify(
                token,
                JWT_SECRET
            );


        // Store decoded user
        req.user =
            decodedUser;


        // Continue request
        next();

    }

    catch (error) {

        return res.status(401).json({

            message:
                "Invalid or expired token"

        });

    }

}


module.exports =
    authenticateToken;