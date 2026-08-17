const token = localStorage.getItem("token");
// Gets the JWT token saved during login


const userData = localStorage.getItem("user");
// Gets the logged-in user's information


// Checks whether the user is logged in
if (!token || !userData) {

    window.location.href = "index.html";
    // Sends the user back to login if no token exists

}


const user = JSON.parse(userData);
// Converts saved user information from JSON text into an object


const welcomeMessage = document.getElementById("welcomeMessage");
// Finds the welcome message element


welcomeMessage.textContent =
    `Welcome, ${user.name}`;
// Displays the logged-in user's name


const logoutButton =
    document.getElementById("logoutButton");
// Finds the logout button


logoutButton.addEventListener("click", function () {

    localStorage.removeItem("token");
    // Removes JWT token from browser storage

    localStorage.removeItem("user");
    // Removes user information from browser storage

    window.location.href = "index.html";
    // Sends user back to login page

});


// ======================================================
// SUBMIT COMPLAINT
// ======================================================

const complaintForm =
    document.getElementById("complaintForm");
// Finds the complaint form


complaintForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();
        // Prevents normal page refresh


        const complaintMessage =
            document.getElementById("complaintMessage");
        // Finds the message area


        const complaintData = {

            resident_name:
                document.getElementById("residentName").value,

            room_number:
                document.getElementById("roomNumber").value,

            contact:
                document.getElementById("contact").value,

            category:
                document.getElementById("category").value,

            description:
                document.getElementById("description").value,

            date:
                document.getElementById("date").value,

            priority:
                document.getElementById("priority").value,

            additional_info:
                document.getElementById("additionalInfo").value

        };
        // Collects all complaint information from the form


        complaintMessage.textContent =
            "Submitting complaint...";
        // Shows loading message


        try {

            const response = await fetch(
                "http://localhost:5000/api/complaints",
                {

                    method: "POST",
                    // Sends POST request to backend


                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },
                    // Sends JSON and JWT token


                    body:
                        JSON.stringify(complaintData)
                    // Converts complaint data into JSON

                }
            );


            const data =
                await response.json();
            // Converts backend response to JavaScript


            if (!response.ok) {

                complaintMessage.textContent =
                    data.message ||
                    "Failed to submit complaint";

                return;
                // Stops if backend returns an error

            }


            complaintMessage.textContent =
                "Complaint submitted successfully!";
            // Shows success message


            complaintForm.reset();
            // Clears the form


            loadComplaints();
            // Reloads complaint list

        }

        catch (error) {

            console.error(error);
            // Shows technical error in browser console


            complaintMessage.textContent =
                "Unable to connect to server.";
            // Shows connection error

        }

    }
);


// ======================================================
// LOAD MY COMPLAINTS
// ======================================================

async function loadComplaints() {

    const complaintsList =
        document.getElementById("complaintsList");
    // Finds the complaint list container


    complaintsList.innerHTML =
        "<p>Loading complaints...</p>";
    // Shows loading message


    try {

        const response = await fetch(
            "http://localhost:5000/api/complaints",
            {

                method: "GET",
                // Requests complaints from backend


                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
                // Sends resident JWT token

            }
        );


        const complaints =
            await response.json();
        // Converts response to JavaScript data


        if (!response.ok) {

            complaintsList.innerHTML =
                `<p>${complaints.message}</p>`;

            return;
            // Stops if backend returns an error

        }


        if (complaints.length === 0) {

            complaintsList.innerHTML =
                "<p>No complaints submitted yet.</p>";

            return;
            // Shows message when there are no complaints

        }


        complaintsList.innerHTML = "";
        // Clears previous complaints


        complaints.forEach(function (complaint) {

            const complaintCard =
                document.createElement("div");
            // Creates a new complaint card


            complaintCard.className =
                "complaint-card";
            // Gives the card a CSS class


            complaintCard.innerHTML = `

                <h3>
                    ${complaint.category}
                </h3>

                <p>
                    <strong>Complaint ID:</strong>
                    ${complaint.id}
                </p>

                <p>
                    <strong>Room:</strong>
                    ${complaint.room_number}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${complaint.priority}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status}
                </p>

                <p>
                    <strong>Staff Remarks:</strong>
                    ${complaint.staff_remarks || "Not updated yet"}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${complaint.date}
                </p>

            `;
            // Creates the visible complaint information


            complaintsList.appendChild(
                complaintCard
            );
            // Adds complaint card to dashboard

        });

    }

    catch (error) {

        console.error(error);
        // Shows technical error


        complaintsList.innerHTML =
            "<p>Unable to load complaints.</p>";
        // Shows error message

    }

}


// ======================================================
// REFRESH COMPLAINTS BUTTON
// ======================================================

const loadComplaintsButton =
    document.getElementById("loadComplaintsButton");
// Finds refresh button


loadComplaintsButton.addEventListener(
    "click",
    loadComplaints
);
// Calls loadComplaints when button is clicked


loadComplaints();
// Loads complaints automatically when dashboard opens