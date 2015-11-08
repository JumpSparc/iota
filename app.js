var express          = require('express');
var path             = require('path');
var favicon          = require('serve-favicon');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var methodOverride   = require('method-override');

var app  = express();
var port = process.env.PORT || 3000;

var dbConfig = require('./config/db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // connected
  console.log('connected to db!');
});

// Configuring Passport
var passport       = require('passport');
var session        = require('express-session');
var flash          = require('connect-flash');

app.use(session({
  secret: 'jumpsparc solar app',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config/passport')(passport); // pass passport for configuration
var auth_export = require('./lib/auth'); // rename file later
// set user object for all 
app.use(auth_export.user);

// ROUTES
var index   = require('./routes/index')(passport);
var users   = require('./routes/users')(passport);
var devices = require('./routes/devices')(passport);
var api     = require('./routes/api')();
var mobile  = require('./routes/mobile')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', users);
app.use('/device', devices);
app.use('/api/v1/', api);
app.use('/m/', mobile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// quota guard
var http, options, proxy, url;

http = require("http");

url = require("url");

qg_proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL || 'http://quotaguard3753:6573bf143e5c@us-east-1-static-hopper.quotaguard.com:9293' );
qg_target  = url.parse("http://ip.quotaguard.com/");

qg_options = {
    hostname: qg_proxy.hostname,
    port: qg_proxy.port || 80,
    path: qg_target.href,
    headers: {
      "Proxy-Authorization": "Basic " + (new Buffer(qg_proxy.auth).toString("base64")),
      "Host" : qg_target.hostname
    }
};

http.get(qg_options, function(res) {
    res.pipe(process.stdout);
      return console.log("status code", res.statusCode);
});
// quotaguard end

app.listen(port);
console.log('listening to port: ' + port);
