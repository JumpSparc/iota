var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// Schemas
var deviceSchema = Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name:        String,
  cluster:     Boolean,  // turns the device into a container
  type:        String,
  desc:        String,
  graph:       String,
  gmap:        String,
  data:        [String], // data that will be accepted
  child_devices: [{
    type: ObjectId,
    ref: 'Device'
  }],
  created_at:  { type: Date, default: Date.now } 
}); 

// Model
module.exports = mongoose.model('Device',deviceSchema);
