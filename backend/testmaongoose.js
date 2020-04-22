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


app.get('/', (req, res) => {
  console.log(req.query);
});

app.post('/newclient', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  run().catch(error => console.log(error.stack));
  res.send("success");
})

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});

  let url = 'mongodb://localhost:27017/test';
  mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }).then(() => {
    console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });
  // 定义模型
  const customerSchema = new mongoose.Schema({ name: String, age: Number, email: String });
  // 使用模式编译模型
  const Customer = mongoose.model('Customer', customerSchema);

let msg = { name: 'D', age: 30, email: 'a@foo.bar' };
async function run(msg) {
  await Customer.create(msg);
  await Customer.create({ name: 'B', age: 28, email: 'b@foo.bar' });

  // Find all customers
  const docs = await Customer.find();
  console.log(docs);
  const res = await Customer.find({}, null, { sort: { name: 1 }, limit: 1 });
  ; // 'A
  console.log("res:", res[0].name);
  
}
