var Moment = require('moment'); // require
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment)

const totalAbsent = (connection,code) =>{ 

    connection.then(client => {

      let date_ob = new Date();
      let current_year = date_ob.getFullYear();
      let current_month = date_ob.getUTCMonth()+1;
      let current_day = date_ob.getUTCDate();
      let from_day = 1;
      let from_month = 7;
      let from_year = current_month < from_month ? current_year+1 : current_year
      var start_date=moment(from_year+'-'+from_month+'-'+from_day, 'YYYY-MM-DD')
      var end_date=moment(current_year+'-'+current_month+'-'+current_day, 'YYYY-MM-DD')
      let total_days = end_date.diff(start_date, 'days') ;
      let off_day = [];
      let off_per_year = 0;
      let no_of_off_day = 0;
      var days_obj={'sunday':0, 'monday':0,'tuesday':0, 'wednesday':0, 'thursday':0, 'friday':0, 'saturday':0}
      var days_in_words = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; 

      for (var d = new Date(from_year, (from_month-1), (from_day + 1)); d <= date_ob; d.setDate(d.getDate() + 1)) {

        dd =  moment(d.getFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate(), 'YYYY-MM-DD');
        days_obj[days_in_words[dd.day()]] = days_obj[days_in_words[dd.day()]] +1
      }

      client.db('Attendance_System').collection('employers').find({"EmpCode":""+code}).toArray() 
      .then(results => {
        off_day = results[0].off_day.map(day => day.toLowerCase());
        off_per_year = results[0].off_per_year;

      let manageSites = client.db('Attendance_System').collection('summary')  
      
      manageSites.find({EmpCode:code}).project({["summary."+from_year+""]:!null ,["summary."+current_year+""]:!null}).toArray().then(r=> 
        {          
          const summaries = []
          const response = {}               
          var totalWorkingMinutes = 0;
          var index = 0;
          let sTime = 0;
          let eTime = 0;
          
              for(var i = 0;i < Object.keys(r[0]['summary']).length ;i++){

                var obj0=r[0]['summary'][Object.keys(r[0]['summary'])[i]]

                for(var j = 0;j < Object.keys(obj0).length ;j++){

                  var obj1= obj0[Object.keys(obj0)[j]];
                  
                  for(var k = 0;k < Object.keys(obj1).length ;k++){
                    
                    var obj2= obj1[Object.keys(obj1)[k]];

                    sTime=obj2.start.date
                    eTime=obj2.end.date
                    totalWorkingMinutes += diff(sTime, eTime)    
                    summaries[index] = obj2
                    index++;              
                  }
                }
              }
              off_day.map(item=>{
                no_of_off_day += days_obj[item]
              })
              
            response['present_days'] = summaries.length;
            response['absent_days'] = Math.abs((total_days-no_of_off_day) - response['present_days'])
            // console.log(response);
            return response
          })
      })
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
  
module.exports={
  totalAbsent:totalAbsent
}