/**
 * index.js
 *
 * 機能：メイン実行ファイル
 **/

// ■モジュール読み込み
const express = require('express'); // express 設定
require('dotenv').config(); // dotenv(環境変数) 設定

const app = express();
const router = express.Router(); // router 設定

// ■クラス初期化
const DB = require('../class/db'); // DB設定
const db = new DB(process.env.KEY1, process.env.KEY2, process.env.KEY3, process.env.KEY4); // DBインスタンス生成
const SQL = require('../class/sql'); // SQL設定
const sql = new SQL(); // SQLインスタンス設定

// ■DB関係定数
const DB_LIMIT = 20;

// ★トップページアクセス
router.get('/', (req, res, next) => {
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  allSearch(res, times); // 全検索
});

// ★タイトル検索
router.get('/search1', (req, res, next) => {
  let searchtl = req.query.ori === void 0 ? req.query.title : req.query.ori; // タイトル
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchtl) {
    ambiguousSearch('title', searchtl, res, 1, times); // あいまい検索
  } else {
    allSearch(res, times); // 全検索
  }
});

// ★管理番号検索
router.get('/search2', (req, res, next) => {
  let searchno = req.query.ori === void 0 ? req.query.sort_no : req.query.ori; // 管理番号
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchno) {
		codeSearch(searchno, res, times); // コード検索
  } else {
  	allSearch(res, times); // 全検索
  }
});

// ★酒種類検索
router.get('/search3', (req, res, next) => {
  let searchgr = req.query.ori === void 0 ? Number(req.query.type) : req.query.ori; // 酒種類
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchgr) {
    generalSearch('ganre_id', searchgr, res, 3, times); // 通常検索
  }
});

// 制作年検索
router.get('/search4', (req, res, next) => {
  let searchyr = req.query.ori === void 0 ? Number(req.query.year) : req.query.ori; // 制作年
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchyr) {
    generalSearch('man_date', searchyr, res, 4, times); // 通常検索
  }
});

// ★周年検索
router.get('/search5', (req, res, next) => {
  let searchan = req.query.ori === void 0 ? Number(req.query.anniversary) : req.query.ori; // 周年
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchan) {
    generalSearch('anniversary', searchan, res, 5, times); // 通常検索
  }
});

// ★定形外検索
router.get('/search6', (req, res, next) => {
  let searchfx = req.query.ori === void 0 ? req.query.fixed : req.query.ori; // 定形外
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchfx) {
    generalSearch('fixed', searchfx, res, 6, times); // 通常検索 
  }
});

// ★キーワード検索
router.get('/search7', (req, res, next) => {
  let searchkw = req.query.ori === void 0 ? req.query.keyword : req.query.ori; // キーワード
  let times = req.query.times === void 0 ? 0 : req.query.times; // 検索回数
  if(searchkw) {
  	ambiguousSearch('keyword', searchkw, res, 7, times); // あいまい検索
  } else {
		allSearch(res, times); // 全検索
  } 
});

// ★エラー処理
router.get('/err', (req, res, next) => {
  res.render('error', {err: "no data", msg: "検索結果がありませんでした。"}); // レンダリング
});


// ◆1秒後に実行関数（DBアクセス待ち）
const resolveAfter1Seconds = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sql.getValue); // 値戻し
    }, 1000);
  });
}

// ◆管理番号用データ整形
const dataShaping = (obj) => {
  const dataArr = JSON.parse(JSON.stringify((new Array(10000)).fill((new Array(10)).fill(0)))); // 配列定義
  let tmpArr = []; // ID一時格納用
  let index = 0; // mapインデックス
  Object.keys(obj).map((key, i) => {
    tmpArr[i] = obj[key].item_id; // ID一時格納
  });
  const set = new Set(tmpArr); // 重複無しコレクション
  const setToArr = Array.from(set); // 配列取得
  Object.keys(obj).map((key, i) => {
    index = setToArr.indexOf(obj[key].item_id); // インデックス取得
    dataArr[index][obj[key].type - 1] = Number(obj[key].no); // 配列に管理番号格納
  });
  return dataArr; // 値返し
}

// ◆全体検索
const allSearch = (res, times) => {
  let obj1, obj2; // 結果受取用オブジェクト定義
  let idArr = []; // ID格納用
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? LIMIT ? OFFSET ?", ['item', DB_LIMIT, DB_LIMIT * times]); // SQLクエリ投げ
    obj1 = await resolveAfter1Seconds(); // 処理待ち
    if(obj1 == "error"){
      await res.redirect("/err"); // エラーの場合トップに帰る
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // ID格納
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQLクエリ投げ
      obj2 = await resolveAfter1Seconds(); // 処理待ち
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: "", no: 0, fix: obj1[0].fixed}); // 画面レンダリング
    }
  })();
}

// ◆通常検索
const generalSearch = (column, word, res, no, times) => {
  let obj1, obj2; // 結果受取用オブジェクト定義
  let idArr = []; // ID格納用
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? WHERE ?? = ? LIMIT ? OFFSET ?", ['item', column, word, DB_LIMIT, DB_LIMIT * times]); // SQLクエリ投げ
    obj1 = await resolveAfter1Seconds(); // 処理待ち
    if(obj1 == "error"){
      await res.redirect("/err"); // エラーの場合トップに帰る
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // ID配列に格納
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQLクエリ投げ
      obj2 = await resolveAfter1Seconds(); // 処理待ち
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: no, fix: obj1[0].fixed}); // 画面レンダリング
    }
  })();
}

// ◆あいまい検索
const ambiguousSearch = (column, word, res, no, times) => {
  let obj1, obj2; // 結果受取用オブジェクト定義
  let idArr = []; // ID格納用配列
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? WHERE ?? LIKE ? LIMIT ? OFFSET ?", ['item', column, '%' + word + '%', DB_LIMIT, DB_LIMIT * times]); // SQLクエリ投げ
    obj1 = await resolveAfter1Seconds(); // 処理待ち
    if(obj1 == "error"){
      await res.redirect("/err"); // エラーの場合トップに帰る
    } else {
      await Object.keys(obj1).map((key, i) => {
        idArr[i] = obj1[key].ID; // ID格納用
      });
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? IN (?)", ['man_no', 'item_id', idArr]); // SQLクエリ投げ
      obj2 = await resolveAfter1Seconds(); // 処理待ち
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: no, fix: obj1[0].fixed}); // 画面レンダリング
    }
  })();
}

// ◆管理番号検索
const codeSearch = (word, res, times) => {
  let obj1, obj2; // 結果受取用オブジェクト定義
  (async() => {
    await sql.doInquiry("SELECT * FROM ?? LEFT OUTER JOIN ?? ON ?? = ?? WHERE ?? = ? LIMIT ? OFFSET ?", ['item', 'man_no', 'item.ID', 'man_no.item_id', 'man_no.no', word, DB_LIMIT, DB_LIMIT * times]); // SQLクエリ投げ
    obj1 = await resolveAfter1Seconds(); // 処理待ち
    if(obj1 == "error"){
      await res.redirect("/err"); // エラーの場合トップに帰る
    } else {
      await sql.doInquiry("SELECT * FROM ?? WHERE ?? = ?", ['man_no', 'item_id', obj1[0].ID]); // SQLクエリ投げ
      obj2 = await resolveAfter1Seconds(); // 処理待ち
      await res.render('index', { data: obj1, man_no: dataShaping(obj2), ori: word, no: 2, fix: obj1[0].fixed}); // 画面レンダリング
    }
  })();
}

module.exports = router;



