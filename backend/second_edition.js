"use strict";

// 引入expres框架
let express = require("express");
let app = express();
app.use(express.json());     
app.use(express.urlencoded());
app.use(express.static("./frontend/public"));
// app.use(cors());


let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();

let port = 5000;

//引入数据库模块
const mongoose = require('mongoose');
// need to be set for use findOneAndUpdate function
mongoose.set('useFindAndModify', false);
// 数据库绑定
let url = 'mongodb://localhost:27017/orderManageSystem';
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
  });
// 定义order模型
const orderSchema = new mongoose.Schema({ 
  Id: {type: Number, unique:true},
  orderTime: {type: Date, default:Date.now},   //不需要设定
  orderStatus: Boolean,
  payType: Number,
  customerName: String,
  totalPrice: Number,
  remark: String
});
//定义client模型
const clientSchema = new mongoose.Schema({
  Id: {type: Number, unique: true},
  customerName: String,
  address: String,
  status: Boolean,
  phoneNumber: Number,
  remark: String,
  country: String
})

//定义product模型
const productSchema = new mongoose.Schema({
  Id: {type: Number, unique: true},
  productName: String,
  price: Number,
  quantity: Number,
  type: {type:String, enum:["daily_necessities", "make_up"]},
  remark: String
})
// 以固定模式作为Order数据库的模版
const Order = mongoose.model('Order', orderSchema);
const Client = mongoose.model('Client', clientSchema);
const Product = mongoose.model("Product", productSchema);

async function dbAndMsg (query, body) {
  let db;
  let msg;
  if(query.type == "order") {
    db = Order;
    msg = {
      Id : body.Id,
      orderStatus: body.orderStatus,
      payType: body.payType,
      customerName: body.customerName,
      totalPrice: body.totalPrice,
      remark: body.remark
    } 
  }else if (query.type == "client") {
    db = Client;
    msg = {
      Id: body.Id,
      customerName: body.customerName,
      address: body.address,
      status: body.status,
      phoneNumber: body.phoneNumber,
      remark: body.remark,
      country: body.country
    }
  }else if (query.type == "product") {
    db = Product,
    msg = {
      Id: body.Id,
      productName: body.productName,
      price: body.price,
      quantity: body.quantity,
      type: body.type,
      remark: body.remark     
    }
  }
  let dbMsg = {
    dbName: db,
    msgContend: msg
  }
  return dbMsg;
}
// 主页
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/public/index.html");
});


// login,发送login主页
app.get('/Login', (req, res) => {
  console.log(req.query);
  res.sendFile(__dirname + "/frontend/public/order_summary.html");  //跳转到home界面
});

// load 登陆后发送所有的订单和用户信息
app.get('/load', async function (req, res) {
  let allMsg = {
    orders: await Order.find(),
    clients: await Client.find(),
    products: await Product.find()
  }
  let content = JSON.stringify(allMsg);
  res.send(content);
})

// 增加 new order || new client || new product
app.post('/create', jsonParser, async function (req, res) {
  if ((req.body == undefined || req.query == undefined)) return res.sendStatus(400);
  let dbMsg = await dbAndMsg(req.query, req.body);
  
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
app.post('/delete', jsonParser, async function (req, res) {
  if ((req.body == undefined || req.query == undefined)) return res.sendStatus(400);
  let db;
  if (req.query.type == "order") db = Order;
  else if (req.query.type == "client") db = Client;
  else if (req.query.type == "product") db = Product;
  let msg = {Id:req.query.Id}
  console.log("Id:", req.query.Id);
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

