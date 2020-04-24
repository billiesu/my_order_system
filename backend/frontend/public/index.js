'use strict';

/**
 * An async function to send the request to the backend.
 */
async function submit() {
  
    // Set the mouse cursor to hourglass
    document.body.style.cursor = "wait";
    try {
        // Get the login infos from the user
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
  
        // Address of my backend
        let request = `http://127.0.0.1:5000/login`;
  
        // Send an HTTP GET request to the backend
        // let login_info = {"username" : username, "password" : password};
        const response = await axios.get(request);
        console.log("data.data: ", JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log("error: ", error);
    }
  
    // Set the cursor back to default
    document.body.style.cursor = "default";
}
  