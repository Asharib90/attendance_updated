// const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({dest:'uploads/'}).single("demo_image");


const isFaceValidate = (connection) => (req,res,next) => { 

    // upload(req, res, (err) => {
    //     console.log(req)
    //     if(err) {
    //       res.status(400).send("Something went wrong!");
    //     }
    //     res.send(req.body.file);
    //   });
    // const authHeader = req.headers['authorization']
    // const token = authHeader && authHeader.split(' ')[1]
    // jwt.verify(token, process.env.TOKEN_SECRET , (err, user) => {
        // console.log(req.file)
        // request.post({url:'http://asharib90.pythonanywhere.com/register', formData: req.body}, function optionalCallback(err, httpResponse, body) {
        //     if (err) {
        //         return console.error('upload failed:', err);
        //     }
        //     console.log('Upload successful!  Server responded with:', body);
        // });
        // console.log(err)
        // if (err) return res.sendStatus(403)
        // req.user = user
        // // next()
    // })
}

module.exports={
    isFaceValidate:isFaceValidate
}