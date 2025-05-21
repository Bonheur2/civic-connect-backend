"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String
    },
    names: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
    },
    bio: {
        type: String
    },
    image: {
        type: String
    },
    address: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /\S+@\S+\.\S+/.test(value);
            },
            message: 'Please provide a valid email'
        }
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['citizen', 'admin', 'super-admin'],
        default: 'citizen'
    },
    agency_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Agency', // Reference to Agency collection
        required: function () {
            return this.role === 'admin';
        },
        default: null
    },
    otpExpires: { type: String },
    otp: {
        type: String
    },
    verified: { type: Boolean, default: false }
}, { timestamps: true });
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt();
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
// Static method for login
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcryptjs_1.default.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect email');
};
const User = mongoose_1.default.model('User', userSchema);
module.exports = User;
