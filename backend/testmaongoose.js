"use strict";

// 引入expres框架
let express = require("express");
let app = express();
app.use(express.json());     
app.use(express.urlencoded());

let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();

let port = 5000;

//引入数据库模块
const mongoose = require('mongoose');
// need to be set for use findOneAndUpdate function
mongoose.set('useFindAndModify', false);
// 数据库绑定
let url = 'mongodb://localhost:27017/clientMsg';
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
  });
// 定义模型
const orderSchema = new mongoose.Schema({ 
  Id: {type: Number, unique:true},
  orderTime: {type: Date, default:Date.now},   //不需要设定
  orderStatus: Boolean,
  payType: Number,
  customerName: String,
  totalPrice: Number,
  remark: String

});
// 以固定模式作为Order数据库的模版
const Order = mongoose.model('Order', orderSchema);

// 初始化
app.get('/', (req, res) => {
  console.log(req.query);
});

// load 登陆后发送所有的订单和用户信息
app.get('/load', async function (req, res) {
  let allFindMsg = await Order.find();
  let content = JSON.stringify(allFindMsg);
  res.send(content);
})

// 增加新订单
app.post('/createOrder', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400);
  let msg = {
    Id : req.body.Id,
    orderStatus: req.body.orderStatus,
    payType: req.body.payType,
    customerName: req.body.customerName,
    totalPrice: req.body.totalPrice,
    remark: req.body.remark
  }
  let insertSign = await orderInsert(msg).catch(error => console.log(error.stack));
  console.log("sign:", insertSign);
  if (insertSign) 
    res.send("success");
  else 
    res.send("fail")
})

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});


// updateOrder
app.post('/updateOrder', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400);
  let msg = {
    Id : req.body.Id,
    orderStatus: req.body.orderStatus,
    payType: req.body.payType,
    customerName: req.body.customerName,
    totalPrice: req.body.totalPrice,
    remark: req.body.remark
  }
  let searchRes = await orderFind(msg);
  if (!searchRes.res) {
    res.send("Couldn't find this order!!")
  } else {
    // console.log("2!Send id is:", searchRes.id);
    await orderUpdate(searchRes._id, msg);
    res.send("success execute!!");
    // console.log("Execute result:" + exRes);
  }
})

app.post('/deleteOrder', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400);
  let msg = {Id: req.body.Id};
  let searchRes = await orderFind(msg);
  if (!searchRes.res) {
    res.send("Couldn't find this order!!")
  } else {
    await orderDelete(searchRes._id);
    res.send("success delete!!")
  }
  
})

//delete function
async function orderDelete (_id) { 
  Order.findByIdAndDelete(_id, function(err) {
    if (err) console.log(err);
    console.log("Success delete!!*****");
  })
}

// sync function
async function orderInsert (msg) {
  // const res = await Order.find({Id:msg.Id}, null, { sort: { name: 1 }, limit: 1 });
  let sign = await orderFind(msg);
  if (!sign.res) {
    await Order.create(msg).catch(error => console.log(error.stack));
    console.log("Sucess Insert");
    return true;
  } else {
    console.log("Fail insert!");
    return false;
  }
}

// update the original msg 
async function orderUpdate (id, newMsg) {
  // console.log("1!Send id is:", id);
  Order.findByIdAndUpdate(
    {_id: id}, 
    { 
      Id : newMsg.Id,
      orderStatus: newMsg.orderStatus,
      payType: newMsg.payType,
      customerName: newMsg.customerName,
      totalPrice: newMsg.totalPrice,
      remark: newMsg.remark
    },
    function (err, res) {
      if (err) {
        console.log("Happen error!!!");
        console.log(err);
      }
      if (res) {
        console.log("success!!!")
        console.log(res);
      }
    })  
}


// using ID search order
async function orderFind (msg) {
  const res = await Order.find({Id:msg.Id}, null, { sort: { name: 1 }, limit: 1 });
  if (res[0] != null) {
    console.log("find!");
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

