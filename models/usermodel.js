const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  __Eid: {
    type: Number,
      default:0
  },
    first_name: {
    type: String,
      default:""
  },
  last_name: {
    type: String,
    default:""
  },
  phone_number: {
    type: String,
    default:""

  },
  address: {
    type: String,
    default:""
  },
  date_of_joining: {
    type: String,
    default:""
  },
  designation: {
    type: String,
    default:""
  },
  email: {
    type: String,
    default:""
  },
  shift_timing: {
    type: String,
     default:""  
    },
});

const User = mongoose.model("users", UserSchema);

module.exports = User;