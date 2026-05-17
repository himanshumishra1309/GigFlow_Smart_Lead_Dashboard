import type { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/types";
import { ApiError } from "../utils/ApiError";

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req:AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userRole = req.user.user_type;

        if (!userRole) {
            return next(new ApiError(401, "User is not authenticated or role is missing"));
        }

        if (!allowedRoles.includes(userRole)) {
            return next(
                new ApiError(403, `Role '${userRole}' is not allowed to access this resource`)
            );
        }

        next();
    }
}