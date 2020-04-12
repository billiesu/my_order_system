const express = require("express");
const app = express();

let port = 3000;
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.route("/Login").get((req, res) =>{
  res.sendFile(__dirname + "/public/order_summary.html");
});

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});
