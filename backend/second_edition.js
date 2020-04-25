"use strict";

// 引入expres框架
let express = require("express");
let app = express();
const cors = require("cors");

app.use(express.json());     
app.use(express.urlencoded());
app.use(express.static("./frontend/public"));
app.use(cors());

let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();


let port = 5000;

//引入数据库模块
const mongoose = require('mongoose');
// need to be set for use findOneAndUpdate function
mongoose.set('useFindAndModify', false);
// 数据库绑定
let url = 'mongodb://localhost:27017/orderManage';
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
  });
// 定义order模型
const orderSchema = new mongoose.Schema({ 
  Id: {type: String, unique:true},
  orderTime: {type:String},   //不需要设定
  orderStatus: {type:String},
  payType: {type:String},
  customerName: {type:String},
  totalPrice: {type:String},
  remark: {type:String}
});
//定义client模型
const clientSchema = new mongoose.Schema({
  Id: {type: String, unique:true},
  customerName: {type:String},
  address: {type:String},
  status: {type:String},
  phoneNumber: {type:String},
  remark: {type:String},
  country: {type:String}
})

//定义product模型
const productSchema = new mongoose.Schema({
  Id: {type: String, unique:true},
  productName: {type:String},
  price: {type:String},
  quantity:{type:String},
  type: {type:String},
  remark: {type:String}
})
// 以固定模式作为Order数据库的模版
const Order = mongoose.model('Order', orderSchema);
const Client = mongoose.model('Client', clientSchema);
const Product = mongoose.model("Product", productSchema);

async function dbAndMsg (query, body) {
  let db;
  let msg;
  if(query.type == "orders") {
    db = Order;
    msg = {
      Id : query.id,
      orderTime: body.data.OrderDate,
      orderStatus: body.data.OrderDate,
      payType: body.data.PayType,
      customerName: body.data.Client,
      totalPrice: body.data.Totalprice,
      remark: body.data.Remark
    } 
  }else if (query.type == "clients") {
    db = Client;
    msg = {
      Id: query.id,
      customerName: body.data.Name,
      address: body.data.Address,
      status: body.data.Status,
      phoneNumber: body.data.Phone,
      remark: body.data.Remark,
      country: body.data.Country
    }
  }else if (query.type == "products") {
    db = Product,
    msg = {
      Id: query.id,
      productName: body.data.Name,
      price: body.data.Price,
      quantity: body.data.Quantities,
      type: body.data.Type,
      remark: body.data.Remark     
    }
  }
  let dbMsg = {
    dbName: db,
    msgContend: msg
  }
  return dbMsg;
}


app.get("/", function (req, res) {
  console.log("req.query");
  res.sendFile(__dirname + "/frontend/public/index.html");
});

app.route("/Login").get((req, res) =>{
  res.sendFile(__dirname + "/frontend/public/order_summary.html");

});

// load 登陆后发送所有的订单和用户信息
app.get('/load',  async function (req, res){
  let allMsg = {
    orders: await Order.find(),
    clients: await Client.find(),
    products: await Product.find()
  }
  console.log("req.query",allMsg);
  let content = JSON.stringify(allMsg);
  res.send(content);
})

// 增加 new order || new client || new product
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

// update Order || client ||  product 
app.post('/update', jsonParser, async function (req, res) {
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

//delete order || client || product
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

//delete function
async function deleteFunction (db, _id) { 
  db.findByIdAndDelete(_id, function(err) {
    if (err) {
      console.log(err);
      console.log("Fail delete!!*****");
    }
    console.log("Success delete!!*****");
  })
}

// sync function
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

// update the original msg 
async function updateFunction (db, id, newMsg) {
  // 跟新order内容
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
          console.log(res);
        }
      })  
  
}


// using ID search order
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

