/**
 * db.js
 *
 * name：DB
 * function：DB operation
 **/
 
// ■ define module
const mysql = require('mysql2');

class DB {

  // ◆ constructer
  constructor(host, user, pass, db) {
    // DB config
    this.pool = mysql.createPool({
      host     : host,
      user     : user,
      password : pass,
      database : db,
      insecureAuth : true
    });
    this.obj; // result object
  }

  // ◆ゲッター
  get getResult() {
    return this.obj; // return result
  }

  // ★mysql実行
  doQuery(qry) {
    (async() => {
      const promisePool = this.pool.promise(); // spread pool
      const [rows, fields] = await promisePool.query(qry); // query name
      this.obj = rows; // result object
    })();
  }
}

module.exports = DB;