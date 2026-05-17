import { Lead } from "../models/lead.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { Response, Request } from "express";
import mongoose from "mongoose";

const addLead = asyncHandler(async(req: Request, res: Response) => {
    const {firstName, lastName, email, status, source} = req.body;

    if([firstName, lastName, email, status, source].some((it) => it.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const lead = await Lead.create({
        firstName, lastName, email, status, source
    });

    if(!lead){
        throw new ApiError(500, "Error creating new Lead");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Lead Created Successfully",
            lead
        )
    )
});

const editLead = asyncHandler(async(req: Request, res: Response) => {
    const {id, firstName, lastName, email, status, source} = req.body;

    if([firstName, lastName, email, status, source].some((it) => it.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const foundLead = await Lead.findById(id);

    if(!foundLead){
        throw new ApiError(404, "No Lead with the provided id found");
    }

    const updatedData = await Lead.findByIdAndUpdate(
        id, 
        {
            firstName, lastName, email, status, source
        },
        {
            new: true
        }
    ).select("-password");

    if(!updatedData){
        throw new ApiError(500, "Unable to update lead data");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Lead updated successfully",
            updatedData
        )
    )
})

const deleteLead = asyncHandler(async (req: Request, res: Response) => {
    const leadId = req.params.leadId as string;

    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
        throw new ApiError(400, "Lead ID is invalid");
    }

    const deletedLead = await Lead.findByIdAndDelete(leadId);

    if (!deletedLead) {
        throw new ApiError(404, "No Lead found with the provided id");
    }

    return res.status(200).json(
        new ApiResponse(200, "Lead deleted successfully", deletedLead)
    );
});

const getLeadDetail = asyncHandler(async (req: Request, res: Response) => {
    const leadId = req.params.leadId as string;

    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
        throw new ApiError(400, "Lead ID is invalid");
    }

    const leadDetails = await Lead.findById(leadId).select("-password -refreshToken");

    if(!leadDetails){
        throw new ApiError(500, "Unabele to fetch the lead details");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Successfully received lead detail",
            leadDetails
        )
    )
})

const getLeadList = asyncHandler(async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    
    const leads = await Lead.aggregate([{
        $facet: {
            metadata: [{$count: 'totalCount'}],
            data: [{$skip: (page-1)*limit}, {$limit: limit}]
        }
    }]);

    if(!leads){
        throw new ApiError(500, "Unable to fetch leads");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Leads fetched successfully",
            leads
        )
    )
})

export {addLead, editLead, deleteLead, getLeadDetail, getLeadList}