const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,

    },
    realState: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'realState'
        }

    ],
    role: {
        type: Number
    },
    lastBonoTime: {
        type: Number,
    }
});

usersSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;