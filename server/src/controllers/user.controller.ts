import {User} from "../models/user.model"
import { ObjectId } from "mongodb"
import { ApiError } from "../utils/ApiError.js"
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId: ObjectId) => {
    try {
        if(!userId) throw new ApiError(400, "User Id was not received");
        const user = User.findById(userId);
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
    const {firstName, lastName, email, status, source, password} = req.body;

    if([firstName, lastName, email, status, source, password].some((it)=> it.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.create({
        firstName, lastName, email, status, source, password
    })

    if(!user) throw new ApiError(500, "Error creating user");

    const createdUser = User.findById(user._id).select("-password -refreshToken")

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

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

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
    await User.findByIdAndUpdate(
        req.user._id,
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
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            "User Logged Out Successfully",
            {}
        )
    )
})