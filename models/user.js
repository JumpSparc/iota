var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// Schemas
var userSchema = Schema({
  email: {
    type: String, 
    required: true, 
    index: {unique: true}
  },
  username: {
    type: String
  },
  password: {
    type: String, 
    required: true
  },
  devices: [{ 
    type : ObjectId, 
    ref: 'Device'
  }],
  created_at:  { type: Date, default: Date.now } 
}); 

// Turn password to hash before saving
userSchema.pre('save', function(next){
  var user = this;
  // check if user password is modified
  if(!user.isModified('password')) return next();
  
  bcrypt.hash(user.password, bcrypt.genSaltSync(), function(err, hash){
    if(err) return next(err);

    user.password = hash;
    next();
  });
});


// check password validity
userSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

// Model
module.exports = mongoose.model('User',userSchema);
