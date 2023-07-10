const express = require('express');
const multer = require("multer"); 
const ConnectDB = require('./db');
const dotenv = require('dotenv');

dotenv.config();

ConnectDB();

const app = express();

//app.use(express.json())

//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(multer().array())
// for test server
app.get('/',(req,res)=>{
    res.send('server path running')
});

// for auth route
app.use('/api/auth',require('./routes/auth'))

// for user route
app.use('/api/user',require('./routes/user'))

// for media route
app.use('/api/media',require('./routes/media'))

// for admin route
app.use('/admin/user',require('./routes/admin/user'))
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`server run on port ${port}`)
});