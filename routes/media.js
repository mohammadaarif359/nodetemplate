const express = require('express');
const router = express.Router();
const multer = require('multer')
const Media = require('../models/media')
const {body,ValidationResult} = require('express-validator');
const protect = require('../middleware/auth');

router.post('/upload', function (req, res) {
    uploadMedia(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(400).json({ type: 'error', error: err, code: 400 });
        } else if (err) {
            // An unknown error occurred when uploading.
            res.status(400).json({ type: 'error', error: err, code: 400 });
        } else {
            //console.log('after save req file',req.files);
            req.files.map(async(val)=>{
                await Media.create({
                    name:val.filename,
                    user_id:req.user._id
                })
            });
            res.status(200).json({ type: 'success', response:[], code: 200 });            
        }
    })
});
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './audio/')
    },
    filename(req, file, cb) {
        //cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
        cb(null, `${file.originalname}`)
    }
})
function checkFileType(file, cb, res) {
    const filetypes = /mp3/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (extname || mimetype) {
        return cb(null, true)
    } else {
        //return cb(null,true)
        cb('Upload only mp3 file')
    }
}
const uploadMedia = multer({
    storage,
    fileFilter: function (req, file, cb, res) {
        checkFileType(file, cb, res)
    }
//}).single('upload_audio')
}).array('upload_media',2)

module.exports = router;