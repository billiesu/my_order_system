// "use strict";
/** 
 * @param {JSON Array} data The user info sent from the backend.
 * @param {Number} currID The id number of the current operated data.
 */
let data = {};
let currID;
let currElement;
//  let urlPrefix = "http://localhost:5000/email";
const urlPrefix = 'http://www.tntrpg.com:5000';

//Load the infos from the backend.
onload = async function () {
  const res = await axios.get(urlPrefix + "/load");
  //Preprcess the data we received.
  for (let type in res.data) {
    console.log("type:",type);
    data[type] = {};
    let id;
    
    for (let layer in res.data[type]) {
      console.log("res,type:",res.data[type][layer]);
      for (let key in res.data[type][layer]) {
        console.log("Key:", key);
        if (key === "_id" || key === "__v") {
          continue;
        }
        if (key === "Id") {
          id = res.data[type][layer][key];
          
          console.log("type",type);
          data[type][id] = {};
        }else {
          data[type][id][key] = {};
          data[type][id][key] = res.data[type][layer][key];
        }
      }
    }
  
  }
  generateTable("order-table", "orders");
  generateTable("product-table", "products");
  generateTable("client-table", "clients");
};

/**
 * Generate three tables
 * @param {String} tableID The ID of the table we want to generate.
 * @param {String} dataName The key name of the data table sent from the backend.
 */
function generateTable(tableID, type) {
  let tbody = document.getElementById(tableID);
  let info = data[type];
  for (let key in info) {
    let tr = generateRow(key, info[key]);
    tbody.appendChild(tr);
  }
}
//Generate each row
function generateRow(id, row_info) {
  let row = document.createElement("tr");
  //If it is an order number, make it clickable
  let cell = document.createElement("td");
  cell.innerHTML =
        "<p onclick='edit()' class='order-number'>" + id + "</p>";
  row.appendChild(cell);
  for (let key in row_info) {
    cell = document.createElement("td");
    cell.innerHTML = row_info[key];
    row.appendChild(cell);
  }
  return row;
}
//editing the order
function edit() {
  let name =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement.parentElement.id;

  let id = "new-" + name;
  //Record the current operated ID number
  currID = event.target.innerHTML;
  currElement = event.target;

  //Get infos from the table
  let column = 1;
  document
    .getElementById(id)
    .querySelectorAll("li")
    .forEach((element) => {
      let val = event.target.parentElement.parentElement.querySelector(
        `td:nth-child(${column + 1})`
      ).innerHTML;
      element.querySelector("input").value = val;
      column++;
    });
  //Change visibility
  for (let element of document.getElementsByClassName("delete")) {
    element.style.display = "inline-block";
  }
  document.getElementsByClassName("pop-out")[0].style.display = "block";
  document.getElementById(id).style.display = "block";
}

/**
 * Add new order/product/client
 */
document.getElementsByClassName("add-new-btn").onclick = function () {
  add();
};
function add() {
  let name = event.target.parentElement.parentElement.id;
  let id = "new-" + name;
  document
    .getElementById(id)
    .querySelectorAll("li")
    .forEach((element) => {
      element.querySelector("input").value = "";
    });
  //adding "adding" class to pop-out page to indicate it is opened by add buttion
  document
    .getElementsByClassName("pop-out")[0]
    .classList.toggle("adding", true);
  
  //Change visibility
  for (let element of document.getElementsByClassName("delete")) {
    element.style.display = "none";
  }
  document.getElementsByClassName("pop-out")[0].style.display = "block";
  document.getElementById(id).style.display = "block";
}


/**
 * save/delete/cancel the editted details
 */
document.getElementsByClassName("save").onclick = function () {
  save();
};
async function save() {
  let parent = event.target.parentElement.parentElement;// find the corrent pop-out page
  console.log("parent:", parent)
  let type = parent.id.substring(4);
  if (data[type] === undefined) {
    data[type] = {};
  }
  let request = "";

  //Change the cursor style and notation text
  document.body.style.cursor = "wait";
  let notationID = parent.id.substring(4, parent.id.length - 1) + "-notation";
  let notation = document.getElementById(notationID);
  notation.innerHTML = "Saving...";

  let id;
  // data[type] = info;
  if (
    //check whether the current pop-out page is opened by add button or edit button
    document.getElementsByClassName("pop-out")[0].classList.contains("adding")
  ) {
    //Generate a random orderID
    id = randomNumber();
    data[type][id] = {};
    request = urlPrefix + '/add?type=' + type + '&id=' + id;
    //remove "adding" class
    document
      .getElementsByClassName("pop-out")[0]
      .classList.toggle("adding", false);
  } else {
    id = currID;
    request = urlPrefix + `/edit?type=` + type + '&id=' + id;
    console.log("request:", request);
  }

  //Get all the input values of input boxes.
  parent.querySelectorAll("li").forEach((element) => {
    data[type][id][element.querySelector("p").innerHTML] = element.querySelector(
      "input"
    ).value;
    console.log(element.querySelector("input").value);
  });
  //Insert the input infos into the corresponding table.
  let tableID = parent.id.substring(4, parent.id.length - 1) + "-table";
  let tbody = document.getElementById(tableID);
  let tr = generateRow(id, data[type][id]);
  if (id !== currID) {
    tbody.appendChild(tr);
  }else {
    let arr = [id];
    for (let key in data[type][id]) {
      arr.push(data[type][id][key]);
    }
    let i = 0;
    console.log(data[type][id]);
    currElement.parentElement.parentElement.querySelectorAll('td').forEach((element) => {
      if (i === 0) { //If it is an order number, make it clickable
        element.innerHTML = "<p onclick='edit()' class='order-number'>" + arr[i++] + "</p>";
      }else {
        element.innerHTML = arr[i++];
      }
    });
  }
  // Sent the data to the backend
  let send = {
    data:data[type][id]
  }
  console.log("data type:", send);
  await axios.post(request, send, (err) => {
    if (err) {
      console.log(err);
    }
  });
  // cancel notation
  notation.innerHTML = "";
  document.body.style.cursor = "default";
  console.log("data type:", data[type]);
  //Hide the edit pages  parent = event.target.parentElement.parentElement;
  document.getElementsByClassName("pop-out")[0].style.display = "none";
  console.log("evernt:", parent);
  parent.style.display = "none";
  
}
//generate a random order ID
//format: current time + 6 random numbers
function randomNumber() {
  
  const now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  month = this.setTimeDateFmt(month);
  hour = this.setTimeDateFmt(hour);
  minutes = this.setTimeDateFmt(minutes);
  seconds = this.setTimeDateFmt(seconds);
  return (
    now.getFullYear().toString() +
    month.toString() +
    day +
    hour +
    minutes +
    seconds +
    Math.round(Math.random() * 1000000).toString()
  );
}
function setTimeDateFmt(s) {
  return s < 10 ? "0" + s : s;
}

/**
 * Delete infos
 */
document.getElementsByClassName("delete").onclick = function () {
  del();
};
function del() {
  if (confirm("Delete?")) {
    currElement.parentElement.parentElement.parentElement.removeChild(currElement.parentElement.parentElement);

    //send delete request to backend
    let parent = event.target.parentElement.parentElement;
    console.log("parent:", parent)
    let type = parent.id.substring(4);
    let request = urlPrefix + '/delete?type=' + type + '&id=' + currID;
    
    //make a delete request to backend
    axios.get(request, (err) => {
      if (err) {
        console.log(err);
      }
    });
    document.getElementsByClassName("pop-out")[0].style.display = "none";
    event.target.parentElement.parentElement.style.display = "none";
  }
}

//cancel button
document.getElementsByClassName("cancel").onclick = function () {
  cancel();
};
function cancel() {
  document.getElementsByClassName("pop-out")[0].style.display = "none";
  event.target.parentElement.parentElement.style.display = "none";
}

/**
 * Switch the navigation bar
 */
document.getElementsByClassName("cancel").onclick = function () {
  openPage();
};
//only the the navigation bar we click can has the class "active" and is visible
function openPage() {
  let activeElement = document.getElementsByClassName("active")[0];
  if (activeElement === event.target) {
    return;
  }
  let name = event.target.id;
  let id = name.substring(0, name.lastIndexOf("-"));
  document.getElementById(id).style.display = "block";
  name = document.getElementsByClassName("main-nav-btn active")[0].id;
  id = name.substring(0, name.lastIndexOf("-"));
  document.getElementById(id).style.display = "none";
  activeElement.classList.toggle("active", false);
  event.target.classList.toggle("active", true);
}
