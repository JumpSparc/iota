var express = require('express');
var async   = require('async');
var router  = express.Router();
var Device  = require('../models/device');
var User    = require('../models/user');
var Log     = require('../models/log');
var _       = require('underscore');

module.exports = function(){

  router.get('/', function(req, res, next) {
    res.json('You lost?');
  })
  
  .get('/fetch/:id', function(req, res, next) {
    Device.findOne({ _id: req.params.id }, function(err, device) {
      if(device){
        var d = Log.find({'device_id' : device.id }).sort('-created_at').limit(1000);
        d.exec( function(err, logs) {
          if (err) throw err;
          var series = [];
          device.variable.forEach(function(item) {
            var data = [];
            logs.forEach(function(log) {
              data.push({ x: log.created_at.getTime(), y: parseInt(log.data[item.name]) });
            });
            series.push({
              name: item.name,
              color: item.color,
              data: data
            });
          });
          // sorts the data in asc order
          series.map(function(item){
            item.data.reverse();
          });
          res.json(series);
        });
      }
      else{
        res.json({error: "Device not found."});
      }
    });
  })
  

  // Mobile
  .get('/sign_in', function(req, res, next) {

    var email = req.query.email;
    var password = req.query.password;

    if(email === undefined || password === undefined) { res.json({error: "email / password params required."}); }
    else{
      User.findOne({email: email}, function(err, user) {
        var validPass =  user ? user.comparePassword(password) : false;
        if(user && validPass){
          res.json({success: user._id}); 
        }
        else if(user && !validPass){
          res.json({error: "Wrong password."});
        }
        else{
          res.json({error: "User does not exist."});
        }
      });
    }
  })
  
  .get('/fetch/all_devices/:id', function(req, res, next) {
    var user_id = req.params.id;
    if(user_id){
      var data = [];

      Device.find({user_id: user_id}, function(err, devices) {
        if(devices){
          var all_devices = [];
          async.each(devices,
            function(device, callback){
              var d = Log.find({'device_id' : device.id }, 'created_at data').limit(1000);
              d.exec( function(err, logs) {
                if (err) throw err;
                var series = [];
                device.variable.forEach(function(item) {
                  var data = [];
                  logs.forEach(function(log) {
                    data.push({ x: log.created_at.getTime(), y: parseInt(log.data[item.name]) });
                  });
                  series.push({
                    name: item.name,
                    color: item.color,
                    data: data
                  });
                });

                var item = {   
                  id: device.id,
                  name: device.name,
                  desc: device.desc,
                  status: device.status,
                  location: device.location,
                  gmap: device.gmap,
                  privacy: device.privacy,
                  variables: series
                }
 
                all_devices.push(item);
                callback();
              });
            },
            // return function
            function(err) {
              res.json(all_devices);
            }
          );

        }
        else{
          res.json({error: 'no devices found'});
        }
      });  
    }
    else{
      res.json({error: "User id required."});
    }
  })
  
  .get('/add_device', function(req, res, next) {
    var newDevice = {
      user_id:   req.query.user_id,
      name:      req.query.name,
      desc:      req.query.desc,
      privacy:   req.query.privacy,
      status:    'on',
      graph:     'area',
      location:  req.query.location,
      gmap:      req.query.gmap,
      variable:  { name: req.query.data, color: "#CD5C5C" }
    }
    
    if(req.query.user_id !== undefined && req.query.name !== undefined){
      saveDevice(newDevice, req, res);
    }
    else{
      res.json({error: "user_id and name required"});
    }
  })
  
  .get('/update_device', function(req, res, next) {
    var device_id = req.query.device_id;

    var device = {
      name:      req.query.name,
      desc:      req.query.desc,
      privacy:   req.query.privacy,
      location:  req.query.location,
      gmap:      req.query.gmap,
      variable:  { name: req.query.data, color: "#CD5C5C" }
    }

    if(req.query.device_id !== undefined){
      updateDevice(device_id, device, req, res);
    }
    else{
      res.json({error: "device_id required"});
    }
  
  })

  .get('/delete_device', function(req, res, next) {
    if(req.query.device_id !== undefined){
      Device.find({ _id: req.query.device_id }).remove().exec();
      res.json({status: "Device " + req.query.device_id + " deleted"});
    }
    else{
      res.json({error: "device_id required"});
    }
  
  })

  .get('/device_status/:id', function(req, res, next) {
    var device_id = req.params.id;
    Device.findOne({_id: device_id}, function(err, device) {
      if (device) {
        res.json({status: device.status});
      }
      else{
        res.json({error: "device not found."});
      }
    });
  })

  .get('/device/:command/:id', function(req, res, next) {
    var device_id = req.params.id;
    var command   = req.params.command;
    if(device_id){
      updateDevice(device_id, {status: command}, req, res)      
    }
    else{
      res.json({error: "device_id required."});
    }
  })
  
  // TODO: add forget password
  .get('/forget_pass', function(req, res, next) {
  
  })

  // devices with no user
  // register through qr code in mobile
  // accepts user_id and device_id only
  .get('/qr_add_device', function(req, res, next){
    var device_id = req.query.device_id;
    var user_id   = req.query.user_id;

    if (user_id && device_id) {
      updateDevice(device_id, {user_id: user_id}, req, res);
    }
    else{
      res.json({ error: "user_id and device_id required.", params: req.params })
    }
  });

  return router;
};

function saveDevice(data, req, res) {
  Device.create(data, function(err) {
    if(err) res.json({message: err});

    res.json({ device_id: data }); 
  });
}

function updateDevice(device_id, data, req, res) {
  Device.findOneAndUpdate({_id: device_id}, data, function(err, device){
    if(err) res.json({message: err});

    res.json(device); 
  });
}
