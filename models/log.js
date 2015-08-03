var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed    = Schema.Types.Mixed;

// Schemas
var logSchema = Schema({
  device_id: {
    type: Schema.Types.ObjectId,
    ref: 'Device'
  },
  data:  Mixed,
  created_at:  { type: Date, default: Date.now } 
}); 

// Model
module.exports = mongoose.model('Log', logSchema);
