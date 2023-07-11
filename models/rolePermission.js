const mongoose = require('mongoose');
const { Schema } =  mongoose;

const rolePermissionSchema = new Schema({
    role_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'role'
    },
    permission_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Permission'
    },
    permissions:{
        type:Array,
        require:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('RolePermission',rolePermissionSchema);