const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport =require('passport');

// bring in User models
let User = require('../models/user');
const verifyPasswordsMatch = (req, res, next) => {
    const {password} = req.body;
    return check('password2','Passwords do not match')
      .equals(password);
}
// register form
router.get('/register',(req,res)=>{
  res.render('register')
})

// register process
router.post('/register',[
  // title must be notEmpty
  check('name','Name is required').notEmpty(),
  // author must be notEmpty
  check('email','Email is required').notEmpty(),
  check('email','Email is not valid').isEmail(),
  // body must be notEmpty
  check('username','Username is required').notEmpty(),
  check('password','Password is required').notEmpty(),
  //verifyPasswordsMatch()
],(req,res)=>{
  const result = validationResult(req);
  if (result.errors.length>0) {
    res.render('register',{
      title:'Register',
      errors:result.errors
    });
  } else {
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(user.password,salt,(err,hash)=>{
        if (err) {
          console.log(err);
        }
        user.password = hash;
        User.create(user,function(err){
          if (err) {
            console.log(err);
            return;
          }else {
            req.flash('success','You are now registered and can login');
            res.redirect('/users/login');
          }
      });
    });
    });
  }
});

// login form
router.get('/login',(req,res)=>{
  res.render('login');
})

// login process
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash:true
  })(req,res,next);
});

//logout
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/users/login');
})

module.exports = router;
