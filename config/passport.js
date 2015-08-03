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
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done){
      // allows login with username or email
      var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
      User.findOne(criteria, function(err, user){
        if(err) { return done(err); }
      
        if(!user){
          return done(null, false, req.flash('loginMessage', 'User does not exist.'));
        }

        if(!user.comparePassword(password)){
          return done(null, false, req.flash('loginMessage', 'Incorrect password'));
        }
        return done(null, user);
      });
    }      
  ));
};
