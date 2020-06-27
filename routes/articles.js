const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// bring in Article models
let Article = require('../models/article');
// user models
let User = require('../models/user');
// add route
router.get('/add',(req,res)=>{
  res.render('add_article',{
    title:'Add Article'
  });
})

// add submit post route
router.post('/add',[
  // title must be notEmpty
  check('title','Title is required').notEmpty(),
  // author must be notEmpty
  //check('author','Author is required').notEmpty(),
  // body must be notEmpty
  check('body','Body is required').notEmpty()
], ensureAuthenticated, function(req,res) {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const result = validationResult(req);
  if (result.errors.length>0) {
    res.render('add_article',{
      title:'Add Article',
      errors:result.errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    Article.create(article,function(err){
      if (err) {
        console.log(err);
        return;
      }else {
        req.flash('success','Article Added');
        res.redirect('/');
      }
    });
  }
});

// load edit forn
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
  Article.findById(req.params.id,function(err,article){
    if (article.author != req.user._id) {
      req.flash('danger','Not authorized');
      res.redirect('/');
    }
    res.render('edit_article',{
      title:'Edit Article',
      article:article
    });
  });
});

// update submit post route
router.post('/edit/:id',function(req,res) {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  let query = {_id:req.params.id};
  Article.updateOne(query,article,function(err){
    if (err) {
      console.log(err);
      return;
    }else {
      req.flash('success','Article Updated');
      res.redirect('/')
    }
  });
});

router.delete('/:id',(req,res)=>{
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = {_id:req.params.id};
  Article.findById(req.params.id,function(err,article){
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query,function(err) {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });  
});

// get single articles
router.get('/:id',(req,res)=>{
  Article.findById(req.params.id,function(err,article){
    User.findById(article.author,function(err,user){
      res.render('article',{
        article:article,
        author:user.name
      });
    });
  });
});

// access controls
function ensureAuthenticated(req,res,next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger','please login');
    res.redirect('/users/login');
  }
}


module.exports = router;
