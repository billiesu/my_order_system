'use strict';

/**
 * An async function to send the request to the backend.
 */
// async function submit() {
  
//     // Set the mouse cursor to hourglass
//     document.body.style.cursor = "wait";
//     try {
//         // Get the login infos from the user
//         let username = document.getElementById("username").value;
//         let password = document.getElementById("password").value;
  
//         // Address of my backend
//         let request = `http://www.tntrpg.com:5000/login`;
  
//         // Send an HTTP GET request to the backend
//         // let login_info = {"username" : username, "password" : password};
//         const response = await axios.get(request);
//         console.log("data.data: ", JSON.stringify(response.data, null, 2));
//     } catch (error) {
//       console.log("error: ", error);
//     }
  
//     // Set the cursor back to default
//     document.body.style.cursor = "default";
// }

async function email() {
  // Set the mouse cursor to hourglass
    document.body.style.cursor = "wait";
    try {
        // Get the login infos from the user
        let name= document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let msg = document.getElementById("message").value;
        let data = {
          name:name,
          email:email,
          msg:msg
        }
  
        // Address of my backend
        let request = `http://www.tntrpg.com:5000/email`;
  
        // Send an HTTP GET request to the backend
        // let login_info = {"username" : username, "password" : password};
        await axios.post(request, data);
    } catch (error) {
      console.log("error: ", error);
    }
  
    // Set the cursor back to default
    document.body.style.cursor = "default";
}
  