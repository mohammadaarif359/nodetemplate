const ResponseHandler = (status=false,errors,httpResponse=200) =>{
    return (req,res,next) => {
        return res.status(httpResponse).json({status,errors,code:httpResponse})
    }

}

module.exports = ResponseHandler;

