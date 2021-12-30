const employeeUpdate=(connection)=>(req,res)=>{ 
  const {Code,EmpCode,Name,PhoneNo,EMail,Registered,hours_per_day,hours_per_week,shift_type,off_per_year,role,pin,off_day,lead,address,date_of_joining,designation}=req.body
  const empFilter = {}
  const usrFilter = {}


    Code? empFilter['Code']=Code : 0
    EmpCode? empFilter['EmpCode']=EmpCode : 0
    Name? empFilter['Name']= Name : 0  
    PhoneNo? empFilter['PhoneNo']=PhoneNo : 0
    EMail? empFilter['EMail']=EMail : 0
    Registered != undefined? empFilter['Registered']=Registered : 0
    hours_per_week? empFilter['hours_per_week']=hours_per_week : 0
    hours_per_day? empFilter['hours_per_day']=hours_per_day : 0
    shift_type? empFilter['shift_type']=shift_type : 0
    off_per_year? empFilter['off_per_year']=off_per_year : 0
    role? empFilter['role']=role : 0
    pin? empFilter['pin']=pin : 0
    off_day? empFilter['off_day']=off_day : 0
    shift_type? empFilter['shift_type']=shift_type : 0
    lead? empFilter['lead']=lead : 0
    
    Name? usrFilter['Name']=Name : 0
    EmpCode? usrFilter['EmpCode']=EmpCode : 0
    address? usrFilter['address']=address : 0
    designation? usrFilter['designation']=designation : 0
    date_of_joining? usrFilter['date_of_joining']=date_of_joining : 0
    shift_type? usrFilter['shift_type']=shift_type : 0
  EmpCode? (
  connection.then(client => {
  const employers = client.db('Attendance_System').collection('employers')  

  employers.find({'EmpCode': ''+EmpCode}).toArray()
  .then(results => {
      if(results.length != 0){
        try {
          employers.updateOne({'EmpCode': ''+EmpCode},{$set:empFilter})
          .then(results => {

            try {
              const user = client.db('Attendance_System').collection('users')  
              user.updateOne({'EmpCode': ''+EmpCode},{$set:usrFilter})
              .then(result => {

              try {         
                res.status(200).send({"response":'record updated successfully'});
                } catch (error) {
                  console.log(error);
                  res.status(404).send({"error":'User not updated'});
                }
              })
            } catch (error) {
              console.log(error);
              res.status(404).send({"error":'Employee not updated'});
            }
          })
          .catch(error => console.error(error))
        
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
  employeeUpdate:employeeUpdate
}