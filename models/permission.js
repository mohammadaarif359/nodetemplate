const mongoose = require('mongoose');
const { Schema } =  mongoose;

const permissionSchema = new Schema({
    name:{
        type:String,
        require:true,
    },
    display_name:{
        type:String,
        require:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Permission',permissionSchema);