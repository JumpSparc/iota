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
  
  .get('/push', function(req, res, next) {
    // require device_id for push
    if (!req.query.device_id){
      res.json({error: 'device_id required.'});
    } // endif
    else{
      var device_id = req.query.device_id; 
      // remove the device_id from the query object
      delete req.query.device_id;

      Device.findOne({_id: device_id}, function(err, device) {
        var  query_keys = Object.keys(req.query);
        if (device){
          var variables = device.variable.map(function(item) { return item.name; });
         
          // if no variables are defined
          if(variables.length === 0){
            res.json({ error: "No variables defined." });
          }
          else if(_.isEqual(variables.sort(), query_keys.sort())) { // if query has valid data
            newLog = new Log({
              device_id: device._id,
              data: req.query
            });

            newLog.save(function(err, data) {
              res.json({ status: 'Success'});
            });
          }
          else{
            res.json({ error: "Allowed Data: " + variables.join(', ') });
          } 
        }
        else{
          res.json({error: 'Device does not exist.'});
        }
      });
    } // end else
  })
  
  // get device
  .get('/fetch/:id', function(req, res, next) {
    console.log("/fetch/:id"); 
    console.log(req.params); 
    console.log("-------------------------------------------"); 

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
              label: item.label,
              color: item.color,
              data: data,
              max: item.max,
              min: item.min,
              max_action: item.max_action,
              min_action: item.min_action
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
  // User Sign in
  .get('/sign_in', function(req, res, next) {
    console.log("/sign_in"); 
    console.log(req.query); 
    console.log("-------------------------------------------"); 

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
  
  // create user
  .get('/signup', function(req, res, next){
    console.log("/signup"); 
    console.log(req.query); 
    console.log("-------------------------------------------"); 

    var email = req.query.email;
    var password = req.query.password;
    if (email && password){
      var newUser = new User({
        email: req.query.email,
        password: req.query.password
      });

      newUser.save(function(err, user) {
        if(err) res.json({error: err});
        else res.json({user: user});
      });
    }
    else{
      res.json({error: "email and password required."});
    }
  })

  // get all devices
  .get('/fetch/all_devices/:id', function(req, res, next) {
    console.log("/fetch/all_devices/:id"); 
    console.log(req.params); 
    console.log("-------------------------------------------"); 

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
                    if(log.data !== undefined){
                      data.push({ x: log.created_at.getTime(), y: parseInt(log.data[item.name]) });
                    }
                  });
                  series.push({
                    name: item.name,
                    label: item.label,
                    color: item.color,
                    data: data,
                    max: item.max,
                    min: item.min,
                    max_action: item.max_action,
                    min_action: item.min_action
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
  
  // add Device 
  .get('/add_device', function(req, res, next) {
    console.log("/add_device"); 
    console.log(req.query); 
    console.log("-------------------------------------------"); 

    var newDevice = {
      user_id:   req.query.user_id,
      name:      req.query.name,
      desc:      req.query.desc,
      privacy:   req.query.privacy,
      status:    'on',
      graph:     'area',
      location:  req.query.location,
      gmap:      req.query.gmap,
      variable:  { name: req.query.data, label: req.query.label, color: "#CD5C5C" }
    }
    
    if(req.query.user_id !== undefined && req.query.name !== undefined){
      console.log(newDevice); 
      console.log("-------------------------------------------"); 
      saveDevice(newDevice, req, res);
    }
    else{
      console.log("user_id and name required"); 
      console.log("-------------------------------------------"); 
      res.json({error: "user_id and name required"});
    }
  })
  
  // update devic
  .get('/update_device', function(req, res, next) {
    console.log("/update_device"); 
    console.log(req.query); 

    if(req.query.device_id !== undefined) {
      var device_id = req.query.device_id;

      Device.findOne({_id: device_id}, function(err, device) {
        if (!device) {
          res.json({error: "device not found."});
        }
        else if(device && device.variable.length > 0){
          var device_data = {
            name:      req.query.name,
            desc:      req.query.desc,
            privacy:   req.query.privacy,
            location:  req.query.location,
            gmap:      req.query.gmap,
            variable:  [{ 
              name: req.query.data, 
              label: req.query.label, 
              color: "#CD5C5C",
              max:  device.variable[0].max,
              min:  device.variable[0].min,
              max_action: device.variable[0].max_action,
              min_action: device.variable[0].min_action
            }]
          }
          console.log(device_data);
          console.log("-------------------------------------------"); 
          updateDevice(device_id, device_data, req, res);
        }
        else{
          var device_data = {
            name:      req.query.name,
            desc:      req.query.desc,
            privacy:   req.query.privacy,
            location:  req.query.location,
            gmap:      req.query.gmap,
            variable:  [{ 
              name: req.query.data, 
              label: req.query.label, 
              color: "#CD5C5C"
            }]
          }
          console.log(device_data);
          console.log("-------------------------------------------"); 
          updateDevice(device_id, device_data, req, res);
        }
      });
    }
    else{
      console.log("device_id required"); 
      console.log("-------------------------------------------"); 
      res.json({error: "device_id required"});
    }
  })

  // delete device
  .get('/delete_device', function(req, res, next) {
    console.log("/delete_device"); 
    console.log(req.query); 


    if(req.query.device_id !== undefined){
      Device.find({ _id: req.query.device_id }).remove().exec();
      console.log("device deleted"); 
      console.log("-------------------------------------------"); 
      res.json({status: "Device " + req.query.device_id + " deleted"});
    }
    else{
      console.log("device_id required"); 
      console.log("-------------------------------------------"); 
      res.json({error: "device_id required"});
    }
  })

  // ON / OFF status for device
  .get('/device_status/:id', function(req, res, next) {
    console.log("/device_status/:id"); 
    console.log(req.params); 
    console.log("-------------------------------------------"); 

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

  // set command 
  // currently on / off only
  .get('/device/:command/:id', function(req, res, next) {
    console.log("/device/:command/:id"); 
    console.log(req.params); 
    console.log("-------------------------------------------"); 

    var device_id = req.params.id;
    var command   = req.params.command;
    if(device_id){
      updateDevice(device_id, {status: command}, req, res)      
    }
    else{
      res.json({error: "device_id required."});
    }
  })
  
  // set rules for device
  .get('/device_rules', function(req, res, next) {
    console.log("/device/:command/:id"); 
    console.log(req.query); 


    var device_id = req.query.device_id;
    if (device_id) {
      Device.findOne({_id: device_id}, function(err, dv){
        if(err) res.json({message: err});
        console.log("device_rules: Device found");

        // TODO fix device model name variables
        if(dv){
          var data;

          if(dv.variable.length > 0) {
            data = {
              variable: dv.variable,
            };
            data.variable[0].max = req.query.max;
            data.variable[0].min = req.query.min;
            data.variable[0].max_action = req.query.max_action;
            data.variable[0].min_action = req.query.min_action;
          }
          else {
            data = {
              variable: [{
                max: req.query.max,
                min: req.query.min,
                max_action: req.query.max_action,
                min_action: req.query.min_action
              }]
            };
          }

          console.log(data);
          
          Device.findOneAndUpdate({_id: device_id}, data, function(err, device){ 
            if(err) res.json({message: err});

            if(device){
              var item = {
                _id: device.id,
                name: device.name,
                user_id: device.user_id,
                created_at: device.created_at,
                child_devices: device.child_devices,
                variables: device.variable,
                data: device.data
              };

              console.log(item);
              console.log("-------------------------------------------"); 
              res.json(item);
            }
          });
        }
        else{
          console.log("-------------------------------------------"); 
          res.json({error: "device not found"});
        }
      });
    }
    else{
      res.json({ error: "device_id required."});
    }
  })


  // TODO: add forget password
  .get('/forget_pass', function(req, res, next) {
  
  })

  // devices with no user
  // register through qr code in mobile
  // accepts user_id and device_id only
  .get('/qr_add_device', function(req, res, next){
    console.log("/qr_add_device"); 
    console.log(req.query); 
    console.log("-------------------------------------------"); 

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
  if (device_id) {
    Device.findOneAndUpdate({_id: device_id}, data, function(err, device){
      if(err) res.json({message: err});

      // TODO fix device model name variables
      var item = {
        _id: device.id,
        name: device.name,
        user_id: device.user_id,
        created_at: device.created_at,
        child_devices: device.child_devices,
        variables: device.variable,
        data: device.data
      };
      res.json(item); 
    });
  }
  else{
    res.json({ error: "device_id required."});
  }
}
