import {User} from "../models/user.model"
import { ObjectId } from "mongodb"
import { ApiError } from "../utils/ApiError"
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import type { AuthenticatedRequest } from "../types/types";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId: ObjectId) => {
    try {
        if(!userId) throw new ApiError(400, "User Id was not received");
        const user = await User.findById(userId);
        if(!user) throw new ApiError(404, "User not found");
        const accessToken = await User.generateAccessToken();
        const refreshToken = await User.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const {firstName, lastName, email, username, user_type, password} = req.body;

    if([firstName, lastName, email, username, user_type, password].some((it)=> it.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.create({
        firstName, lastName, email, username, user_type, password
    })

    if(!user) throw new ApiError(500, "Error creating user");

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, "User Registered Successfully", createdUser)
    )
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const {email, password} = req.body;

    if(!email){
        throw new ApiError(400, "Please enter your email");
    }

    if(!password){
        throw new ApiError(400, "Please enter your password");
    }

    const user = await User.findOne({email: email});

    if(!user){
        throw new ApiError(500, "No user with that email found");
    }

    const checkPassword = await User.isPasswordCorrect(password);

    if(!checkPassword){
        throw new ApiError(400, "Incorrect Password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "User Logged In successfully",
            {
                loggedInUser,
                accessToken,
                refreshToken
            }
        )
    )
})

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const rq = req as AuthenticatedRequest
    await User.findByIdAndUpdate(
        rq.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            "User Logged Out Successfully",
            {}
        )
    )
})

const getAllEmplyeeList = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    
    const employees = await User.aggregate([
        {
            $match: {
                user_type: "Sales User"
            }
        },
        {
            $sort: {
                firstName: 1
            }
        },
        {
            $facet: {
                metadata: [{$count: 'totalCount'}],
                data: [{$skip: (page*1)-limit}, {$limit: limit}]
            }
        }
    ])

    if(!employees){
        throw new ApiError(400, "Unable to fetch list of employees")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Fetched all employees",
            {
                employees,
                totalCount: employees.length
            }
        )
    )
});

const getUserDetails = asyncHandler(async (req: Request, res: Response)=>{
    const id: string = req.params.id as string;

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400, "User Id invalid");
    }

    const user = await User.findById(id);

    if(!user){
        throw new ApiError(500, "Unable to get user data");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Fetched User Details",
            user
        )
    )
})

export {registerUser, loginUser, logoutUser, getAllEmplyeeList, getUserDetails}