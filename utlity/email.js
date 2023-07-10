const nodemailer = require('nodemailer');

const sendEmail = async (data) =>{
    let type = 'errpr';
    try {
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            port:process.env.MAIL_PORT,
            secure:process.env.MAIL_SECURE,
            auth:{
                user:process.env.MAIL_USERNAME,
                pass:process.env.MAIL_PASSWORD
            },
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Suntec ðŸ‘»" <demo@tsprojects.net>',
            to: data.email,
            subject: data.subject,
            text: data.message, // plain text body
            //html: '<b>Hello world?</b>', // html body
        });

        if(info.messageId) {
            return true;
        } else {
            return false;
        }
    } catch(error) {
        console.log('error',error);
        //res.status(500).json({ type, error: error.message, code: 500 });
        return false;
    }
}

module.exports = sendEmail;