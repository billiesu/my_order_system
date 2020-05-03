const assert = require("assert");
const myLib = require("./lib/functions.js");

// Testing find function
describe("test findFunction", () => {
    it("should return false", async () => {
      let db;
      let msg = {
          Id : "123",
          OrderDate: "2012-12-12",
          Client: "bilibili",
          Totalprice: "123123",
          PayType: "wechat",
          Status: "unfinished",
          Remark: "need finished"
      }
      let funcRes = await myLib.find(db, msg);
      assert.equal(funcRes.res, true);
    });
  });

// Testing insert function
  describe("test insertFunction", () => {
    it("should return true", async () => {
      let db;
      let msg = {
          Id : "123",
          OrderDate: "2012-12-12",
          Client: "bilibili",
          Totalprice: "123123",
          PayType: "wechat",
          Status: "unfinished",
          Remark: "need finished"
      }
      let funcRes = await myLib.insert(db, msg);
      assert.equal(funcRes, false);
    });
  });