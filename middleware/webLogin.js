const  webLogin=(connection)=>  (req,res,next)=>{ 
    
    const {code,pin} = req.body
    const filter = {}
    code? filter['EmpCode'] = code : 0
    pin? filter['pin'] = pin : 0

    connection.then(client => {
    const employers = client.db('Attendance_System').collection('employers')  
    const quotesCollection = employers.aggregate([
        { $match: { EmpCode:code, pin:pin} },
        {
            $lookup:
            {
                from: "users",
                localField: "_id",
                foreignField: "employeeId",
                as: "profile"
            }
        },
     
    ]).toArray()
    .then(results => {
        results[0] && delete results[0].pin
        req.result = results;
        next();
    })
    .catch(error => console.error(error))
    })
}

module.exports={
    webLogin:webLogin
}