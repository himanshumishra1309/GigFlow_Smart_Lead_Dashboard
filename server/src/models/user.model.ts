import mongoose, {Schema} from "mongoose"
import bcrypt from 'bcrypt'
import jwt, { type Secret } from 'jsonwebtoken'
import type { IUserDocument } from "../types/types.js";

const userSchema = new Schema<IUserDocument>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value: string): boolean {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                return emailRegex.test(value)
            },
            message: "Invalid email format!",
        },
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    user_type: {
        type: String,
        required: true,
        enum: ["Admin", "Sales User"]
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true});


userSchema.pre<IUserDocument>("save", async function () {
    if(!this.isModified("password")) return;
    
    let salts = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salts);
});

userSchema.methods.isPasswordCorrect = async function (password : string) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString(),
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY)
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString(),
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY)
        }
    )
}

export const User = mongoose.model<IUserDocument>("User", userSchema);