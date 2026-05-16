import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { User } from "../models/user.model";
import { AuthenticatedRequest } from "../types/types";

const authMiddleware = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    const rq = req as AuthenticatedRequest;
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        throw new ApiError(404, "Token Not Found");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if(!secret) throw new ApiError(500, "Access token secret not configured");

    const decoded: any = await jwt.verify(token, secret) as JwtPayload | string;
    if(!decoded || typeof decoded === 'string'){
        throw new ApiError(500, "Error decoding token");
    }

    const userId = (decoded as JwtPayload).sub || (decoded as any)._id;
    if (!userId) throw new ApiError(401, "Invalid token payload");

    const user = await User.findById(userId).select?.("-password -refreshToken") ?? await User.findById(userId);
    if (!user) throw new ApiError(401, "Invalid access token - user not found");

    rq.user = user;
    next();
})