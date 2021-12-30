const mongoose = require("mongoose");
const ManagesitesSchema = new mongoose.Schema({
    SitesName: {
    type: String,
    default:""
   },
  Address: {
    type: String,
   default:""
   },
  City: {
    type: String,
   default:""  },
  Type: {
    type: String,
    default:""
  },
});
const managesites = mongoose.model("manage_sites", ManagesitesSchema);
module.exports = managesites;