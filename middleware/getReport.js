var moment = require('moment'); // require


const getReport = (connection) => (req,res,next)=>{ 

  const {empCode,start,end} = req.body


    connection.then(client => {

      let from_day = parseInt(start.split('/')[0]);
      let from_month = parseInt(start.split('/')[1]);
      let from_year = parseInt(start.split('/')[2]);
      let to_year = parseInt(end.split('/')[2]);
      let to_month = parseInt(end.split('/')[1]);
      let to_day = parseInt(end.split('/')[0]);
      var start_date=moment(from_year+'-'+from_month+'-'+from_day, 'YYYY-MM-DD')
      var end_date=moment(to_year+'-'+to_month+'-'+to_day, 'YYYY-MM-DD')
      let total_days = end_date.diff(start_date, 'days') +1;

      if(total_days > 0){     

      let years_to_fetch = [];
      let minutes_per_week = 0;
      let minutes_per_day = 0;
      let days_per_week = 0;
      let off_day = [];
      let response = { daily_details:[]};
      let time_work = 0;
      let no_of_off_day = 0;
      var days_obj={'Sunday':0, 'Monday':0,'Tuesday':0, 'Wednesday':0, 'Thursday':0, 'Friday':0, 'Saturday':0}


      for(var year =from_year; year<=to_year; year++){
        years_to_fetch.push("summary."+year+"")
      }

      client.db('Attendance_System').collection('employers').find({"EmpCode":""+empCode}).toArray()
      .then(results => {
        
        if (results != [] && results[0]){

        off_day = results[0].off_day;
        minutes_per_day = results[0].hours_per_day * 60;
        minutes_per_week = results[0].hours_per_week * 60;
        days_per_week = results[0].hours_per_week / results[0].hours_per_day;

      let report = client.db('Attendance_System').collection('summary')  
    
      report.find({EmpCode:''+empCode}).project(years_to_fetch).toArray().then(r=> 
        {  
          if(r[0]){                   
            
            //filter months
            for(var i = 1;i < 13 ;i++){
              r[0]['summary'][from_year] && i<from_month? delete r[0]['summary'][from_year][i] : 0
              r[0]['summary'][to_year] && i>to_month? delete r[0]['summary'][to_year][i] : 0
            }  

            //filter days
            for(var i = 1;i <31 ;i++){
              r[0]['summary'][from_year] && i<from_day? delete r[0]['summary'][from_year][from_month][i] : 0
              r[0]['summary'][to_year] && r[0]['summary'][to_year][to_month] && i>to_day? delete r[0]['summary'][to_year][to_month][i] : 0
            }            

            const summaries = []         
            var totalWorkingMinutes = 0;
            var index = 0;
            let sTime = 0;
            let eTime = 0;

            for (var dd = from_day; dd <= total_days ; dd++) {
              var date_ob = new Date(from_year, from_month-1, 1+dd);
              let year = date_ob.getUTCFullYear();
              let month = date_ob.getUTCMonth()+1;
              let day = date_ob.getUTCDate();

              var days_in_words = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              d =  moment(year+'-'+month+'-'+day, 'YYYY-MM-DD');

              days_obj[days_in_words[d.day()]] = days_obj[days_in_words[d.day()]] +1
              
              if(r[0].summary[year] && r[0].summary[year][month] && r[0].summary[year][month][day]){

                if(r[0].summary[year][month][day].start && r[0].summary[year][month][day].end){

                sTime=r[0].summary[year][month][day].start.date
                eTime=r[0].summary[year][month][day].end.date
                totalWorkingMinutes += diff(sTime, eTime)            
                summaries[index] = r[0].summary[year][month][day]
                index++;   
                }
              }
            }

            for(var i = 0;i < Object.keys(r[0]['summary']).length ;i++){
              
              var obj0=r[0]['summary'][Object.keys(r[0]['summary'])[i]]
              
              for(var j = 0;j < Object.keys(obj0).length ;j++){
                
                var obj1= obj0[Object.keys(obj0)[j]];
                
                for(var k = 0;k < Object.keys(obj1).length ;k++){
                  
                  var obj2= obj1[Object.keys(obj1)[k]];

                  if(obj2.end && obj2.start){

                    time_work = diff(obj2.start.date, obj2.end.date)
                    
                    var late_time=((parseFloat(obj2.start.date.slice(11,16).replace(':','.'))-.10) - parseFloat(results[0].start_timing.replace(':','.'))).toFixed(2)

                    response.daily_details.push({
                      "Date": obj2.start.date.slice(0,10),
                      "CheckIn_date": obj2.start.date.slice(11,16) ,
                      "CheckIn_location": obj2.start.location ,
                      "CheckIn_siteId": obj2.start.siteId ,
                      "CheckOut_date": obj2.end.date.slice(11,16) ,
                      "CheckOut_location": obj2.end.location,
                      "CheckOut_siteId": obj2.end.siteId ,
                      "Work_time": timeConvert(time_work),
                      "Late_time": late_time>0? late_time.replace('.',':'):'00:00',
                      "Over_time ": time_work > minutes_per_week? timeConvert(time_work-minutes_per_week) : '0:0' ,
                    })
                  }
                }
              }
            }

            off_day.map(item=>{
              no_of_off_day += days_obj[item]
            })

            response['Present Days'] = summaries.length;
            response['Absent Days'] = Math.abs((total_days-no_of_off_day) - response['Present Days'] )  
            response['Working Hours'] = timeConvert(totalWorkingMinutes)
            response['Start Timing'] = results[0].start_timing;
            response['End Timing'] = results[0].end_timing;
            response['Hours Short'] = totalWorkingMinutes < ((total_days - no_of_off_day)  * minutes_per_day)? 
            timeConvert((((total_days-no_of_off_day) * minutes_per_day) - totalWorkingMinutes)) : '0'
            response['Over Time'] = totalWorkingMinutes > ((total_days-no_of_off_day)  * minutes_per_day)? 
            timeConvert(totalWorkingMinutes - ((total_days-no_of_off_day) * minutes_per_day)) : '0'

            res.status(200).send(response)
            next()            
            }
          else{
            res.status(200).send({'error':' No attendance record found'})
          }
        })
      }
      else {
          res.status(404).json({ "error": 'User not found' })
      }

      }).catch(error => console.error(error))
    }
     else {res.status(200).send({'error':'Giving date is not correct'})}
    }).catch(error => console.error(error))
}

function diff(start, end) {
  var startDate = new Date(start);
  var endDate = new Date(end);
  var diff = endDate.getTime() - startDate.getTime();
  var hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  var minutes = Math.floor(diff / 1000 / 60);
  totalMinutes = hours*60+minutes

  if (hours < 0)
     hours = hours + 24;
  return (totalMinutes);
  }

function timeConvert(data) {
  var minutes = data % 60;
  var hours = (data - minutes) / 60;
  
  return hours + ":" + minutes;
  }  

module.exports={
  getReport:getReport
}