
var ObjectId = require('mongodb').ObjectId; 
const startTiming = (connection,sum) => (req,res,next)=>{ 
  
   let quotesCollection = '';
   let code = req.user.code
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    console.log(date_ob)

    connection.then(client => {
      let employers = client.db('Attendance_System').collection('summary')  
      let updateLogin = client.db('Attendance_System').collection('employers')  
        sum == 'start' ?
        quotesCollection = employers.updateOne({EmpCode:code},{$set: {["summary."+year+"."+month+"."+date+".start"]:req.body}})
        : quotesCollection = employers.updateOne({EmpCode:code},{$set: {["summary."+year+"."+month+"."+date+".end"]:req.body}})

        sum == 'start' ? updateLogin.updateOne({EmpCode:code},{$set: {"status":true}}) :  updateLogin.updateOne({EmpCode:code},{$set: {"status":false}})


        quotesCollection.then(results => {
        try {
            res.status(200).send(results)
            next()
          } catch (error) {
            res.status(500).send({"error":'User is not found'});
          }
        })
        .catch(error => console.error(error))
    })
}

module.exports={
    startTiming:startTiming
}