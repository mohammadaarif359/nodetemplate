const jwt = require('jsonwebtoken')
const User = require('../models/user')

const admin = async(req,res,next) =>{
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			let token  = req.headers.authorization.split(' ')[1];
			let decodetoken = jwt.verify(token,process.env.JWT_SECRET)
			let auth_user = await User.findOne({_id:decodetoken.id,auth_token:token}).select('-password').populate('role_id');
			if(auth_user) {
				req.user = auth_user;
				next();
			} else {
				res.json({type:"error",message:"Un-Authorized user access",code:403})
			}	
		} catch(error) {
			res.json({type:"error",message:"Un-Authorized user access",code:403})
		}
		
	} else {
        res.json({type:"error",message:"Un Authorized acesss",code:403})
    }
}

module.exports = admin