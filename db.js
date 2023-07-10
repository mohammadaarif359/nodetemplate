const mongoose = require('mongoose');

const ConnectDB = async() =>{
    try {
        const con = await mongoose.connect(process.env.MONGODB_URL,{
            useUnifiedTopology:true,
            useNewUrlParser:true
        })
        console.log('mongo db connected')
    } catch(error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = ConnectDB;