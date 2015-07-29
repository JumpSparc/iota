module.exports = function(express, passport){
  var router = express.Router();
  var User   = require('../models/user');

  router.get('/', isLoggedIn, function(req, res, next) {
    res.render('index', { title: 'Express' });
  })
  
  .get('/login', function(req, res, next) {
    res.render('login',{ message: req.flash('loginMessage') });
  })
  
  .post('/login', passport.authenticate('local', { successRedirect: '/', 
                                                   failureRedirect: '/login',
                                                   failureFlash: true
                                      })
  )

  .get('/profile', isLoggedIn, function(req, res, next){
    res.render('users/profile', {user: req.user, message: req.flash('changePassMessage')});
  })
  
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
    //res.json(req.body);
  });

  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
    
    // user session is not found
    res.redirect('/login');
  }
  return router;
};
