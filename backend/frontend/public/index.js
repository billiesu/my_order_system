'use strict';


//when click the button, call email() function
document.getElementById("emailSend").onclick = function () {
  email();
};

async function email() {
  // Set the mouse cursor to hourglass
    document.body.style.cursor = "wait";
    try {
      if (confirm("Send Recomendation?")) {
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
      //  let request = "http://localhost:5000/email";
       let request = "http://www.tntrpg.com:5000/email";
 
       // Send an HTTP GET request to the backend
       await axios.post(request, data);
      }
 
    } catch (error) {
      console.log("error: ", error);
    }
  
    // Set the cursor back to default
    document.body.style.cursor = "default";
}