const loginForm = document.getElementById("loginForm");
// Finds the login form from index.html

const message = document.getElementById("message");
// Finds the message area from index.html


loginForm.addEventListener("submit", async function (event) {
    // Runs this function when the user clicks Login

    event.preventDefault();
    // Prevents the browser from refreshing the page


    const email = document.getElementById("email").value;
    // Gets the email entered by the user

    const password = document.getElementById("password").value;
    // Gets the password entered by the user


    message.textContent = "Logging in...";
    // Shows a temporary message


    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
            {
                method: "POST",
                // Sends a POST request to the backend

                headers: {
                    "Content-Type": "application/json"
                    // Tells backend that we are sending JSON
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
                // Converts login information into JSON
            }
        );


        const data = await response.json();
        // Converts backend response into JavaScript data


        if (!response.ok) {
            // Checks whether the backend returned an error

            message.textContent = data.message;
            // Shows the backend error message

            return;
            // Stops the function
        }


        localStorage.setItem(
            "token",
            data.token
        );
        // Stores JWT token in the browser


        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );
        // Stores logged-in user information


        message.textContent = "Login successful!";
        // Shows successful login message


        if (data.user.role === "resident") {
            // Checks whether logged-in user is a resident

            window.location.href = "resident.html";
            // Opens resident dashboard
        }


        if (data.user.role === "staff") {
            // Checks whether logged-in user is staff

            window.location.href = "staff.html";
            // Opens staff dashboard
        }


    } catch (error) {

        console.error(error);
        // Shows technical error in browser console

        message.textContent =
            "Unable to connect to the server.";
        // Shows connection error to user

    }

});