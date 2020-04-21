"use strict";
let express = require('express');
//let path = require('path')
let app = express();
let fs = require('fs');
let moment = require('moment');
let today = moment();
let port = 3000;
//let form = path.join(__dirname + '/form.html')
let user_info = {};






app.use(express.json());     
app.use(express.urlencoded());

app.get('/', (req, res) => {
  console.log(req.query);
});

app.get('/load', (req, res) => {
  if (req.method === 'GET') {
    if (req.query !== undefined && req.query.steamID !== undefined){
      let id = req.query.steamID;
      let content = JSON.stringify(user_info[id]);
      res.send(content);
    }
  }
});

app.all('/save', function (req, res) {
  let id = '';
  if (req.query !== undefined && req.query.steamID !== undefined){
    id = req.query.steamID;
  }
  let content = "";
  if (req.method === 'GET') {
    content = JSON.stringify(req.query, null, 2);
  } else {
    content = JSON.parse(req.body.data);
    if (user_info[id] === undefined) {
      user_info[id] = {};
    }
    user_info[id] = content;
    // user_info[id].xp = content.xp;
    // user_info[id].ability1 = content.ability1;
    // user_info[id].ability2 = content.ability2;
    // user_info[id].ability3 = content.ability3;
    // user_info[id].ability4 = content.ability4;
    // user_info[id].ability5 = content.ability5;
    // user_info[id].ability6 = content.ability6;
    // user_info[id].gold = content.gold;
    // user_info[id].items = content.items;
    setInterval(writeFile, 20000);
  }
  fs.writeFile('./123.json', JSON.stringify(req.query), (err) => {
    if(err) {
      console.log(err);
    }else {
      console.log("Writing succeed");
    }
  })
  res.send('saving succeed! ' + 'Query: ' + JSON.stringify(req.query) + req.body.data + JSON.stringify(user_info));
});

function writeFile() {
  let path = './data/' + today.format('YYYY-MM-DD') + '.json';
  let content = JSON.stringify(user_info);
  fs.writeFile(path, content, (err) => {
    if(err) {
      console.log(err);
    }else {
      console.log("Writing succeed");
    }
  })
}
app.listen(port, '0.0.0.0',  () => {
  let pathPrev = './data/' + today.subtract(1, 'days').format('YYYY-MM-DD') + '.json';
  fs.readFile(pathPrev, (err, data) => {
    if (err) {
      console.log(err);
    }else {
      user_info = JSON.parse(data);
    }
  })
  today.subtract(-1, 'days');
  console.log(`Listening at http://localhost:${port}`);
});
