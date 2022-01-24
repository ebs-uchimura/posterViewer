/**
 * sql.js
 *
 * name：SQL
 * function：SQL operation
 **/
 
// ■ define modules
const mysql = require('mysql2');
const DB = require('./db');
const db = new DB(process.env.KEY1, process.env.KEY2, process.env.KEY3, process.env.KEY4);

class SQL {

  // ◆ construnctor
  constructor() {
  }

  // ◆ getter
  get getValue() {
    if(SQL.isEmpty(db.obj)) {
      return "error"; // return error
    } else {
      return db.obj; // return result
    }
  }

  // ★ inquire
  doInquiry = (sql, inserts) => {
    // make query
    let qry = mysql.format(sql, inserts);
    // connect ot mysql
    db.doQuery(qry);
  }

  static isEmpty(obj){
    return !Object.keys(obj).length; // check whether blank
  }

}

module.exports = SQL;