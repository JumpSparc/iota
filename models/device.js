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
  status:      String,
  data:        [String],
  // Params for variable 
  // Min and Max for calling command
  // { 
  //   name: String, 
  //   label: String,  
  //   color: hex-value,
  //   min: Float
  //   max: Float,
  //   min_action: String,
  //   max_action: String
  // }
  variable:    [Mixed],
  child_devices: [{
    type: ObjectId,
    ref: 'Device'
  }],
  created_at:  { type: Date, default: Date.now } 
}); 


// return long lat of device if available
deviceSchema.methods.lat = function(){
  if(this.gmap){
    var gmap = this.gmap.split(',');
    return gmap[0];
  }
  else{
    return null;
  }
};

deviceSchema.methods.lng = function(){
  if(this.gmap){
    var gmap = this.gmap.split(',');
    return gmap[1];
  }
  else{
    return null;
  }
};



// Model
module.exports = mongoose.model('Device',deviceSchema);
