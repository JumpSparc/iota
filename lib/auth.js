// add user object to locals, allowing to be used in templates
exports.user = function(req, res, next){
  res.locals.user = req.user || null;
  next();
};

// requires user to login
exports.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()) return next();

  // user is not logged in
  res.redirect('/login');
};
