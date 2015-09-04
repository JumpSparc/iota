var express = require('express');
var router  = express.Router();
var auth    = require('../lib/auth');
var Device  = require('../models/device');
var _       = require('underscore');

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
    var newDevice = {
      user_id: req.user._id,
      name: req.body.name,
      cluster: cluster,
      desc: req.body.desc,
      data: req.body.device_data.split(',')
    };

    if( typeof req.body.child_devices !== 'undefined' && req.body.child_devices.constructor === Array ) {
      var children = [];
      var childrenIds = [];
      req.body.child_devices.forEach(function(child) {
        children.push({ name: child });
      });
      Device.create(children, function(err, data) {
        if(err) res.render('devices/new', {message: err});
        childrenIds = data.map(function(child){ return child._id});
        
        newDevice.child_devices = childrenIds; 
        saveDevice(newDevice, req, res);
      });
    }
    else if( typeof req.body.child_devices !== 'undefined' && req.body.child_devices.constructor === String ){
      Device.create({ name: req.body.child_devices}, function(err, data) {
        if(err) res.render('devices/new', {message: err});
        
        newDevice.child_devices = data._id; 
        saveDevice(newDevice, req, res);
      });
    }
    else{
      saveDevice(newDevice, req, res);
    }
  })

  // edit device
  .get('/edit/:id', auth.isLoggedIn, function(req, res, next){
    Device.findOne({_id: req.params.id}).populate('child_devices').exec(function(err, device){
      res.render('devices/edit', {action: 'update', device: device});
    });
  })
  
  // TODO change to 'put' http verb later
  // TODO change to meaningful variable names, sabaw pa ko ngayon
  // OPTIMIZE refactor this later, full of crappy logic
  .post('/update', function(req, res, next){
    var cluster = ( req.body.cluster == 'on' ? true : false );
    // could be a string or array or undefined
    var childDevices = req.body.child_devices;
    var childrenIds  = req.body.child_ids;

    // update params
    var updateData = {
      name:  req.body.name,
      desc:  req.body.desc,
      cluster: cluster,
      graph: req.body.graph,
      data: req.body.device_data.split(',')
    };
 
    if( typeof childDevices !== 'undefined' && childDevices.constructor === Array ) {
      Device.find({ _id: { $in: childrenIds}}, function(err, data) {
        var existingChildIds = ( typeof childrenIds !== 'undefined' && childrenIds.constructor === Array ? childrenIds : []);
        var existingChild = [];
        var newChild;

        if( typeof data !== 'undefined' ) {
          existingChild = data.map(function(child){ return child.name; });
          newChild = _.difference(childDevices, existingChild );
        }
        else {
          newChild = childDevices;
        }
        
        var newChildQuery;
        // if it has many new child devices
        if( newChild.constructor === Array ) {
           newChildQuery = newChild.map(function(child) { return { name: child }; });
        }

        Device.create(newChildQuery, function(err, newChildData) {
        
          newChildData.map(function(child) {
            existingChildIds.push(child._id);  
          });
          updateData.child_devices = existingChildIds;

          updateDevice(updateData, req, res); 
        });
      });
    }
    else if( typeof childDevices !== 'undefined' && childDevices.constructor === String ) {
      console.log('1 child device only'); 
      if( typeof childrenIds == 'undefined' ) {
        console.log('new child device');
        Device.create({ name: childDevices }, function(err, newDevice) {
          updateData.child_devices = [newDevice._id]
          updateDevice(updateData, req, res); 
        });
      }
      else {
        console.log('same device');
        updateData.child_devices = [childrenIds]
        updateDevice(updateData, req, res); 
      }
      
    }
    else{ 
      console.log('no child device');
      updateData.cluster       = false;
      updateData.child_devices = [];
      updateDevice(updateData, req, res); 
    }
  })
  
  // delete device
  .delete('/destroy/:id', function(req, res, next){
    Device.find({ _id: req.params.id }).remove().exec();
    console.log('Device Deleted: ' + req.params.id);
    res.json('success');
  });

  return router;
};

function saveDevice(data, req, res) {
  Device.create(data, function(err) {
    if(err) res.render('devices/new', {message: err});

    req.flash('deviceMessage', 'Successfuly added a new device!');
    res.redirect('/device'); 
  });
}

function updateDevice(data, req, res) {
  Device.findOneAndUpdate({_id: req.body._id}, data, function(err, device){
    req.flash('deviceMessage', 'Device updated!');
    res.redirect('/device');
  });
}
