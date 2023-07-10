const mongoose = require('mongoose');
const { Schema } = mongoose;

const OtpVerificationSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    attribute_type:{
        type:String,
        required:true
    },
    attribute_value:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        require:true
    }
},{
    timestamps:true
})

// for otp generate
OtpVerificationSchema.pre('save',async function(next){
    if(!this.isModified('otp')) {
        next();
    }
    length = this.otp != '' ? this.otp : 4;
    const newOtp = Math.floor(10 ** (length-1) + Math.random() * (10 ** length) - 1);
    this.otp = newOtp
})
module.exports = mongoose.model('OtpVerification',OtpVerificationSchema);
