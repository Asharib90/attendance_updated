
var ObjectId = require('mongodb').ObjectId; 

const getManageSites = (connection) => (req,res,next)=>{ 
  
   let quotesCollection = '';
    connection.then(client => {
      
        let manageSites = client.db('Attendance_System').collection('manage_sites')  

          manageSites.find().toArray().then(r=> 
            {
            res.status(200).send({'data':r});
              next()
            })
    })
}

module.exports={
  getManageSites:getManageSites
}