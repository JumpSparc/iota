var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed    = Schema.Types.Mixed;

// Schemas
var deviceSchema = Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name:        String,
  cluster:     Boolean,  // turns the device into a container
  privacy:     Boolean,
  type:        String,
  desc:        String,
  graph:       String,
  location:    String,
  gmap:        String,
  data:        [String],
  variable:    [Mixed], // {name:"value", color: "hex-value"}
  child_devices: [{
    type: ObjectId,
    ref: 'Device'
  }],
  created_at:  { type: Date, default: Date.now } 
}); 

// Model
module.exports = mongoose.model('Device',deviceSchema);
