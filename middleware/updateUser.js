

const updateUser = (connection) => (req,res,next)=>{ 
    let code = req.user.code;
    const dat = '';
    connection.then(client => {
    const employers = client.db('Attendance_System').collection('employers')  
    // const quotesCollection = employers.updateOne({EMail:email},{$set:req.body})
    
    console.log(code)
   employers.aggregate([
        { $match: { EmpCode:code} },
        {
            $lookup:
            {
                from: "users",
                localField: "_id",
                foreignField: "employeeId",
                as: "profile"
            },             
        },
        { $set: {"profile":req.body}}
    ]).toArray()
    .then(results => {
    try {
        res.send(results[0].profile)
        next()

      } catch (error) {
        res.status(404).send({"error":'User is not found'});
      }
    })
    .catch(error => console.error(error))
    })
}

module.exports={
    updateUser:updateUser
}