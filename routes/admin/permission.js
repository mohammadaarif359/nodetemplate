const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator')
const Permission = require('../../models/permission');
const RolePermission = require('../../models/rolePermission');
const Role = require('../../models/role');
const admin = require('../../middleware/admin')
const access = require('../../middleware/access')
const mongoose = require('mongoose')

router.post('/create',admin,[
    body('display_name','desc is required').notEmpty(),
    body('name','Name is required').notEmpty()
    .custom((value,{req}) => {
        return Permission.findOne({
            name: value
        }).then((permission) => {
          if (permission) {
            return Promise.reject('Permission already exits');
          }
        });
    })
],async(req,res)=>{
    let type ='error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
        const permision = await Permission.create({
            name:req.body.name,
            display_name:req.body.display_name
        })
        return res.status(200).json({type:'success',message:'permission addedd successfully',data:[],code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }   
})

router.get('/list',admin,async(req,res)=>{
    let type = 'error';
    try {
        let {page,limit,search} = req.query;
        page = page ?? 1;
        limit = limit ?? 10;
        const response = await Permission.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return res.status(200).json({type:'success',message:'permission get sucessfully',data:response,code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});

router.get('/edit/:id',admin,async(req,res)=>{
    let type = 'error';
    const {id} = req.params;
    try {
        const permission = await Permission.findById(id);
        if(permission){
            return res.status(200).json({type:'success',message:'permission get sucessfully',data:user,code:200})
        } else {
            return res.status(404).json({type:'error',message:'permission not found',code:404})
        }
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});

router.post('/update',admin,[
    body('id','Id is required').notEmpty(),
    body('display_name','Display name is required').notEmpty(),
    body('name','Email must be valid').isEmail()
    .custom((value,{req}) => {
        return Permission.findOne({
            _id: { $ne: req.body.id },
            name: value
        }).then((data) => {
          if (data) {
            return Promise.reject('Permission already exits');
          }
        });
    })
],async(req,res)=>{
    let type ='error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
        let permission = await Permission.findById(req.body.id);
        permission.name = req.body.name;
        permission.email = req.body.display_name;
        await permission.save();
        return res.status(200).json({type:'success',message:'permission update successfully',data:[],code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }   
})

router.get('/delete/:id',admin,async(req,res)=>{
    let type = 'error';
    const {id} = req.params;
    try {
        const permission = await Permission.findByIdAndDelete(id);
        if(permission) {
            return res.status(200).json({type:'success',message:'permission get sucessfully',data:permission,code:200})
        } else {
            return res.status(404).json({type:'error',message:'permission not found',code:404})
        }
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});

router.post('/assign',admin,[
    body('permission_id','Permission id required').notEmpty(),
    body('role_id','Role id is required').notEmpty(),
    body('permissions','Permissions is required').isArray(),
],async(req,res)=>{
    let type ='error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
        // assign permission
        const permision = await RolePermission.create({
            role_id:req.body.role_id,
            permission_id:req.body.permission_id,
            permissions:req.body.permissions
        })
        return res.status(200).json({type:'success',message:'permission assign successfully',data:[],code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }   
})

router.get('/assign-list/:role_id',async(req,res)=>{
    let type = 'error';
    try {
        let role_id = req.params.role_id;
        //const response = await RolePermission.find({role_id:role_id}).populate('permission_id');
        const response = await RolePermission.aggregate([
            {
                $match:{
                    role_id:new mongoose.Types.ObjectId(role_id)
                }
            },
            {
                $unwind:"$permissions"
            },
            {
                $lookup: {
                    from: 'permissions',
                    localField:'permission_id',
                    foreignField:'_id',
                    as:'permission'
                }
            },
            {
                $project:{
                    role:"admin",
                    resource:{ $arrayElemAt: ['$permission.name', 0] },
                    action:"$permissions",
                    attributes:'*',
                    _id:0
                }
            }
        ]);
        return res.status(200).json({type:'success',message:'permission assign get sucessfully',data:response,code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});
module.exports = router;