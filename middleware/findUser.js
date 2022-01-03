var Moment = require('moment'); // require
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment)

const findUser = (connection) => (req, res, next) => {

    const { empCode, deviceId } = req.body

    const filter = {}
    empCode ? filter['empCode'] = empCode : 0
    
    connection.then(client => {
            const employees = client.db('attendanceApp').collection('employees')
            const employeesTable = employees.find(filter).toArray()
                .then(results => {                    
                    
                    if (results != [] && results[0]) {
                        if (results[0].registered == true) {

                            let dailyAttendancetable = client.db('attendanceApp').collection('dailyAttendance')
                            let date = new Date();
                            let currentYear = date.getFullYear();
                            let currentMonth = date.getUTCMonth() + 1;
                            let currentDay = date.getUTCDate();
                            var fromYear = 0
                            var fromMonth = 0
                            var fromDay = 0 
                            dailyAttendancetable.find({"empCode": empCode }).toArray().then(response1 => {
                                
                                try{
                                    fromYear = Object.keys(response1[0]['attendance'])[0]
                                    fromMonth = Object.keys(response1[0]['attendance'][fromYear])[0]
                                    fromDay = Object.keys(response1[0]['attendance'][fromYear][fromMonth])[0]
                                    
                                }catch{
                                    results[0]['totalAbsentDays'] = 0;
                                    req.result = results;
                                    next();
                                }              
                                currentYear -  parseInt(fromYear) >= 2 ?  (fromMonth = 7, fromDay = 1   
                                ): (fromMonth = parseInt(fromMonth), fromDay = parseInt(fromDay))

                                fromYear = currentYear - parseInt(fromYear)===0 ? currentYear : currentYear - 1
                                var startDate = moment(fromYear + '-' + fromMonth + '-' + fromDay, 'YYYY-MM-DD')
                                var endDate = moment(currentYear + '-' + currentMonth + '-' + currentDay, 'YYYY-MM-DD')
                                let totalDays = endDate.diff(startDate, 'days')==0? (endDate.diff(startDate, 'days')) : endDate.diff(startDate, 'days')+1
                                let offDay = results[0].offDay.map(day => day.toLowerCase());
                                let offPerYear = results[0].offPerYear;
                                let noOfOffDay = 0;
                                var daysObj = { 'sunday': 0, 'monday': 0, 'tuesday': 0, 'wednesday': 0, 'thursday': 0, 'friday': 0, 'saturday': 0 }
                                var daysInWords = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                
                                for (var d = new Date(fromYear, (fromMonth - 1), (fromDay + 1)); d <= date; d.setDate(d.getDate() + 1)) {
                                    
                                    dd = moment(d.getFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(), 'YYYY-MM-DD');
                                    daysObj[daysInWords[dd.day()]] = daysObj[daysInWords[dd.day()]] + 1                                    
                                }
                                
                                dailyAttendancetable.find({"empCode": empCode }).project({ ["attendance." + fromYear + ""]: !null, ["attendance." + currentYear + ""]: !null }).toArray().then(response2 => {
                                    
                                    
                                    const summaries = []
                                    var totalWorkingMinutes = 0;
                                    var index = 0;
                                    let sTime = 0;
                                    let eTime = 0;
                                    
                                    for (var i = 0; i < Object.keys(response2[0]['attendance']).length; i++) {
                                        
                                        var obj0 = response2[0]['attendance'][Object.keys(response2[0]['attendance'])[i]]
                                        
                                        for (var j = 0; j < Object.keys(obj0).length; j++) {
                                            
                                            var obj1 = obj0[Object.keys(obj0)[j]];
                                            
                                            for (var k = 0; k < Object.keys(obj1).length; k++) {
                                                
                                                var obj2 = obj1[Object.keys(obj1)[k]];
                                                
                                                if(obj2.end && obj2.start){
                                                    sTime = obj2.start.date
                                                    eTime = obj2.end.date                                                        
                                                    eTime.substring(0,10) == endDate.format('YYYY-MM-DD').toString().substring(0,10)? totalDays =+1 : 0
                                                    totalWorkingMinutes += diff(sTime, eTime)
                                                    summaries[index] = obj2
                                                    index++;
                                                }
                                            }
                                        }
                                    }
                                    offDay.map(item => {
                                        noOfOffDay += daysObj[item]
                                    })                                    
                                    results[0]['totalAbsentDays'] = Math.abs((totalDays - noOfOffDay) - summaries.length )
                                    req.result = results;
                                    next();                                    
                                })
                                .catch(error => console.error(error))                             
                    })
                    .catch(error => {console.error(error)})
                }
                else {    
                    res.status(404).json({ "error": 'User is not registered' })
                    next();
                }
            }
            else {            
                res.status(404).json({ "error": 'User not found'})
                next();
            }
        })
    })
}

function diff(start, end) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);
    totalMinutes = hours * 60 + minutes
    if (hours < 0)
        hours = hours + 24;
    console.log(start,end,totalMinutes);
    return (totalMinutes);
}

module.exports = {
    findUser: findUser
}