import { Lead } from "../models/lead.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { Response, Request } from "express";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import { User } from "../models/user.model.js";

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
    );

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

    const leadDetails = await Lead.findById(leadId);

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

    const search = req.query.search as string;
    const status = req.query.status as string;
    const source = req.query.source as string;
    const sort = req.query.sort as string;

    const matchStage: any = {}

    if(status) matchStage.status = status
    if(source) matchStage.source = source

    if(search){
        matchStage.$or = [
            { firstName: {$regex: search, $options: 'i'} },
            { lastName: {$regex: search, $options: 'i'} },
            { email: {$regex: search, $options: 'i'} },
        ]
    }

    const sortStage: any = {};
    if(sort === "Oldest"){
        sortStage.createdAt = 1;
    } else{
        sortStage.createdAt = -1;
    }
    
    const leads = await Lead.aggregate([
        {$match: matchStage},
        {$sort: sortStage},
        {
            $facet: {
                metadata: [{$count: 'totalCount'}],
                data: [{$skip: (page-1)*limit}, {$limit: limit}]
            }
        }
    ]);

    if (!leads || leads.length === 0) {
        throw new ApiError(500, "Unable to fetch leads");
    }

    const responseData = {
        leads: leads[0].data,
        totalCount: leads[0].metadata[0]?.totalCount || 0,
        page,
        limit
    };

    return res.status(200).json(
        new ApiResponse(200, "Leads fetched successfully", responseData)
    );
})

const exportLeadsCSV = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    const source = req.query.source as string;
    const status = req.query.status as string;

    const matchStage: any = {};

    if(source) matchStage.source = source;
    if(status) matchStage.status = status;

    if(search){
        matchStage.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const leads = await Lead.find(matchStage).sort({createdAt: -1});

    if(!leads || leads.length === 0){
        throw new ApiError(404, "No lead with th given requirement found")
    }

    const fields = ['firstName', 'lastName', 'email', 'status', 'source', 'createdAt'];
    
    const json2csvParser = new Parser({fields});
    const csv = json2csvParser.parse(leads)

    res.header('Content-Type', 'text/csv');
    res.attachment('lead-export.csv');
    return res.status(200).send(csv);
})

export {addLead, editLead, deleteLead, getLeadDetail, getLeadList, exportLeadsCSV}