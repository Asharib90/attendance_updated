const employeeDelete=(connection)=>(req,res)=>{ 
  const {EmpCode}=req.body

  EmpCode? (

    connection.then(client => {
      const employers = client.db('Attendance_System').collection('employers')  
      
      employers.find({'EmpCode': ''+EmpCode}).toArray()
      .then(results => {
        if(results.length != 0){
          try {
            employers.deleteOne({'EmpCode':''+EmpCode})
            .then(result => {
              try {  
                const users = client.db('Attendance_System').collection('users') 
                users.deleteOne({'EmpCode':''+EmpCode})
                .then(resultss => {
                  try {
                    resultss.deletedCount? res.status(200).json({"response":'Successfully deleted'}) : res.status(404).json({"error":"record not found"});         
                  } catch (error) {
                    res.status(500).send(error);
                  }
                })      
            } catch (error) {
              res.status(500).send(error);
            }
          })
        } catch (error) {
          res.status(500).send(error);
        }
          }
          else{
            res.status(404).json({"error":'User is not registered'})
          }
        })
    })
  )
  :res.status(404).json({"error":'No ID found'})


}

module.exports={
  employeeDelete:employeeDelete
}