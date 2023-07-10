
const responseHandle = (err,req,res,next) =>{
    const statusCode = res.statusCode === 200 ? 200 : res.statusCode;
    res.status(statusCode)
    res.json({
        message:err.message,
        stack:err.stack,
        code:res.statusCode
    })
}

modul.exports = responseHandle;