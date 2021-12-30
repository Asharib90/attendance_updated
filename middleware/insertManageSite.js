
var ObjectId = require('mongodb').ObjectId; 

const insertManageSite = (connection) => (req,res,next)=>{ 
  
   let quotesCollection = '';
    connection.then(client => {
      
        let manageSites = client.db('Attendance_System').collection('manage_sites')  
        quotesCollection = manageSites.insertOne(req.body, function(err,docsInserted){

          manageSites.find({"_id":docsInserted.insertedId}).toArray().then(r=> 
            {
            res.status(200).send(r[0]);
              next()
            })
        })
    })
}

module.exports={
  insertManageSite:insertManageSite
}