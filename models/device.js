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


// return long lat of device if available
deviceSchema.methods.lat = function(){
  var gmap = this.gmap.split(',');
  return gmap[0];
};

deviceSchema.methods.lng = function(){
  var gmap = this.gmap.split(',');
  return gmap[1];
};



// Model
module.exports = mongoose.model('Device',deviceSchema);
