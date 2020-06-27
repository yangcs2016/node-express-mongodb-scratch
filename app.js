const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressMessages = require('express-messages');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log('DB Connection Error: '+ err.message);
});

let db = mongoose.connection;
//init app
const app = express();

// bring in models
let Article = require('./models/article');

//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));
// parse application/json
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname,'public')));

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = expressMessages(req, res);
  next();
});

// passport config
require('./config/passport')(passport);
// passprot middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
  res.locals.user = req.user || null;
  next();
})
//Home route
app.get('/',(req,res)=>{
  Article.find({},function(err,articles){
    if (err) {
      console.log(err);
    }else {
      res.render('index',{
        title:'Articles',
        articles:articles
      });
    }
  });
});

// route files
let articles =require('./routes/articles');
app.use('/articles',articles);
let users =require('./routes/users');
app.use('/users',users);

//Start server
app.listen(3000,function(){
  console.log('server start on port 3000')
})
