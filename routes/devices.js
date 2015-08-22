var express = require('express');
var router  = express.Router();
var auth    = require('../lib/auth');
var Device  = require('../models/device');

module.exports = function(passport) {

  // show all devices 
  router.get('/',auth.isLoggedIn , function(req, res, next){
    Device.find({user_id: req.user._id}, function(err, devices){
      if(err) return err;

      res.render('devices/index', {devices: devices, message: req.flash('deviceMessage')});
    });
  })
  // /device/new - show new device form 
  .get('/new',auth.isLoggedIn , function(req, res, next){
    res.render('devices/new', {action: 'create', device: {}});
  })
  // /device/create - create new device
  .post('/create', function(req, res, next){
    var cluster = ( req.body.cluster == 'on' ? true : false );
    var children = [];
    var childrenIds = [];

    if(typeof req.body.child_devices !== 'undefined' && req.body.child_devices.length > 0) {
      req.body.child_devices.forEach(function(child) {
        children.push({ name: child });
      });
      Device.create(children, function(err, data) {
        if(err) res.render('devices/new', {message: err});
        childrenIds = data.map(function(child){ return child._id});
        
        var newDevice = new Device({
          user_id: req.user._id,
          name: req.body.name,
          cluster: cluster,
          child_devices: childrenIds,
          desc: req.body.desc,
          data: req.body.device_data.split(',')
        });

        newDevice.save(function(err) {
          if(err) res.render('devices/new', {message: err});
          req.flash('deviceMessage', 'Successfuly added a new device!');
          res.redirect('/device'); 
        });
      });
    }
    else{
      var newDevice = new Device({
        user_id: req.user._id,
        name: req.body.name,
        cluster: cluster,
        desc: req.body.desc,
        data: req.body.device_data.split(',')
      });

      newDevice.save(function(err) {
        if(err) res.render('devices/new', {message: err});

        req.flash('deviceMessage', 'Successfuly added a new device!');
        res.redirect('/device'); 
      });
    }
  })
  // edit device
  .get('/edit/:id', auth.isLoggedIn, function(req, res, next){
    Device.findOne({_id: req.params.id}, function(err, device){
      res.render('devices/edit', {action: 'update', device: device});
    });
  })
  
  // TODO change to 'put' http verb later
  .post('/update', function(req, res, next){
    data = {
      name:  req.body.name,
      desc:  req.body.desc,
      graph: req.body.graph,
      data: req.body.device_data.split(',')
    };
    Device.findOneAndUpdate({_id: req.body._id}, data, function(err, device){
      console.log(device);
      req.flash('deviceMessage', ' updated!');
      res.redirect('/device');
    });
  })
  
  .delete('/destroy/:id', function(req, res, next){
    Device.find({ _id: req.params.id }).remove().exec();
    console.log('Device Deleted: ' + req.params.id);
    res.json('success');
  });

  return router;
};
