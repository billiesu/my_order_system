"use strict";

// import express frame
let express = require("express");
let app = express();
const cors = require("cors");
const moment = require("moment");

// add email module
const nodemailer = require("nodemailer");


app.use(express.json());     
app.use(express.urlencoded());
app.use(express.static("./frontend/public"));
app.use(cors());

let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();

// set inform email address & passward 
let pw = "using_for_project_only";
let spec = `smtps://ee599projecttest@gmail.com:${pw}@smtp.gmail.com`;

//set port number
let port = 5000;

//import database Model
const mongoose = require('mongoose');
// need to be set for use findOneAndUpdate function
mongoose.set('useFindAndModify', false);
// connect database
let url = 'mongodb://localhost:27017/orderManage';
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
  });
// define order Model
const orderSchema = new mongoose.Schema({ 
  Id: {type: String, unique:true},
  OrderDate: {type:String},   //不需要设定
  Client: {type:String},
  Totalprice: {type:String},
  PayType: {type:String},
  Status: {type:String},
  Remark: {type:String}
});
//define client Model
const clientSchema = new mongoose.Schema({
  Id: {type: String, unique:true},
  Name: {type:String},
  Address: {type:String},
  State: {type:String},
  Country: {type:String},
  Phone: {type:String},
  Remark: {type:String}
})

// define product model
const productSchema = new mongoose.Schema({
  Id: {type: String, unique:true},
  Name: {type:String},
  Type: {type:String},
  Quantities:{type:String},
  Price: {type:String},
  Remark: {type:String}
})
// create collection entrance for the specific Model
const Order = mongoose.model('Order', orderSchema);
const Client = mongoose.model('Client', clientSchema);
const Product = mongoose.model("Product", productSchema);

// define db'type & db's msg with req.query & req.body
async function dbAndMsg (query, body) {
  let db;
  let msg;
  if(query.type == "orders") {
    db = Order;
    msg = {
      Id : query.id,
      OrderDate: body.data.OrderDate,
      Client: body.data.Client,
      Totalprice: body.data.Totalprice,
      PayType: body.data.PayType,
      Status: body.data.Status,
      Remark: body.data.Remark
    } 
  }else if (query.type == "clients") {
    db = Client;
    msg = {
      Id: query.id,
      Name: body.data.Name,
      Address: body.data.Address,
      State: body.data.State,
      Country: body.data.Country,
      Phone: body.data.Phone,
      Remark: body.data.Remark
    }
  }else if (query.type == "products") {
    db = Product,
    msg = {
      Id: query.id,
      Name: body.data.Name,
      Type: body.data.Type,
      Quantities: body.data.Quantities,
      Price: body.data.Price,
      Remark: body.data.Remark     
    }
  }
  let dbMsg = {
    dbName: db,
    msgContend: msg
  }
  return dbMsg;
}

// main page
app.get("/", function (req, res) {
  console.log("req.query");
  res.sendFile(__dirname + "/frontend/public/index.html");
});

// loading page
app.route("/Login").get((req, res) =>{
  res.sendFile(__dirname + "/frontend/public/order_summary.html");

});

// after loading, send all client/order/product msg back 
app.get('/load',  async function (req, res){
  let allMsg = {
    orders: await Order.find(),
    clients: await Client.find(),
    products: await Product.find()
  }
  console.log("req.query",allMsg);
  console.log("success load!!!");
  let content = JSON.stringify(allMsg);
  res.send(content);
})

// add new order/lient/roduct
app.post('/add', jsonParser, async function (req, res) {
  if ((req.body == undefined || req.query == undefined)) return res.sendStatus(400);
  console.log("body contains:", req.body);
  let dbMsg = await dbAndMsg(req.query, req.body);
  console.log(req.query);
  let insertSign = await insertFunction(dbMsg.dbName, dbMsg.msgContend).catch(error => console.log(error.stack));
  console.log("sign:", insertSign);
  if (insertSign) 
    res.send("Insert success!!!");
  else 
    res.send("Insert fail!!!!")
})

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});

// update order/lient/roduct
app.post('/edit', jsonParser, async function (req, res) {
  console.log("req.body",req.body,"req.query",req.query);
  if ((req.body == undefined || req.query == undefined)) return res.sendStatus(400);
  
  let dbMsg = await dbAndMsg(req.query, req.body);
  let searchRes = await findFunction(dbMsg.dbName, dbMsg.msgContend);
  if (!searchRes.res) {
    res.send("Couldn't find this order!!")
  } else {
    await updateFunction(dbMsg.dbName, searchRes._id, dbMsg.msgContend);
    res.send("success update msg!!");
  }
})

//delete order/lient/roduct
app.get('/delete', async function (req, res) {
  if ((req.body == undefined || req.query == undefined)) return res.sendStatus(400);
  let db;
  if (req.query.type == "orders") db = Order;
  else if (req.query.type == "clients") db = Client;
  else if (req.query.type == "products") db = Product;
  let msg = {Id:req.query.id}
  console.log("Id:", req.query.id);
  let searchRes = await findFunction(db, msg);
  if (!searchRes.res) {
    res.send("Couldn't find this order!!")
  } else {
    await deleteFunction(db, searchRes._id);
    res.send("success delete!!")
  }
  
})

app.post('/email', jsonParser, function (req, res) {
  if ((req.body === undefined)) return res.sendStatus(400);
  let clientEmail = req.body.email;
  let clientMsg = req.body.msg;
  let clientName = req.body.name;
  let systemEmail = "ee599projecttest@gmail.com";
  let managerEmail = "Billie_su@163.com";
  let date = moment().format("MMMM Do YYYY, h:mm:ss a");
  // msg content send to client
  let msgSendToClient = `<pre>`;
  msgSendToClient += date + "\n";
  msgSendToClient += "Dear " + clientName + ", we have receive your recommendation. " + "\n";
  msgSendToClient += "Your recommendation is:" +clientMsg + "\n";
  msgSendToClient += "We will reply you as soom as possible.";
  msgSendToClient += `</pre>`;

  // msg content send to manager
  let msgSendToManager = `<pre>`;
  msgSendToManager += date + "\n";
  msgSendToManager += "Dear manager, you get msg from client. Here is msg:" + "\n";
  msgSendToManager += clientMsg;
  msgSendToManager += `</pre>`;

  let mailOptions1 = {
    from: '"NodeJS" <ee599projecttest@gmail.com>', // sender address
    to: clientEmail, // list of receivers
    subject: "Reply for your recommendation about our Order Manage System", // Subject line
    text: "", // plaintext body
    html: msgSendToClient
  };
  SendMail(mailOptions1);
  let mailOptions2 = {
    from: '"NodeJS" <ee599projecttest@gmail.com>', // sender address
    to: managerEmail, // list of receivers
    subject: "New recommendation about Order Manage System", // Subject line
    text: "", // plaintext body
    html: msgSendToManager
  };
  SendMail(mailOptions2);
  console.log("Have send msg to client and manager!");
  res.send("Have send msg to client and manager!");
}) 


// send mail function 
function SendMail(mailOptions) {
  var transporter = nodemailer.createTransport(spec);
  return transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("Error in sending email: ", error);
      try {
        if (/quota/.test(error)) {
          console.log("We failed because of email quota!");
        }
      } catch (error) {
        console.log("Error: ", error);
      }
      return console.log(error);
    }
    console.log("Message sent: " + info.response);
  });
}


//delete function(availablefor all db type)
async function deleteFunction (db, _id) { 
  db.findByIdAndDelete(_id, function(err) {
    if (err) {
      console.log(err);
      console.log("Fail delete!!*****");
    }
    console.log("Success delete!!*****");
  })
}

// insert function (availablefor all db type)
async function insertFunction (db, msg) {
  // const res = await Order.find({Id:msg.Id}, null, { sort: { name: 1 }, limit: 1 });
  let sign = await findFunction(db, msg);
  if (!sign.res) {
    await db.create(msg).catch(error => console.log(error.stack));
    console.log("Sucess Insert msg");
    return true;
  } else {
    console.log("Fail insert msg!");
    return false;
  }
}

// update the original msg (availablefor all db type)
async function updateFunction (db, id, newMsg) {
    db.findByIdAndUpdate(
      {_id: id}, 
      newMsg,
      function (err, res) {
        if (err) {
          console.log("Happen error when update!!!");
          console.log(err);
        }
        if (res) {
          console.log("success to update msg!!!")
          // console.log(res);
        }
      })  
  
}


// using Id (not _id) search msg(return one msg cz only Id is unique)
async function findFunction (db, msg) {
  const res = await db.find({Id:msg.Id}, null, { sort: { name: 1 }, limit: 1 });
  if (res[0] != null) {
    console.log("Suceess to find order!");
    console.log("res._id:",res[0]._id);
    console.log("***********");
    let sucRes = {
      res: true,
      _id: res[0]._id
    };
    return sucRes;
  }else {
    console.log("***********");
    console.log("fail to find order!");
    let failRes = {
      res: false,
      _id: null
    };
    return failRes;
  }
}

