const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator')
const User = require('../../models/user');
const admin = require('../../middleware/admin')
const excelJS = require("exceljs");
const fs = require('fs');
const path = require('path');

router.get('/list',admin,async(req,res)=>{
    let type = 'error';
    try {
        let {page,limit,search} = req.query;
        page = page ?? 1;
        limit = limit ?? 10;
        const response = await User.find().select('-password -auth_token').populate('role_id',['_id','name']).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return res.status(200).json({type:'success',message:'users get sucessfully',data:response,code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});

router.get('/edit/:id',admin,async(req,res)=>{
    let type = 'error';
    const {id} = req.params;
    try {
        const user = await User.findById(id).select('-password -auth_token').populate('role_id',['_id','name']);
        if(user) {
            return res.status(200).json({type:'success',message:'user get sucessfully',data:user,code:200})
        } else {
            return res.status(404).json({type:'error',message:'user not found',code:404})
        }
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
});

router.post('/update',admin,[
    body('id','Id is required').notEmpty(),
    body('name','Name is required').notEmpty(),
    body('email','Email must be valid').isEmail()
    .custom((value,{req}) => {
        return User.findOne({
            _id: { $ne: req.body.id },
            email: value
        }).then((user) => {
          if (user) {
            return Promise.reject('Email already exits');
          }
        });
    }),
    body('mobile','Mobile must be valid').isLength({min:8,max:12})
    .custom((value,{req}) => {
        return User.findOne({
            _id: { $ne: req.body.id },
            mobile: value
        }).then((user) => {
          if (user) {
            return Promise.reject('Mobile already exits');
          }
        });
    }),
    body('role','Role is required').notEmpty(),
    body('status','Status must be true or false').isBoolean(),
    body('password','Password atleast 6 char').optional().isLength({min:6})
],async(req,res)=>{
    let type ='error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
        let user = await User.findById(req.body.id);
        user.name = req.body.name;
        user.email = req.body.email;
        user.mobile = req.body.mobile;
        user.role_id = req.body.role_id;
        user.status = req.body.status;
        if(req.body.password) {
            user.password = req.body.password
            user.auth_token = null
        }
        await user.save();
        return res.status(200).json({type:'success',message:'user update successfully',data:[],code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }   
})

router.get('/export',admin,async(req,res)=>{
    let type ='error';
    try {
        const users = await User.find().populate('role_id',['_id','name']).sort({ createdAt: -1 });
        const workBook =new excelJs.WorkBook();
        const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
        const path = "./files";  // Path to download excel
        // Column for data in excel. key must match data key
        worksheet.columns = [
            { header: "S no.", key: "s_no", width: 10 }, 
            { header: "Name", key: "name", width: 10 },
            { header: "Email", key: "email", width: 10 },
            { header: "Mobile", key: "mobile", width: 10 },
            { header: "Status", key: "status", width: 10 },
        ];
        // Looping through user data
        let counter = 1;
        users.forEach((user) => {
            user.s_no = counter;
            worksheet.addRow(user); // Add data in worksheet
            counter++;
        });
        // reponse
        const data = await workbook.xlsx.writeFile(`${path}/users.xlsx`)
            .then(()=>{
                res.setHeader('Content-Type', 'application/vnd.ms-excel')
		        res.send(imageBuffer)
            })
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})
module.exports = router;