var express = require('express');
var router  = express.Router();
var Device  = require('../models/device');
var Log     = require('../models/log');

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
        if (device){
          // TODO add params checking based on device.data
          var required_data = device.data;
          newLog = new Log({
            data: req.query
          });

          newLog.save(function(err, data) {
            res.json({status: 'Whatever you\'re trying to do succeeded, I hope that you\'re happy.'});
          });
        }
        else{
          res.json({error: 'Device does not exist.'});
        }
      });
    } // end else
  });

  return router;
};
