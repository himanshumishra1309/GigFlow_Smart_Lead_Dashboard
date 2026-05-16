import { Document } from "mongoose"
import type { Request } from "express";

export interface IUser {
    firstName: string,
    lastName: string,
    email: string,
    status: "New" | "Contacted" | "Qualified" | "Lost",
    source: "Website" | "Instagram" | "Referral",
    password: string,
    refreshToken: string
}

export interface IUserDocument extends IUser, Document{
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export interface AuthenticatedRequest extends Request{
    user? : unknown
}