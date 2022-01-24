/**
 * app.js
 *
 * function：main NODE server
 **/

// ■ define modules
const express = require('express'); // express config
const path = require('path'); // path config
const port = process.env.PORT || 3001; // port config
const indexRouter = require('./routes/index'); // execute main file

const app = express(); // initilize express 

// ■ EJS setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ■express setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ★main
app.use('/', indexRouter);

// connect to port
let server = app.listen(port, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});