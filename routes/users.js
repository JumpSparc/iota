module.exports = function(express, passport) {
  var User    = require('../models/user'); 
  var router = express.Router();

  router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  })

  .get('/signup', function(req, res, next){
    res.render('users/signup', { title: 'Signup'});
  })

  .post('/signup', function(req, res, next){
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });

    newUser.save(function(err) {
      if(err) throw err;
      res.redirect('/');
    });
  })

  .get('/profile', function(req, res, next){
      res.render('users/profile');
    });
    return router;
  };
