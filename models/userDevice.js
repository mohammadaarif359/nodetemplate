const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserDeviceSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    udid:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:null
    },
    status:{
        type:Boolean,
        deafult:true
    }
},{
    timestamps:true
})
module.exports = mongoose.model('UserDevice',UserDeviceSchema);