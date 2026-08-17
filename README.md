# PG Complaint Management System

A simple web-based PG Complaint Management System designed to help residents submit and track complaints while allowing staff to manage, update, and resolve those complaints efficiently.

## 📌 Features

### Resident
- Resident registration and login
- Secure password authentication
- Submit new complaints
- Select complaint category
- Set complaint priority
- View submitted complaints
- Track complaint status
- View staff remarks
- Logout functionality

### Staff
- Staff login
- View all resident complaints
- Filter complaints by status
- View complaint details
- Update complaint status
- Set complaint priority
- Add staff remarks
- Manage and resolve complaints

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite
- better-sqlite3

### Authentication
- JWT (JSON Web Token)
- Password hashing

### API Testing
- Postman

## 📂 Project Structure

text
PG-compaint-Management/
│
├── backend/
│   ├── middleware/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── index.html
│   ├── resident.html
│   ├── resident.js
│   ├── style.css
│   └── ...
│
├── .gitignore
└── README.md
