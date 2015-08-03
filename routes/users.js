var express = require('express');
var router  = express.Router();
var User    = require('../models/user'); 

module.exports = function(passport) {

  router.get('/signup', function(req, res, next){
    // redirect to home if already logged in
    if(req.user) res.redirect('/');

    res.render('users/signup', { title: 'Signup'});
  })
  // create user
  .post('/signup', function(req, res, next){
    // split email by '@' for default username
    // example: 'randomano@yahoo.com'
    //    username = randomano
    var username = req.body.email.split('@')[0];
    console.log('Generated Username:' + username);
    var newUser = new User({
      email: req.body.email,
      username: username,
      password: req.body.password
    });

    newUser.save(function(err) {
      if(err) throw err;
      res.redirect('/');
    });
  });

  return router;
};
