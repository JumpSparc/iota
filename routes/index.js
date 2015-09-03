var express = require('express');
var router  = express.Router();
var User   = require('../models/user');
var Device   = require('../models/device');
var Log   = require('../models/log');
var auth = require('../lib/auth');

module.exports = function(passport){


  router.get('/', auth.isLoggedIn, function(req, res, next) {
    Device.find({ user_id: req.user._id }, function(err, devices) {
    
      res.render('index', { user: req.user, devices: devices});
    }); 
  })
  // login page
  .get('/login', function(req, res, next) {
    res.render('login',{ message: req.flash('loginMessage') });
  })
  // login method
  .post('/login', passport.authenticate('local', { successRedirect: '/', 
                                                   failureRedirect: '/login',
                                                   failureFlash: true
                                      })
  )

  // logout method
  .get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/login');
  })
  // user profile page
  .get('/profile', auth.isLoggedIn, function(req, res, next){
    res.render('users/profile', {user: req.user, message: req.flash('changePassMessage')});
  })
  // update user profile
  .post('/profile', function(req, res, next) {
    User.findById(req.body._id, function(err, user) {
      console.log(user);

      user.password = req.body.password;
      user.save(function(err){
        if(err) throw err;
        
        req.flash('changePassMessage', 'Password changed!');
        res.redirect('/profile');
      });
    });
  });

  return router;
};
