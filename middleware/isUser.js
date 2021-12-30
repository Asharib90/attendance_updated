

const isUser=(connection,accountSid,authToken)=>(req,res,next)=>{ 
    const twilioClient = require('twilio')(accountSid, authToken);
    const {code,email,registered} = req.body
    
    let codes = 0;
    const filter = {}
    const addFilter = {}

   filter['EmpCode']=code
   filter['EMail']=email

    connection.then(client => {
    const employers = client.db('Attendance_System').collection('employers')  
    const quotesCollection = employers.find(filter).toArray()
    .then(results => {
        if(results.length > 0){            
            try {    
                //     twilioClient.messages
                // .create({
                    
                //     body: 'Your code is '+Math.floor(100000 + Math.random() * 900000),
                //     from: '+17122484496',
                //     to: '+923212063231'
                // })
                // .then(message => {

                // codes = Math.floor(100000 + Math.random() * 900000)
                codes = 123456
                    res.code = codes;
                    
                    if(results[0].Registered){
                       res.status(404).json({"error":'User is already registered'})
                    }else{
                        employers.updateOne({'EmpCode': ''+code},{$set:{"Registered": true}})
                        .then(results => {

                            const employers = client.db('Attendance_System').collection('employers')  
                            employers.find({'EmpCode': ''+code}).toArray()
                            .then(results => {
                            results[0].Name.split(" ")[0]? addFilter['first_name']=results[0].Name.split(" ")[0] : results[0].Name.split(" ")[0] 
                            results[0].Name.split(" ")[1]? addFilter['last_name']=results[0].Name.split(" ")[1] : addFilter['last_name']=''
                            results[0].EmpCode? addFilter['EmpCode']=results[0].EmpCode : addFilter['EmpCode']=''
                            results[0].address? addFilter['address']=results[0].address :addFilter['address']=''
                            results[0].designation? addFilter['designation']=results[0].designation :addFilter['designation']=''
                            results[0].date_of_joining? addFilter['date_of_joining']=results[0].date_of_joining : addFilter['date_of_joining']=''
                            results[0].shift_type? addFilter['shift_type']=results[0].shift_type : addFilter['shift_type']=''

                            const user = client.db('Attendance_System').collection('users')  
                            user.insertOne(addFilter)
                            .then(result => {
                                result.acknowledged? next() : res.status(404).json({"error":'User not registered successfully'})
                                })
                            })                                 
                            const summary = client.db('Attendance_System').collection('summary')  
                            summary.insertOne({EmpCode:''+code,summary:{}})
                            .then(result => {
                                result.acknowledged? next() : res.status(404).json({"error":'User not registered successfully'})
                                }) 
                          })
                          .catch(error => {
                            console.error(error)
                            res.status(500).send(error);
                        })                            
                    }
                // }).catch(error => {
                //     console.error(error)
                //     res.status(500).send(error);
                // }) 
            }catch (error) {
                console.error(error)
                res.status(500).send(error);
            }
        }else{
            res.status(404).json({"error":'User is not found'})
            }
        })
    .catch(error => console.error(error))
    })
}

module.exports={
    isUser:isUser
}