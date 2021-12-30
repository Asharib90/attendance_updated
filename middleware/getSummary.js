var moment = require('moment'); // require

const getSummary = (connection) => (req,res,next)=>{ 

  const {empCode,start,end} = req.body
  start <= end?(

    connection.then(client => {
      
      let date_ob = new Date();
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let minutes_per_week = 0;
      let days_per_week = 0;
      let minutes_per_day = 0;
      let total_days = end-start + 1;
      let shift_type = '';
      let off_day = [];
      let no_of_off_day = 0;
      var days_obj={'Sunday':0, 'Monday':0,'Tuesday':0, 'Wednesday':0, 'Thursday':0, 'Friday':0, 'Saturday':0}
      
      client.db('Attendance_System').collection('employers').find({"EmpCode":''+empCode}).toArray() 
      .then(results => {

        if (results != [] && results[0]){

        shift_type = ''+results[0].shift_type;
        off_day = results[0].off_day;
        minutes_per_week = results[0].hours_per_week * 60;
        minutes_per_day = results[0].hours_per_day * 60;
        days_per_week = results[0].hours_per_week / results[0].hours_per_day ; 
      
      let manageSites = client.db('Attendance_System').collection('summary')  
      const quotesCollection = 
      manageSites.find({EmpCode:''+empCode}).project({["summary."+year+"."+month+""]:!null}).toArray().then(r=> 
        { 
          
        if (r != [] && r[0]){       

          const summaries = []
          const response = {}               
          var totalWorkingMinutes = 0;
          var index = 0;
          let sTime = 0;
          let eTime = 0;
          
          for(var i = parseInt(start);i <= parseInt(end);i++){
            var days_in_words = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            d =  moment(year+'-'+month+'-'+i, 'YYYY-MM-DD');
            days_obj[days_in_words[d.day()]] = days_obj[days_in_words[d.day()]] +1

            if(r[0].summary[year] && r[0].summary[year][month] && r[0].summary[year][month][i]){

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

          response['Shift Type'] = shift_type
          response['Present Days'] = summaries.length;
          response['Absent Days'] = Math.abs((total_days-no_of_off_day) - response['Present Days'] )
          response['Working Hours'] = timeConvert(totalWorkingMinutes)
          response['Hours Short'] = totalWorkingMinutes < ((total_days - no_of_off_day)  * minutes_per_day)? 
          timeConvert((((total_days-no_of_off_day) * minutes_per_day) - totalWorkingMinutes)) : '0'
          response['Over Time'] = totalWorkingMinutes > ((total_days-no_of_off_day)  * minutes_per_day)? 
          timeConvert(totalWorkingMinutes - ((total_days-no_of_off_day) * minutes_per_day)) : '0'

          res.status(200).send(response);
            next()
          }
          else {
              res.status(404).json({ "error": 'No attendance record found' })
          }
          })
        }
        else {
            res.status(404).json({ "error": 'User not found' })
        }
          
      })
    }).catch(error => console.error(error))
  ): res.status(200).send({'error':'Giving date is not correct'})
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
  getSummary:getSummary
}