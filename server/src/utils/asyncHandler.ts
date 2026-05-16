import type { Request, Response, NextFunction } from "express"

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => any;

const asyncHandler = (requestHandler : AsyncRequestHandler) => {
    return(req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}