/**
 * index.js
 *
 * function：main
 **/

// ■ define module
const express = require('express'); // express
require('dotenv').config(); // dotenv configuration

const app = express();
const router = express.Router(); // router

// ■ class initialization
const DB = require('../class/db'); // DB
const db = new DB(process.env.KEY1, process.env.KEY2, process.env.KEY3, process.env.KEY4); // DB instance
const SQL = require('../class/sql'); // SQL
const sql = new SQL(); // SQL

// ■ DB limit
const DB_LIMIT = 20;

// ★ top page
router.get('/', (req, res, next) => {
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  allSearch(res, times); // search all
});

// ★ title search
router.get('/search1', (req, res, next) => {
  let searchtl = req.query.ori === void 0 ? req.query.title : req.query.ori; // title
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchtl) {
    ambiguousSearch('title', searchtl, res, 1, times); // fuzzy search
  } else {
    allSearch(res, times); // search all
  }
});

// ★ management no search
router.get('/search2', (req, res, next) => {
  let searchno = req.query.ori === void 0 ? req.query.sort_no : req.query.ori; // management no
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchno) {
		codeSearch(searchno, res, times); // code search
  } else {
  	allSearch(res, times); // search all
  }
});

// ★ types search
router.get('/search3', (req, res, next) => {
  let searchgr = req.query.ori === void 0 ? Number(req.query.type) : req.query.ori; // types
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchgr) {
    generalSearch('ganre_id', searchgr, res, 3, times); // general search
  }
});

// ★ year search
router.get('/search4', (req, res, next) => {
  let searchyr = req.query.ori === void 0 ? Number(req.query.year) : req.query.ori; // production year
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchyr) {
    generalSearch('man_date', searchyr, res, 4, times); // general search
  }
});

// ★ anniversary search
router.get('/search5', (req, res, next) => {
  let searchan = req.query.ori === void 0 ? Number(req.query.anniversary) : req.query.ori; // anniversary
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchan) {
    generalSearch('anniversary', searchan, res, 5, times); // general search
  }
});

// ★ out of fixed search
router.get('/search6', (req, res, next) => {
  let searchfx = req.query.ori === void 0 ? req.query.fixed : req.query.ori; // out of fixed
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchfx) {
    generalSearch('fixed', searchfx, res, 6, times); // general search
  }
});

// ★ keyword search
router.get('/search7', (req, res, next) => {
  let searchkw = req.query.ori === void 0 ? req.query.keyword : req.query.ori; // keyword
  let times = req.query.times === void 0 ? 0 : req.query.times; // search times
  if(searchkw) {
  	ambiguousSearch('keyword', searchkw, res, 7, times); // fuzzy search
  } else {
		allSearch(res, times); // search all
  } 
});

// ★ error
router.get('/err', (req, res, next) => {
  res.render('error', {err: "no data", msg: "no result"});
});


// ◆ execute after 1 second
const resolveAfter1Seconds = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sql.getValue); // return value
    }, 1000);
  });
}

// ◆ management no shaping
const dataShaping = (obj) => {
  const dataArr = JSON.parse(JSON.stringify((new Array(10000)).fill((new Array(10)).fill(0)))); // define array
  let tmpArr = []; // ID set
  let index = 0; // map index
  Object.keys(obj).map((key, i) => {
    tmpArr[i] = obj[key].item_id; // ID set
  });
  const set = new Set(tmpArr); // no duplicate collection
  const setToArr = Array.from(set); // get array
  Object.keys(obj).map((key, i) => {
    index = setToArr.indexOf(obj[key].item_id); // get index
    dataArr[index][obj[key].type - 1] = Number(obj[key].no); // set management no into array
  });
  return dataArr; // return value
}

// ◆ search all
const allSearch = (res, times) => {
  let obj1, obj2; // result object
  let idArr = []; // ID array
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? LIMIT ? OFFSET ?", ['item', DB_LIMIT, DB_LIMIT * times]); // SQL query
    obj1 = await resolveAfter1Seconds(); // wait
    if(obj1 == "error"){
      await res.redirect("/err"); // if error goto top
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // ID
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQL query
      obj2 = await resolveAfter1Seconds(); // wait
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: "", no: 0, fix: obj1[0].fixed}); // render
    }
  })();
}

// ◆ general search
const generalSearch = (column, word, res, no, times) => {
  let obj1, obj2; // result object
  let idArr = []; // ID
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? WHERE ?? = ? LIMIT ? OFFSET ?", ['item', column, word, DB_LIMIT, DB_LIMIT * times]); // SQL query
    obj1 = await resolveAfter1Seconds(); // wait
    if(obj1 == "error"){
      await res.redirect("/err"); // if error goto top
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // set ID
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQL query
      obj2 = await resolveAfter1Seconds(); // wait
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: no, fix: obj1[0].fixed}); // render
    }
  })();
}

// ◆ fuzzy search
const ambiguousSearch = (column, word, res, no, times) => {
  let obj1, obj2; // result object
  let idArr = []; // ID
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? WHERE ?? LIKE ? LIMIT ? OFFSET ?", ['item', column, '%' + word + '%', DB_LIMIT, DB_LIMIT * times]); // SQL query
    obj1 = await resolveAfter1Seconds(); // wait
    if(obj1 == "error"){
      await res.redirect("/err"); // if error goto top
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // ID
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQL query
      obj2 = await resolveAfter1Seconds(); // wait
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: no, fix: obj1[0].fixed}); // render
    }
  })();
}

// ◆ management no search
const codeSearch = (word, res, times) => {
  let obj1, obj2; // result object
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? LEFT OUTER JOIN ?? ON ?? = ?? WHERE ?? = ? LIMIT ? OFFSET ?", ['item', 'man_no', 'item.ID', 'man_no.item_id', 'man_no.no', word, DB_LIMIT, DB_LIMIT * times]); // SQL query
    obj1 = await resolveAfter1Seconds(); // wait
    if(obj1 == "error"){
      await res.redirect("/err"); // if error goto top
    } else {
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? = ?", ['man_no', 'item_id', obj1[0].ID]); // SQL query
      obj2 = await resolveAfter1Seconds(); // wait
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: 2, fix: obj1[0].fixed}); // render
    }
  })();
}

module.exports = router;



