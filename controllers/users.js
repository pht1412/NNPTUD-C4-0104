let userModel = require('../schemas/users')
const xlsx = require('xlsx');
const { generateRandomString } = require('../utils/stringHandler');
const nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "e8373cebe94c4c",
    pass: "662aeab6ada703"
  }
});

module.exports = {
    importUsers: async (req, res) => {
        try {
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const users = xlsx.utils.sheet_to_json(sheet);

            for (const user of users) {
                const { username, email } = user;
                const password = generateRandomString(16);

                const newUser = new userModel({
                    username,
                    email,
                    password, // Password will be hashed by pre-save hook in user schema
                    role: '69b1265c33c5468d1c85aad8'
                });

                await newUser.save();

                await transport.sendMail({
                    from: 'Hệ thống Admin <admin@haha.com>',
                    to: email,
                    subject: 'Thông tin tài khoản mới của bạn',
                    html: `
                        <p>Chào ${username},</p>
                        <p>Tài khoản của bạn đã được tạo thành công.</p>
                        <p>Username: ${username}</p>
                        <p>Mật khẩu tạm thời của bạn là: <b>${password}</b></p>
                        <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
                    `
                });
            }

            res.status(200).send({ message: 'Users imported successfully' });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },
    CreateAnUser: async function (username, password, email, role, session,
        fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save({ session });
        return newItem;
    },
    GetAnUserByUsername: async function (username) {
        return await userModel.findOne({
            isDeleted: false,
            username: username
        })
    }, GetAnUserById: async function (id) {
        return await userModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('role')
    }, GetAnUserByEmail: async function (email) {
        return await userModel.findOne({
            isDeleted: false,
            email: email
        })
    }, GetAnUserByToken: async function (token) {
        let user = await userModel.findOne({
            isDeleted: false,
            forgotPasswordToken: token
        })
        if (user.forgotPasswordTokenExp > Date.now()) {
            return user;
        }
        return false;
    }
}