"use strict";
// 引入expres框架
let express = require("express");
let app = express();
// fs框架
let fs = require('fs');
let moment = require('moment');
let today = moment();

//引入数据库模块
const mongoose = require('mongoose');

//MangoDB 服务器
const url = 'mongodb://localhost:27017/customer';

//目标数据库名字
// const dbname = 'orderDetail';

//创建MangoDB客户端
// const client = new MongoClient(url);



let port = 5000;
//let form = path.join(__dirname + '/form.html')
let user_info = {};

let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();

app.use(express.json());     
app.use(express.urlencoded());

app.get('/', (req, res) => {
  console.log(req.query);
});

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("成功连接！！！");

//   //数据库实例
//   // const db = client.db(dbname);
//   //断开连接
//   db.close();
// })

// 设置默认 mongoose 连接


// 让 mongoose 使用全局 Promise 库
// mongoose.Promise = global.Promise;
// 取得默认连接
// const db = mongoose.connection;
// 将连接与错误事件绑定（以获得连接错误的提示）
// db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

// //定义模型
// const Schema = mongoose.Schema;
// const SomeSchemaModel = new Schema({
//   Id: {type: Number, unique:true},
//   orderTime: {type: Date, default:Date.now},
//   orderStatus: Boolean,
//   payType: Number,
//   customerName: String,
  
// });
// 
// const SomeModel = mongoose.model('SomeModel', SomeSchemaModel);


/**
 * 登陆功能
 */
// app.get('/load', (req, res) => {
//   // if (req.method === 'GET') {
//     if (req.query !== undefined && req.query.steamID !== undefined){
//       let id = req.query.steamID;
//       let content = JSON.stringify(req.query.steamID);
//       res.send(content);
//       console.log(`contend: ${content}`);
//     // }
//   }
// });


/**
 * 新建client
 */
app.post('/newclient', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  if (mongoose.somemodels.find({Id: req.body.Id}) != null) {
    console.log("This data have already inserted!");
    res.send("This have already inserted!")
  }else {
    res.send('welcome ****, ' + req.body.customerName);
    //创建 SomeModel 模型实例
      const test = new SomeModel({customerName: req.body.customerName, Id:req.body.Id, orderStatus:req.body.orderStatus, payType: req.body.payType});
      console.log("test.status:", test.orderStatus);
    // 传递回调保存模型实例
      test.save( function(error) {
        if (error) {
          return handleError(error);
        }
      })
      let outputString = JSON.stringify(test.customerName, null, 2);
      console.log("Outcome: ", "Succcess insert:" + outputString);   
  }
 });

 /**
  * 查询client
  */

// 



app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});
