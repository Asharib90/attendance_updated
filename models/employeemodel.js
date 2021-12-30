const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    Code: {
    type: String,default:""
   },
  EmpCode: {
    type: String,
   default:"" 
   },
  
  Name: {
    type: String,
   default:""  },
  PhoneNo: {
    type: String,
   default:""

  },
  EMail: {
    type: String,
  default:""
  },
 
});

const employe = mongoose.model("employe", EmployeeSchema);

module.exports = employe;