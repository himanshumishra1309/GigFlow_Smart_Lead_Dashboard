class ApiError extends Error{
    statusCode: number

    // We use 'any' for 'data' because ApiError is a universal error handler.
    // The data payload must be completely flexible to accommodate various 
    // endpoint contexts
    data: any
    success: boolean

    // We use 'any[]' for 'errors' to make this class framework-agnostic. 
    // Different validation libraries return error details 
    // in completely different shapes
    errors: any[]

    constructor(
        statusCode: number,
        message:string="Something went wrong",
        errors:any[]=[],
        stack:string=""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}