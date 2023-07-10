const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator')
const protect = require('../middleware/auth')
const User = require('../models/user');
const OtpVerification = require('../models/otpVerification');

// Route 1: user update using get : '/api/user/profile' . login required
router.get('/profile',protect,async(req,res)=>{
    let type = 'error';
    try {
        const user = await User.findOne({_id:req.user._id});
        return res.status(200).json({"type":"sucesss",data:user,message:"Profile get sucessfully",code:200})
    } catch (error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

// Route 2: user update using post : '/api/user/update' . login required
router.post('/update',protect,[
    body('name','Name is required').notEmpty(),
    body('email','Email must be valid').isEmail()
    .custom((value,{req}) => {
        return User.findOne({
            _id: { $ne: req.user._id },
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
            _id: { $ne: req.user._id },
            mobile: value
        }).then((user) => {
          if (user) {
            return Promise.reject('Mobile already exits');
          }
        });
    }),
    //body('role_id', 'Role is required').notEmpty(),
],
async(req,res)=>{
    let type = 'error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
        const {name,email,mobile} = req.body 
        console.log('req body',req.body)
        await User.findOneAndUpdate(req.user._id,{name:name,email:email,mobile:mobile})
        return res.status(200).json({type:'success',message:'user update sucessfully',code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

// Route 3: user delete using get : '/api/user/delete' . login required
router.post('/delete',protect,async(req,res)=>{
    let type = 'error';
    try {
        const user = await User.findOne({_id:req.user._id});
        if(user) {
            user_id = user._id;
            // delete user otp
            await OtpVerification.findOneAndDelete({user_id:user_id});
            
            // delete user with token
            const status = await User.findOneAndDelete({_id:user_id});
            if(status) {
                return res.status(200).json({"type":"sucesss",message:"User delete sucessfully",code:200})
            } else {
                return res.status(500).json({type,error:'Something went wrong',code:500})
            }
        } else {
            return res.status(400).json({type:'error',message:'User not found',code:400})
        }
    } catch (error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

module.exports = router;