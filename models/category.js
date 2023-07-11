const mongoose = require('mongoose');
const { Schema } =  mongoose;

const categorySchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    name:{
        type:String,
        require:true,
    },
    desc:{
        type:String,
        require:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Category',categorySchema);