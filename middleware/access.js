const acccessType = process.env.ACCESS_TYPE;

if(acccessType == 'by_roles_file') {
  const { roles } = require('../roles');
  exports.grantAccess = (action, resource) => {
    return async (req, res, next) => {
    let type='error';
    try {
      const permission = roles.can(req.user.role_id.name)[action](resource);
      console.log('permission',permission);
      if (!permission.granted) {
      return res.status(401).json({type,error:"You don't have enough permission to perform this action",code:401})
      }
      next()
    } catch (error) {
      return res.status(500).json({type,error:error.message,code:500})
      //next(error)
    }
    }
  }
} else if(acccessType =='by_role_all_permission') {
  const mongoose = require('mongoose')
  const AccessControl = require('accesscontrol');
  const RolePermission = require('../models/rolePermission');
  console.log('acccessType',acccessType)

  exports.grantAccess = (action, resource) => {
    return async (req, res, next) => {
      let type='error';
      try {
      let grantArray = await fetchPermissions(req.user);
      const ac = new AccessControl(grantArray);
      const permission = ac.can(req.user.role_id.name)[action](resource);
      if (!permission.granted) {
        return res.status(401).json({type,error:"You don't have enough permission to perform this action",code:401})
      }
      next()
      } catch (error) {
        //return res.status(500).json({type,error:error.message,code:500})
        return res.status(401).json({type,error:"You dont have enough permission to perform this action",code:401})
      //next(error)
      }
    }
  } 
  async function fetchPermissions(user) {
    const response = await RolePermission.aggregate([
      {
          $match:{
              role_id:new mongoose.Types.ObjectId(user.role_id)
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
              role:user.role_id.name,
              resource:{ $arrayElemAt: ['$permission.name', 0] },
              action:"$permissions",
              attributes:'*',
              _id:0
          }
      }
    ]);
    return response;
  }
} 
