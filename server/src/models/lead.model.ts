import mongoose, {Schema} from "mongoose";
import type { ILeadDocument } from "../types/types.js";

const leadSchema = new Schema<ILeadDocument>({
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
    status: {
        type: String,
        required: true,
        enum: ["New", "Contacted", "Qualified", "Lost"]
    },
    source: {
        type: String,
        required: true,
        enum: ["Website", "Instagram", "Referral"]
    },
}, {timestamps: true});

export const Lead = mongoose.model<ILeadDocument>("Lead", leadSchema)