const mongoose = require('mongoose');
const { Schema } = mongoose;
const bycrpt = require('bcryptjs')

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    password: {
        type:String,
        require:true
    },
    profile_photo:{
        type:String,
        default:null
    },
    forgot_password_token:{
        type:String,
        default:null
    },
    role_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'role',
        required:true
    },
    auth_token:{
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

// for user password encription
UserSchema.pre('save',async function(next){
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bycrpt.genSalt(10);
    this.password = await bycrpt.hash(this.password,salt)
})

// for password match
UserSchema.methods.matchPassword = async function(enterPassword){
    const compare =  await bycrpt.compare(enterPassword,this.password)
    return compare;

}

module.exports = mongoose.model('user',UserSchema);