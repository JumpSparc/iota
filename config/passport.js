var Local    = require('passport-local').Strategy;
var User     = require('../models/user');

module.exports = function(passport){
  // sessions stuff
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    }); 
  });

  // login authentication
  passport.use(new Local({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done){
      User.findOne({email: email}, function(err, user){
        if(err) { return done(err); }
      
        if(!user){
          return done(null, false, req.flash('loginMessage', 'Incorrect email'));
        }

        if(!user.comparePassword(password)){
          return done(null, false, req.flash('loginMessage', 'Incorrect password'));
        }
        return done(null, user);
      });
    }      
  ));
};
