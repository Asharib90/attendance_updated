var moment = require('moment'); // require

const employeeGet=(connection)=>(req,res)=>{ 
    let code = req.user.code

    connection.then(client => {
    const employers = client.db('Attendance_System').collection('employers')  

    const quotesCollection = employers.find().toArray()
    .then(results => {
      try {               
        var profile = results.filter(employee => {
          if(employee.EmpCode === code){
            return employee 
          }
        })

        if(profile[0] && profile[0].role==="HR"){
          calculation_of_time(client,results,res); 
        }
        else{
          var filteredEmployee = results.filter(employee => {
            if(employee.lead === code){
              return employee 
            } 
          })
          // console.log(filteredEmployee)
          calculation_of_time(client,filteredEmployee,res); 
        }

      } catch (error) {
        res.status(500).send(error);
      }
    })
    .catch(error => {
      console.error(error)
      res.status(404).json({"error":'User is not found'})
    })    
    })
}

function calculation_of_time(client,results,res) {
  
  var result = [];
  
  results.filter((employee,index)=> {  
    let date_ob = new Date();
    let day = ("0" + (date_ob.getDate())).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let minutes_per_week = 0;
    let days_per_week = 0;
    let minutes_per_day = 0;
    let total_days = day-1;
    let shift_type = '';
    let off_day = [];
    let no_of_off_day = 0;
    var days_obj={'Sunday':0, 'Monday':0,'Tuesday':0, 'Wednesday':0, 'Thursday':0, 'Friday':0, 'Saturday':0}
    shift_type = ''+employee.shift_type;
    off_day = employee.off_day;
    minutes_per_week = employee.hours_per_week * 60;
    minutes_per_day = employee.hours_per_day * 60;
    days_per_week = employee.hours_per_week / employee.hours_per_day ; 
    let manageSites = client.db('Attendance_System').collection('summary')  

  const es = manageSites.find({EmpCode:''+employee.EmpCode}).project({["summary."+year+"."+month+""]:!null}).toArray().then(r=> 
    { 

      if (r != [] && r[0]){
        
        const summaries = []
        const response = {}               
        var totalWorkingMinutes = 0;
        var index = 0;
        let sTime = 0;
        let eTime = 0;
        
        for(var i = 1;i <= parseInt(day);i++){
          var days_in_words = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          
          d =  moment(year+'-'+month+'-'+i, 'YYYY-MM-DD');
          days_obj[days_in_words[d.day()]] = days_obj[days_in_words[d.day()]] +1
          
          if(r[0].summary[year] && r[0].summary[year][month] && r[0].summary[year][month][i] && r[0].summary[year][month][i].start && r[0].summary[year][month][i].end){
            
            sTime=r[0].summary[year][month][i].start.date
            eTime=r[0].summary[year][month][i].end.date
            totalWorkingMinutes += diff(sTime, eTime)            
            summaries[index] = r[0].summary[year][month][i]
            index++;              
            
          }      
        }
        //calculating total number of off days in giving range
        off_day.map(item=>{
          no_of_off_day += days_obj[item]
        })
        
        employee['Date']=year+'-'+month+'-'+day;
        employee['Total_Hours'] = timeConvert(totalWorkingMinutes)
        employee['Total_Overtime'] = totalWorkingMinutes > ((total_days-no_of_off_day)  * minutes_per_day)? 
        timeConvert(totalWorkingMinutes - ((total_days-no_of_off_day) * minutes_per_day)) : '0'
      }
      else {
        employee['Date']=year+'-'+month+'-'+day;
        employee['Total_Hours']='0' 
        employee['Total_Overtime']='0' 
      }
      result.push(employee)
      results.length ===result.length? res.status(200).send({'users':result}):null;
      // results.length ===result.length? console.log(result):null; 
      })
    })
  }

function timeConvert(data) {
  var minutes = data % 60;
  var hours = (data - minutes) / 60;
  
  return hours + ":" + minutes;
  }

function diff(start, end) {
  var startDate = new Date(start);
  var endDate = new Date(end);
  var diff = endDate.getTime() - startDate.getTime();
  var hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  var minutes = Math.floor(diff / 1000 / 60);

  totalMinutes = hours*60+minutes
  
  // If using time pickers with 24 hours format, add the below line get exact hours
  if (hours < 0)
     hours = hours + 24;
  
  // return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
  return (totalMinutes);
  }
  
module.exports={
  employeeGet:employeeGet
}