import { Document } from "mongoose"
import { ObjectId } from "mongodb"
import type { Request } from "express";

export interface IUser {
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    user_type: "Admin" | "Employee"
    password: string,
    refreshToken: string
}

export interface IUserDocument extends IUser, Document{
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export interface AuthenticatedRequest extends Request{
    user? : {
        _id: ObjectId;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        user_type: "Admin" | "Employee";
        refreshToken?: string;
    }
}

export interface ILeadDocument extends Document {
    firstName: string,
    lastName: string,
    email: string,
    status: "New" | "Contacted" | "Qualified" | "Lost",
    source: "Website" | "Instagram" | "Referral",
}