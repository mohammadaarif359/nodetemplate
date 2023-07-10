const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator');
const ResponseHandler = require('../utlity/common')
const generateToken = require('../utlity/generateToken')
const User = require('../models/user');
const Role = require('../models/role');
const OtpVerification = require('../models/otpVerification');
const UserDevice = require('../models/userDevice');
const protect = require('../middleware/auth')
const sendEmail = require('../utlity/email')

// Route 1: register user using post : '/api/auth/register' . no login required
router.post('/register',[
    body('name','Name is required').notEmpty(),
    body('email','Email must be valid').isEmail()
    .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject('Email already exits');
          }
        });
    }),
    body('mobile','Mobile must be valid').isLength({min:8,max:12})
    .custom((value) => {
        return User.findOne({ mobile: value }).then((user) => {
          if (user) {
            return Promise.reject('Mobile already exits');
          }
        });
    }),
    body('password','Password atleast 6 char').isLength({min:6}),
    body('role_id', 'Role is required').notEmpty(),
    /*.custom((value) => {
      return User.findOne({_id:value}).then((user) => {
        if (!user) {
          return Promise.reject('Role not exits');
        }
      });
    }),*/
],
async(req,res)=>{
    let type = 'error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({type,errors:errors.array(),code:400})
    }

    try {
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            role_id: req.body.role_id,
            status:true
        });
        return res.status(200).json({type:'success',message:'user created sucessfully',code:200})
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

// Route 2: login user using post : '/api/auth/login' . no login required
router.post('/login',[
    body('username','Username is required').notEmpty(),
    body('password','Password is required').notEmpty(),
],async(req,res)=>{
    let type = 'error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
      const { username,password } = req.body
      const user = await User.findOne({email:username}).populate('role_id',['_id','name'])
      if(user && await user.matchPassword(password)) {
          if(!user.status) {
            return res.status(400).json({type:'error',message:'Your account is not activated',code:401})    
          }
          /*if(user.role_id == null || user.role_id && user.role_id.name != 'user') {
            return res.status(400).json({type:'error',message:'Your have not permission to login here',code:401})
          }*/
          // generate token
          let token = generateToken(user._id);
          // save token
          user.auth_token = token;
          const userData = await user.save();
          // response
          let response = {}
          response._id = user.id
          response.name = user.name
          response.email = user.email
          response.mobile = user.moble
          response.profile_photo = user.profile_photo
          response.profile_photo_url = user.profile_photo
          response.status = user.status
          response.role = user.role_id
          response.token = token 
          res.status(200).json({type:'success',message:'login sucessfully',data:response,code:200})
      } else {
        return res.status(400).json({type:'error',message:'Username or password may be incorrect',code:400})  
      }
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

// Route 3: user device save using post : '/api/auth/save-device' . login required
router.post('/save-device',protect,[
    body('user_id','User id is required').notEmpty(),
    body('udid','Udid is required').notEmpty(),
    body('type','Type is invalid').isIn(['ANDROID','IOS']),
    body('token','Token is required').notEmpty(),
    body('status','Status is required').notEmpty().isBoolean(),
],async(req,res)=>{
    let type = 'error';
    //return validation error
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({type,errors:errors.array(),code:400})
    }
    try {
      // 
      await UserDevice.findOneAndDelete({token:req.body.token});
      const device = await UserDevice.create({
          user_id:req.body.user_id,
          udid:req.body.udid,
          type:req.body.type,
          token:req.body.token,
          status:req.body.status
      })
      return res.status(200).json({type:'success',data:device,message:'User device saved successfully',code:200})  
    } catch(error) {
        return res.status(500).json({type,error:error.message,code:500})
    }
})

// Route 4: forgot password using post : '/api/auth/password/request' . no login required
router.post('/password/request',[
  body('email','Email must be valid').isEmail(),
],async(req,res)=>{
  let type = 'error';
  //return validation error
  let errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({type,errors:errors.array(),code:400})
  }
  try {
    // 
    let user = await User.findOne({email:req.body.email});
    if(user) {
      // generate and save user forgot token
      let token = (Math.random() + 1).toString(36).substring(1);
      user.forgot_password_token = token;
      await user.save();

      // save otp data
      let otpData = await OtpVerification.create({
        user_id:user._id,
        attribute_type:'email',
        attribute_value:req.body.email,
        otp:4
      })

      // otp send to email if attribute_type email
      let responseMg = '';
      if(otpData.attribute_type == 'email') {
        console.log('if email')
        let data = {}
        data.name = user.name
        data.email = user.email
        data.otp = otpData.otp
        data.subject = 'Otp Verification'
        data.message = `Use this "One Time Passcode" (OTP) ${data.otp} Verification Process to assure the Secure Access of your account. Please enter the OTP provided below`
        responseMg = 'OTP to reset password has sent to you email id';
        const mailresponse  = await sendEmail(data);
        console.log('mailreponse',mailresponse)
      }
      return res.status(200).json({type:'success',data:token,message:responseMg,code:200})
    } else {
      return res.status(400).json({type:'error',message:'Email does not exist',code:400})
    } 
  } catch(error) {
      return res.status(500).json({type,error:error.message,code:500})
  }
})

// Route 4: forgot password otp verify using post : '/api/auth/password/otp-verify' . no login required
router.post('/password/otp-verify',[
    body('token','Forgot password token required').notEmpty()
      .custom((value) => {
        return User.findOne({ forgot_password_token: value }).then((user) => {
          if (!user) {
            return Promise.reject('Forgot password token not exists');
          }
        });
    }),
    body('otp','Otp must be number').isNumeric() 
],async(req,res)=>{
  let type = 'error';
  //return validation error
  let errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({type,errors:errors.array(),code:400})
  }
  try {
      const user = await User.findOne({forgot_password_token:req.body.token})
      if(user) {
          const otpData = await OtpVerification.findOne({user_id:user._id}).sort({createdAt: -1})
          if(otpData && otpData.otp == req.body.otp) {
            await OtpVerification.findByIdAndDelete(otpData._id);
            let token = (Math.random() + 1).toString(36).substring(1);
            user.forgot_password_token = token;
            await user.save();
            return res.status(200).json({type:'success',data:token,message:"Otp verified successfully.",code:200}) 
          } else {
            return res.status(400).json({type:'error',message:'Invalid Otp',code:400})
          }
      } else {
        return res.status(400).json({type:'error',message:'Token does not exist',code:400})
      }
  } catch(error) {
      return res.status(500).json({type,error:error.message,code:500}) 
  }
})

// Route 5: set password using post : '/api/auth/password/reset' . no login required
router.post('/password/reset',[
  body('token','Forgot password token required').notEmpty()
    .custom((value) => {
      return User.findOne({ forgot_password_token: value }).then((user) => {
        if (!user) {
          return Promise.reject('Forgot password token not exists');
        }
      });
  }),
  body('password','Passowrd at least 6 char').isLength({min:6}) 
],async(req,res)=>{
  let type = 'error';
  //return validation error
  let errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({type,errors:errors.array(),code:400})
  }
  try {
      let user = await User.findOne({forgot_password_token:req.body.token})
      if(user) {
          user.forgot_password_token = null
          user.password = req.body.password
          await user.save();
          return res.status(200).json({type:'success',message:"Password reset successfully.",code:200})
      } else {
        return res.status(400).json({type:'error',message:'Token does not exist',code:400})
      }
  } catch(error) {
      return res.status(500).json({type,error:error.message,code:500}) 
  }
})

// Route 6: change password using post : '/api/auth/password/reset' . no login required
router.post('/password/change',protect,[
  body('old_password','Old password required').notEmpty(),
  body('password','New passowrd at least 6 char').isLength({min:6}) 
],async(req,res)=>{
  let type = 'error';
  //return validation error
  let errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({type,errors:errors.array(),code:400})
  }
  try {
      let user = await User.findOne({_id:req.user._id})
      if(user && await user.matchPassword(req.body.old_password)) {
          user.password = req.body.password
          await user.save();
          return res.status(200).json({type:'success',message:"Password update successfully.",code:200})
      } else {
        return res.status(400).json({type:'error',message:'Incorrect old password',code:400})
      }
  } catch(error) {
      return res.status(500).json({type,error:error.message,code:500}) 
  }
})
module.exports = router;