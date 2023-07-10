const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model('role',RoleSchema);