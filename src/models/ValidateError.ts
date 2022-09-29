export interface ValidateError {
    response: {
        data: {
            code: string,
            statusCode: number,
            message: string
        }
    }
}