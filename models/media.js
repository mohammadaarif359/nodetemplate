const mongoose = require('mongoose');
const { Schema } =  mongoose;

const mediaSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    name:{
        type:String,
        require:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Media',mediaSchema);