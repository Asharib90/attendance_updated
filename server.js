const express = require('express');
const MongoClient = require('mongodb').MongoClient
const authenticateToken = require("./middleware/authenticateToken");
const { isUser } = require("./middleware/isUser");
const { findUser } = require("./middleware/findUser");
const { webLogin } = require("./middleware/webLogin");
const { updateUser } = require("./middleware/updateUser");
const { startTiming } = require("./middleware/startTiming");
const { isFaceValidate } = require("./middleware/isFaceValidate");
const { updateManageSites } = require("./middleware/updateManageSites");
const { insertManageSite } = require("./middleware/insertManageSite");
const { getManageSites } = require("./middleware/getManageSites");
const { getSummary } = require("./middleware/getSummary");
const { getReport } = require("./middleware/getReport");
const { employeeDelete } = require("./middleware/employee/employeeDelete");
const { employeeGet } = require("./middleware/employee/employeeGet");
const { employeeInsert } = require("./middleware/employee/employeeInsert");
const { employeeUpdate } = require("./middleware/employee/employeeUpdate");
const jwt = require('jsonwebtoken');


const cors = require('cors')//cors for own server connected with own
const app = express();
const port = process.env.PORT || 5001;
//Middleware

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
)

require("dotenv").config();//dotenv config
process.env.TOKEN_SECRET;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const connection = MongoClient.connect('mongodb+srv://starmarketing:Crystalball007@cluster0.u64nt.mongodb.net',
 { useUnifiedTopology: true })



//Generate Token Function
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '5000000s' });
}

//Login API call
app.post('/login', findUser(connection), (req,res)=> {  

  const token = generateAccessToken({empCode: req.body.empCode});
  res.status(200).json({token:token,user:req.result,allo:res.allo})

});

//Is Server run API call
app.get('/',(req,res) =>{
  res.send("Attendance System API's is ready to use.");
});


//User Register API call
app.post('/register', isUser(connection,accountSid,authToken), (req, res) => {
  const token = generateAccessToken({ code: req.body.code });
  res.json({token:token,code: res.code});
})

//Face Varification API call
app.post('/verify', authenticateToken, (req, res) => {
  res.send(200)
});


//Login API call for web
app.post('/webLogin', webLogin(connection), (req,res)=> {
  const token = generateAccessToken({ code: req.body.code });
  req.result.length > 0 ? 
  res.json({token:token,user:req.result,allo:res.allo}):
  
  res.status(404).json({"error":'Check your credential '})
});

//UpdateProfile API Call
app.post('/update_profile', authenticateToken, updateUser(connection));

//Checkin & Checkout API Call
app.post('/start', authenticateToken, startTiming(connection,'start'));
app.post('/end', authenticateToken, startTiming(connection,'end'));

//Manage Sites API Calls
app.post('/manage_site', authenticateToken, insertManageSite(connection));
app.get('/manage_site', authenticateToken, getManageSites(connection));
app.put('/manage_site', authenticateToken, updateManageSites(connection));

//employee API Calls
app.get('/employee', authenticateToken, employeeGet(connection))
app.put('/employee', authenticateToken, employeeUpdate(connection))
app.delete('/employee', authenticateToken, employeeDelete(connection))
app.post('/employee', authenticateToken, employeeInsert(connection))


//Get Summary
app.post('/getSummary', authenticateToken, getSummary(connection));

//Get Report
app.post('/getReport', authenticateToken, getReport(connection));


app.listen(port, () =>{
    console.log('Port is Ok');
})
