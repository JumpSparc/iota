var express = require('express');
var router  = express.Router();
var Device  = require('../models/device');
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
          // if query has valid data
          if(_.isEqual(device.data.sort(), query_keys.sort())) {
            var required_data = device.data;
            newLog = new Log({
              device_id: device._id,
              data: req.query
            });

            newLog.save(function(err, data) {
              res.json({status: 'Success'});
            });
          }
          else{
            var allowed_data = device.data.join(', ');
            res.json({ error: "Allowed Data: " + allowed_data });
          } 
        }
        else{
          res.json({error: 'Device does not exist.'});
        }
      });
    } // end else
  })
  
  .get('/fetch/:id', function(req, res, next) {
    Device.findOne({ _id: req.params.id }, function(err, device) {
      var d = Log.find({'device_id' : device.id }, 'created_at data').limit(1000);
      d.exec( function(err, logs) {
        if (err) throw err;
        var series = [];
        device.data.forEach(function(item) {
          var color = '#'+Math.floor(Math.random()*16777215).toString(16);
          var data = [];
          logs.forEach(function(log) {
            data.push({ x: log.created_at.getTime(), y: parseInt(log.data[item]) });
          });
          series.push({
            name: item,
            color: color,
            data: data
          });
        });
        res.send(series);
      });
    });
  });

  return router;
};
