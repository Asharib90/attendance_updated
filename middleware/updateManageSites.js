var ObjectId = require('mongodb').ObjectId; 

const updateManageSites=(connection)=>(req,res)=>{ 
  const {_id,SitesName,Address,City,Type,Latitude,Longitude,Site_switch}=req.body
  const filter = {}

  id = new ObjectId(_id)
  
  SitesName? filter['SitesName']=SitesName : 0
  Address? filter['Address']=Address :0
  City? filter['City']=City : 0
  Type? filter['Type']=Type : 0
  Latitude? filter['Latitude']=Latitude : 0
  Longitude? filter['Longitude']=Longitude : 0
  Site_switch != undefined? filter['Site_switch']=Site_switch : 0

  connection.then(client => {
  const post = client.db('Attendance_System').collection('manage_sites')  

  console.log(filter)

  const quotesCollection = post.updateOne({'_id': id},{$set:filter})
  .then(results => {
  try {
      res.status(200).send({'users':"Update Successfully"});
      res.send(results);
    } catch (error) {
      res.status(404).json({"error":'User is not registered'})
    }
  })
  .catch(error => {
    console.error(error)
  
    res.status(404).json({"error":'User is not registered'})})
  })
}

module.exports={
  updateManageSites:updateManageSites
}