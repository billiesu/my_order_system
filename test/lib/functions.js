const mongoose = require('mongoose');
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
  const Order = mongoose.model('Order', orderSchema);

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
    await Order.create(msg).catch(error => console.log(error.stack));
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

  
  const res = await Order.find({Id:msg.Id}, null, { sort: { name: 1 }, limit: 1 });
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

//-----------------------------------------------------------------------------
module.exports = {
  delete: deleteFunction,
  insert: insertFunction,
  update: updateFunction,
  find: findFunction
};