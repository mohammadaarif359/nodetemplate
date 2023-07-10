const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ConnectDB = require('./db');
const User = require('./models/user');
const Role = require('./models/role');

dotenv.config()
ConnectDB();

const destroyData = async() =>{
    try{  
        // delete all user,product and order data  
        await Role.deleteMany()
        await User.deleteMany()

        console.log('data destroy');
        process.exit()

    }catch(error) {
        console.log(`${error}`);
        process.exit()
    }
}

const importData = async() =>{
    try {
        // import role
        const roles = ['admin','user'];
        await Role.create({
            name: 'admin',
            description: 'admin user'
        });
        await Role.create({
            name: 'user',
            description: 'app user'
        });
        /*for(let i=0;i<roles;i++) {
            const role = await Role.findOne({name:element})
            if(!role) {
                // create role 
                let roleData = await Role.create({
                    name: roles[i],
                    description: roles[i]
                });
            }
        }*/
        // create default admin user
        const adminRole = await Role.findOne({name:'admin'})

        const user = await User.create({
            name: 'admin',
            email: 'aarif@technoscore.net',
            mobile: 8290027571,
            password: 123456,
            role_id: adminRole._id,
            status: true
        });

        console.log('data imported');
        process.exit()
    } catch(error) {
        console.log(`${error}`);
        process.exit()
    }
}
if(process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
